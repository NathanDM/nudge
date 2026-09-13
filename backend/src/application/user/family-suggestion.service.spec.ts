import { ForbiddenException } from '@nestjs/common';
import { FamilySuggestionService } from './family-suggestion.service';

const makeRepo = (overrides: Record<string, jest.Mock> = {}) => ({
  findSuggestions: jest.fn(),
  addFamilyIfReciprocal: jest.fn(),
  dismissIfReciprocal: jest.fn(),
  ...overrides,
});

describe('FamilySuggestionService', () => {
  it('list returns the repository suggestions as-is', async () => {
    // GIVEN
    const suggestions = [{ id: 'bob', name: 'Bob', currentType: null }];
    const repo = makeRepo({ findSuggestions: jest.fn().mockResolvedValue(suggestions) });
    const service = new FamilySuggestionService(repo as any);
    // WHEN
    const result = await service.list('me');
    // THEN
    expect(result).toBe(suggestions);
    expect(repo.findSuggestions).toHaveBeenCalledWith('me');
  });

  describe('accept', () => {
    it('adds the family contact when reciprocal', async () => {
      const repo = makeRepo({ addFamilyIfReciprocal: jest.fn().mockResolvedValue(true) });
      const service = new FamilySuggestionService(repo as any);

      await expect(service.accept('me', 'bob')).resolves.toBeUndefined();
      expect(repo.addFamilyIfReciprocal).toHaveBeenCalledWith('me', 'bob');
    });

    it('throws ForbiddenException when not reciprocal', async () => {
      const repo = makeRepo({ addFamilyIfReciprocal: jest.fn().mockResolvedValue(false) });
      const service = new FamilySuggestionService(repo as any);

      await expect(service.accept('me', 'bob')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('dismiss', () => {
    it('records the dismissal when reciprocal', async () => {
      const repo = makeRepo({ dismissIfReciprocal: jest.fn().mockResolvedValue(true) });
      const service = new FamilySuggestionService(repo as any);

      await expect(service.dismiss('me', 'bob')).resolves.toBeUndefined();
      expect(repo.dismissIfReciprocal).toHaveBeenCalledWith('me', 'bob');
    });

    it('throws ForbiddenException when not reciprocal', async () => {
      const repo = makeRepo({ dismissIfReciprocal: jest.fn().mockResolvedValue(false) });
      const service = new FamilySuggestionService(repo as any);

      await expect(service.dismiss('me', 'bob')).rejects.toThrow(ForbiddenException);
    });
  });
});
