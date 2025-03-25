import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOne(name: string): Promise<User> {
    return this.userRepository.findOne({ where: { name } });
  }

  async createOne({ name, email, password }: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create({ name, email, password });

    return this.userRepository.save(newUser);
  }
}
