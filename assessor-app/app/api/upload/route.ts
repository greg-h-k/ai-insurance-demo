import { NextRequest, NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { randomUUID } from "crypto"
import { createUploadRecord } from "@/lib/uploads"
import { assessDamage, type DamageAssessment } from "@/lib/bedrock"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
  "image/heif",
]

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed types: JPEG, PNG, GIF, WebP, HEIC" },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB" },
        { status: 400 }
      )
    }

    const bucketName = process.env.S3_BUCKET_NAME
    if (!bucketName) {
      return NextResponse.json(
        { error: "S3 bucket not configured" },
        { status: 500 }
      )
    }

    // Generate upload ID and S3 key
    const uploadId = randomUUID()
    const extension = file.name.split(".").pop() || "jpg"
    const key = `uploads/${uploadId}.${extension}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Step 1: Upload to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    )

    const tableName = process.env.DYNAMODB_UPLOADS_TABLE_NAME
    if (!tableName) {
      return NextResponse.json(
        { error: "DynamoDB table not configured" },
        { status: 500 }
      )
    }

    // Step 2: Run AI damage assessment via Bedrock
    let assessment: DamageAssessment | undefined
    let assessedAt: string | undefined
    let assessmentError: string | undefined

    try {
      assessment = await assessDamage(buffer)
      assessedAt = new Date().toISOString()
    } catch (bedrockErr) {
      console.error("Bedrock assessment failed (upload succeeded):", bedrockErr)
      assessmentError = bedrockErr instanceof Error ? bedrockErr.message : "Assessment failed"
    }

    // Step 3: Record upload and assessment in DynamoDB
    try {
      await createUploadRecord({
        uploadId,
        filename: file.name,
        s3Key: key,
        s3Bucket: bucketName,
        contentType: file.type,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        ...(assessment && { assessment, assessedAt }),
        ...(assessmentError && { assessmentError }),
      })
    } catch (dbError) {
      console.error("DynamoDB write failed:", dbError)
    }

    return NextResponse.json({
      success: true,
      uploadId,
      key,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}
