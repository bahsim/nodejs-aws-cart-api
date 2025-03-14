import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as path from 'path';

export class CartServiceStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create VPC
    const vpc = new ec2.Vpc(this, 'CartServiceVPC', {
      maxAzs: 2,
      natGateways: 1,
    });

    // Create RDS Security Group
    const dbSecurityGroup = new ec2.SecurityGroup(this, 'DBSecurityGroup', {
      vpc,
      description: 'Security group for RDS instance',
      allowAllOutbound: true,
    });

    // Create RDS Instance
    const databaseCredentials = new secretsmanager.Secret(this, 'DBCredentials', {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'postgres' }),
        generateStringKey: 'password',
        excludeCharacters: '/@" ',
      },
    });

    const database = new rds.DatabaseInstance(this, 'CartDatabase', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_14,
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [dbSecurityGroup],
      credentials: rds.Credentials.fromSecret(databaseCredentials),
      databaseName: 'cartdb',
    });

    // Lambda Security Group
    const lambdaSecurityGroup = new ec2.SecurityGroup(this, 'LambdaSecurityGroup', {
      vpc,
      description: 'Security group for Lambda function',
      allowAllOutbound: true,
    });

    // Allow Lambda to access RDS
    database.connections.allowFrom(lambdaSecurityGroup, ec2.Port.tcp(5432));

    // Create Lambda function
    const cartServiceLambda = new nodejs.NodejsFunction(this, 'CartServiceLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '..', 'src', 'lambda.ts'),
      handler: 'handler',
      vpc,
      securityGroups: [lambdaSecurityGroup],
      environment: {
        DB_HOST: database.instanceEndpoint.hostname,
        DB_PORT: '5432',
        DB_NAME: 'cartdb',
        DB_SECRET_ARN: databaseCredentials.secretArn,
      },
      bundling: {
        externalModules: ['aws-sdk'],
        nodeModules: ['pg', 'typeorm', 'reflect-metadata'],
      },
    });

    // Grant Lambda access to read DB credentials
    databaseCredentials.grantRead(cartServiceLambda);

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'CartServiceApi', {
      restApiName: 'Cart Service API',
      deployOptions: {
        stageName: 'prod',
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    // Integrate Lambda with API Gateway
    const integration = new apigateway.LambdaIntegration(cartServiceLambda);
    api.root.addProxy({
      defaultIntegration: integration,
      anyMethod: true,
    });
  }
}
