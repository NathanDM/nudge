import { pgTable, uuid, primaryKey } from 'drizzle-orm/pg-core';
import { users } from './users';
import { families } from './families';

export const userFamilies = pgTable(
  'user_families',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    familyId: uuid('family_id')
      .notNull()
      .references(() => families.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.familyId] }),
  }),
);
