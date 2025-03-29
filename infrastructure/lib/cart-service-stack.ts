import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

/**
 * Represents the CloudFormation stack for the Cart Service.
 * This stack includes the Lambda function for the Cart Service and an API Gateway to expose the Lambda function as a REST API.
 *
 * @class
 * @extends {cdk.Stack}
 *
 * @param {cdk.App} scope - The scope in which this stack is defined.
 * @param {string} id - The scoped construct ID.
 * @param {cdk.StackProps} [props] - Stack properties.
 *
 * @example
 * new CartServiceStack(app, 'CartServiceStack');
 *
 * @property {nodejs.NodejsFunction} cartApi - The Lambda function for the Cart Service.
 * @property {apigateway.RestApi} api - The API Gateway REST API for the Cart Service.
 */
export class CartServiceStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cartFunction = new nodejs.NodejsFunction(this, 'CartService', {
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

    cartFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ['*'],
        allowedMethods: [lambda.HttpMethod.ALL],
        allowedHeaders: ['*']
      }
    });
  }
}
