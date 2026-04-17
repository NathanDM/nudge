import {
  Injectable,
  Inject,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  GiftIdeaRepository,
  GIFT_IDEA_REPOSITORY,
} from '../../domain/gift/gift-idea.repository';
import { UserRepository, USER_REPOSITORY } from '../../domain/user/user.repository';
import { GiftResponseDto } from './gift.dto';
import { CreateGiftDto } from './create-gift.dto';

type OgData = { imageUrl: string | null; title: string | null; price: number | null };

function extractMeta(html: string, property: string): string | null {
  const p = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return (
    html.match(new RegExp(`<meta[^>]+property=["']${p}["'][^>]+content=["']([^"']+)["']`, 'i'))?.[1] ??
    html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${p}["']`, 'i'))?.[1] ??
    null
  );
}

async function fetchOgData(url: string): Promise<OgData> {
  try {
    const res = await Promise.race([
      fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Nudge/1.0)' } }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
    ]);
    const html = await (res as Response).text();
    const imageUrl = extractMeta(html, 'og:image');
    const title = extractMeta(html, 'og:title');
    const priceStr = extractMeta(html, 'product:price:amount') ?? extractMeta(html, 'og:price:amount');
    const parsed = priceStr ? Math.round(parseFloat(priceStr) * 100) : null;
    return { imageUrl, title, price: parsed !== null && !isNaN(parsed) ? parsed : null };
  } catch {
    return { imageUrl: null, title: null, price: null };
  }
}

@Injectable()
export class GiftService {
  constructor(
    @Inject(GIFT_IDEA_REPOSITORY)
    private readonly giftRepo: GiftIdeaRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepository,
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
          ogImageUrl: g.ogImageUrl,
          claimedByName: g.claimedByName,
          claimedAnonymously: g.claimedAnonymously,
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
      ogImageUrl: g.ogImageUrl,
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
    const og = dto.url ? await fetchOgData(dto.url) : { imageUrl: null, title: null, price: null };
    const title = dto.title || og.title;
    if (!title) throw new BadRequestException('Titre requis');
    return this.giftRepo.create({
      forUserId,
      addedByUserId,
      title,
      description: dto.description,
      url: dto.url,
      price: dto.price ?? og.price,
      ogImageUrl: og.imageUrl,
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

  async releaseAnonymousClaim(giftId: string, userId: string) {
    const gift = await this.giftRepo.findById(giftId);
    if (!gift) throw new NotFoundException('Gift not found');
    if (!gift.claimedAnonymously) throw new BadRequestException('Not anonymously claimed');

    const isOwner = gift.canBeUnclaimedByOwner(userId);
    if (!isOwner) {
      const owner = await this.userRepo.findById(gift.forUserId);
      if (!owner) throw new NotFoundException('Gift owner not found');
      if (owner.managedBy !== userId)
        throw new ForbiddenException('Cannot release this claim');
    }

    await this.giftRepo.releaseAnonymousClaim(giftId);
    return { success: true };
  }
}
