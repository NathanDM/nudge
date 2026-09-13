import { sql } from 'drizzle-orm';
import { createTestDb, TestDB } from './test-db';

describe('migrations on PGlite', () => {
  let db: TestDB;
  let close: () => Promise<void>;

  beforeAll(async () => ({ db, close } = await createTestDb()));
  afterAll(() => close());

  const tables = async () => {
    const result = await db.execute(sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
    return result.rows.map((r: any) => r.table_name);
  };

  it('creates family_suggestion_dismissals and drops families', async () => {
    const names = await tables();
    expect(names).toContain('family_suggestion_dismissals');
    expect(names).not.toContain('families');
    expect(names).not.toContain('user_families');
  });

  it('creates both user_contacts indexes (0006 statement-breakpoint fix + 0009)', async () => {
    const result = await db.execute(sql`SELECT indexname FROM pg_indexes WHERE tablename = 'user_contacts'`);
    const names = result.rows.map((r: any) => r.indexname);
    expect(names).toContain('idx_user_contacts_user_type');
    expect(names).toContain('idx_user_contacts_contact_type');
  });

  it('applies the orphan migrations (partial unique index on phone)', async () => {
    const result = await db.execute(sql`SELECT indexdef FROM pg_indexes WHERE indexname = 'users_phone_unique'`);
    expect((result.rows[0] as any).indexdef).toContain('WHERE (phone IS NOT NULL)');
  });
});
