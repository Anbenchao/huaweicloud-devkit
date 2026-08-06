# VPC Subnet Guide

## Create VPC
hcloud VPC CreateVpc --vpc.name=<name> --vpc.cidr=192.168.0.0/16

## Create Subnet
hcloud VPC CreateSubnet --subnet.name=<name> --subnet.vpc_id=<vpc-id> --subnet.cidr=192.168.1.0/24 --subnet.gateway_ip=192.168.1.1 --subnet.availability_zone=cn-south-1a

## CIDR Planning
| Environment | VPC CIDR | Subnet CIDR |
|------------|----------|-------------|
| Dev | 192.168.0.0/16 | 192.168.1.0/24 |
| Staging | 10.0.0.0/16 | 10.0.1.0/24 |
| Production | 172.16.0.0/16 | 172.16.1.0/24 (public) + 172.16.2.0/24 (private) |
