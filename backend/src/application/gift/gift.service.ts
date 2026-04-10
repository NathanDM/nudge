import {
  Injectable,
  Inject,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  GiftIdeaRepository,
  GIFT_IDEA_REPOSITORY,
} from '../../domain/gift/gift-idea.repository';
import { GiftResponseDto } from './gift.dto';
import { CreateGiftDto } from './create-gift.dto';

@Injectable()
export class GiftService {
  constructor(
    @Inject(GIFT_IDEA_REPOSITORY)
    private readonly giftRepo: GiftIdeaRepository,
  ) {}

  async getGiftsForUser(
    forUserId: string,
    viewerId: string,
  ): Promise<GiftResponseDto[]> {
    const gifts = await this.giftRepo.findByForUserId(forUserId);

    if (viewerId === forUserId) {
      return gifts
        .filter((g) => g.addedByUserId === viewerId)
        .map((g) => ({
          id: g.id,
          forUserId: g.forUserId,
          addedByUserId: g.addedByUserId,
          addedByName: g.addedByName,
          title: g.title,
          description: g.description,
          url: g.url,
          price: g.price,
          canDelete: true,
          createdAt: g.createdAt,
        }));
    }

    return gifts.map((g) => ({
      id: g.id,
      forUserId: g.forUserId,
      addedByUserId: g.addedByUserId,
      addedByName: g.addedByName,
      title: g.title,
      description: g.description,
      url: g.url,
      price: g.price,
      claimedByUserId: g.claimedByUserId,
      claimedAt: g.claimedAt,
      canClaim: g.canBeClaimedBy(viewerId),
      canUnclaim: g.canBeUnclaimedBy(viewerId),
      canDelete: g.canBeDeletedBy(viewerId),
      createdAt: g.createdAt,
    }));
  }

  async createGift(
    forUserId: string,
    addedByUserId: string,
    dto: CreateGiftDto,
  ) {
    return this.giftRepo.create({
      forUserId,
      addedByUserId,
      title: dto.title,
      description: dto.description,
      url: dto.url,
      price: dto.price,
    });
  }

  async deleteGift(giftId: string, userId: string) {
    const gift = await this.giftRepo.findById(giftId);
    if (!gift) throw new NotFoundException('Gift not found');
    if (!gift.canBeDeletedBy(userId))
      throw new ForbiddenException('Only the author can delete this gift idea');
    await this.giftRepo.delete(giftId);
  }

  async claimGift(giftId: string, userId: string) {
    const gift = await this.giftRepo.findById(giftId);
    if (!gift) throw new NotFoundException('Gift not found');
    if (!gift.canBeClaimedBy(userId))
      throw new ForbiddenException('Cannot claim this gift');
    return this.giftRepo.claim(giftId, userId);
  }

  async unclaimGift(giftId: string, userId: string) {
    const gift = await this.giftRepo.findById(giftId);
    if (!gift) throw new NotFoundException('Gift not found');
    if (!gift.canBeUnclaimedBy(userId))
      throw new ForbiddenException('Cannot unclaim this gift');
    return this.giftRepo.unclaim(giftId);
  }
}
