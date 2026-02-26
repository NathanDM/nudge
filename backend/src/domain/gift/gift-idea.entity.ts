export class GiftIdea {
  constructor(
    public readonly id: string,
    public readonly forUserId: string,
    public readonly addedByUserId: string,
    public readonly title: string,
    public readonly description: string | null,
    public readonly url: string | null,
    public readonly price: number | null,
    public readonly claimedByUserId: string | null,
    public readonly claimedAt: Date | null,
    public readonly createdAt: Date,
  ) {}

  isClaimVisibleTo(viewerId: string): boolean {
    return viewerId !== this.forUserId;
  }

  canBeDeletedBy(userId: string): boolean {
    return userId === this.addedByUserId;
  }

  canBeClaimedBy(userId: string): boolean {
    return userId !== this.forUserId && this.claimedByUserId === null;
  }

  canBeUnclaimedBy(userId: string): boolean {
    return userId === this.claimedByUserId;
  }
}
