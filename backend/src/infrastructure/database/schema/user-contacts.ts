import { pgTable, uuid, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { users } from './users';

export const userContacts = pgTable(
  'user_contacts',
  {
    userId: uuid('user_id').notNull().references(() => users.id),
    contactId: uuid('contact_id').notNull().references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.userId, t.contactId] }) }),
);
