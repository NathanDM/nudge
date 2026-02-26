import { Family } from './family.entity';

export interface FamilyRepository {
  findAllWithMembers(): Promise<Family[]>;
}

export const FAMILY_REPOSITORY = Symbol('FAMILY_REPOSITORY');
