#!/bin/bash
set -euo pipefail

# =============================================================================
# Docker Image Build and Push Script
# =============================================================================
#
# Builds the Next.js application Docker image and pushes it to ECR.
#
# Required environment variables:
#   AWS_REGION      - AWS region (e.g., eu-west-2)
#   AWS_ACCOUNT_ID  - AWS account ID
#
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_NAME="assessor-app"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}>>>${NC} $1"
}

log_error() {
    echo -e "${RED}>>>${NC} $1"
}

echo "=============================================="
echo "  Docker Image Build & Push"
echo "=============================================="
echo ""

# Validate required environment variables
log_info "Validating environment variables..."
: "${AWS_REGION:?AWS_REGION is required}"
: "${AWS_ACCOUNT_ID:?AWS_ACCOUNT_ID is required}"

ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

log_info "All required variables present."
echo ""

# Authenticate with ECR
log_info "Logging in to ECR..."
aws ecr get-login-password --region "${AWS_REGION}" | \
    docker login --username AWS --password-stdin "${ECR_REGISTRY}"

# Build Docker image
log_info "Building Docker image..."
docker build --platform linux/amd64 -t "${APP_NAME}" "${SCRIPT_DIR}/${APP_NAME}/"

# Tag image
log_info "Tagging image..."
docker tag "${APP_NAME}:latest" "${ECR_REGISTRY}/${APP_NAME}:latest"

# Push image
log_info "Pushing image to ECR..."
docker push "${ECR_REGISTRY}/${APP_NAME}:latest"

log_info "Docker image pushed successfully."
