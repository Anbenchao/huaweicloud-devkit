---
name: huawei-modelarts
description: "Use when training, deploying, or managing AI/ML models on Huawei Cloud ModelArts. Covers training jobs, model registry, online services, notebook instances. Triggers: ModelArts, model training, AI, machine learning, deep learning, notebook, inference, deployment. NOT for: general AI/ML concepts, non-Huawei platforms."
version: 1
---

# Huawei Cloud ModelArts

**STOP - Do not answer from general knowledge.** Follow the procedure below.

## Critical Warnings
| Trap | Why |
|------|-----|
| Training jobs charge by duration | Stop idle notebooks to avoid costs |
| Model versioning is manual | No automatic version tracking |
| OBS bucket required for training data | Must create OBS bucket before training |

## Common Workflows
| Task | Command |
|------|---------|
| List training jobs | hcloud ModelArts ListTrainingJobs --cli-region=<r> |
| Create training job | hcloud ModelArts CreateTrainingJob --job_name=<n> --algorithm_id=<id> --inputs='[{"obs_url":"<url>"}]' |
| Deploy model | hcloud ModelArts CreateService --service_name=<n> --model_id=<id> --specification=<spec> |
| Create notebook | hcloud ModelArts CreateNotebookInstance --name=<n> --flavor=<f> --volume.size=50 |

## Troubleshooting
| Error | Fix |
|-------|-----|
| OBS access denied | Check OBS bucket policy and IAM role |
| Training job stuck | Check logs via hcloud ModelArts ShowTrainingJobLog |

## Security
- MUST use dedicated OBS buckets for training data
- MUST restrict notebook internet access when not needed
- MUST encrypt training data at rest
