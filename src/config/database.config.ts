import { DataSourceOptions } from 'typeorm';
import { SecretsManager } from 'aws-sdk';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';

const secretsManager = new SecretsManager();

export async function getDatabaseConfig(): Promise<DataSourceOptions> {
  // Get database credentials from Secrets Manager
  const secretData = await secretsManager
    .getSecretValue({ SecretId: process.env.DB_SECRET_ARN! })
    .promise();
  
  const dbCredentials = JSON.parse(secretData.SecretString!);

  return {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: dbCredentials.username,
    password: dbCredentials.password,
    database: process.env.DB_NAME,
    entities: [Cart, CartItem],
    synchronize: false, // Set to false in production
    logging: true,
  };
}
