import { readFileSync } from 'fs';
import { join } from 'path';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import * as schema from '../infrastructure/database/schema';

const MIGRATIONS = join(__dirname, '../infrastructure/database/migrations');

// Applied by hand in prod, never enrolled in _journal.json: replay them so the test schema matches prod.
const ORPHAN_MIGRATIONS = ['0004_drop_child_name_unique.sql', '0005_fix_phone_unique_partial.sql'];

export type TestDB = ReturnType<typeof drizzle<typeof schema>>;

export async function createTestDb(): Promise<{ db: TestDB; close: () => Promise<void> }> {
  const client = new PGlite();
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: MIGRATIONS });
  for (const file of ORPHAN_MIGRATIONS) await client.exec(readFileSync(join(MIGRATIONS, file), 'utf8'));
  return { db, close: () => client.close() };
}
