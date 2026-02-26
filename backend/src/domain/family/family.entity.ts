import { User } from '../user/user.entity';

export class Family {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly createdAt: Date,
    public readonly members: User[] = [],
  ) {}
}
