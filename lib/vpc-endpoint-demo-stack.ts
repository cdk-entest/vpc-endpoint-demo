import { Stack, StackProps, aws_ec2, aws_iam } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Effect } from "aws-cdk-lib/aws-iam";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class VpcEndpointDemoStack extends Stack {
  public readonly vpc: aws_ec2.Vpc;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

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

    vpc.addGatewayEndpoint("S3Endpoint", {
      service: aws_ec2.GatewayVpcEndpointAwsService.S3,
    });

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

    this.vpc = vpc;
  }
}

interface Ec2Props extends StackProps {
  vpc: aws_ec2.Vpc;
}

export class Ec2Stack extends Stack {
  constructor(scope: Construct, id: string, props: Ec2Props) {
    super(scope, id, props);

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

    const sg = new aws_ec2.SecurityGroup(
      this,
      "SGForPrivateEc2VpcEndpointDemo",
      {
        securityGroupName: "SGForPrivateEc2VpcEndpointDemo",
        vpc: props.vpc,
      }
    );

    sg.addIngressRule(aws_ec2.Peer.anyIpv4(), aws_ec2.Port.allTcp());

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
  }
}
