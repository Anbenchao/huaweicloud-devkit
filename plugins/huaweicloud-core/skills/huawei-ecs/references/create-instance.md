# Create ECS Instance SOP

## 1. Discover flavors
hcloud ECS ListFlavors --cli-region=<region> --cli-output=json

## 2. Find image
hcloud IMS ListImages --cli-region=<region> --imagetype=gold

## 3. Verify VPC/subnet
hcloud VPC ListVpcs --cli-region=<region>
hcloud VPC ListSubnets --vpc_id=<vpc-id> --cli-region=<region>

## 4. Create
hcloud ECS CreateServers --cli-region=<region> --server.name=<name> --server.flavorRef=<flavor-id> --server.imageRef=<image-id> --server.nics.1.subnet_id=<subnet-id> --server.root_volume.volumetype=SSD --server.root_volume.size=40 --server.vpcid=<vpc-id> --server.count=1

## 5. EIP (optional)
hcloud EIP CreatePublicip --bandwidth.size=5 --bandwidth.share_type=PER
hcloud EIP BindPublicIp --publicip_id=<eip-id> --server_id=<instance-id>

## 6. Verify
hcloud ECS ListServersDetails --cli-region=<region> --server_id=<instance-id>
Expected: status=ACTIVE

## Constraints
- Name: 1-64 chars, letters/digits/hyphens
- Flavor: must be available in target region
- Root volume: SSD 40GB min
