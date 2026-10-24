// ============================================================
// Core API Types (strict – no `any`)
// ============================================================

export interface ApiBreedAttributes {
  name: string;
  description: string;
  temperament: string | null;
  life: { min: number; max: number };
  male_weight: { min: number; max: number };
  female_weight: { min: number; max: number };
  male_height: { min: number; max: number };
  female_height: { min: number; max: number };
  hypoallergenic: boolean;
  energy: number;
  barking: number;
  drooling: number;
  grooming: number;
  shedding: number;
  trainability: number;
  good_with_dogs: number;
  good_with_strangers: number;
  good_with_children: number;
  apartment_friendly: number;
  exercise_minutes: number;
  other_names: string | null;
  origin?: string | null;
  country_of_origin?: string | null;
}

export interface ApiBreedRelationships {
  group?: { data: { id: string; type: string } | null };
}

export interface ApiBreed {
  id: string;
  type: 'breeds';
  attributes: ApiBreedAttributes;
  relationships: ApiBreedRelationships;
}

export interface ApiGroupAttributes {
  name: string;
}

export interface ApiGroup {
  id: string;
  type: 'groups';
  attributes: ApiGroupAttributes;
}

export interface ApiImage {
  id: string;
  url: string;
  thumb: string;
  medium: string;
  large: string;
  author: string | null;
  license: string | null;
  source: string | null;
}

export interface ApiPaginatedResponse<T> {
  data: T[];
  meta?: {
    pagination?: {
      current: number;
      next: number | null;
      last: number;
      records: number;
    };
  };
}

export interface ApiSingleResponse<T> {
  data: T;
}

// ============================================================
// Normalised App-layer types (flattened for SQLite & UI)
// ============================================================

export type SizeCategory = 'small' | 'medium' | 'large' | 'giant';
export type CoatLength = 'short' | 'medium' | 'long' | 'wire' | 'unknown';

export interface Breed {
  id: string;
  name: string;
  description: string;
  temperament: string | null;
  otherNames: string | null;
  origin: string | null;
  lifeMin: number;
  lifeMax: number;
  maleWeightMin: number;
  maleWeightMax: number;
  femaleWeightMin: number;
  femaleWeightMax: number;
  maleHeightMin: number;
  maleHeightMax: number;
  femaleHeightMin: number;
  femaleHeightMax: number;
  hypoallergenic: boolean;
  energy: number;
  barking: number;
  drooling: number;
  grooming: number;
  shedding: number;
  trainability: number;
  goodWithDogs: number;
  goodWithStrangers: number;
  goodWithChildren: number;
  apartmentFriendly: number;
  exerciseMinutes: number;
  groupId: string | null;
  groupName: string | null;
  sizeCategory: SizeCategory;
  coatLength: CoatLength;
  images: BreedImage[];
  cachedAt: number;
}

export interface BreedImage {
  id: string;
  thumb: string;
  medium: string;
  large: string;
  author: string | null;
  license: string | null;
  source: string | null;
}

export interface Group {
  id: string;
  name: string;
}

// ============================================================
// Filter types
// ============================================================

export interface BreedFilters {
  search: string;
  groupIds: string[];
  sizes: SizeCategory[];
  coatLengths: CoatLength[];
  hypoallergenic: boolean | null;
  minEnergy: number | null;
  minGoodWithChildren: number | null;
  minGoodWithDogs: number | null;
  minGoodWithStrangers: number | null;
}

export const DEFAULT_FILTERS: BreedFilters = {
  search: '',
  groupIds: [],
  sizes: [],
  coatLengths: [],
  hypoallergenic: null,
  minEnergy: null,
  minGoodWithChildren: null,
  minGoodWithDogs: null,
  minGoodWithStrangers: null,
};

// ============================================================
// Navigation types
// ============================================================

export type RootStackParamList = {
  MainTabs: undefined;
};

export type MainTabParamList = {
  BreedsTab: undefined;
  FavouritesTab: undefined;
};

export type BreedsStackParamList = {
  BreedList: undefined;
  BreedDetail: { breedId: string; breedName: string };
};

// ============================================================
// Sync / cache types
// ============================================================

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface SyncState {
  status: SyncStatus;
  lastSyncedAt: number | null;
  error: string | null;
  progress: number;
}
