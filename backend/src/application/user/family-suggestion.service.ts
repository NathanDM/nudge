import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { FamilySuggestionRepository, FAMILY_SUGGESTION_REPOSITORY } from '../../domain/user/family-suggestion.repository';
import { FamilySuggestion } from '../../domain/user/family-suggestion';

function assertSuggested(ok: boolean): void {
  if (!ok) throw new ForbiddenException('Cette personne ne fait pas partie de votre cercle familial');
}

@Injectable()
export class FamilySuggestionService {
  constructor(@Inject(FAMILY_SUGGESTION_REPOSITORY) private readonly repo: FamilySuggestionRepository) {}

  list(userId: string): Promise<FamilySuggestion[]> {
    return this.repo.findSuggestions(userId);
  }

  async accept(userId: string, contactId: string): Promise<void> {
    assertSuggested(await this.repo.addFamilyIfSuggested(userId, contactId));
  }

  async dismiss(userId: string, contactId: string): Promise<void> {
    assertSuggested(await this.repo.dismissIfSuggested(userId, contactId));
  }
}
