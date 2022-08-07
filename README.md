## VPC Endpoint Demo 

note this aws s3 ls can be timeout in case of isolated private ec2 
```bash 
aws s3 ls 
```
then need to specifiy a bucket 
```bash 
aws s3 ls s3://bucket-in-the-same-region-ec2/ 
```

## VPC Endpoint Types 
- Gateway endpoint 
- Interface endpoint 
- Service endpoint 

## Application Stack 
create a vpc 
```tsx
 const vpc = new aws_ec2.Vpc(this, "VpcEndpoint", {
      vpcName: "VpcEndpoint",
      cidr: "10.1.0.0/16",
      subnetConfiguration: [
        {
          name: "Public",
          cidrMask: 24,
          subnetType: aws_ec2.SubnetType.PUBLIC,
        },
        {
          name: "PrivateIsolated",
          cidrMask: 24,
          subnetType: aws_ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });
```
add gateway endpoint s3 
```tsx
vpc.addGatewayEndpoint("S3Endpoint", {
      service: aws_ec2.GatewayVpcEndpointAwsService.S3,
    });
```

add interface endpoints for ssm - ec2
```tsx
 vpc.addInterfaceEndpoint("SsmEndpoint", {
      service: aws_ec2.InterfaceVpcEndpointAwsService.SSM,
      privateDnsEnabled: true,
});

vpc.addInterfaceEndpoint("SsmMessage", {
  service: aws_ec2.InterfaceVpcEndpointAwsService.SSM_MESSAGES,
  privateDnsEnabled: true,
});

vpc.addInterfaceEndpoint("Ec2Message", {
  service: aws_ec2.InterfaceVpcEndpointAwsService.EC2_MESSAGES,
  privateDnsEnabled: true,
});
```
can further add security for the endpoints. Create an ec2 in a isolated subnet without nat 
```tsx 
 new aws_ec2.Instance(this, "PrivateEc2", {
      instanceName: "PrivateEc2",
      vpc: props.vpc,
      instanceType: aws_ec2.InstanceType.of(
        aws_ec2.InstanceClass.T2,
        aws_ec2.InstanceSize.SMALL
      ),
      machineImage: new aws_ec2.AmazonLinuxImage({
        generation: aws_ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      role: role,
      securityGroup: sg,
    });
```
role for ec2 to access s3 and ssm 
```tsx
const role = new aws_iam.Role(this, "RoleForEc2Private", {
      roleName: "RoleForEc2PrivateVpcEndpointDemom",
      assumedBy: new aws_iam.ServicePrincipal("ec2.amazonaws.com"),
      managedPolicies: [
        aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
          "AmazonSSMManagedInstanceCore"
        ),
      ],
    });

role.addToPolicy(
  new aws_iam.PolicyStatement({
    effect: Effect.ALLOW,
    resources: ["*"],
    actions: ["s3:*"],
  })
);
```