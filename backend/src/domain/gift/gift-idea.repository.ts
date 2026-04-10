import { GiftIdea } from './gift-idea.entity';

export type GiftWithAuthor = GiftIdea & { addedByName: string };

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
  }): Promise<GiftIdea>;
  delete(id: string): Promise<void>;
  claim(id: string, claimedByUserId: string): Promise<GiftIdea>;
  unclaim(id: string): Promise<GiftIdea>;
}

export const GIFT_IDEA_REPOSITORY = Symbol('GIFT_IDEA_REPOSITORY');
