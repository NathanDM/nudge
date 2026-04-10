import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull().unique(),
  pin: varchar('pin', { length: 4 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
