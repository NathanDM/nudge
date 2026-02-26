import { Injectable, Inject } from '@nestjs/common';
import {
  FamilyRepository,
  FAMILY_REPOSITORY,
} from '../../domain/family/family.repository';
import { Family } from '../../domain/family/family.entity';

@Injectable()
export class FamilyService {
  constructor(
    @Inject(FAMILY_REPOSITORY) private readonly familyRepo: FamilyRepository,
  ) {}

  async findAllWithMembers(): Promise<Family[]> {
    return this.familyRepo.findAllWithMembers();
  }
}
