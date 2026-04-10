import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { UserRepository, USER_REPOSITORY } from '../../domain/user/user.repository';
import { User } from '../../domain/user/user.entity';

type PublicUser = Omit<User, 'pin'>;

@Injectable()
export class UserService {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepo: UserRepository) {}

  async getContactsWithSelf(userId: string): Promise<PublicUser[]> {
    const [self, contacts] = await Promise.all([
      this.userRepo.findById(userId),
      this.userRepo.findContacts(userId),
    ]);
    const all = self ? [self, ...contacts.filter((c) => c.id !== userId)] : contacts;
    return all.map(({ pin, ...rest }) => rest);
  }

  async addContactByPhone(userId: string, phone: string): Promise<PublicUser> {
    const lastEight = phone.replace(/\D/g, '').slice(-8);
    const contact = await this.userRepo.findByPhone(lastEight);
    if (!contact) throw new NotFoundException('Utilisateur introuvable');
    await this.userRepo.addContact(userId, contact.id);
    const { pin, ...rest } = contact;
    return rest;
  }
}
