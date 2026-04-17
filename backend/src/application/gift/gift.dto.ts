export class GiftResponseDto {
  id: string;
  forUserId: string;
  addedByUserId: string;
  addedByName: string;
  title: string;
  description: string | null;
  url: string | null;
  price: number | null;
  ogImageUrl: string | null;
  claimedByUserId?: string | null;
  claimedAt?: Date | null;
  claimedAnonymously?: boolean;
  canClaim?: boolean;
  canUnclaim?: boolean;
  canDelete: boolean;
  createdAt: Date;
}
