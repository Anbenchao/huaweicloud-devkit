---
name: huawei-cce
description: "Use when creating or managing CCE Kubernetes clusters. Covers cluster creation, node pools, SWR registry, autoscaling. Triggers: CCE, Kubernetes, K8s, cluster, node pool, container, SWR. NOT for: serverless functions (use huawei-functiongraph)."
version: 1
---

# Huawei Cloud CCE

**STOP - Do not answer from general knowledge.** Follow the procedure below.

## Critical Warnings
| Trap | Why |
|------|-----|
| Cluster type immutable | Cannot change hybrid/traditional after creation |
| Master managed by Huawei | No SSH to master. Use kubectl only |
| Network model affects pod IP | VPC network gives pods VPC IPs |

## Common Workflows
| Task | Command |
|------|---------|
| List clusters | hcloud CCE ListClusters |
| Create cluster | hcloud CCE CreateCluster --cluster.name=<n> --cluster.flavor=cce.s1.small |
| Create node pool | hcloud CCE CreateNodePool --cluster_id=<id> --nodepool.name=<n> |
| Get kubeconfig | hcloud CCE CreateKubeConfig --cluster_id=<id> |

## SWR
docker tag <img> swr.cn-south-1.myhuaweicloud.com/<org>/<img>
docker push
