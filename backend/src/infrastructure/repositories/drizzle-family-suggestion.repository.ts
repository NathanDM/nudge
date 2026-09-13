import { Injectable, Inject } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { FamilySuggestionRepository } from '../../domain/user/family-suggestion.repository';
import { FamilySuggestion } from '../../domain/user/family-suggestion';
import { DRIZZLE, DrizzleDB } from '../database/drizzle.provider';

//   theirs: user_contacts(user_id = him, contact_id = me, type = family)   ← "il m'a"
//   mine:   user_contacts(user_id = me,  contact_id = him)                 ← "je l'ai" (peut manquer)
//   d:      family_suggestion_dismissals(user_id = me, contact_id = him)   ← "j'ai refusé"
//
//   suggestion(him) = theirs ∧ ¬(mine.type = family) ∧ ¬d ∧ him.managed_by IS NULL
//   accept(him)     = INSERT mine[family] WHERE theirs   (RETURNING → 403 si vide)
//   dismiss(him)    = INSERT d            WHERE theirs   (RETURNING → 403 si vide, no-op sur doublon)
@Injectable()
export class DrizzleFamilySuggestionRepository implements FamilySuggestionRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findSuggestions(userId: string): Promise<FamilySuggestion[]> {
    const result = await this.db.execute(sql`
      SELECT u.id, u.name, mine.contact_type AS "currentType"
      FROM user_contacts theirs
      JOIN users u ON u.id = theirs.user_id
      LEFT JOIN user_contacts mine
        ON mine.user_id = ${userId} AND mine.contact_id = theirs.user_id
      LEFT JOIN family_suggestion_dismissals d
        ON d.user_id = ${userId} AND d.contact_id = theirs.user_id
      WHERE theirs.contact_id = ${userId}
        AND theirs.user_id <> ${userId}
        AND theirs.contact_type = 'family'
        AND (mine.contact_id IS NULL OR mine.contact_type <> 'family')
        -- gstack-shortcut(dec-e2f6654b): refus à vie, upgrade when un proche ré-ajouté reste invisible (d.created_at < theirs.created_at)
        AND d.contact_id IS NULL
        AND u.managed_by IS NULL
      ORDER BY theirs.created_at DESC
      LIMIT 50
    `);
    return result.rows as FamilySuggestion[];
  }

  async addFamilyIfReciprocal(userId: string, contactId: string): Promise<boolean> {
    const result = await this.db.execute(sql`
      INSERT INTO user_contacts (user_id, contact_id, contact_type)
      SELECT ${userId}::uuid, ${contactId}::uuid, 'family'
      WHERE ${this.reciprocal(userId, contactId)}
      ON CONFLICT (user_id, contact_id) DO UPDATE SET contact_type = 'family'
      RETURNING user_id
    `);
    return result.rows.length > 0;
  }

  async dismissIfReciprocal(userId: string, contactId: string): Promise<boolean> {
    const result = await this.db.execute(sql`
      INSERT INTO family_suggestion_dismissals (user_id, contact_id)
      SELECT ${userId}::uuid, ${contactId}::uuid
      WHERE ${this.reciprocal(userId, contactId)}
      -- DO NOTHING would leave RETURNING empty on a repeat dismissal and turn it into a 403
      ON CONFLICT (user_id, contact_id) DO UPDATE SET user_id = EXCLUDED.user_id
      RETURNING user_id
    `);
    return result.rows.length > 0;
  }

  private reciprocal(userId: string, contactId: string) {
    return sql`${contactId}::uuid <> ${userId}::uuid AND EXISTS (
      SELECT 1 FROM user_contacts r
      WHERE r.user_id = ${contactId} AND r.contact_id = ${userId} AND r.contact_type = 'family'
    )`;
  }
}
