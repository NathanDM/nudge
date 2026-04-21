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

function extractLdJson(html: string): { title: string | null; price: number | null; imageUrl: string | null } {
  const matches = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const [, raw] of matches) {
    try {
      const data = JSON.parse(raw);
      const entries = Array.isArray(data) ? data : [data];
      for (const entry of entries) {
        const type = entry['@type'];
        if (!['Product', 'ItemPage', 'WebPage'].includes(type)) continue;
        const title = entry.name ?? null;
        const priceStr = entry.offers?.price ?? entry.offers?.[0]?.price ?? null;
        const parsed = priceStr ? Math.round(parseFloat(String(priceStr)) * 100) : null;
        const price = parsed !== null && !isNaN(parsed) ? parsed : null;
        const imageUrl = typeof entry.image === 'string' ? entry.image : entry.image?.[0] ?? null;
        if (title || price) return { title, price, imageUrl };
      }
    } catch { /* skip malformed */ }
  }
  return { title: null, price: null, imageUrl: null };
}

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
};

function shopifyJsonUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const match = u.pathname.match(/^(\/products\/[^/?#]+)/);
    if (!match) return null;
    return `${u.origin}${match[1]}.json`;
  } catch { return null; }
}

function variantId(url: string): string | null {
  try { return new URL(url).searchParams.get('variant'); } catch { return null; }
}

async function fetchShopifyJson(url: string): Promise<OgData> {
  const jsonUrl = shopifyJsonUrl(url);
  if (!jsonUrl) return { imageUrl: null, title: null, price: null };
  const res = await fetch(jsonUrl, { headers: BROWSER_HEADERS });
  if (!res.ok) return { imageUrl: null, title: null, price: null };
  const { product } = await res.json() as { product: { title: string; images: { src: string }[]; variants: { id: number; price: string }[] } };
  if (!product) return { imageUrl: null, title: null, price: null };
  const vid = variantId(url);
  const variant = vid ? product.variants.find((v) => String(v.id) === vid) : product.variants[0];
  const price = variant ? Math.round(parseFloat(variant.price) * 100) : null;
  return {
    title: product.title ?? null,
    imageUrl: product.images?.[0]?.src ?? null,
    price,
  };
}

async function fetchOgData(url: string): Promise<OgData> {
  try {
    const isShopify = /\/products\/[^/?#]+/.test(new URL(url).pathname);

    if (isShopify) {
      const shopify = await Promise.race([
        fetchShopifyJson(url),
        new Promise<OgData>((resolve) => setTimeout(() => resolve({ imageUrl: null, title: null, price: null }), 5000)),
      ]);
      if (shopify.title) return shopify;
    }

    const res = await Promise.race([
      fetch(url, { headers: BROWSER_HEADERS }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
    ]);
    if (!(res as Response).ok) return { imageUrl: null, title: null, price: null };
    const html = await (res as Response).text();
    const imageUrl = extractMeta(html, 'og:image');
    const title = extractMeta(html, 'og:title');
    const priceStr = extractMeta(html, 'product:price:amount') ?? extractMeta(html, 'og:price:amount');
    const parsed = priceStr ? Math.round(parseFloat(priceStr) * 100) : null;
    const ogPrice = parsed !== null && !isNaN(parsed) ? parsed : null;
    if (title && ogPrice) return { imageUrl, title, price: ogPrice };
    const ld = extractLdJson(html);
    return {
      imageUrl: imageUrl ?? ld.imageUrl,
      title: title ?? ld.title,
      price: ogPrice ?? ld.price,
    };
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
        .filter((g) => !g.secret)
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
          canDelete: g.canBeDeletedBy(viewerId),
          secret: false,
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
      secret: g.secret,
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
      secret: dto.secret ?? false,
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
