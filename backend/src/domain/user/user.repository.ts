import { User } from './user.entity';

export interface UserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByPhone(lastEightDigits: string): Promise<User | null>;
  create(name: string, phone: string, pin: string): Promise<User>;
  findContacts(userId: string): Promise<User[]>;
  addContact(userId: string, contactId: string): Promise<void>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
