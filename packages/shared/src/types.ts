// ─── Enums ───────────────────────────────────────────────────────────────────

export type CarType =
  | 'SEDAN' | 'HATCHBACK' | 'COUPE' | 'CONVERTIBLE'
  | 'SUV' | 'PICKUP' | 'TRUCK' | 'VAN' | 'MINIVAN'
  | 'SUPERCAR' | 'HYPERCAR' | 'CLASSIC' | 'ELECTRIC' | 'OTHER'

export type Rarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'

export type InteractionType = 'WANT' | 'SAW' | 'RODE' | 'DROVE' | 'OWNED'

export type ImageType =
  | 'EXTERIOR_FRONT' | 'EXTERIOR_SIDE' | 'EXTERIOR_REAR'
  | 'INTERIOR' | 'ENGINE' | 'DETAIL'

// ─── Entities ────────────────────────────────────────────────────────────────

export interface Brand {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  country: string | null
}

export interface CarModel {
  id: string
  brandId: string
  name: string
  slug: string
  type: CarType
  brand?: Brand
}

export interface CarVersion {
  id: string
  modelId: string
  year: number
  name: string
  trim: string | null
  engine: string | null
  horsepower: number | null
  torqueNm: number | null
  transmission: string | null
  drivetrain: string | null
  fuelType: string | null
  fuelCity: number | null
  fuelHwy: number | null
  doors: number | null
  seats: number | null
  weightKg: number | null
  priceUSD: number | null
  rarity: Rarity
  isLatam: boolean
  model?: CarModel & { brand?: Brand }
  images?: CarImage[]
  primaryImage?: CarImage | null
  interactionCounts?: InteractionCounts
  userInteraction?: InteractionType | null
}

export interface CarImage {
  id: string
  versionId: string
  url: string
  thumbUrl: string
  type: ImageType
  isPrimary: boolean
  verified: boolean
}

export interface Interaction {
  id: string
  userId: string
  versionId: string
  type: InteractionType
  points: number
  verified: boolean
  photoUrl: string | null
  latitude: number | null
  longitude: number | null
  note: string | null
  createdAt: string
  version?: CarVersion
}

export interface InteractionCounts {
  WANT: number
  SAW: number
  RODE: number
  DROVE: number
  OWNED: number
}

export interface UserProfile {
  id: string
  clerkId: string
  username: string
  displayName: string
  avatarUrl: string | null
  bio: string | null
  country: string
  totalPoints: number
  isPremium: boolean
  createdAt: string
  stats?: UserStats
}

export interface UserStats {
  totalInteractions: number
  uniqueCars: number
  uniqueBrands: number
  verifiedCount: number
}

export interface Achievement {
  id: string
  key: string
  name: string
  description: string
  iconUrl: string
  points: number
  unlockedAt?: string | null
}

export interface RankingEntry {
  rank: number
  user: Pick<UserProfile, 'id' | 'username' | 'displayName' | 'avatarUrl' | 'country'>
  totalPoints: number
  totalInteractions: number
}

// ─── API Payloads ─────────────────────────────────────────────────────────────

export interface CreateInteractionPayload {
  versionId: string
  type: InteractionType
  photoBase64?: string
  latitude?: number
  longitude?: number
  note?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface ApiError {
  error: string
  code?: string
}
