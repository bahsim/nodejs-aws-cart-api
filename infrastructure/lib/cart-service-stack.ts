import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';

export class CartServiceStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cartApi = new nodejs.NodejsFunction(this, 'CartService', {
      runtime: lambda.Runtime.NODEJS_18_X,
      functionName: 'CartService',
      handler: 'cartService',
      entry: path.join(__dirname, '../../src/lambda.ts'),
      memorySize: 256,
      timeout: cdk.Duration.seconds(30),
      bundling: {
        externalModules: [
          '@nestjs/platform-socket.io',
          '@grpc/grpc-js',
          '@grpc/proto-loader',
          'amqplib',
          'kafkajs',
          'amqp-connection-manager',
          'ioredis',
          'nats',
          'mqtt',
          '@nestjs/microservices'        ],
      },
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'CartApi', {
      restApiName: 'Cart Service',
      description: 'Cart API Service',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    api.root.addProxy({
      defaultIntegration: new apigateway.LambdaIntegration(cartApi),
      anyMethod: true,
    });
  }
}
