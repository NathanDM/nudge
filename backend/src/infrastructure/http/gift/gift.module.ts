import { Module } from '@nestjs/common';
import { GiftController } from './gift.controller';
import { GiftService } from '../../../application/gift/gift.service';
import { GIFT_IDEA_REPOSITORY } from '../../../domain/gift/gift-idea.repository';
import { DrizzleGiftIdeaRepository } from '../../repositories/drizzle-gift-idea.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [GiftController],
  providers: [
    GiftService,
    { provide: GIFT_IDEA_REPOSITORY, useClass: DrizzleGiftIdeaRepository },
  ],
})
export class GiftModule {}
