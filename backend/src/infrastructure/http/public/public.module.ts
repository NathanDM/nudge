import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { PublicShareController } from './public-share.controller';
import { USER_REPOSITORY } from '../../../domain/user/user.repository';
import { GIFT_IDEA_REPOSITORY } from '../../../domain/gift/gift-idea.repository';
import { DrizzleUserRepository } from '../../repositories/drizzle-user.repository';
import { DrizzleGiftIdeaRepository } from '../../repositories/drizzle-gift-idea.repository';

@Module({
  imports: [ThrottlerModule.forRoot([{ ttl: 60000, limit: 5 }])],
  controllers: [PublicShareController],
  providers: [
    { provide: USER_REPOSITORY, useClass: DrizzleUserRepository },
    { provide: GIFT_IDEA_REPOSITORY, useClass: DrizzleGiftIdeaRepository },
  ],
})
export class PublicModule {}
