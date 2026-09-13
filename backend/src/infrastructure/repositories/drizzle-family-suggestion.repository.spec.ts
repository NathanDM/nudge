import { users, userContacts, familySuggestionDismissals } from '../database/schema';
import { createTestDb, TestDB } from '../../test/test-db';
import { DrizzleFamilySuggestionRepository } from './drizzle-family-suggestion.repository';

type ContactType = 'family' | 'friend';

describe('DrizzleFamilySuggestionRepository (PGlite)', () => {
  let db: TestDB;
  let close: () => Promise<void>;
  let repo: DrizzleFamilySuggestionRepository;
  let me: string;
  let bob: string;

  beforeAll(async () => {
    ({ db, close } = await createTestDb());
    repo = new DrizzleFamilySuggestionRepository(db as any);
  });
  afterAll(() => close());

  beforeEach(async () => {
    await db.delete(familySuggestionDismissals);
    await db.delete(userContacts);
    await db.delete(users);
    me = await createUser('Alice', '0600000001');
    bob = await createUser('Bob', '0600000002');
  });

  const createUser = async (name: string, phone: string | null, managedBy: string | null = null) => {
    const [row] = await db.insert(users).values({ name, phone, pin: managedBy ? null : 'x', managedBy }).returning();
    return row.id;
  };
  const link = (from: string, to: string, contactType: ContactType) =>
    db.insert(userContacts).values({ userId: from, contactId: to, contactType });
  const myContactType = async (contactId: string) => {
    const rows = await db.select().from(userContacts);
    return rows.find((r) => r.userId === me && r.contactId === contactId)?.contactType ?? null;
  };

  describe('findSuggestions', () => {
    it('suggests someone who has me as family when I do not have them', async () => {
      // GIVEN
      await link(bob, me, 'family');
      // WHEN
      const result = await repo.findSuggestions(me);
      // THEN
      expect(result).toEqual([{ id: bob, name: 'Bob', currentType: null }]);
    });

    it('suggests with currentType friend when I have them as friend', async () => {
      await link(bob, me, 'family');
      await link(me, bob, 'friend');

      const result = await repo.findSuggestions(me);

      expect(result).toEqual([{ id: bob, name: 'Bob', currentType: 'friend' }]);
    });

    it('excludes someone I already have as family', async () => {
      await link(bob, me, 'family');
      await link(me, bob, 'family');

      expect(await repo.findSuggestions(me)).toEqual([]);
    });

    it('excludes someone who only has me as friend', async () => {
      await link(bob, me, 'friend');

      expect(await repo.findSuggestions(me)).toEqual([]);
    });

    it('excludes someone I dismissed', async () => {
      await link(bob, me, 'family');
      await db.insert(familySuggestionDismissals).values({ userId: me, contactId: bob });

      expect(await repo.findSuggestions(me)).toEqual([]);
    });

    it('never suggests myself even with a self-link row', async () => {
      await link(me, me, 'family');

      expect(await repo.findSuggestions(me)).toEqual([]);
      expect(await repo.addFamilyIfReciprocal(me, me)).toBe(false);
      expect(await repo.dismissIfReciprocal(me, me)).toBe(false);
    });

    it('orders suggestions newest first', async () => {
      const carl = await createUser('Carl', '0600000003');
      await db.insert(userContacts).values({ userId: bob, contactId: me, contactType: 'family', createdAt: new Date('2024-01-01') });
      await db.insert(userContacts).values({ userId: carl, contactId: me, contactType: 'family', createdAt: new Date('2024-06-01') });

      expect((await repo.findSuggestions(me)).map((s) => s.id)).toEqual([carl, bob]);
    });

    it('excludes managed children', async () => {
      const child = await createUser('Léa', null, bob);
      await link(child, me, 'family');

      expect(await repo.findSuggestions(me)).toEqual([]);
    });
  });

  describe('addFamilyIfReciprocal', () => {
    it('creates the family contact when reciprocal and absent', async () => {
      await link(bob, me, 'family');

      const added = await repo.addFamilyIfReciprocal(me, bob);

      expect(added).toBe(true);
      expect(await myContactType(bob)).toBe('family');
    });

    it('upgrades friend to family when reciprocal', async () => {
      await link(bob, me, 'family');
      await link(me, bob, 'friend');

      expect(await repo.addFamilyIfReciprocal(me, bob)).toBe(true);
      expect(await myContactType(bob)).toBe('family');
    });

    it('writes nothing and returns false when not reciprocal', async () => {
      await link(bob, me, 'friend');

      expect(await repo.addFamilyIfReciprocal(me, bob)).toBe(false);
      expect(await myContactType(bob)).toBeNull();
    });
  });

  describe('dismissIfReciprocal', () => {
    it('records the dismissal when reciprocal', async () => {
      await link(bob, me, 'family');

      expect(await repo.dismissIfReciprocal(me, bob)).toBe(true);
      expect(await db.select().from(familySuggestionDismissals)).toHaveLength(1);
    });

    it('writes nothing and returns false when not reciprocal', async () => {
      expect(await repo.dismissIfReciprocal(me, bob)).toBe(false);
      expect(await db.select().from(familySuggestionDismissals)).toHaveLength(0);
    });

    it('is idempotent on a second dismissal', async () => {
      await link(bob, me, 'family');
      await repo.dismissIfReciprocal(me, bob);

      expect(await repo.dismissIfReciprocal(me, bob)).toBe(true);
      expect(await db.select().from(familySuggestionDismissals)).toHaveLength(1);
    });
  });
});
