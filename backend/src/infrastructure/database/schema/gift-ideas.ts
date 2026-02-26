import { pgTable, uuid, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const giftIdeas = pgTable('gift_ideas', {
  id: uuid('id').defaultRandom().primaryKey(),
  forUserId: uuid('for_user_id')
    .notNull()
    .references(() => users.id),
  addedByUserId: uuid('added_by_user_id')
    .notNull()
    .references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  url: varchar('url', { length: 500 }),
  price: integer('price'),
  claimedByUserId: uuid('claimed_by_user_id').references(() => users.id),
  claimedAt: timestamp('claimed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
