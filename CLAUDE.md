# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Insurance Claims Demo - A full-stack web application for AI-powered car damage assessment. Users upload car damage images and receive AI-generated claim information including vehicle metadata, damage summary, and repair cost estimates.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Infrastructure**: AWS (Terraform) - ECS Fargate, ALB, VPC, ECR
- **AI**: AWS Bedrock with Claude Sonnet for image analysis
- **Storage**: S3 for document uploads
- **UI Components**: shadcn/ui
- **AI Integration**: Vercel ai-sdk for AI response handling

## Development Guidelines

- Use **shadcn/ui** for all UI components in the web app
- Use **Vercel ai-sdk** for components that interact with AI responses (streaming, chat interfaces, etc.)

## Common Commands

### Frontend Development (assessor-app/)
```bash
cd assessor-app
npm run dev      # Start dev server on :3000
npm run build    # Production build
npm run lint     # ESLint
```

### Infrastructure (terraform/)
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

### Docker Deployment
```bash
# Requires AWS_REGION and AWS_ACCOUNT_ID env vars
./deploy-app-image.sh
```

## Architecture

```
assessor-app/          # Next.js web application
├── app/               # App Router (page.tsx, layout.tsx)
└── Dockerfile         # Multi-stage build, standalone output

terraform/             # Infrastructure as Code
├── main.tf            # Root module
├── terraform.tfvars   # Environment config
└── modules/
    ├── base-network/  # VPC, subnets, security groups, VPC endpoints
    └── nextjs_app/    # ECS, ECR, ALB, IAM roles, CloudWatch
```

## Deployment Flow

1. Modify code in `assessor-app/`
2. Run `npm run build` locally to verify
3. Execute `./deploy-app-image.sh` to build and push Docker image to ECR
4. Force new ECS deployment to pick up latest image
5. Access via ALB DNS name

## Key Configuration

- **Next.js**: Configured for standalone output mode (Docker-optimized)
- **ECS Tasks**: Run as non-root `node` user, 512 CPU / 1024 MB memory
- **Networking**: VPC with public/private subnets, NAT Gateway, VPC Endpoints for AWS services
- **Security**: HTTPS via ACM certificate, CIDR-restricted ALB access
