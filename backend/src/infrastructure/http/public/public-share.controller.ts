import {
  Controller,
  Get,
  Post,
  Param,
  Req,
  NotFoundException,
  ConflictException,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { OptionalAuthGuard } from '../auth/optional-auth.guard';
import { UserRepository, USER_REPOSITORY } from '../../../domain/user/user.repository';
import {
  GiftIdeaRepository,
  GIFT_IDEA_REPOSITORY,
} from '../../../domain/gift/gift-idea.repository';

interface PublicGiftDto {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  price: number | null;
  isClaimed: boolean;
  claimedByName: string | null;
}

@Controller('api/public/share')
export class PublicShareController {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: UserRepository,
    @Inject(GIFT_IDEA_REPOSITORY) private readonly giftRepo: GiftIdeaRepository,
  ) {}

  @Get(':token')
  async getPublicList(@Param('token') token: string) {
    const owner = await this.userRepo.findByShareToken(token);
    if (!owner) throw new NotFoundException('Ce lien n\'est plus valide.');

    const gifts = await this.giftRepo.findByForUserId(owner.id);
    const publicGifts: PublicGiftDto[] = gifts.map((g) => ({
      id: g.id,
      title: g.title,
      description: g.description,
      url: g.url,
      price: g.price,
      isClaimed: g.isClaimed(),
      claimedByName: g.claimedByName,
    }));

    return { ownerName: owner.name, gifts: publicGifts };
  }

  @Post(':token/gifts/:giftId/claim')
  @HttpCode(200)
  @UseGuards(ThrottlerGuard, OptionalAuthGuard)
  async claimGift(
    @Param('token') token: string,
    @Param('giftId') giftId: string,
    @Req() req: any,
  ) {
    const owner = await this.userRepo.findByShareToken(token);
    if (!owner) throw new NotFoundException('Ce lien n\'est plus valide.');

    const callerId: string | undefined = req.user?.id;

    if (callerId) {
      const gift = await this.giftRepo.findById(giftId);
      if (!gift) throw new NotFoundException('Gift not found');
      if (gift.isClaimed()) throw new ConflictException('already_claimed');
      await this.giftRepo.claim(giftId, callerId);
    } else {
      const result = await this.giftRepo.claimAnonymously(giftId, owner.id);
      if (result === 'already_claimed')
        throw new ConflictException('already_claimed');
    }

    return { success: true };
  }
}
