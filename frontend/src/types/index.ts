export interface User {
  id: string;
  name: string;
}

export interface Family {
  id: string;
  name: string;
  members: User[];
}

export interface Gift {
  id: string;
  forUserId: string;
  addedByUserId: string;
  title: string;
  description: string | null;
  url: string | null;
  price: number | null;
  claimedByUserId?: string | null;
  claimedAt?: string | null;
  canClaim?: boolean;
  canUnclaim?: boolean;
  canDelete: boolean;
  createdAt: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
}
