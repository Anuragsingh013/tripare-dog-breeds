# Architecture Overview

## System Design

```
┌─────────────────────────────────────────────────────────────┐
│                      React Native App                       │
├─────────────────────────────────────────────────────────────┤
│  UI Layer                                                   │
│  BreedListScreen  •  BreedDetailScreen  •  FavouritesScreen │
│  FilterPanel  •  BreedCard  •  TraitBar  •  SyncBanner      │
├─────────────────────────────────────────────────────────────┤
│  State Management (Zustand)                                 │
│  useBreedStore — normalised breeds + groups + filters       │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                 │
│  useBreedSync hook  ──► fetchAllBreeds (API retry/backoff)  │
│  SQLite (expo-sqlite WAL mode) normalised offline cache     │
├─────────────────────────────────────────────────────────────┤
│  External                                                   │
│  dogapi.dog/api/v2  (6 pages x 48 = 283 breeds)             │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

```
App Start
  └── useBreedSync.performSync(force=false)
       ├── 1. Load from SQLite ──► hydrate Zustand immediately (offline-first)
       ├── 2. Check lastSyncedAt (SYNC_INTERVAL = 30 min)
       └── 3. If stale ──► fetchAllBreeds() (6 paginated requests, merged)
            ├── normaliseBreed() ──► flatten + derive size/coat
            ├── saveBreeds() ──► SQLite transaction
            └── setBreeds() ──► Zustand store
```

## Database Schema (SQLite)

### Table: `breeds`
- `id` (TEXT PRIMARY KEY)
- `name` (TEXT NOT NULL)
- `description` (TEXT)
- `temperament` (TEXT)
- `other_names` (TEXT)
- `origin` (TEXT)
- `life_min` (INTEGER), `life_max` (INTEGER)
- `male_weight_min` (REAL), `male_weight_max` (REAL)
- `female_weight_min` (REAL), `female_weight_max` (REAL)
- `male_height_min` (REAL), `male_height_max` (REAL)
- `female_height_min` (REAL), `female_height_max` (REAL)
- `hypoallergenic` (INTEGER 0/1)
- `energy`, `barking`, `drooling`, `grooming`, `shedding` (INTEGER 1-5)
- `trainability`, `good_with_dogs`, `good_with_strangers`, `good_with_children` (INTEGER 1-5)
- `apartment_friendly` (INTEGER 1-5)
- `exercise_minutes` (INTEGER)
- `group_id` (TEXT, indexed)
- `group_name` (TEXT)
- `size_category` (TEXT, indexed: small/medium/large/giant)
- `coat_length` (TEXT, indexed: short/medium/long/wire)
- `cached_at` (INTEGER timestamp)

### Table: `breed_images`
- `id` (TEXT PRIMARY KEY)
- `breed_id` (TEXT NOT NULL, indexed)
- `url`, `thumb`, `medium`, `large` (TEXT)
- `author`, `license` (TEXT)

### Table: `groups`
- `id` (TEXT PRIMARY KEY)
- `name` (TEXT NOT NULL)

### Table: `sync_meta`
- `key` (TEXT PRIMARY KEY)
- `value` (TEXT)