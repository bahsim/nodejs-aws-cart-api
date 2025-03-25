import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

export class CartServiceStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cartApi = new nodejs.NodejsFunction(this, 'CartService', {
      runtime: lambda.Runtime.NODEJS_20_X,
      functionName: 'CartService',
      handler: 'cartService',
      entry: path.join(__dirname, '../../src/lambda.ts'),
      memorySize: 1024,
      timeout: cdk.Duration.seconds(120),
      bundling: {
        externalModules: [
          'aws-sdk',
          '@nestjs/websockets',
          '@nestjs/microservices',
        ],
        commandHooks: {
          beforeBundling(): string[] {
            return [];
          },
          beforeInstall(): string[] {
            return [];
          },
          afterBundling(inputDir: string, outputDir: string): string[] {
            return [`cp -r ${inputDir}/node_modules ${outputDir}/`];
          },
        },
        esbuildArgs: {
          '--banner:js': `
            import crypto from 'node:crypto';
            global.crypto = crypto;
          `,
        },
      },
      environment: {
        DB_HOST: process.env.DB_HOST ?? '',
        DB_PORT: process.env.DB_PORT ?? '',
        DB_USERNAME: process.env.DB_USERNAME ?? '',
        DB_PASSWORD: process.env.DB_PASSWORD ?? '',
        DB_DATABASE: process.env.DB_DATABASE ?? '',
      },
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'CartApi', {
      restApiName: 'Cart Service',
      description: 'Cart API Service',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'Authorization',
          'X-Amz-Date',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
      },
      deployOptions: {
        stageName: 'api',
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        metricsEnabled: true,
      },
    });

    api.root.addProxy({
      defaultIntegration: new apigateway.LambdaIntegration(cartApi, {
        proxy: true,
        timeout: cdk.Duration.seconds(29), // API Gateway maximum is 29 seconds
        integrationResponses: [
          {
            statusCode: '200',
            responseParameters: {
              'method.response.header.Access-Control-Allow-Origin': "'*'",
            },
          },
        ],
      }),
      anyMethod: true,
      defaultMethodOptions: {
        authorizationType: apigateway.AuthorizationType.NONE, // Temporarily disable auth
        methodResponses: ['200', '201', '400', '401', '403'].map(
          (statusCode) => ({
            statusCode,
            responseParameters: {
              'method.response.header.Access-Control-Allow-Origin': true,
            },
          }),
        ),
      },
    });

    // Grant API Gateway permission to invoke Lambda with broader permissions
    cartApi.addPermission('APIGatewayInvoke', {
      principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      sourceArn: `arn:aws:execute-api:${this.region}:${this.account}:${api.restApiId}/*/*`,
      action: 'lambda:InvokeFunction',
    });
  }
}
