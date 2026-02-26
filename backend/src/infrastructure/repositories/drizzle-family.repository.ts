import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { FamilyRepository } from '../../domain/family/family.repository';
import { Family } from '../../domain/family/family.entity';
import { User } from '../../domain/user/user.entity';
import { DRIZZLE, DrizzleDB } from '../database/drizzle.provider';
import { families, userFamilies, users } from '../database/schema';

@Injectable()
export class DrizzleFamilyRepository implements FamilyRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAllWithMembers(): Promise<Family[]> {
    const allFamilies = await this.db
      .select()
      .from(families)
      .orderBy(families.name);

    const result: Family[] = [];

    for (const fam of allFamilies) {
      const memberRows = await this.db
        .select({
          id: users.id,
          name: users.name,
          pin: users.pin,
          createdAt: users.createdAt,
        })
        .from(userFamilies)
        .innerJoin(users, eq(userFamilies.userId, users.id))
        .where(eq(userFamilies.familyId, fam.id))
        .orderBy(users.name);

      const members = memberRows.map(
        (r) => new User(r.id, r.name, r.pin, r.createdAt),
      );

      result.push(new Family(fam.id, fam.name, fam.createdAt, members));
    }

    return result;
  }
}
