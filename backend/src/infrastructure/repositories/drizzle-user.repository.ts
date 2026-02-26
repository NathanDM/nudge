import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { UserRepository } from '../../domain/user/user.repository';
import { User } from '../../domain/user/user.entity';
import { DRIZZLE, DrizzleDB } from '../database/drizzle.provider';
import { users } from '../database/schema';

@Injectable()
export class DrizzleUserRepository implements UserRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAll(): Promise<User[]> {
    const rows = await this.db.select().from(users).orderBy(users.name);
    return rows.map(
      (r) => new User(r.id, r.name, r.pin, r.createdAt),
    );
  }

  async findById(id: string): Promise<User | null> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id));
    if (!row) return null;
    return new User(row.id, row.name, row.pin, row.createdAt);
  }

  async findByIdWithPin(id: string): Promise<User | null> {
    return this.findById(id);
  }
}
