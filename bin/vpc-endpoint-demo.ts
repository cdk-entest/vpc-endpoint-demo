#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { VpcEndpointDemoStack, Ec2Stack } from '../lib/vpc-endpoint-demo-stack';

const app = new cdk.App();

// vpc stack 
const vpc = new VpcEndpointDemoStack(app, 'VpcEndpointDemoStack', {
  env: {
    region: 'us-west-2'
  }
});

// ec2 stack 
new Ec2Stack(app, "Ec2Stack", {
  vpc: vpc.vpc,
  env: {
    region: 'us-west-2'
  }
})
