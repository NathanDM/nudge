import { Module } from '@nestjs/common';
import { FamilyController } from './family.controller';
import { FamilyService } from '../../../application/family/family.service';
import { FAMILY_REPOSITORY } from '../../../domain/family/family.repository';
import { DrizzleFamilyRepository } from '../../repositories/drizzle-family.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [FamilyController],
  providers: [
    FamilyService,
    { provide: FAMILY_REPOSITORY, useClass: DrizzleFamilyRepository },
  ],
})
export class FamilyModule {}
