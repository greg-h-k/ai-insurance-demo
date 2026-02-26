export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import { getUploadRecord } from "@/lib/uploads"
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Car, FileText, DollarSign, AlertCircle } from "lucide-react"
import Link from "next/link"

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
})

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

interface Props {
  params: Promise<{ uploadId: string }>
}

export default async function UploadSummaryPage({ params }: Props) {
  const { uploadId } = await params
  const record = await getUploadRecord(uploadId)

  if (!record) {
    notFound()
  }

  const imageUrl = await getSignedUrl(
    s3Client,
    new GetObjectCommand({ Bucket: record.s3Bucket, Key: record.s3Key }),
    { expiresIn: 3600 }
  )

  const { assessment, assessmentError } = record

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/upload" className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
            ← New Assessment
          </Link>
        </div>

        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              Damage Assessment
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              {record.filename} &middot; {new Date(record.uploadedAt).toLocaleString()}
            </p>
          </div>

          {/* Vehicle image */}
          <Card className="mb-6 overflow-hidden border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={record.filename}
                className="w-full object-contain"
                style={{ maxHeight: "400px" }}
              />
            </CardContent>
          </Card>

          {/* Assessment error state */}
          {!assessment && (
            <Card className="mb-6 border-red-200 dark:border-red-800">
              <CardContent className="flex items-center gap-3 p-4 text-red-700 dark:text-red-400">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm">
                  {assessmentError
                    ? `Assessment unavailable: ${assessmentError}`
                    : "Assessment data not available for this upload."}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Assessment results */}
          {assessment && (
            <div className="space-y-4">
              {/* Vehicle metadata */}
              <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Car className="h-5 w-5" />
                    Vehicle Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{assessment.carMetadata.make}</Badge>
                    <Badge variant="secondary">{assessment.carMetadata.model}</Badge>
                    <Badge variant="secondary">{assessment.carMetadata.color}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Damage summary */}
              <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5" />
                    Damage Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                    {assessment.damageSummary}
                  </p>
                </CardContent>
              </Card>

              {/* Repair cost estimate */}
              <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <DollarSign className="h-5 w-5" />
                    Estimated Repair Cost
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                    {formatCurrency(assessment.estimatedRepairCost.min)} &ndash; {formatCurrency(assessment.estimatedRepairCost.max)}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <Button asChild>
              <Link href="/upload">Start New Assessment</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
