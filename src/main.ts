import { NestFactory } from '@nestjs/core';

import helmet from 'helmet';

import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { typeOrmConfig } from './config/typeorm.config';

let dataSource: DataSource;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get('APP_PORT') || 4000;
  initializeDatabase();

  app.enableCors({
    origin: (req, callback) => callback(null, true),
  });
  app.use(helmet());

  await app.listen(port, () => {
    console.log('App is running on %s port', port);
  });
}
bootstrap();


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
