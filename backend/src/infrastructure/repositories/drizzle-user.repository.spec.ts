import { users, userContacts } from '../database/schema';
import { createTestDb, TestDB } from '../../test/test-db';
import { DrizzleUserRepository } from './drizzle-user.repository';

describe('DrizzleUserRepository (PGlite)', () => {
  let db: TestDB;
  let close: () => Promise<void>;
  let repo: DrizzleUserRepository;
  let me: string;
  let bob: string;

  beforeAll(async () => {
    ({ db, close } = await createTestDb());
    repo = new DrizzleUserRepository(db as any);
  });
  afterAll(() => close());

  beforeEach(async () => {
    await db.delete(userContacts);
    await db.delete(users);
    me = await createUser('Alice', '0600000001');
    bob = await createUser('Bob', '0600000002');
  });

  const createUser = async (name: string, phone: string) => {
    const [row] = await db.insert(users).values({ name, phone, pin: 'x' }).returning();
    return row.id;
  };
  const myContactType = async (contactId: string) => {
    const rows = await db.select().from(userContacts);
    return rows.find((r) => r.userId === me && r.contactId === contactId)?.contactType ?? null;
  };

  describe('removeContact', () => {
    it('returns true and deletes the row when the contact exists (regression)', async () => {
      // GIVEN
      await db.insert(userContacts).values({ userId: me, contactId: bob, contactType: 'family' });
      // WHEN
      const removed = await repo.removeContact(me, bob);
      // THEN
      expect(removed).toBe(true);
      expect(await myContactType(bob)).toBeNull();
    });

    it('returns false when nothing matched', async () => {
      expect(await repo.removeContact(me, bob)).toBe(false);
    });
  });

  describe('addContactIfMissing', () => {
    it('inserts a friend contact when absent', async () => {
      await repo.addContactIfMissing(me, bob);

      expect(await myContactType(bob)).toBe('friend');
    });

    it('keeps an existing family contact untouched', async () => {
      await db.insert(userContacts).values({ userId: me, contactId: bob, contactType: 'family' });

      await repo.addContactIfMissing(me, bob);

      expect(await myContactType(bob)).toBe('family');
    });
  });
});
