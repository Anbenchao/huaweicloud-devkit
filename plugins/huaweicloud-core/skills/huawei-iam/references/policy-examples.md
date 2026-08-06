# IAM Policy Examples

## ECS Read-Only
{"Version":"1.1","Statement":[{"Effect":"Allow","Action":["ecs:List*","ecs:Get*","ecs:Describe*"],"Resource":["*"]}]}

## OBS Bucket Operator (scoped)
{"Version":"1.1","Statement":[{"Effect":"Allow","Action":["obs:Get*","obs:Put*","obs:Delete*","obs:List*"],"Resource":["arn:aws:obs:::my-bucket","arn:aws:obs:::my-bucket/*"]}]}

## RDS Backup Only
{"Version":"1.1","Statement":[{"Effect":"Allow","Action":["rds:CreateBackup","rds:ListBackup","rds:RestoreFromBackup"],"Resource":["*"]}]}

## Conditions Example (Confused Deputy Protection)
{"Version":"1.1","Statement":[{"Effect":"Allow","Action":["ecs:*"],"Resource":["*"],"Condition":{"StringEquals":{"g:SourceAccount":"0123456789"},"StringLike":{"g:SourceUrn":"urn:obs:*"}}}]}
