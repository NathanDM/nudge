import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { FamilySuggestionRepository, FAMILY_SUGGESTION_REPOSITORY } from '../../domain/user/family-suggestion.repository';
import { FamilySuggestion } from '../../domain/user/family-suggestion';

function assertReciprocal(ok: boolean): void {
  if (!ok) throw new ForbiddenException('Cette personne ne vous a pas dans sa famille');
}

@Injectable()
export class FamilySuggestionService {
  constructor(@Inject(FAMILY_SUGGESTION_REPOSITORY) private readonly repo: FamilySuggestionRepository) {}

  list(userId: string): Promise<FamilySuggestion[]> {
    return this.repo.findSuggestions(userId);
  }

  async accept(userId: string, contactId: string): Promise<void> {
    assertReciprocal(await this.repo.addFamilyIfReciprocal(userId, contactId));
  }

  async dismiss(userId: string, contactId: string): Promise<void> {
    assertReciprocal(await this.repo.dismissIfReciprocal(userId, contactId));
  }
}
