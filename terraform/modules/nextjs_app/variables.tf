variable "app_name" {
  description = "Name of the application"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC to deploy resources in"
  type        = string
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs for the ALB"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs for ECS tasks"
  type        = list(string)
}

variable "certificate_arn" {
  description = "ARN of the ACM certificate for HTTPS"
  type        = string
}

variable "allowed_cidr_block" {
  type = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "ssm_parameter_arns" {
  description = "Map of secret names to their SSM Parameter ARNs"
  type        = map(string)
  default     = {}
}

variable "s3_document_bucket_name" {
  description = "Name of the S3 bucket for document uploads"
  type        = string
  default     = ""
}

variable "s3_document_bucket_arn" {
  description = "ARN of the S3 bucket for document uploads (for IAM permissions)"
  type        = string
  default     = ""
}

variable "enable_s3_document_upload" {
  description = "Whether to enable S3 document upload permissions for ECS tasks"
  type        = bool
  default     = false
}

variable "dynamodb_uploads_table_name" {
  description = "Name of the DynamoDB table for upload tracking"
  type        = string
  default     = ""
}

variable "dynamodb_uploads_table_arn" {
  description = "ARN of the DynamoDB table for upload tracking (for IAM permissions)"
  type        = string
  default     = ""
}

variable "bedrock_model_id" {
  description = "Bedrock model ID for AI damage assessment"
  type        = string
  default     = ""
}