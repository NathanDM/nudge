import { UnauthorizedException } from '@nestjs/common';
import { InvitationService } from './invitation.service';

const future = new Date(Date.now() + 60_000);
const past = new Date(Date.now() - 60_000);

const makeDb = (row: { token: string; inviterId: string; expiresAt: Date } | undefined) => {
  const chain: any = {};
  chain.select = jest.fn(() => chain);
  chain.from = jest.fn(() => chain);
  chain.where = jest.fn(async () => (row ? [row] : []));
  chain.delete = jest.fn(() => ({ where: jest.fn(async () => undefined) }));
  return chain;
};

const makeUserRepo = () => ({
  findById: jest.fn().mockResolvedValue({ id: 'inviter', name: 'Bob' }),
  addContact: jest.fn(),
  addContactIfMissing: jest.fn().mockResolvedValue(undefined),
});

describe('InvitationService.accept', () => {
  it('links both sides without overwriting an existing contact type', async () => {
    // GIVEN a valid token
    const db = makeDb({ token: 'tok', inviterId: 'inviter', expiresAt: future });
    const userRepo = makeUserRepo();
    const service = new InvitationService(db, userRepo as any);
    // WHEN
    await service.accept('tok', 'me');
    // THEN the non-overwriting insert is used in both directions, never the upsert
    expect(userRepo.addContactIfMissing).toHaveBeenCalledWith('me', 'inviter');
    expect(userRepo.addContactIfMissing).toHaveBeenCalledWith('inviter', 'me');
    expect(userRepo.addContact).not.toHaveBeenCalled();
    expect(db.delete).toHaveBeenCalled();
  });

  it('rejects an expired token', async () => {
    const db = makeDb({ token: 'tok', inviterId: 'inviter', expiresAt: past });
    const service = new InvitationService(db, makeUserRepo() as any);

    await expect(service.accept('tok', 'me')).rejects.toThrow(UnauthorizedException);
  });
});
