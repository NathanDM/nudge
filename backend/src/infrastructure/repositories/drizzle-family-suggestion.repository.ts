import { Injectable, Inject } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { FamilySuggestionRepository } from '../../domain/user/family-suggestion.repository';
import { FamilySuggestion } from '../../domain/user/family-suggestion';
import { DRIZZLE, DrizzleDB } from '../database/drizzle.provider';

//   theirs: user_contacts(user_id = him, contact_id = me, type = family)   ← "il m'a"
//   circle: fermeture transitive de mes liens family sortants (me → A → B → …), via = nom de A
//   mine:   user_contacts(user_id = me,  contact_id = him)                 ← "je l'ai" (peut manquer)
//   d:      family_suggestion_dismissals(user_id = me, contact_id = him)   ← "j'ai refusé"
//
//   suggested(him)  = theirs ∨ circle
//   suggestion(him) = suggested ∧ ¬(mine.type = family) ∧ ¬d ∧ him.managed_by IS NULL
//   accept(him)     = INSERT mine[family] WHERE suggested   (RETURNING → 403 si vide)
//   dismiss(him)    = INSERT d            WHERE suggested   (RETURNING → 403 si vide, no-op sur doublon)
@Injectable()
export class DrizzleFamilySuggestionRepository implements FamilySuggestionRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findSuggestions(userId: string): Promise<FamilySuggestion[]> {
    const result = await this.db.execute(sql`
      WITH RECURSIVE ${this.circle(userId)},
      candidates AS (
        SELECT theirs.user_id AS id, NULL::text AS via, theirs.created_at
        FROM user_contacts theirs
        WHERE theirs.contact_id = ${userId} AND theirs.contact_type = 'family'
        UNION ALL
        SELECT id, via, NULL FROM circle
      ),
      -- un même profil peut être à la fois réciproque et dans le cercle : la réciprocité (via NULL) prime
      ranked AS (SELECT DISTINCT ON (id) id, via, created_at FROM candidates ORDER BY id, via NULLS FIRST)
      SELECT u.id, u.name, mine.contact_type AS "currentType", r.via
      FROM ranked r
      JOIN users u ON u.id = r.id
      LEFT JOIN user_contacts mine ON mine.user_id = ${userId} AND mine.contact_id = r.id
      LEFT JOIN family_suggestion_dismissals d ON d.user_id = ${userId} AND d.contact_id = r.id
      WHERE r.id <> ${userId}
        AND (mine.contact_id IS NULL OR mine.contact_type <> 'family')
        -- gstack-shortcut(dec-e2f6654b): refus à vie, upgrade when un proche ré-ajouté reste invisible (d.created_at < theirs.created_at)
        AND d.contact_id IS NULL
        AND u.managed_by IS NULL
      ORDER BY (r.via IS NOT NULL), r.created_at DESC NULLS LAST, u.name
      LIMIT 50
    `);
    return result.rows as FamilySuggestion[];
  }

  async addFamilyIfSuggested(userId: string, contactId: string): Promise<boolean> {
    const result = await this.db.execute(sql`
      INSERT INTO user_contacts (user_id, contact_id, contact_type)
      SELECT ${userId}::uuid, ${contactId}::uuid, 'family'
      WHERE ${this.suggested(userId, contactId)}
      ON CONFLICT (user_id, contact_id) DO UPDATE SET contact_type = 'family'
      RETURNING user_id
    `);
    return result.rows.length > 0;
  }

  async dismissIfSuggested(userId: string, contactId: string): Promise<boolean> {
    const result = await this.db.execute(sql`
      INSERT INTO family_suggestion_dismissals (user_id, contact_id)
      SELECT ${userId}::uuid, ${contactId}::uuid
      WHERE ${this.suggested(userId, contactId)}
      -- DO NOTHING would leave RETURNING empty on a repeat dismissal and turn it into a 403
      ON CONFLICT (user_id, contact_id) DO UPDATE SET user_id = EXCLUDED.user_id
      RETURNING user_id
    `);
    return result.rows.length > 0;
  }

  // UNION (pas UNION ALL) déduplique les (id, via) déjà visités : les cycles s'arrêtent d'eux-mêmes
  private circle(userId: string) {
    return sql`circle(id, via) AS (
      SELECT c.contact_id, u.name
      FROM user_contacts c
      JOIN users u ON u.id = c.contact_id
      WHERE c.user_id = ${userId} AND c.contact_type = 'family'
      UNION
      SELECT c.contact_id, circle.via
      FROM user_contacts c
      JOIN circle ON c.user_id = circle.id
      WHERE c.contact_type = 'family'
    )`;
  }

  private suggested(userId: string, contactId: string) {
    return sql`${contactId}::uuid <> ${userId}::uuid AND (
      EXISTS (
        SELECT 1 FROM user_contacts r
        WHERE r.user_id = ${contactId} AND r.contact_id = ${userId} AND r.contact_type = 'family'
      )
      OR EXISTS (WITH RECURSIVE ${this.circle(userId)} SELECT 1 FROM circle WHERE circle.id = ${contactId}::uuid)
    )`;
  }
}
