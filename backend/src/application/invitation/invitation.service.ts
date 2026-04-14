import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { eq } from 'drizzle-orm';
import { DRIZZLE, DrizzleDB } from '../../infrastructure/database/drizzle.provider';
import { invitations } from '../../infrastructure/database/schema/invitations';
import { UserRepository, USER_REPOSITORY } from '../../domain/user/user.repository';

@Injectable()
export class InvitationService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    @Inject(USER_REPOSITORY) private readonly userRepo: UserRepository,
  ) {}

  async generate(inviterId: string): Promise<string> {
    const token = randomBytes(6).toString('base64url');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.db.insert(invitations).values({ token, inviterId, expiresAt });
    return token;
  }

  async verify(token: string): Promise<{ inviterId: string; inviterName: string }> {
    const [row] = await this.db.select().from(invitations).where(eq(invitations.token, token));
    if (!row || row.expiresAt < new Date()) throw new UnauthorizedException('Lien invalide ou expiré');
    const user = await this.userRepo.findById(row.inviterId);
    if (!user) throw new UnauthorizedException('Utilisateur introuvable');
    return { inviterId: user.id, inviterName: user.name };
  }

  async accept(token: string, currentUserId: string): Promise<void> {
    const { inviterId } = await this.verify(token);
    await Promise.all([
      this.userRepo.addContact(currentUserId, inviterId),
      this.userRepo.addContact(inviterId, currentUserId),
    ]);
  }
}
