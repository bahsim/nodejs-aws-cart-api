import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CartServiceStack } from '../lib/cart-service-stack';

const app = new cdk.App();
new CartServiceStack(app, 'CartServiceStack');
