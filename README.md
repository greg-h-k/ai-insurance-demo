# AI Insurance Demo

## Overview

This demo project shows how AI can be applied in insurance claims. The use case shown is a web application that allows users to upload images showing damage to their car. The image is submitted to a multimodal AI model on Amazon Bedrock which analyses the photo and returns structured claim information:

- **Car metadata**: make, model and color
- **Damage summary**: textual description of the damage
- **Estimated repair cost**: a min/max USD range

The AI assessment is stored alongside the upload metadata in DynamoDB, and users are presented with a summary page displaying the image and all AI-generated findings.

## Tech stack

| Layer          | Technology                                                                  |
| -------------- | --------------------------------------------------------------------------- |
| Frontend       | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui    |
| AI             | Amazon Bedrock (Claude Sonnet) via Vercel AI SDK (`@ai-sdk/amazon-bedrock`) |
| Storage        | Amazon S3 (image uploads), DynamoDB (upload tracking + assessment results)  |
| Infrastructure | AWS ECS Fargate, ALB, VPC, ECR, managed via Terraform                       |
| Observability  | AWS OpenTelemetry Collector sidecar, CloudWatch Logs                        |

## Project structure

```
assessor-app/                 # Next.js web application
├── app/
│   ├── page.tsx              # Homepage
│   ├── upload/page.tsx       # Photo upload page (drag-and-drop, preview)
│   ├── uploads/[uploadId]/   # Assessment summary page (server component)
│   └── api/
│       ├── upload/route.ts   # POST: S3 upload + Bedrock assessment + DynamoDB write
│       └── uploads/route.ts  # GET: list all tracked uploads
├── lib/
│   ├── bedrock.ts            # Bedrock client, Zod schema, assessDamage()
│   ├── uploads.ts            # UploadRecord type, DynamoDB data access functions
│   └── dynamodb.ts           # DynamoDB Document Client singleton
├── components/ui/            # shadcn/ui components (Button, Card, Badge)
└── Dockerfile                # Multi-stage build, standalone output

terraform/                    # Infrastructure as Code
├── main.tf                   # Root module: S3 bucket, DynamoDB table, module wiring
├── variables.tf              # Root input variables
├── outputs.tf                # Root outputs (S3 bucket name, DynamoDB table name)
├── terraform.tfvars          # Environment-specific values
└── modules/
    ├── base-network/         # VPC, subnets, NAT Gateway, VPC endpoints (S3, DynamoDB, SSM)
    └── nextjs_app/           # ECS cluster/service, ECR, ALB, IAM roles, CloudWatch

deploy-app-image.sh           # Builds Docker image and pushes to ECR
```

## Architecture and data flow

![demo-architecture](./docs/ai-insurance-demo-arch.png)

### Upload and assessment flow

1. User selects or drags a photo onto the upload page
2. Clicking "Upload Image" sends the file to `POST /api/upload`
3. The API route validates the file, uploads it to S3, then sends the image buffer to Amazon Bedrock for AI analysis
4. Bedrock returns structured JSON (vehicle metadata, damage summary, repair cost estimate) validated against a Zod schema
5. The upload metadata and AI assessment are written to DynamoDB in a single record
6. The user is redirected to `/uploads/[uploadId]` — a server-rendered summary page that displays the image (via S3 presigned URL) alongside the assessment results

## Prerequisites

To deploy from a local machine you need:

- **Node.js** (v24+ recommended) and npm
- **Terraform** (v1.0+)
- **Docker** (for building the container image)
- **AWS CLI** configured with credentials that have permissions to create the required resources
- An **ACM certificate** in the target region for HTTPS on the ALB
- **Amazon Bedrock model access** enabled for the Claude Sonnet model in your AWS account (request access via the Bedrock console if not already enabled)

Note the devcontainer allows for running with AI code assistance, but uses a firewall to limit access, so run the app and deploy commands outside of the container.

## Terraform variables

The following variables must be configured in `terraform/terraform.tfvars` or supplied at runtime via `TF_VAR_` environment variables:

| Variable               | Description                          | Example                                               |
| ---------------------- | ------------------------------------ | ----------------------------------------------------- |
| `environment`          | Environment name                     | `dev`                                                 |
| `aws_region`           | AWS deployment region                | `us-east-1`                                           |
| `vpc_name`             | Name for the VPC                     | `ai-insurance-vpc`                                    |
| `vpc_cidr`             | CIDR block for the VPC               | `10.0.0.0/16`                                         |
| `certificate_arn`      | ARN of an ACM certificate for HTTPS  | `arn:aws:acm:us-east-1:123456789:certificate/abc-123` |
| `allowed_cidr_block`   | CIDR block allowed to access the ALB | `0.0.0.0/0`                                           |
| `aws_bedrock_model_id` | Bedrock model ID for AI assessment   | `global.anthropic.claude-sonnet-4-5-20250929-v1:0`    |

Sensitive values like `certificate_arn` and `allowed_cidr_block` can be kept out of source control by providing them at runtime:

```bash
export TF_VAR_certificate_arn="arn:aws:acm:us-east-1:123456789:certificate/abc-123"
export TF_VAR_allowed_cidr_block="203.0.113.0/24"
```

## Deployment

### 1. Deploy infrastructure

```bash
cd terraform
terraform init
terraform plan    # Review the resources that will be created
terraform apply
cd ..
```

This creates the VPC, ECS cluster, ALB, ECR repository, S3 bucket, DynamoDB table, IAM roles, and VPC endpoints.

### 2. Build and push the Docker image

The deploy script requires two environment variables:

```bash
export AWS_REGION=us-east-1
export AWS_ACCOUNT_ID=123456789012
./deploy-app-image.sh
```

This authenticates with ECR, builds the Docker image for `linux/amd64`, and pushes it as `assessor-app:latest`.

### 3. Force ECS redeployment

After pushing a new image, force the ECS service to pick it up:

```bash
aws ecs update-service \
  --cluster assessor-app-cluster \
  --service assessor-app-service \
  --force-new-deployment \
  --region us-east-1
```

### 4. Access the application

Once the ECS service stabilises, find the ALB DNS name:

```bash
aws elbv2 describe-load-balancers \
  --names assessor-app-alb \
  --query 'LoadBalancers[0].DNSName' \
  --output text \
  --region us-east-1
```

Navigate to `https://<ALB_DNS_NAME>` in a browser.

## Local development

```bash
cd assessor-app
npm install
npm run dev
```

The dev server starts on `http://localhost:3000`. For full functionality, create a `.env.local` file:

```
S3_BUCKET_NAME=<your-s3-bucket-name>
DYNAMODB_UPLOADS_TABLE_NAME=ai-insurance-upload-tracking-dev
BEDROCK_MODEL_ID=global.anthropic.claude-sonnet-4-5-20250929-v1:0
```

AWS credentials must be available in your environment (via `~/.aws/credentials`, SSO session, or environment variables) for S3, DynamoDB, and Bedrock access.

## Design notes

- **Next.js** for rapid development of front end components with React and integrated backend. Typescript for type safety.
- **Amazon Bedrock** for serverless model endpoint to allow for quick demo deployment and low/unpredictable usage associated with demo
- **Claude Sonnet 4.5** as a model capable of many different tasks and with multi modal capabilities to be able to inspect the uploaded image and present quality, well definied observations
- **DynamoDB** to support rapidly changing schema and additional information that we may capture during demo/PoC development
- **Single API call**: The upload, AI assessment, and database write all happen in a single `POST /api/upload` request. This simplifies the client and avoids orphaned uploads, at the cost of a longer request duration (5-15 seconds depending on Bedrock latency).
- **Non-critical AI assessment**: The Bedrock call is wrapped in its own try/catch. If it fails, the upload still succeeds and the error is recorded in DynamoDB. The summary page renders an appropriate error message rather than losing the upload entirely.
- **Structured output via Zod**: The AI response is validated against a Zod schema using the Vercel AI SDK's `generateObject`, ensuring type-safe, predictable output from the model.
- **Presigned URLs for images**: The summary page is a React Server Component that generates a 1-hour presigned S3 URL for the image. The page is marked `force-dynamic` to prevent Next.js from caching expired URLs.

## AI logic

When a user uploads an image, this is passed into the model as an image buffer with a system prompt input giving the model its persona, context and instructions. A schema is also provied to assist with well defined, structured output so that it can be safely rendered in the client UI.

## Future improvements

- User feedback implementation to help capture evaluation/validation data to understand how well the model is performing
- Explore use of regression model, using existing data for training. LLM approach could assist with extracting features, which are then used as input data to the cost prediction model
- Integration with IdP for authentication to the app
- Inference results are captured in DynamoDB, provide UI components to allow browsing. Extract this data to integrate with future ground truth data (actual fix costs)
