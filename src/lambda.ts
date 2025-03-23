import 'reflect-metadata';
import { Handler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { Express } from 'express';
import serverlessExpress from '@vendia/serverless-express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import express from 'express';
import { DataSource } from 'typeorm';
import { getDatabaseConfig } from './config/database.config';
// import helmet from 'helmet';
// import * as compression from 'compression';

let cachedServer: Express;
let dataSource: DataSource;

async function bootstrap(): Promise<Express> {
  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );
  
  // // Add security headers
  // app.use(helmet());
  // // Add compression
  // app.use(Compression());

  // Initialize TypeORM connection if not exists
  if (!dataSource || !dataSource.isInitialized) {
    const dbConfig = await getDatabaseConfig();
    dataSource = new DataSource(dbConfig);
    await dataSource.initialize();
  }

  await app.init();
  return expressApp;
}

export const cartService: Handler<APIGatewayProxyEvent> = async (
  _event: APIGatewayProxyEvent,
  _context: Context,
) => {
  try {
    if (!cachedServer) {
      cachedServer = await bootstrap();
    }
    return serverlessExpress({ app: cachedServer });
  } catch (error) {
    console.error('Lambda handler error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
