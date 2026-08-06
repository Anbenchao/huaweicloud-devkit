---
name: huawei-deployment
description: "Use when creating, managing, or running deployment tasks and pipelines on Huawei Cloud CloudDeploy. Triggers: CloudDeploy, deployment, CI/CD, pipeline, release, artifact deployment, deploy task. NOT for: CodeArts Build (build pipeline), SWR container registry."
version: 1
---

# Huawei Cloud CloudDeploy

**STOP - Do not answer from general knowledge.** Follow the procedure below.

## Critical Warnings
| Trap | Why |
|------|-----|
| Deployment hosts need agent | Install CloudDeploy agent on target hosts first |
| Task must reference application first | Create application before task |
| Parallel deployments may conflict | Lock resources or use deployment groups |

## Common Workflows
| Task | Command |
|------|---------|
| Create application | hcloud CloudDeploy CreateApp --name=<n> --platform=<p> --cli-region=<r> |
| Create deployment task | hcloud CloudDeploy CreateTask --name=<n> --app_id=<id> --artifact_source_type=OBS |
| Start deployment | hcloud CloudDeploy StartTask --task_id=<id> |
| List tasks | hcloud CloudDeploy ListTasks --app_id=<id> |

## Troubleshooting
| Error | Fix |
|-------|-----|
| Agent offline | Check agent service on target host, network connectivity |
| Deployment timeout | Check artifact size, increase task timeout |

## Security
- MUST use IAM roles for deployment permissions
- MUST verify artifact integrity before deployment
- MUST not store credentials in deployment scripts
