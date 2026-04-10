export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly phone: string,
    public readonly pin: string,
    public readonly createdAt: Date,
  ) {}
}
