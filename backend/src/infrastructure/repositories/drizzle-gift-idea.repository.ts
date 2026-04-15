import { Injectable, Inject } from '@nestjs/common';
import { eq, and, isNull } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { GiftIdeaRepository, GiftWithAuthor } from '../../domain/gift/gift-idea.repository';
import { GiftIdea } from '../../domain/gift/gift-idea.entity';
import { DRIZZLE, DrizzleDB } from '../database/drizzle.provider';
import { giftIdeas, users } from '../database/schema';

@Injectable()
export class DrizzleGiftIdeaRepository implements GiftIdeaRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  private toEntity(row: typeof giftIdeas.$inferSelect): GiftIdea {
    return new GiftIdea(
      row.id,
      row.forUserId,
      row.addedByUserId,
      row.title,
      row.description,
      row.url,
      row.price,
      row.claimedByUserId,
      row.claimedAt,
      row.claimedAnonymously,
      row.createdAt,
    );
  }

  async findByForUserId(forUserId: string): Promise<GiftWithAuthor[]> {
    const claimers = alias(users, 'claimer');
    const rows = await this.db
      .select({ gift: giftIdeas, addedByName: users.name, claimedByName: claimers.name })
      .from(giftIdeas)
      .innerJoin(users, eq(giftIdeas.addedByUserId, users.id))
      .leftJoin(claimers, eq(giftIdeas.claimedByUserId, claimers.id))
      .where(eq(giftIdeas.forUserId, forUserId))
      .orderBy(giftIdeas.createdAt);
    return rows.map(({ gift, addedByName, claimedByName }) =>
      Object.assign(this.toEntity(gift), { addedByName, claimedByName: claimedByName ?? null }),
    );
  }

  async findById(id: string): Promise<GiftIdea | null> {
    const [row] = await this.db
      .select()
      .from(giftIdeas)
      .where(eq(giftIdeas.id, id));
    if (!row) return null;
    return this.toEntity(row);
  }

  async create(data: {
    forUserId: string;
    addedByUserId: string;
    title: string;
    description?: string | null;
    url?: string | null;
    price?: number | null;
  }): Promise<GiftIdea> {
    const [row] = await this.db.insert(giftIdeas).values(data).returning();
    return this.toEntity(row);
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(giftIdeas).where(eq(giftIdeas.id, id));
  }

  async claim(id: string, claimedByUserId: string): Promise<GiftIdea> {
    const [row] = await this.db
      .update(giftIdeas)
      .set({ claimedByUserId, claimedAt: new Date() })
      .where(eq(giftIdeas.id, id))
      .returning();
    return this.toEntity(row);
  }

  async unclaim(id: string): Promise<GiftIdea> {
    const [row] = await this.db
      .update(giftIdeas)
      .set({ claimedByUserId: null, claimedAt: null })
      .where(eq(giftIdeas.id, id))
      .returning();
    return this.toEntity(row);
  }

  async claimAnonymously(giftId: string, forUserId: string): Promise<'ok' | 'already_claimed'> {
    const result = await this.db
      .update(giftIdeas)
      .set({ claimedAnonymously: true, claimedAt: new Date() })
      .where(and(
        eq(giftIdeas.id, giftId),
        eq(giftIdeas.forUserId, forUserId),
        eq(giftIdeas.claimedAnonymously, false),
        isNull(giftIdeas.claimedByUserId),
      ))
      .returning({ id: giftIdeas.id });
    return result.length === 1 ? 'ok' : 'already_claimed';
  }

  async releaseAnonymousClaim(giftId: string): Promise<void> {
    await this.db
      .update(giftIdeas)
      .set({ claimedAnonymously: false, claimedAt: null })
      .where(and(
        eq(giftIdeas.id, giftId),
        eq(giftIdeas.claimedAnonymously, true),
      ));
  }
}
