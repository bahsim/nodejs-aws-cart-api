import 'reflect-metadata';
import {
  Handler,
  APIGatewayProxyEvent,
  Context,
  Callback,
  APIGatewayProxyResult,
  APIGatewayProxyEventV2,
} from 'aws-lambda';
import { Express } from 'express';
import serverlessExpress from '@vendia/serverless-express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import express from 'express';
import { DataSource } from 'typeorm';
import { typeOrmConfig } from './config/typeorm.config';
// import helmet from 'helmet';
// import * as Compression from 'compression';

let cachedServer: Express;
let dataSource: DataSource;

/**
 * AWS Lambda handler for processing API Gateway Proxy events.
 * This handler is designed to work with both API Gateway and Lambda Function URLs.
 * It initializes the database and server, handles CORS preflight requests, and processes
 * incoming requests using `serverless-express`.
 *
 * @param event - The API Gateway Proxy event containing request details.
 * @param context - The Lambda execution context.
 * @param callback - The callback function for the Lambda handler.
 * @returns A promise resolving to an API Gateway Proxy result containing the HTTP response.
 *
 * @throws {Error} If the server initialization fails or an unexpected error occurs.
 *
 * @example
 * ```typescript
 * import { cartService } from './lambda';
 * 
 * const event = {
 *   rawPath: '/cart',
 *   requestContext: { http: { method: 'GET' } },
 *   queryStringParameters: { id: '123' },
 *   headers: { 'Content-Type': 'application/json' },
 * };
 * 
 * const context = { callbackWaitsForEmptyEventLoop: true };
 * 
 * cartService(event, context, (error, result) => {
 *   if (error) {
 *     console.error('Error:', error);
 *   } else {
 *     console.log('Result:', result);
 *   }
 * });
 * ```
 */
export const cartService: Handler<APIGatewayProxyEventV2> = async (
  event: APIGatewayProxyEventV2,
  context: Context,
  callback: Callback,
) => {
  // Set context callbackWaitsForEmptyEventLoop to false
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    // Transform the event if it's from Lambda Function URL
    const transformedEvent = {
      ...event,
      path: event.rawPath || '/',
      httpMethod: event.requestContext.http.method,
      // Ensure other required properties exist
      queryStringParameters: event.queryStringParameters || {},
      pathParameters: event.pathParameters || {},
      headers: {
        ...event.headers,
        'Content-Type':
          event.headers?.['Content-Type'] ||
          event.headers?.['content-type'] ||
          'application/json',
      },
    };

    console.log('Handler started', {
      path: transformedEvent.path,
      method: transformedEvent.httpMethod,
    });

    // Handle OPTIONS requests for CORS
    if (transformedEvent.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers':
            'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
          'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE',
          'Access-Control-Max-Age': '3600',
        },
        body: '',
      };
    }

    // Initialize both database and server in parallel
    const [, server] = await Promise.all([
      initializeDatabase(),
      initializeServer(),
    ]);

    // Ensure we have a server instance
    if (!server) {
      throw new Error('Failed to initialize server');
    }

    // Process the request using serverless-express
    const response: APIGatewayProxyResult = await serverlessExpress({
      app: server,
    })(transformedEvent, context, callback);

    return {
      ...response,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers':
          'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        ...(response.headers || {}),
      },
    };
    // return serverlessExpress({ app: cachedServer });
  } catch (error) {
    console.error('Lambda handler error:', error);

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Internal Server Error',
        error: error.message,
      }),
    };
  }
};

/**
 * Initializes the database connection if it is not already initialized.
 * Logs the initialization process and handles any errors that occur.
 *
 * @returns {Promise<DataSource>} The initialized data source.
 * @throws Will throw an error if the database initialization fails.
 */
async function initializeDatabase() {
  if (!dataSource || !dataSource.isInitialized) {
    console.log('Initializing database connection...', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_DATABASE,
      // Don't log credentials
    });

    try {
      dataSource = new DataSource(typeOrmConfig);
      await dataSource.initialize();

      // Test the connection
      await dataSource.query('SELECT 1');

      console.log('Database connection initialized successfully');
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }
  return dataSource;
}

/**
 * Initializes the server if it is not already cached.
 *
 * This function checks if the server is already cached. If not, it initializes
 * the server by calling the `bootstrap` function and caches the result. It logs
 * messages to the console during the initialization process.
 *
 * @returns {Promise<any>} A promise that resolves to the cached server instance.
 */
async function initializeServer(): Promise<any> {
  if (!cachedServer) {
    console.log('Initializing server...');
    cachedServer = await bootstrap();
    console.log('Server initialized');
  }

  return cachedServer;
}

async function bootstrap(): Promise<Express> {
  const expressApp = express();

  // Add raw body parsing middleware
  expressApp.use(
    express.json({
      verify: (req: any, res, buf) => {
        req.rawBody = buf.toString();
      },
    }),
  );

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders:
      'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    exposedHeaders: 'Content-Type,Authorization',
  });

  // // Add security headers
  // app.use(helmet());
  // Add compression
  // app.use(Compression());

  // Initialize TypeORM connection if not exists
  if (!dataSource || !dataSource.isInitialized) {
    dataSource = new DataSource(typeOrmConfig);
    await dataSource.initialize();
  }

  await app.init();
  return expressApp;
}
