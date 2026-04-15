import { Module } from '@nestjs/common';
import { PublicShareController } from './public-share.controller';
import { USER_REPOSITORY } from '../../../domain/user/user.repository';
import { GIFT_IDEA_REPOSITORY } from '../../../domain/gift/gift-idea.repository';
import { DrizzleUserRepository } from '../../repositories/drizzle-user.repository';
import { DrizzleGiftIdeaRepository } from '../../repositories/drizzle-gift-idea.repository';

@Module({
  controllers: [PublicShareController],
  providers: [
    { provide: USER_REPOSITORY, useClass: DrizzleUserRepository },
    { provide: GIFT_IDEA_REPOSITORY, useClass: DrizzleGiftIdeaRepository },
  ],
})
export class PublicModule {}
