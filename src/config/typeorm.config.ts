import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { DataSourceOptions } from 'typeorm';
import { Order } from '../order/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { randomBytes } from 'node:crypto';

/**
 * Configuration object for TypeORM DataSource.
 * 
 * @constant
 * @type {DataSourceOptions}
 * 
 * @property {string} name - Unique connection name generated using random bytes.
 * @property {string} type - Database type, set to 'postgres'.
 * @property {string | undefined} host - Database host, retrieved from environment variable `DB_HOST`.
 * @property {number} port - Database port, retrieved from environment variable `DB_PORT` or defaulting to 5432.
 * @property {string | undefined} username - Database username, retrieved from environment variable `DB_USERNAME`.
 * @property {string | undefined} password - Database password, retrieved from environment variable `DB_PASSWORD`.
 * @property {string | undefined} database - Database name, retrieved from environment variable `DB_DATABASE`.
 * @property {Array<Function>} entities - Array of entity classes to be used by TypeORM.
 * @property {boolean} synchronize - Indicates if database schema should be auto-synced, should be set to false in production.
 * @property {boolean} logging - Enables logging of database operations.
 * @property {object} ssl - SSL configuration object.
 * @property {boolean} ssl.rejectUnauthorized - Indicates if unauthorized SSL certificates should be rejected.
 * @property {object} extra - Additional configuration options.
 * @property {number} extra.max - Maximum number of connections in the pool, reduced for Lambda.
 * @property {number} extra.connectionTimeoutMillis - Maximum time to wait for a connection, in milliseconds.
 * @property {number} extra.query_timeout - Maximum time to wait for a query to complete, in milliseconds.
 * @property {number} extra.statement_timeout - Maximum time to wait for a statement to complete, in milliseconds.
 * @property {boolean} extra.keepalive - Enables TCP keepalive.
 * @property {number} extra.keepaliveInitialDelayMillis - Initial delay before TCP keepalive probes are sent, in milliseconds.
 */
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
