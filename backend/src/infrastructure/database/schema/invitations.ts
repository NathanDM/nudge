import { pgTable, varchar, uuid, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const invitations = pgTable('invitations', {
  token: varchar('token', { length: 12 }).primaryKey(),
  inviterId: uuid('inviter_id').notNull().references(() => users.id),
  expiresAt: timestamp('expires_at').notNull(),
});
