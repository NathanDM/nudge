import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }).unique(),
  pin: varchar('pin', { length: 60 }),
  managedBy: uuid('managed_by').references((): any => users.id, { onDelete: 'cascade' }),
  shareToken: varchar('share_token', { length: 32 }).unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
