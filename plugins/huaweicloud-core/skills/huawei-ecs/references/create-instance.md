# Create ECS Instance SOP

## 1. Discover flavors
hcloud ECS ListFlavors --cli-region=<region> --cli-output=json

## 2. Find availability zones
hcloud ECS NovaListAvailabilityZones --cli-region=<region>

## 3. Find image

List available images for standard ECS (exclude BareMetal / Ironic):
hcloud IMS ListImages --cli-region=<region> --__imagetype=gold --__isregistered=未注册 --virtual_env_type=FusionCompute --__support_amd=true --limit=50

Filtering explained:
- `--__imagetype=gold`: public marketplace images
- `--virtual_env_type=FusionCompute`: standard ECS hypervisor (this excludes Ironic/BareMetal images)
- `--__support_amd=true`: AMD-compatible images (use `--__support_xen=true` for older Xen-based flavors)
- If `ListImages` returns no results, try `kvm` or omit `virtual_env_type` and check the `virtual_env_type` field in output to filter client-side

Select an image whose `__support_*` flags match the chosen flavor's virtualization type. Verify compatibility:
- From ListFlavors output, look for `os_extra_specs` or `cond:image` field on the chosen flavor
- Cross-check flavor's required image properties against the image's `__support_amd`, `__support_xen`, `__support_kvm` flags

## 3b. Alternative: find image by ID
hcloud IMS GlanceShowImage --image_id=<image-id> --cli-region=<region>
Use this to inspect a specific known image's properties before creating.

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
