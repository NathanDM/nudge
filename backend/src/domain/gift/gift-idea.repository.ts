import { GiftIdea } from './gift-idea.entity';

export type GiftWithAuthor = GiftIdea & { addedByName: string; claimedByName: string | null };

export interface GiftIdeaRepository {
  findByForUserId(forUserId: string): Promise<GiftWithAuthor[]>;
  findById(id: string): Promise<GiftIdea | null>;
  create(data: {
    forUserId: string;
    addedByUserId: string;
    title: string;
    description?: string | null;
    url?: string | null;
    price?: number | null;
    ogImageUrl?: string | null;
  }): Promise<GiftIdea>;
  delete(id: string): Promise<void>;
  claim(id: string, claimedByUserId: string): Promise<GiftIdea>;
  unclaim(id: string): Promise<GiftIdea>;
  claimAnonymously(giftId: string, forUserId: string): Promise<'ok' | 'already_claimed'>;
  releaseAnonymousClaim(giftId: string): Promise<void>;
}

export const GIFT_IDEA_REPOSITORY = Symbol('GIFT_IDEA_REPOSITORY');
