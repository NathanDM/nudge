export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly phone: string | null,
    public readonly pin: string | null,
    public readonly managedBy: string | null,
    public readonly createdAt: Date,
  ) {}
}
