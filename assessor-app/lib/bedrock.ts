import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock"
import { defaultProvider } from "@aws-sdk/credential-provider-node"
import { generateObject } from "ai"
import { z } from "zod"

export const DamageAssessmentSchema = z.object({
  carMetadata: z.object({
    make: z.string().describe("Vehicle manufacturer, e.g. Toyota"),
    model: z.string().describe("Vehicle model, e.g. Camry"),
    color: z.string().describe("Primary exterior color of the vehicle"),
  }),
  damageSummary: z.string().describe(
    "Detailed description of all visible damage including affected panels, severity, and any safety concerns"
  ),
  estimatedRepairCost: z.object({
    min: z.number().describe("Lower bound of repair cost estimate in USD"),
    max: z.number().describe("Upper bound of repair cost estimate in USD"),
    currency: z.literal("USD"),
  }),
})

export type DamageAssessment = z.infer<typeof DamageAssessmentSchema>

export async function assessDamage(
  imageBuffer: Buffer,
): Promise<DamageAssessment> {
  const modelId = process.env.BEDROCK_MODEL_ID
  if (!modelId) {
    throw new Error("BEDROCK_MODEL_ID environment variable is not set")
  }

  const credentialProvider = defaultProvider()

  const bedrock = createAmazonBedrock({
    region: process.env.AWS_REGION || "us-east-1",
    credentialProvider: async () => {
      const credentials = await credentialProvider()
      return {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
      }
    },
  })

  const { object } = await generateObject({
    model: bedrock(modelId),
    schema: DamageAssessmentSchema,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            image: imageBuffer,
          },
          {
            type: "text",
            text: "You are an automotive insurance claims assessor. Analyze this vehicle damage image. Identify the vehicle make, model, and color. Describe all visible damage in detail. Provide a repair cost estimate range in USD.",
          },
        ],
      },
    ],
  })

  return object
}
