import 'reflect-metadata';
import {
  Handler,
  APIGatewayProxyEvent,
  Context,
  Callback,
  APIGatewayProxyResult,
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
 * AWS Lambda handler for the cart service.
 * 
 * This handler processes incoming API Gateway events, initializes the database and server,
 * handles CORS preflight requests, processes the request body, and invokes the serverless
 * Express application.
 * 
 * @param {APIGatewayProxyEvent} event - The event object containing request details.
 * @param {Context} context - The context object containing runtime information.
 * @param {Callback} callback - The callback function to signal completion.
 * 
 * @returns {Promise<APIGatewayProxyResult>} The response object containing status code, headers, and body.
 * 
 * @throws {Error} If an error occurs during processing, a 500 Internal Server Error response is returned.
 */
export const cartService: Handler<APIGatewayProxyEvent> = async (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback,
) => {
  // Set context callbackWaitsForEmptyEventLoop to false
  context.callbackWaitsForEmptyEventLoop = false;

  console.log('Handler started', {
    path: event.path,
    method: event.httpMethod,
  });

  try {
    // Handle OPTIONS requests for CORS
    if (event.httpMethod === 'OPTIONS') {
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

    if (!cachedServer) {
      cachedServer = await bootstrap();
    }

    // Log the incoming request for debugging
    console.log('Incoming event:', {
      path: event.path,
      httpMethod: event.httpMethod,
      headers: event.headers,
      body: event.body,
    });

    // Handle the request body
    if (event.body) {
      try {
        // If body is base64 encoded, decode it
        if (event.isBase64Encoded) {
          event.body = Buffer.from(event.body, 'base64').toString();
        }

        // Ensure body is parsed as JSON if content-type is application/json
        const contentType =
          event.headers['content-type'] || event.headers['Content-Type'];
        if (contentType?.includes('application/json')) {
          event.body =
            typeof event.body === 'string'
              ? JSON.parse(event.body)
              : event.body;
        }

        console.log('Processed body:', event.body);
      } catch (error) {
        console.error('Error processing body:', error);
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: 'Invalid request body',
            error: error.message,
          }),
        };
      }
    }

    const response: APIGatewayProxyResult = await serverlessExpress({
      app: server,
    })(event, context, callback);

    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers':
        'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      ...(response.headers || {}),
    };

    return {
      ...response,
      headers,
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
