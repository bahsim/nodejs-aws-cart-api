import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { DataSourceOptions } from 'typeorm';
import { Order } from '../order/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { randomBytes } from 'node:crypto';

export const typeOrmConfig: DataSourceOptions = {
  name: 'connection_' + randomBytes(4).toString('hex'),
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [Cart, CartItem, Order, User],
  synchronize: true, // Set to false in production
  logging: true,
  ssl: {
    rejectUnauthorized: false, // you might need this if using SSL
  },
  extra: {
    max: 1, // Reduce pool size for Lambda
    connectionTimeoutMillis: 10000,
    query_timeout: 4000,
    statement_timeout: 4000,
    keepalive: true,
    keepaliveInitialDelayMillis: 5000,
  },
};
