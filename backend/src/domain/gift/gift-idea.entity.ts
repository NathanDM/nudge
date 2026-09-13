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
    public readonly claimedAnonymously: boolean,
    public readonly ogImageUrl: string | null,
    public readonly createdAt: Date,
    public readonly secret: boolean = false,
  ) {}

  isClaimed(): boolean {
    return this.claimedByUserId !== null || this.claimedAnonymously;
  }

  isClaimVisibleTo(viewerId: string): boolean {
    return viewerId !== this.forUserId;
  }

  canBeDeletedBy(userId: string, ownerManagerId: string | null = null): boolean {
    if (userId === this.addedByUserId) return true;
    if (ownerManagerId !== null && userId === ownerManagerId) return true;
    return userId === this.forUserId && !this.secret;
  }

  canBeEditedBy(userId: string, ownerManagerId: string | null = null): boolean {
    return this.canBeDeletedBy(userId, ownerManagerId);
  }

  canBeClaimedBy(userId: string): boolean {
    return userId !== this.forUserId && !this.isClaimed();
  }

  canBeUnclaimedBy(userId: string): boolean {
    return userId === this.claimedByUserId;
  }

  canBeUnclaimedByOwner(userId: string): boolean {
    return userId === this.forUserId && this.claimedAnonymously;
  }
}
