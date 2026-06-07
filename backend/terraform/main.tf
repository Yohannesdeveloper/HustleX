# Terraform Multi-Region Deployment for HustleX
# Deploys to US-East-1 (primary), US-West-2, EU-West-1

terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "hustlex-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "hustlex-terraform-lock"
  }
}

# ================================
# Provider Configuration
# ================================
provider "aws" {
  alias  = "primary"
  region = "us-east-1"
}

provider "aws" {
  alias  = "secondary_us"
  region = "us-west-2"
}

provider "aws" {
  alias  = "secondary_eu"
  region = "eu-west-1"
}

# ================================
# Variables
# ================================
variable "environment" {
  default = "production"
}

variable "app_version" {
  default = "latest"
}

variable "min_instances" {
  default = 10
}

variable "max_instances" {
  default = 100
}

# ================================
# Primary Region (US-East-1)
# ================================
module "primary_region" {
  source = "./modules/region"

  providers = {
    aws = aws.primary
  }

  environment       = var.environment
  app_version       = var.app_version
  region            = "us-east-1"
  is_primary        = true
  min_instances     = var.min_instances
  max_instances     = var.max_instances
  
  mongodb_uri       = var.mongodb_primary_uri
  redis_url         = var.redis_primary_url
}

# ================================
# Secondary Region (US-West-2)
# ================================
module "secondary_us" {
  source = "./modules/region"

  providers = {
    aws = aws.secondary_us
  }

  environment       = var.environment
  app_version       = var.app_version
  region            = "us-west-2"
  is_primary        = false
  min_instances     = 5
  max_instances     = 50
  
  mongodb_uri       = var.mongodb_secondary_uri
  redis_url         = var.redis_secondary_url
}

# ================================
# Secondary Region (EU-West-1)
# ================================
module "secondary_eu" {
  source = "./modules/region"

  providers = {
    aws = aws.secondary_eu
  }

  environment       = var.environment
  app_version       = var.app_version
  region            = "eu-west-1"
  is_primary        = false
  min_instances     = 5
  max_instances     = 50
  
  mongodb_uri       = var.mongodb_secondary_uri
  redis_url         = var.redis_secondary_url
}

# ================================
# Global Resources
# ================================

# Route 53 Global Routing
resource "aws_route53_health_check" "primary" {
  provider          = aws.primary
  fqdn              = "api.hustlex.com"
  port              = 443
  type              = "HTTPS"
  resource_path     = "/api/health/detailed"
  failure_threshold = 3
  request_interval  = 30

  tags = {
    Name = "hustlex-primary-health-check"
  }
}

resource "aws_route53_record" "global" {
  zone_id = var.hosted_zone_id
  name    = "api.hustlex.com"
  type    = "A"

  latency_routing_policy {
    region = "us-east-1"
  }

  alias {
    name                   = module.primary_region.alb_dns_name
    zone_id                = module.primary_region.alb_zone_id
    evaluate_target_health = true
  }

  set_identifier  = "primary"
  health_check_id = aws_route53_health_check.primary.id
}

resource "aws_route53_record" "secondary_us" {
  zone_id = var.hosted_zone_id
  name    = "api.hustlex.com"
  type    = "A"

  latency_routing_policy {
    region = "us-west-2"
  }

  alias {
    name                   = module.secondary_us.alb_dns_name
    zone_id                = module.secondary_us.alb_zone_id
    evaluate_target_health = true
  }

  set_identifier = "secondary-us"
}

resource "aws_route53_record" "secondary_eu" {
  zone_id = var.hosted_zone_id
  name    = "api.hustlex.com"
  type    = "A"

  latency_routing_policy {
    region = "eu-west-1"
  }

  alias {
    name                   = module.secondary_eu.alb_dns_name
    zone_id                = module.secondary_eu.alb_zone_id
    evaluate_target_health = true
  }

  set_identifier = "secondary-eu"
}

# ================================
# Outputs
# ================================
output "primary_region_url" {
  value = "https://api.hustlex.com"
}

output "primary_alb_dns" {
  value = module.primary_region.alb_dns_name
}

output "secondary_us_alb_dns" {
  value = module.secondary_us.alb_dns_name
}

output "secondary_eu_alb_dns" {
  value = module.secondary_eu.alb_dns_name
}

output "mongodb_atlas_url" {
  value     = var.mongodb_primary_uri
  sensitive = true
}
