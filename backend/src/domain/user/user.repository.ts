import { User } from './user.entity';

export interface UserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByPhone(lastEightDigits: string): Promise<User | null>;
  create(name: string, phone: string, pin: string): Promise<User>;
  createChild(name: string, parentId: string): Promise<User | null>;
  deleteChild(childId: string, userId: string): Promise<'ok' | 'not_found' | 'forbidden'>;
  findContacts(userId: string): Promise<User[]>;
  findChildren(userId: string): Promise<User[]>;
  findFamilyContacts(userId: string): Promise<User[]>;
  findFriendContacts(userId: string): Promise<User[]>;
  updateContactType(userId: string, contactId: string, contactType: 'family' | 'friend'): Promise<boolean>;
  addContact(userId: string, contactId: string): Promise<void>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
