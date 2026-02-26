import { Injectable, Inject } from '@nestjs/common';
import {
  UserRepository,
  USER_REPOSITORY,
} from '../../domain/user/user.repository';
import { User } from '../../domain/user/user.entity';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: UserRepository,
  ) {}

  async findAll(): Promise<Omit<User, 'pin'>[]> {
    const users = await this.userRepo.findAll();
    return users.map(({ pin, ...rest }) => rest);
  }
}
