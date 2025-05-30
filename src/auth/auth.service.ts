import 'reflect-metadata';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { UsersService } from '../users/services/users.service';
import { User } from '../users/entities/user.entity';

type TokenResponse = {
  token_type: string;
  access_token: string;
};

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {
    this.loginBasic = this.loginBasic.bind(this);
  }

  async register(payload: User) {
    if (!this.usersService) {
      throw new Error('UsersService not initialized');
    }

    const user = await this.usersService.findOne(payload.name);

    if (user) {
      throw new BadRequestException('User with such name already exists');
    }

    const { id: userId } = await this.usersService.createOne(payload);
    return { userId };
  }

  async validateUser(name: string, password: string): Promise<User> {
    const user = await this.usersService.findOne(name);

    if (!user) {
      return null;
    }

    const isPasswordValid = password === user.password;

    if (isPasswordValid) {
      const { password, ...result } = user;

      return result;
    }

    return null;
  }

  login(user: User, type: 'jwt' | 'basic' | 'default'): TokenResponse {
    const LOGIN_MAP = {
      basic: (user: User) => this.loginBasic(user),
      default: (user: User) => this.loginBasic(user),
    };
    const login = LOGIN_MAP[type];

    return login ? login(user) : LOGIN_MAP.default(user);
  }

  loginBasic(user: User) {
    // const payload = { username: user.name, sub: user.id };
    console.log(user);

    function encodeUserToken(user: User) {
      const { name, password } = user;
      const buf = Buffer.from([name, password].join(':'), 'utf8');

      return buf.toString('base64');
    }

    return {
      token_type: 'Basic',
      access_token: encodeUserToken(user),
    };
  }
}
