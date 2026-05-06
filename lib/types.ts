// Shape-mirror of backend domain entities (subset used by Phase 1 web).
// Kept hand-rolled rather than imported from backend so the web project
// can ship without a TypeScript path-mapping dance.

export type EnergyLevel = "CHILL" | "MODERATE" | "HIGH" | "WILD";
export type BudgetTier = "BUDGET" | "MID" | "PREMIUM" | "LUXURY";
export type TableStatus = "DRAFT" | "OPEN" | "FULL" | "CLOSED" | "CANCELLED";

export interface OrganizerLite {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  trustScore: number;
}

export interface VenueLite {
  id: string;
  name: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface TableModel {
  id: string;
  title: string | null;
  organizerId: string;
  venueId: string;
  venue?: VenueLite;
  organizer?: OrganizerLite;
  eventDate: string;        // ISO
  endDate: string | null;
  totalSeats: number;
  availableSeats: number;
  pricePerSeat: number;     // cents
  currency: string;
  status: TableStatus;
  description: string | null;
  photoUrls: string[];
  occasionType: string;
  energyLevel: EnergyLevel;
  budgetTier: BudgetTier;
  languages: string[];
  musicTags?: string[];
  inclusions?: string[];
  isLgbtqia?: boolean;
  hasVenuePhoto?: boolean;
  joinStatus?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  status: string;
  verificationStatus: string;
  trustScore: number;
}

export interface AuthResponse {
  user: UserProfile;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}
