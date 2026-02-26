export class GiftResponseDto {
  id: string;
  forUserId: string;
  addedByUserId: string;
  title: string;
  description: string | null;
  url: string | null;
  price: number | null;
  claimedByUserId?: string | null;
  claimedAt?: Date | null;
  canClaim?: boolean;
  canUnclaim?: boolean;
  canDelete: boolean;
  createdAt: Date;
}
