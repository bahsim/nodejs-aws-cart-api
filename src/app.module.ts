import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AuthService } from './auth/auth.service';  // Add this import

import { CartModule } from './cart/cart.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { OrderModule } from './order/order.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmNestConfig } from './config/typeorm-nest.config';
import { LocalStrategy } from './auth/strategies';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: typeOrmNestConfig,
    }),
    UsersModule,
    AuthModule,
    CartModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [AuthService, LocalStrategy],
})
export class AppModule {}
