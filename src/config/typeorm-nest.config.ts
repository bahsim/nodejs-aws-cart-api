import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Order } from '../order/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { randomBytes } from 'node:crypto';

/**
 * Generates TypeORM configuration options for NestJS using the provided ConfigService.
 *
 * @param {ConfigService} configService - The configuration service to retrieve database settings.
 * @returns {TypeOrmModuleOptions} The TypeORM module options.
 *
 * @property {string} name - A unique connection name generated using random bytes.
 * @property {string} type - The type of database, set to 'postgres'.
 * @property {string} host - The database host, retrieved from the configuration service.
 * @property {number} port - The database port, retrieved from the configuration service and converted to a number.
 * @property {string} username - The database username, retrieved from the configuration service.
 * @property {string} password - The database password, retrieved from the configuration service.
 * @property {string} database - The database name, retrieved from the configuration service.
 * @property {Array<Function>} entities - The entities to be used by TypeORM.
 * @property {boolean} synchronize - Whether to synchronize the database schema, set to false in production.
 * @property {boolean} logging - Whether to enable logging.
 * @property {boolean} autoLoadEntities - Whether to automatically load entities.
 * @property {object} ssl - SSL configuration options.
 * @property {boolean} ssl.rejectUnauthorized - Whether to reject unauthorized SSL connections.
 * @property {object} extra - Additional configuration options.
 * @property {number} extra.max - The maximum number of connections in the pool, reduced for Lambda.
 * @property {number} extra.connectionTimeoutMillis - The connection timeout in milliseconds.
 * @property {number} extra.query_timeout - The query timeout in milliseconds.
 * @property {number} extra.statement_timeout - The statement timeout in milliseconds.
 * @property {boolean} extra.keepalive - Whether to enable keepalive.
 * @property {number} extra.keepaliveInitialDelayMillis - The initial delay for keepalive in milliseconds.
 */
 export const typeOrmNestConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  name: 'connection_' + randomBytes(4).toString('hex'),
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: +configService.get<number>('DB_PORT'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_DATABASE'),
  entities: [Cart, CartItem, Order, User],
  synchronize: false, // set to false in production
  logging: true,
  autoLoadEntities: true,
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
});
