import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Order } from '../order/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { randomBytes } from 'node:crypto';

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
