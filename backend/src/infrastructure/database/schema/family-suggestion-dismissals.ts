import { pgTable, uuid, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { users } from './users';

export const familySuggestionDismissals = pgTable(
  'family_suggestion_dismissals',
  {
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    contactId: uuid('contact_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.userId, t.contactId] }) }),
);
