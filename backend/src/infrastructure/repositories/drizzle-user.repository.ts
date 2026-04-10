import { Injectable, Inject } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { UserRepository } from '../../domain/user/user.repository';
import { User } from '../../domain/user/user.entity';
import { DRIZZLE, DrizzleDB } from '../database/drizzle.provider';
import { users, userContacts } from '../database/schema';

@Injectable()
export class DrizzleUserRepository implements UserRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAll(): Promise<User[]> {
    const rows = await this.db.select().from(users).orderBy(users.name);
    return rows.map((r) => new User(r.id, r.name, r.phone, r.pin, r.createdAt));
  }

  async findById(id: string): Promise<User | null> {
    const [row] = await this.db.select().from(users).where(eq(users.id, id));
    if (!row) return null;
    return new User(row.id, row.name, row.phone, row.pin, row.createdAt);
  }

  async findByPhone(lastEightDigits: string): Promise<User | null> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(sql`RIGHT(${users.phone}, 8) = ${lastEightDigits}`);
    if (!row) return null;
    return new User(row.id, row.name, row.phone, row.pin, row.createdAt);
  }

  async create(name: string, phone: string, pin: string): Promise<User> {
    const [row] = await this.db
      .insert(users)
      .values({ name, phone, pin })
      .returning();
    return new User(row.id, row.name, row.phone, row.pin, row.createdAt);
  }

  async findContacts(userId: string): Promise<User[]> {
    const rows = await this.db
      .select({ id: users.id, name: users.name, phone: users.phone, pin: users.pin, createdAt: users.createdAt })
      .from(userContacts)
      .innerJoin(users, eq(userContacts.contactId, users.id))
      .where(eq(userContacts.userId, userId))
      .orderBy(users.name);
    return rows.map((r) => new User(r.id, r.name, r.phone, r.pin, r.createdAt));
  }

  async addContact(userId: string, contactId: string): Promise<void> {
    await this.db
      .insert(userContacts)
      .values({ userId, contactId })
      .onConflictDoNothing();
  }
}
