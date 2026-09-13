import { FamilySuggestion } from './family-suggestion';

export interface FamilySuggestionRepository {
  findSuggestions(userId: string): Promise<FamilySuggestion[]>;
  addFamilyIfReciprocal(userId: string, contactId: string): Promise<boolean>;
  dismissIfReciprocal(userId: string, contactId: string): Promise<boolean>;
}

export const FAMILY_SUGGESTION_REPOSITORY = Symbol('FAMILY_SUGGESTION_REPOSITORY');
