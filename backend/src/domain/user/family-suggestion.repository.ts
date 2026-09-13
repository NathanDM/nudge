import { FamilySuggestion } from './family-suggestion';

export interface FamilySuggestionRepository {
  findSuggestions(userId: string): Promise<FamilySuggestion[]>;
  addFamilyIfSuggested(userId: string, contactId: string): Promise<boolean>;
  dismissIfSuggested(userId: string, contactId: string): Promise<boolean>;
}

export const FAMILY_SUGGESTION_REPOSITORY = Symbol('FAMILY_SUGGESTION_REPOSITORY');
