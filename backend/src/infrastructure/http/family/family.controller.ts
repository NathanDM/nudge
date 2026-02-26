import { Controller, Get, UseGuards } from '@nestjs/common';
import { FamilyService } from '../../../application/family/family.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('api/families')
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @UseGuards(AuthGuard)
  @Get()
  async findAll() {
    const families = await this.familyService.findAllWithMembers();
    return families.map((f) => ({
      id: f.id,
      name: f.name,
      members: f.members.map((m) => ({ id: m.id, name: m.name })),
    }));
  }
}
