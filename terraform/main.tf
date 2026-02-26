terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC and Networking
module "baseline_environment_network" {
  source     = "./modules/base-network"
  vpc_name   = var.vpc_name
  vpc_cidr   = var.vpc_cidr
  aws_region = var.aws_region
}

# Next.js Application on ECS
module "nextjs_app" {
  source = "./modules/nextjs_app"

  app_name           = "assessor-app"
  environment        = var.environment
  aws_region         = var.aws_region
  vpc_id             = module.baseline_environment_network.vpc_id
  public_subnet_ids  = module.baseline_environment_network.vpc_public_subnet_ids
  private_subnet_ids = module.baseline_environment_network.vpc_private_subnet_ids
  certificate_arn    = var.certificate_arn
  allowed_cidr_block = var.allowed_cidr_block

  # S3 bucket for document uploads
  enable_s3_document_upload = true
  s3_document_bucket_name   = aws_s3_bucket.document_upload_s3_bucket.id
  s3_document_bucket_arn    = aws_s3_bucket.document_upload_s3_bucket.arn

  # DynamoDB table for upload tracking
  dynamodb_uploads_table_name = aws_dynamodb_table.upload_tracking.name
  dynamodb_uploads_table_arn  = aws_dynamodb_table.upload_tracking.arn

  # Bedrock model for AI damage assessment
  bedrock_model_id = var.aws_bedrock_model_id
}

# S3 Bucket for Document Uploads
resource "aws_s3_bucket" "document_upload_s3_bucket" {
  bucket_prefix = "ai-insurance-document-upload"

  tags = {
    Environment = var.environment
  }
}

# DynamoDB Table for Upload Tracking
resource "aws_dynamodb_table" "upload_tracking" {
  name         = "ai-insurance-upload-tracking-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "uploadId"

  attribute {
    name = "uploadId"
    type = "S"
  }

  tags = {
    Environment = var.environment
  }
}