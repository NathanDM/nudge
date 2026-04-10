import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
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
      row.createdAt,
    );
  }

  async findByForUserId(forUserId: string): Promise<GiftWithAuthor[]> {
    const rows = await this.db
      .select({ gift: giftIdeas, addedByName: users.name })
      .from(giftIdeas)
      .innerJoin(users, eq(giftIdeas.addedByUserId, users.id))
      .where(eq(giftIdeas.forUserId, forUserId))
      .orderBy(giftIdeas.createdAt);
    return rows.map(({ gift, addedByName }) =>
      Object.assign(this.toEntity(gift), { addedByName }),
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
}
