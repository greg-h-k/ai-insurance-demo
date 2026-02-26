import { PutCommand, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb"
import { dynamoDb } from "./dynamodb"
import type { DamageAssessment } from "./bedrock"

export interface UploadRecord {
  uploadId: string
  filename: string
  s3Key: string
  s3Bucket: string
  contentType: string
  fileSize: number
  uploadedAt: string
  assessment?: DamageAssessment
  assessedAt?: string
  assessmentError?: string
}

function getTableName(): string {
  const tableName = process.env.DYNAMODB_UPLOADS_TABLE_NAME
  if (!tableName) {
    throw new Error("DYNAMODB_UPLOADS_TABLE_NAME environment variable is not set")
  }
  return tableName
}

export async function createUploadRecord(record: UploadRecord): Promise<void> {
  await dynamoDb.send(
    new PutCommand({
      TableName: getTableName(),
      Item: record,
    })
  )
}

export async function getUploadRecord(uploadId: string): Promise<UploadRecord | null> {
  const result = await dynamoDb.send(
    new GetCommand({
      TableName: getTableName(),
      Key: { uploadId },
    })
  )
  return (result.Item as UploadRecord) ?? null
}

export async function listUploadRecords(limit = 50): Promise<UploadRecord[]> {
  const result = await dynamoDb.send(
    new ScanCommand({
      TableName: getTableName(),
      Limit: limit,
    })
  )
  return (result.Items ?? []) as UploadRecord[]
}
