variable "environment" {
  type        = string
  description = "Environment name (dev, prod)"
}

variable "aws_region" {
  type        = string
  description = "AWS target deployment region"
}

variable "vpc_name" {
  type        = string
  description = "Name for the VPC"
}

variable "vpc_cidr" {
  type        = string
  description = "A CIDR address range to use for the VPC, must not conflict with existing VPC ranges"
}

variable "certificate_arn" {
  description = "ARN of the ACM certificate for HTTPS"
  type        = string
}

variable "allowed_cidr_block" {
  type = string
}


variable "aws_bedrock_model_id" {
  type        = string
  description = "Bedrock model ID for the AI agent"
}
