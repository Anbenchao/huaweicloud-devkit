# Create ECS Instance SOP

## 1. Discover flavors
hcloud ECS ListFlavors --cli-region=<region> --cli-output=json

## 2. Find availability zones
hcloud ECS NovaListAvailabilityZones --cli-region=<region>

## 3. Find image
hcloud IMS ListImages --cli-region=<region> --__imagetype=gold --__isregistered=未注册

## 4. Verify VPC/subnet
hcloud VPC ListVpcs --cli-region=<region>
hcloud VPC ListSubnets --vpc_id=<vpc-id> --cli-region=<region>

## 5. Create keypair (recommended)
hcloud DEW CreateKeypair --name=<keypair-name>
Save the returned private key to a local file and chmod 600. The public key is auto-injected into the ECS instance.
Alternatively, use adminPass for password-based auth (password is temporary and displayed only once).

## 6. Create instance
hcloud ECS CreateServers --cli-region=<region> --server.name=<name> --server.flavorRef=<flavor-id> --server.imageRef=<image-id> --server.nics.1.subnet_id=<subnet-id> --server.root_volume.volumetype=SSD --server.root_volume.size=40 --server.vpcid=<vpc-id> --server.availability_zone=<az> --server.key_name=<keypair-name> --server.count=1

## 7. EIP (optional)
hcloud EIP CreatePublicip --bandwidth.size=5 --bandwidth.share_type=PER
hcloud EIP BindPublicIp --publicip_id=<eip-id> --server_id=<instance-id>

## 8. Verify
hcloud ECS ListServersDetails --cli-region=<region> --server_id=<instance-id>
Expected: status=ACTIVE

## 9. Delete instance (with cleanup)
hcloud ECS DeleteServers --servers.1.id=<instance-id> --delete_publicip=true --delete_volume=true
Warning: --delete_publicip and --delete_volume default to false. Set to true to avoid orphaned resources.

## Constraints
- Name: 1-64 chars, letters/digits/hyphens
- Flavor: must be available in target region
- Root volume: SSD 40GB min
- adminPass: if no key_name, must provide adminPass; password complexity requires uppercase, lowercase, digit, and special char, 8-26 chars
- AdminPass appears once in creation output and is NOT retrievable later; prefer key_name over adminPass
