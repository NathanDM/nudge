import { Injectable, Inject, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { UserRepository, USER_REPOSITORY } from '../../domain/user/user.repository';
import { User } from '../../domain/user/user.entity';

type PublicUser = { id: string; name: string; managedBy: string | null };

const VALID_CONTACT_TYPES = ['family', 'friend'] as const;

@Injectable()
export class UserService {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepo: UserRepository) {}

  async getChildren(userId: string): Promise<PublicUser[]> {
    const children = await this.userRepo.findChildren(userId);
    return children.map(({ id, name, managedBy }) => ({ id, name, managedBy }));
  }

  async getFamilyContacts(userId: string): Promise<PublicUser[]> {
    const contacts = await this.userRepo.findFamilyContacts(userId);
    return contacts.map(({ id, name, managedBy }) => ({ id, name, managedBy }));
  }

  async getFriendContacts(userId: string): Promise<PublicUser[]> {
    const contacts = await this.userRepo.findFriendContacts(userId);
    return contacts.map(({ id, name, managedBy }) => ({ id, name, managedBy }));
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

  async addContactByPhone(userId: string, phone: string, contactType: 'family' | 'friend' = 'friend'): Promise<Omit<User, 'pin'>> {
    const lastEight = phone.replace(/\D/g, '').slice(-8);
    const contact = await this.userRepo.findByPhone(lastEight);
    if (!contact) throw new NotFoundException('Utilisateur introuvable');
    await this.userRepo.addContact(userId, contact.id, contactType);
    const { pin, ...rest } = contact;
    return rest;
  }
}
