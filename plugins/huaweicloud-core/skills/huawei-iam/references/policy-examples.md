# IAM Policy Examples

## ECS Read-Only
{"Version":"1.1","Statement":[{"Effect":"Allow","Action":["ecs:List*","ecs:Get*","ecs:Describe*"],"Resource":["*"]}]}

## OBS Bucket Operator (scoped)
{"Version":"1.1","Statement":[{"Effect":"Allow","Action":["obs:Get*","obs:Put*","obs:Delete*","obs:List*"],"Resource":["arn:aws:obs:::my-bucket","arn:aws:obs:::my-bucket/*"]}]}

## RDS Backup Only
{"Version":"1.1","Statement":[{"Effect":"Allow","Action":["rds:CreateBackup","rds:ListBackup","rds:RestoreFromBackup"],"Resource":["*"]}]}

## FunctionGraph Developer
{"Version":"1.1","Statement":[{"Effect":"Allow","Action":["functiongraph:function:*","functiongraph:trigger:*","functiongraph:runtime:list","functiongraph:version:*"],"Resource":["*"]}]}

## FunctionGraph Read-Only
{"Version":"1.1","Statement":[{"Effect":"Allow","Action":["functiongraph:function:getConfig","functiongraph:function:list","functiongraph:function:invoke","functiongraph:trigger:list","functiongraph:runtime:list"],"Resource":["*"]}]}

## APIG Operator
{"Version":"1.1","Statement":[{"Effect":"Allow","Action":["apig:instance:*","apig:api:*","apig:group:*","apig:environment:*","apig:domain:*"],"Resource":["*"]}]}

## Conditions Example (Confused Deputy Protection)
{"Version":"1.1","Statement":[{"Effect":"Allow","Action":["ecs:*"],"Resource":["*"],"Condition":{"StringEquals":{"g:SourceAccount":"0123456789"},"StringLike":{"g:SourceUrn":"urn:obs:*"}}}]}
