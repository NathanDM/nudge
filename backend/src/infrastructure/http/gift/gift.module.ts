import { Module } from '@nestjs/common';
import { GiftController } from './gift.controller';
import { GiftService } from '../../../application/gift/gift.service';
import { GIFT_IDEA_REPOSITORY } from '../../../domain/gift/gift-idea.repository';
import { USER_REPOSITORY } from '../../../domain/user/user.repository';
import { DrizzleGiftIdeaRepository } from '../../repositories/drizzle-gift-idea.repository';
import { DrizzleUserRepository } from '../../repositories/drizzle-user.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [GiftController],
  providers: [
    GiftService,
    { provide: GIFT_IDEA_REPOSITORY, useClass: DrizzleGiftIdeaRepository },
    { provide: USER_REPOSITORY, useClass: DrizzleUserRepository },
  ],
})
export class GiftModule {}
