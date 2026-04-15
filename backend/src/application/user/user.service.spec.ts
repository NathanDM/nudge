import { ForbiddenException, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../../domain/user/user.entity';

const makeUser = (overrides: Partial<{ id: string; name: string; phone: string | null; pin: string | null; managedBy: string | null }> = {}): User =>
  new User(
    overrides.id ?? 'user-1',
    overrides.name ?? 'Alice',
    overrides.phone ?? '+33600000001',
    overrides.pin ?? 'hashed',
    overrides.managedBy ?? null,
    new Date(),
  );

const makeRepo = (overrides: Record<string, jest.Mock> = {}) => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByPhone: jest.fn(),
  findByShareToken: jest.fn(),
  create: jest.fn(),
  createChild: jest.fn(),
  deleteChild: jest.fn(),
  findContacts: jest.fn(),
  findFamilyContacts: jest.fn(),
  findFriendContacts: jest.fn(),
  updateContactType: jest.fn(),
  addContact: jest.fn(),
  getShareToken: jest.fn(),
  setShareToken: jest.fn(),
  clearShareToken: jest.fn(),
  findChildren: jest.fn(),
  ...overrides,
});

describe('UserService', () => {
  describe('createChild', () => {
    it('returns the created child', async () => {
      const child = makeUser({ id: 'child-1', name: 'Luc', phone: null, pin: null, managedBy: 'parent-1' });
      const repo = makeRepo({ createChild: jest.fn().mockResolvedValue(child) });
      const service = new UserService(repo as any);

      const result = await service.createChild('Luc', 'parent-1');

      expect(result).toEqual({ id: 'child-1', name: 'Luc', managedBy: 'parent-1' });
      expect(repo.createChild).toHaveBeenCalledWith('Luc', 'parent-1');
    });

    it('throws ConflictException when child name already exists', async () => {
      const repo = makeRepo({ createChild: jest.fn().mockResolvedValue(null) });
      const service = new UserService(repo as any);

      await expect(service.createChild('Léa', 'parent-1')).rejects.toThrow(ConflictException);
    });
  });

  describe('deleteChild', () => {
    it('deletes a child the parent owns', async () => {
      const repo = makeRepo({ deleteChild: jest.fn().mockResolvedValue('ok') });
      const service = new UserService(repo as any);

      await service.deleteChild('child-1', 'parent-1');

      expect(repo.deleteChild).toHaveBeenCalledWith('child-1', 'parent-1');
    });

    it('throws ForbiddenException when child belongs to another parent', async () => {
      const repo = makeRepo({ deleteChild: jest.fn().mockResolvedValue('forbidden') });
      const service = new UserService(repo as any);

      await expect(service.deleteChild('child-1', 'wrong-parent')).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException when child does not exist', async () => {
      const repo = makeRepo({ deleteChild: jest.fn().mockResolvedValue('not_found') });
      const service = new UserService(repo as any);

      await expect(service.deleteChild('unknown-id', 'parent-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateContactType', () => {
    it('updates contact type to family', async () => {
      const repo = makeRepo({ updateContactType: jest.fn().mockResolvedValue(true) });
      const service = new UserService(repo as any);

      await service.updateContactType('user-1', 'contact-1', 'family');

      expect(repo.updateContactType).toHaveBeenCalledWith('user-1', 'contact-1', 'family');
    });

    it('throws BadRequestException for invalid contact type', async () => {
      const repo = makeRepo({ updateContactType: jest.fn() });
      const service = new UserService(repo as any);

      await expect(service.updateContactType('user-1', 'contact-1', 'enemy')).rejects.toThrow(BadRequestException);
      expect(repo.updateContactType).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when contact not in caller list', async () => {
      const repo = makeRepo({ updateContactType: jest.fn().mockResolvedValue(false) });
      const service = new UserService(repo as any);

      await expect(service.updateContactType('user-1', 'unknown', 'family')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getShareToken', () => {
    it('returns the current share token', async () => {
      const repo = makeRepo({ getShareToken: jest.fn().mockResolvedValue('abc123') });
      const service = new UserService(repo as any);

      const result = await service.getShareToken('user-1');

      expect(result).toEqual({ shareToken: 'abc123' });
    });

    it('returns null when no token exists', async () => {
      const repo = makeRepo({ getShareToken: jest.fn().mockResolvedValue(null) });
      const service = new UserService(repo as any);

      const result = await service.getShareToken('user-1');

      expect(result).toEqual({ shareToken: null });
    });
  });

  describe('generateShareToken', () => {
    it('persists a 32-char hex token and returns it', async () => {
      const repo = makeRepo({ setShareToken: jest.fn().mockResolvedValue(undefined) });
      const service = new UserService(repo as any);

      const result = await service.generateShareToken('user-1');

      expect(result.shareToken).toMatch(/^[0-9a-f]{32}$/);
      expect(repo.setShareToken).toHaveBeenCalledWith('user-1', result.shareToken);
    });
  });

  describe('revokeShareToken', () => {
    it('clears the token and returns success', async () => {
      const repo = makeRepo({ clearShareToken: jest.fn().mockResolvedValue(undefined) });
      const service = new UserService(repo as any);

      const result = await service.revokeShareToken('user-1');

      expect(result).toEqual({ success: true });
      expect(repo.clearShareToken).toHaveBeenCalledWith('user-1');
    });
  });
});
