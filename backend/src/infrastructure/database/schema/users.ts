import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  pin: varchar('pin', { length: 10 }).default('1234').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
