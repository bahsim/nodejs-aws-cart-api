import {
  Controller,
  Get,
  Request,
  Post,
  UseGuards,
  HttpStatus,
  Body,
  HttpCode,
  Inject,
} from '@nestjs/common';
import {
  LocalAuthGuard,
  // JwtAuthGuard,
  BasicAuthGuard,
} from './auth';
import { AuthService } from './auth/auth.service';
import { AppRequest } from './shared';
import { User } from './users/entities/user.entity';

@Controller()
export class AppController {
  constructor(
    @Inject(AuthService) // Add explicit injection
    private readonly authService: AuthService,
  ) {}

  @Get(['', 'ping'])
  healthCheck() {
    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
    };
  }

  @Post('api/auth/register')
  @HttpCode(HttpStatus.CREATED)
  // TODO ADD validation
  async register(@Body() body: User) {
    // Add logging
    console.log('Register endpoint hit');
    console.log('Request body:', body);

    if (!this.authService) {
      throw new Error('AuthService not initialized');
    }

    try {
      const result = await this.authService.register(body);
      console.log('Registration result:', result);

      return result;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('api/auth/login')
  async login(@Request() req: AppRequest) {
    const token = this.authService.login(req.user, 'basic');

    return token;
  }

  @UseGuards(BasicAuthGuard)
  @Get('api/profile')
  async getProfile(@Request() req: AppRequest) {
    return {
      user: req.user,
    };
  }
}
