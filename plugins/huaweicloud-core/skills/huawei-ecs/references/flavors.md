# ECS Flavor Specs
> Verify live: hcloud ECS ListFlavors --cli-region=<region> --cli-output=json

## General-Purpose (s-series)
| Flavor | vCPU | RAM | Use Case |
|--------|------|-----|----------|
| s6.small.1 | 1 | 1GB | Dev/test |
| s6.large.2 | 2 | 4GB | Web app |
| s6.xlarge.2 | 4 | 8GB | App server |
| s6.2xlarge.2 | 8 | 16GB | Production |

## Memory-Optimized (m-series)
| Flavor | vCPU | RAM | Use Case |
|--------|------|-----|----------|
| m6.large.8 | 2 | 16GB | Small DB |
| m6.xlarge.8 | 4 | 32GB | MySQL/PG |
| m6.2xlarge.8 | 8 | 64GB | Enterprise DB |

## GPU (g-series)
| Flavor | vCPU | RAM | GPU | Use |
|--------|------|-----|-----|-----|
| g6.2xlarge.8 | 8 | 64GB | 1xT4 | Inference |
| g6.4xlarge.8 | 16 | 128GB | 1xT4 | Training |
