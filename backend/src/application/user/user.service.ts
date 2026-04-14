import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRepository, USER_REPOSITORY } from '../../domain/user/user.repository';
import { User } from '../../domain/user/user.entity';

type PublicUser = { id: string; name: string; managedBy: string | null };

const VALID_CONTACT_TYPES = ['family', 'friend'] as const;

@Injectable()
export class UserService {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepo: UserRepository) {}

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
    return { id: child.id, name: child.name, managedBy: child.managedBy };
  }

  async deleteChild(childId: string, userId: string): Promise<void> {
    await this.userRepo.deleteChild(childId, userId);
  }

  async updateContactType(userId: string, contactId: string, contactType: string): Promise<void> {
    if (!VALID_CONTACT_TYPES.includes(contactType as any))
      throw new BadRequestException('contactType must be "family" or "friend"');
    await this.userRepo.updateContactType(userId, contactId, contactType as 'family' | 'friend');
  }

  async addContactByPhone(userId: string, phone: string): Promise<Omit<User, 'pin'>> {
    const lastEight = phone.replace(/\D/g, '').slice(-8);
    const contact = await this.userRepo.findByPhone(lastEight);
    if (!contact) throw new NotFoundException('Utilisateur introuvable');
    await this.userRepo.addContact(userId, contact.id);
    const { pin, ...rest } = contact;
    return rest;
  }
}
