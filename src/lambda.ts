import 'reflect-metadata';
import { Handler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { Express } from 'express';
import serverlessExpress from '@vendia/serverless-express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as express from 'express';
import { DataSource } from 'typeorm';
import { getDatabaseConfig } from './config/database.config';

let cachedServer: Express;
let dataSource: DataSource;

async function bootstrap(): Promise<Express> {
  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  // Initialize TypeORM connection if not exists
  if (!dataSource || !dataSource.isInitialized) {
    const dbConfig = await getDatabaseConfig();
    dataSource = new DataSource(dbConfig);
    await dataSource.initialize();
  }

  await app.init();
  return expressApp;
}

export const handler: Handler<APIGatewayProxyEvent> = async (
  _event: APIGatewayProxyEvent,
  _context: Context
) => {
  if (!cachedServer) {
    cachedServer = await bootstrap();
  }
  return serverlessExpress({ app: cachedServer });
};
