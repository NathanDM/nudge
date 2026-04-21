import { Injectable, Inject, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { UserRepository, USER_REPOSITORY } from '../../domain/user/user.repository';
import { User } from '../../domain/user/user.entity';

type PublicUser = { id: string; name: string; managedBy: string | null; birthdate?: string | null };

const VALID_CONTACT_TYPES = ['family', 'friend'] as const;

@Injectable()
export class UserService {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepo: UserRepository) {}

  async getChildren(userId: string): Promise<PublicUser[]> {
    const children = await this.userRepo.findChildren(userId);
    return children.map(({ id, name, managedBy, birthdate }) => ({ id, name, managedBy, birthdate }));
  }

  async getFamilyContacts(userId: string): Promise<PublicUser[]> {
    const contacts = await this.userRepo.findFamilyContacts(userId);
    return contacts.map(({ id, name, managedBy, birthdate }) => ({ id, name, managedBy, birthdate }));
  }

  async getFriendContacts(userId: string): Promise<PublicUser[]> {
    const contacts = await this.userRepo.findFriendContacts(userId);
    return contacts.map(({ id, name, managedBy, birthdate }) => ({ id, name, managedBy, birthdate }));
  }

  async createChild(name: string, parentId: string): Promise<PublicUser> {
    const child = await this.userRepo.createChild(name, parentId);
    if (!child) throw new ConflictException('Un enfant avec ce prénom existe déjà');
    return { id: child.id, name: child.name, managedBy: child.managedBy };
  }

  async deleteChild(childId: string, userId: string): Promise<void> {
    const result = await this.userRepo.deleteChild(childId, userId);
    if (result === 'not_found') throw new NotFoundException('Enfant introuvable');
    if (result === 'forbidden') throw new ForbiddenException('Accès refusé');
  }

  async updateContactType(userId: string, contactId: string, contactType: string): Promise<void> {
    if (!VALID_CONTACT_TYPES.includes(contactType as any))
      throw new BadRequestException('contactType must be "family" or "friend"');
    const found = await this.userRepo.updateContactType(userId, contactId, contactType as 'family' | 'friend');
    if (!found) throw new NotFoundException('Contact introuvable');
  }

  async removeContact(userId: string, contactId: string): Promise<void> {
    await this.userRepo.removeContact(userId, contactId);
  }

  async addContactByPhone(userId: string, phone: string, contactType: 'family' | 'friend' = 'friend'): Promise<Omit<User, 'pin'>> {
    const lastEight = phone.replace(/\D/g, '').slice(-8);
    const contact = await this.userRepo.findByPhone(lastEight);
    if (!contact) throw new NotFoundException('Utilisateur introuvable');
    await this.userRepo.addContact(userId, contact.id, contactType);
    const { pin, ...rest } = contact;
    return rest;
  }

  async getShareToken(userId: string): Promise<{ shareToken: string | null }> {
    const shareToken = await this.userRepo.getShareToken(userId);
    return { shareToken };
  }

  async generateShareToken(userId: string): Promise<{ shareToken: string }> {
    const shareToken = randomBytes(16).toString('hex');
    await this.userRepo.setShareToken(userId, shareToken);
    return { shareToken };
  }

  async revokeShareToken(userId: string): Promise<{ success: true }> {
    await this.userRepo.clearShareToken(userId);
    return { success: true };
  }

  async getChildShareToken(childId: string, parentId: string): Promise<{ shareToken: string | null }> {
    const child = await this.userRepo.findById(childId);
    if (!child || child.managedBy !== parentId) throw new ForbiddenException('Accès refusé');
    return { shareToken: await this.userRepo.getShareToken(childId) };
  }

  async generateChildShareToken(childId: string, parentId: string): Promise<{ shareToken: string }> {
    const child = await this.userRepo.findById(childId);
    if (!child || child.managedBy !== parentId) throw new ForbiddenException('Accès refusé');
    const shareToken = randomBytes(16).toString('hex');
    await this.userRepo.setShareToken(childId, shareToken);
    return { shareToken };
  }

  async revokeChildShareToken(childId: string, parentId: string): Promise<{ success: true }> {
    const child = await this.userRepo.findById(childId);
    if (!child || child.managedBy !== parentId) throw new ForbiddenException('Accès refusé');
    await this.userRepo.clearShareToken(childId);
    return { success: true };
  }

  async getProfile(userId: string): Promise<{ id: string; name: string; phone: string | null; birthdate: string | null }> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return { id: user.id, name: user.name, phone: user.phone, birthdate: user.birthdate };
  }

  async updateBirthdate(userId: string, birthdate: string | null): Promise<{ birthdate: string | null }> {
    await this.userRepo.updateBirthdate(userId, birthdate);
    return { birthdate };
  }

  async updateChildBirthdate(childId: string, parentId: string, birthdate: string | null): Promise<{ birthdate: string | null }> {
    const child = await this.userRepo.findById(childId);
    if (!child || child.managedBy !== parentId) throw new ForbiddenException('Accès refusé');
    await this.userRepo.updateBirthdate(childId, birthdate);
    return { birthdate };
  }
}
