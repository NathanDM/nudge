import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from '../../../application/user/user.service';
import { USER_REPOSITORY } from '../../../domain/user/user.repository';
import { DrizzleUserRepository } from '../../repositories/drizzle-user.repository';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    { provide: USER_REPOSITORY, useClass: DrizzleUserRepository },
  ],
})
export class UserModule {}
