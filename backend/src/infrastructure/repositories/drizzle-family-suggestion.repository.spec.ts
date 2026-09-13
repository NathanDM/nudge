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
      expect(result).toEqual([{ id: bob, name: 'Bob', currentType: null, via: null }]);
    });

    it('suggests with currentType friend when I have them as friend', async () => {
      await link(bob, me, 'family');
      await link(me, bob, 'friend');

      const result = await repo.findSuggestions(me);

      expect(result).toEqual([{ id: bob, name: 'Bob', currentType: 'friend', via: null }]);
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
      expect(await repo.addFamilyIfSuggested(me, me)).toBe(false);
      expect(await repo.dismissIfSuggested(me, me)).toBe(false);
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

    it('suggests the family of my family with the first-hop name as via', async () => {
      const carl = await createUser('Carl', '0600000003');
      await link(me, bob, 'family');
      await link(bob, carl, 'family');

      expect(await repo.findSuggestions(me)).toEqual([{ id: carl, name: 'Carl', currentType: null, via: 'Bob' }]);
    });

    it('follows family links transitively', async () => {
      const carl = await createUser('Carl', '0600000003');
      const dan = await createUser('Dan', '0600000004');
      await link(me, bob, 'family');
      await link(bob, carl, 'family');
      await link(carl, dan, 'family');

      expect((await repo.findSuggestions(me)).map((s) => [s.id, s.via])).toEqual([[carl, 'Bob'], [dan, 'Bob']]);
    });

    it('does not cross friend links when walking the circle', async () => {
      const carl = await createUser('Carl', '0600000003');
      await link(me, bob, 'friend');
      await link(bob, carl, 'family');

      expect(await repo.findSuggestions(me)).toEqual([]);
    });

    it('terminates on cycles and never suggests myself', async () => {
      const carl = await createUser('Carl', '0600000003');
      await link(me, bob, 'family');
      await link(bob, carl, 'family');
      await link(carl, me, 'family');
      await link(carl, bob, 'family');

      expect((await repo.findSuggestions(me)).map((s) => s.id)).toEqual([carl]);
    });

    it('lists people who added me before the circle, with via null when both apply', async () => {
      const carl = await createUser('Carl', '0600000003');
      const dan = await createUser('Dan', '0600000004');
      await link(me, bob, 'family');
      await link(bob, carl, 'family');
      await link(bob, dan, 'family');
      await link(dan, me, 'family');

      const result = await repo.findSuggestions(me);

      expect(result.map((s) => [s.id, s.via])).toEqual([[dan, null], [carl, 'Bob']]);
    });

    it('excludes circle members I dismissed', async () => {
      const carl = await createUser('Carl', '0600000003');
      await link(me, bob, 'family');
      await link(bob, carl, 'family');
      await db.insert(familySuggestionDismissals).values({ userId: me, contactId: carl });

      expect(await repo.findSuggestions(me)).toEqual([]);
    });
  });

  describe('addFamilyIfSuggested', () => {
    it('creates the family contact when suggested and absent', async () => {
      await link(bob, me, 'family');

      const added = await repo.addFamilyIfSuggested(me, bob);

      expect(added).toBe(true);
      expect(await myContactType(bob)).toBe('family');
    });

    it('upgrades friend to family when suggested', async () => {
      await link(bob, me, 'family');
      await link(me, bob, 'friend');

      expect(await repo.addFamilyIfSuggested(me, bob)).toBe(true);
      expect(await myContactType(bob)).toBe('family');
    });

    it('writes nothing and returns false when not suggested', async () => {
      await link(bob, me, 'friend');

      expect(await repo.addFamilyIfSuggested(me, bob)).toBe(false);
      expect(await myContactType(bob)).toBeNull();
    });

    it('creates the family contact for a member of my circle', async () => {
      const carl = await createUser('Carl', '0600000003');
      await link(me, bob, 'family');
      await link(bob, carl, 'family');

      expect(await repo.addFamilyIfSuggested(me, carl)).toBe(true);
      expect(await myContactType(carl)).toBe('family');
    });
  });

  describe('dismissIfSuggested', () => {
    it('records the dismissal when suggested', async () => {
      await link(bob, me, 'family');

      expect(await repo.dismissIfSuggested(me, bob)).toBe(true);
      expect(await db.select().from(familySuggestionDismissals)).toHaveLength(1);
    });

    it('writes nothing and returns false when not suggested', async () => {
      expect(await repo.dismissIfSuggested(me, bob)).toBe(false);
      expect(await db.select().from(familySuggestionDismissals)).toHaveLength(0);
    });

    it('records the dismissal for a member of my circle', async () => {
      const carl = await createUser('Carl', '0600000003');
      await link(me, bob, 'family');
      await link(bob, carl, 'family');

      expect(await repo.dismissIfSuggested(me, carl)).toBe(true);
      expect(await db.select().from(familySuggestionDismissals)).toHaveLength(1);
    });

    it('is idempotent on a second dismissal', async () => {
      await link(bob, me, 'family');
      await repo.dismissIfSuggested(me, bob);

      expect(await repo.dismissIfSuggested(me, bob)).toBe(true);
      expect(await db.select().from(familySuggestionDismissals)).toHaveLength(1);
    });
  });
});
