import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from '../../domain/user/user.entity';

const makeUser = (overrides: Partial<{ managedBy: string | null; pin: string }> = {}): User =>
  new User('user-1', 'Alice', '0600000001', overrides.pin ?? 'hashed', overrides.managedBy ?? null, new Date());

const makeRepo = (user: User | null) => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByPhone: jest.fn().mockResolvedValue(user),
  create: jest.fn(),
  createChild: jest.fn(),
  deleteChild: jest.fn(),
  findContacts: jest.fn(),
  findChildren: jest.fn(),
  findFamilyContacts: jest.fn(),
  findFriendContacts: jest.fn(),
  updateContactType: jest.fn(),
  addContact: jest.fn(),
});

const makeJwt = () => ({ sign: jest.fn().mockReturnValue('token') } as unknown as JwtService);

describe('AuthService.login', () => {
  it('rejects a managed (child) user with UnauthorizedException', async () => {
    const child = makeUser({ managedBy: 'parent-1' });
    const service = new AuthService(makeRepo(child) as any, makeJwt());

    await expect(service.login('0600000001', '1234')).rejects.toThrow(UnauthorizedException);
  });

  it('rejects unknown phone with UnauthorizedException', async () => {
    const service = new AuthService(makeRepo(null) as any, makeJwt());

    await expect(service.login('0699999999', '1234')).rejects.toThrow(UnauthorizedException);
  });

  it('rejects wrong PIN with UnauthorizedException', async () => {
    const hashedPin = await bcrypt.hash('correct', 10);
    const user = makeUser({ pin: hashedPin });
    const service = new AuthService(makeRepo(user) as any, makeJwt());

    await expect(service.login('0600000001', 'wrong')).rejects.toThrow(UnauthorizedException);
  });

  it('returns accessToken for valid adult user', async () => {
    const hashedPin = await bcrypt.hash('1234', 10);
    const user = makeUser({ pin: hashedPin });
    const service = new AuthService(makeRepo(user) as any, makeJwt());

    const result = await service.login('0600000001', '1234');

    expect(result.accessToken).toBe('token');
    expect(result.user.id).toBe('user-1');
  });
});
