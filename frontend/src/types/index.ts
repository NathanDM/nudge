export interface User {
  id: string;
  name: string;
  phone?: string | null;
  managedBy?: string | null;
  birthdate?: string | null;
}

export interface Gift {
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
  claimedByName?: string | null;
  claimedAt?: string | null;
  claimedAnonymously?: boolean;
  canClaim?: boolean;
  canUnclaim?: boolean;
  canDelete: boolean;
  secret: boolean;
  createdAt: string;
}

export interface PublicGift {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  price: number | null;
  isClaimed: boolean;
  claimedByName: string | null;
}

export interface AuthState {
  token: string | null;
  user: User | null;
}
