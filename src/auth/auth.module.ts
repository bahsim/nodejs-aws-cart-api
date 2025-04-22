import { forwardRef, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { BasicStrategy, LocalStrategy } from './strategies';

import { JWT_CONFIG } from '../constants';
import { UsersModule } from '../users/users.module';
import { LocalAuthGuard } from './guards';

const { secret, expiresIn } = JWT_CONFIG;

@Module({
  imports: [
    forwardRef(() => UsersModule),
    PassportModule.register({ defaultStrategy: 'local' }),
  ],
  providers: [LocalStrategy, BasicStrategy, LocalAuthGuard, AuthService],
  exports: [AuthService],
})
export class AuthModule {}
