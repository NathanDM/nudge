import { Injectable, Inject, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { eq, sql, and } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
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

  async createChild(name: string, parentId: string): Promise<User> {
    try {
      const [row] = await this.db
        .insert(users)
        .values({ name, managedBy: parentId })
        .returning();
      return toUser(row);
    } catch (err: any) {
      if (err?.code === '23505') throw new ConflictException('Un enfant avec ce prénom existe déjà');
      throw err;
    }
  }

  async deleteChild(childId: string, userId: string): Promise<void> {
    const child = await this.findById(childId);
    if (!child) throw new NotFoundException('Enfant introuvable');
    if (child.managedBy !== userId) throw new ForbiddenException('Accès refusé');
    await this.db.delete(users).where(eq(users.id, childId));
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
    // UNION: direct family contacts + their children (propagated, read-time only)
    // Raw SQL used here because Drizzle's union() + self-join alias combination
    // requires matching column order that's simpler to guarantee with explicit SQL.
    const result = await this.db.execute(sql`
      SELECT u.id, u.name, u.managed_by AS "managedBy"
      FROM users u
      WHERE u.managed_by = ${userId}
      UNION
      SELECT u.id, u.name, u.managed_by AS "managedBy"
      FROM users u
      INNER JOIN user_contacts uc
        ON uc.contact_id = u.id
        AND uc.user_id = ${userId}
        AND uc.contact_type = 'family'
      UNION
      SELECT children.id, children.name, children.managed_by AS "managedBy"
      FROM users children
      INNER JOIN users parent ON parent.id = children.managed_by
      INNER JOIN user_contacts uc
        ON uc.contact_id = parent.id
        AND uc.user_id = ${userId}
        AND uc.contact_type = 'family'
      ORDER BY name
    `);
    return (result.rows as Array<{ id: string; name: string; managedBy: string | null }>)
      .map((r) => new User(r.id, r.name, null, null, r.managedBy, new Date()));
  }

  async findFriendContacts(userId: string): Promise<User[]> {
    const rows = await this.db
      .select({ id: users.id, name: users.name, phone: users.phone, pin: users.pin, managedBy: users.managedBy, createdAt: users.createdAt })
      .from(userContacts)
      .innerJoin(users, eq(userContacts.contactId, users.id))
      .where(and(
        eq(userContacts.userId, userId),
        eq(userContacts.contactType, 'friend'),
      ))
      .orderBy(users.name);
    return rows.map(toUser);
  }

  async updateContactType(userId: string, contactId: string, contactType: 'family' | 'friend'): Promise<void> {
    const result = await this.db
      .update(userContacts)
      .set({ contactType })
      .where(and(
        eq(userContacts.userId, userId),
        eq(userContacts.contactId, contactId),
      ))
      .returning();
    if (result.length === 0) throw new NotFoundException('Contact introuvable');
  }

  async addContact(userId: string, contactId: string): Promise<void> {
    await this.db
      .insert(userContacts)
      .values({ userId, contactId })
      .onConflictDoNothing();
  }
}
