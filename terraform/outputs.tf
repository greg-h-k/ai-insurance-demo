output "document_upload_s3_bucket_name" {
  value = aws_s3_bucket.document_upload_s3_bucket.id
}

output "upload_tracking_dynamodb_table_name" {
  value = aws_dynamodb_table.upload_tracking.name
}