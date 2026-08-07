# Create ECS Instance SOP

**Before executing any command: If MCP tools are not available** (new session after install), restart your session or use hcloud CLI directly with caution. Commands using adminPass/password WILL appear in shell history — prefer key_name.

## 1. Discover flavors
hcloud ECS ListFlavors --cli-region=<region> --cli-output=json

## 2. Find availability zones
hcloud ECS NovaListAvailabilityZones --cli-region=<region>

## 3. Find image
hcloud IMS ListImages --cli-region=<region> --__imagetype=gold --__isregistered=未注册 --limit=20

Common image IDs (cn-south-1, verify with region):
| Image | ID |
|-------|----|
| Ubuntu 22.04 | Query live via ListImages |
| CentOS 8.2 64bit | Query live via ListImages |
| EulerOS 2.9 64bit | Query live via ListImages |

Always run ListImages to get the latest image IDs — they change over time.

## 4. Verify VPC/subnet
hcloud VPC ListVpcs --cli-region=<region>
hcloud VPC ListSubnets --vpc_id=<vpc-id> --cli-region=<region>

## 5. Create keypair (recommended over adminPass)
hcloud ECS NovaCreateKeypair --keypair.name=<name>
Save the returned private key to a local file. The public key is auto-injected.

Password alternative:
- adminPass: 8-26 chars, must have uppercase + lowercase + digit + special char
- Passwords appear ONCE in creation output and are not retrievable
- Passwords are logged in shell history — this is a security risk

## 6. Create instance
hcloud ECS CreateServers --cli-region=<region> --server.name=<name> --server.flavorRef=<flavor-id> --server.imageRef=<image-id> --server.nics.1.subnet_id=<subnet-id> --server.root_volume.volumetype=SSD --server.root_volume.size=40 --server.vpcid=<vpc-id> --server.availability_zone=<az> --server.key_name=<keypair-name> --server.count=1

## 7. EIP (optional)
hcloud EIP CreatePublicip --publicip.type=EIP --bandwidth.size=5 --bandwidth.share_type=PER --bandwidth.name=<name>
hcloud EIP AssociatePublicips --publicip_id=<eip-id> --publicip.associate_instance_id=<instance-id> --publicip.associate_instance_type=ecs

## 8. Verify
hcloud ECS ListServersDetails --cli-region=<region> --server_id=<instance-id>
Expected: status=ACTIVE

## 9. Delete instance (with cleanup)
hcloud ECS DeleteServers --servers.1.id=<instance-id> --delete_publicip=true --delete_volume=true
Warning: --delete_publicip and --delete_volume default to false. Set to true to avoid orphaned charges.

## Constraints
- Name: 1-64 chars, letters/digits/hyphens
- Flavor: must be available in target region — always ListFlavors first
- Root volume: SSD 40GB min
- Keypair is safer than adminPass (passwords leak into shell history)
