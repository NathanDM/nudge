import { Injectable, Inject } from '@nestjs/common';
import { eq, sql, and } from 'drizzle-orm';
import { UserRepository } from '../../domain/user/user.repository';
import { User } from '../../domain/user/user.entity';
import { DRIZZLE, DrizzleDB } from '../database/drizzle.provider';
import { users, userContacts } from '../database/schema';

const toUser = (r: { id: string; name: string; phone?: string | null; pin?: string | null; managedBy?: string | null; createdAt?: Date }): User =>
  new User(r.id, r.name, r.phone ?? null, r.pin ?? null, r.managedBy ?? null, r.createdAt ?? new Date());

@Injectable()
export class DrizzleUserRepository implements UserRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAll(): Promise<User[]> {
    const rows = await this.db.select().from(users).orderBy(users.name);
    return rows.map(toUser);
  }

  async findById(id: string): Promise<User | null> {
    const [row] = await this.db.select().from(users).where(eq(users.id, id));
    return row ? toUser(row) : null;
  }

  async findByPhone(lastEightDigits: string): Promise<User | null> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(sql`RIGHT(${users.phone}, 8) = ${lastEightDigits}`);
    return row ? toUser(row) : null;
  }

  async create(name: string, phone: string, pin: string): Promise<User> {
    const [row] = await this.db.insert(users).values({ name, phone, pin }).returning();
    return toUser(row);
  }

  async createChild(name: string, parentId: string): Promise<User | null> {
    const [existing] = await this.db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.managedBy, parentId), eq(users.name, name)));
    if (existing) return null;
    const [row] = await this.db
      .insert(users)
      .values({ name, phone: null, pin: null, managedBy: parentId })
      .returning();
    return toUser(row);
  }

  async deleteChild(childId: string, userId: string): Promise<'ok' | 'not_found' | 'forbidden'> {
    const child = await this.findById(childId);
    if (!child) return 'not_found';
    if (child.managedBy !== userId) return 'forbidden';
    await this.db.delete(users).where(eq(users.id, childId));
    return 'ok';
  }

  async findContacts(userId: string): Promise<User[]> {
    const rows = await this.db
      .select({ id: users.id, name: users.name, phone: users.phone, pin: users.pin, managedBy: users.managedBy, createdAt: users.createdAt })
      .from(userContacts)
      .innerJoin(users, eq(userContacts.contactId, users.id))
      .where(eq(userContacts.userId, userId))
      .orderBy(users.name);
    return rows.map(toUser);
  }

  async findFamilyContacts(userId: string): Promise<User[]> {
    const result = await this.db.execute(sql`
      SELECT DISTINCT u.id, u.name, u.managed_by AS "managedBy"
      FROM users u
      WHERE
        u.managed_by = ${userId}
        OR u.id IN (
          SELECT uc.contact_id FROM user_contacts uc
          WHERE uc.user_id = ${userId} AND uc.contact_type = 'family'
        )
        OR u.managed_by IN (
          SELECT uc.contact_id FROM user_contacts uc
          WHERE uc.user_id = ${userId} AND uc.contact_type = 'family'
        )
      ORDER BY u.name
    `);
    return (result.rows as Array<{ id: string; name: string; managedBy: string | null }>)
      .map((r) => new User(r.id, r.name, null, null, r.managedBy, new Date()));
  }

  async findChildren(userId: string): Promise<User[]> {
    const rows = await this.db
      .select({ id: users.id, name: users.name, phone: users.phone, pin: users.pin, managedBy: users.managedBy, createdAt: users.createdAt })
      .from(users)
      .where(eq(users.managedBy, userId))
      .orderBy(users.name);
    return rows.map(toUser);
  }

  async findFriendContacts(userId: string): Promise<User[]> {
    const rows = await this.db
      .select({ id: users.id, name: users.name, phone: users.phone, pin: users.pin, managedBy: users.managedBy, createdAt: users.createdAt })
      .from(userContacts)
      .innerJoin(users, eq(userContacts.contactId, users.id))
      .where(and(
        eq(userContacts.userId, userId),
        eq(userContacts.contactType, 'friend'),
        sql`${users.id} != ${userId}`,
      ))
      .orderBy(users.name);
    return rows.map(toUser);
  }

  async updateContactType(userId: string, contactId: string, contactType: 'family' | 'friend'): Promise<boolean> {
    const result = await this.db
      .update(userContacts)
      .set({ contactType })
      .where(and(
        eq(userContacts.userId, userId),
        eq(userContacts.contactId, contactId),
      ))
      .returning();
    return result.length > 0;
  }

  async addContact(userId: string, contactId: string, contactType: 'family' | 'friend' = 'friend'): Promise<void> {
    await this.db
      .insert(userContacts)
      .values({ userId, contactId, contactType })
      .onConflictDoUpdate({
        target: [userContacts.userId, userContacts.contactId],
        set: { contactType },
      });
  }

  async findByShareToken(token: string): Promise<User | null> {
    const [row] = await this.db
      .select({ id: users.id, name: users.name, managedBy: users.managedBy })
      .from(users)
      .where(eq(users.shareToken, token));
    return row ? toUser(row) : null;
  }

  async getShareToken(userId: string): Promise<string | null> {
    const [row] = await this.db
      .select({ shareToken: users.shareToken })
      .from(users)
      .where(eq(users.id, userId));
    return row?.shareToken ?? null;
  }

  async setShareToken(userId: string, token: string): Promise<void> {
    await this.db
      .update(users)
      .set({ shareToken: token })
      .where(eq(users.id, userId));
  }

  async clearShareToken(userId: string): Promise<void> {
    await this.db
      .update(users)
      .set({ shareToken: null })
      .where(eq(users.id, userId));
  }
}
