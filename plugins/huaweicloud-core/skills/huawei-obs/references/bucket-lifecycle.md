# OBS Bucket Lifecycle

## Create Bucket
hcloud OBS CreateBucket --bucket=<unique-name> --location=cn-south-1

## Lifecycle Rules (JSON)
{
  "Rules": [{
    "ID": "move-to-ia-after-30d",
    "Status": "Enabled",
    "Filter": {"Prefix": ""},
    "Transitions": [{"Days": 30, "StorageClass": "STANDARD_IA"}],
    "Expiration": {"Days": 365}
  }]
}

## Apply
hcloud OBS SetLifecycleConfiguration --bucket=<name> --lifecycle=lifecycle.json

## Static Website
hcloud OBS SetBucketWebsite --bucket=<name> --index=index.html --error=error.html

## Cross-Region Replication
Requires: source bucket versioning enabled, destination bucket in different region, replication IAM role.
