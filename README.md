# 🐶 Tripare Dog Breed Explorer

A production-grade React Native app that lets you browse, filter, and explore all 283 recognised dog breeds — fully offline-capable after first sync.

---

## Quick Start

```bash
npm install
cp .env.example .env
npx expo start          # Expo Go — scan QR code with your phone
# OR
npm run android         # Android emulator
npm run ios             # iOS simulator (macOS only)
```

> **Ready in < 3 minutes** — no native build steps required for Expo Go.

---

## Architecture Overview

The app follows an **offline-first** layered architecture:

1. **API Layer** (`src/api/dogApi.ts`) — Integrates with Dog API v2. All 283 breeds are fetched across 6 paginated pages (`GET /api/v2/breeds?page[number]=N`), merged, and normalised. Requests implement exponential backoff with jitter (up to 3 retries).
2. **Persistence Layer** (`src/db/database.ts`) — SQLite (WAL mode) stores breeds, groups, and sync metadata. Data is loaded instantaneously (< 30ms) on cold app starts.
3. **State Layer** (`src/store/breedStore.ts`) — Zustand store holds normalised `Record<string, Breed>` and `Record<string, Group>`. Filtering and multi-attribute search operate on-demand via the `getFilteredBreeds()` selector.

```
API (6 pages merged) ──► Normalisation ──► SQLite (WAL) ──► Zustand Store ──► UI Components
                                                ▲
                                  (Instant offline cold-start)
```

### Data Flow

```
App Start / Foreground (AppState)
  └── useBreedSync.performSync(force=false)
       ├── 1. Load from SQLite ──► Hydrate Zustand immediately (offline ready in ~30ms)
       ├── 2. Check if cache stale (lastSyncedAt > 30 minutes)
       └── 3. If stale or force=true:
            ├── fetchGroups()
            ├── fetchAllBreeds() (6 pages fetched & merged)
            ├── saveBreeds() + saveGroups() in SQLite transaction
            └── setBreeds() in Zustand store
```

---

## Key Technical Decisions

### State Management: Zustand
Chosen over Redux Toolkit for minimal boilerplate and lightweight footprint (~1KB). A single reactive `useBreedStore` manages breeds, groups, active filters, search text, sync status, and favourites.

### Persistence: expo-sqlite (WAL Mode)
SQLite provides indexed queries, batch write transactions, and near-zero read overhead. It guarantees instant startup without storing massive JSON blobs in AsyncStorage.

### Offline & Sync Resilience
- **Cache-First UX**: SQLite is loaded immediately on app open.
- **Background Sync**: Sync runs asynchronously without blocking user navigation.
- **Error Banner with Retry**: Sync failures show a non-intrusive `SyncBanner` while existing cached breeds remain completely interactive.
- **Stale Re-check**: Automatic sync check on app return from background via `AppState`.

---

## Features

- **Breed Explorer**: Browse all 283 breeds with smooth SectionList grouping by breed group.
- **Filtered Discovery**: Filter by Group, Size category, Coat length, Hypoallergenic status, and minimum trait scores (Energy, Good with Children, Good with Dogs, Good with Strangers).
- **Fast Debounced Search**: Instant real-time search matching both primary breed names and alternative/other names.
- **Rich Breed Details**: Overview tab (quick stats, dimensions table, temperament tags, description), Traits tab (11 visual 5-point trait bars), and Gallery tab (photo viewer with photographer and license attribution).
- **Favourites Collection**: Heart icon toggle persisted directly in database / store for offline access.
- **Graceful Error Handling**: Global React ErrorBoundary to prevent crashes and provide quick retry actions.

---

## Running Tests & Type Checks

```bash
# Run unit tests (Jest + ts-jest)
npm test

# Run tests in watch mode
npm run test:watch

# TypeScript strict type checking
npm run type-check
```

### Test Coverage Summary (22 tests passing)
- `src/__tests__/helpers.test.ts` (12 tests) — normalisation, size category derivation, coat length heuristic, debounce, relative time formatting.
- `src/__tests__/breedStore.test.ts` (8 tests) — store mutations, search filters, group/size/coat/trait filters, favourite toggling.
- `src/__tests__/dogApi.test.ts` (2 tests) — 6-page API merging and exponential backoff retry failure handling.

---

## Project Structure

```
tripare-dog-breeds/
├── docs/
│   ├── ARCHITECTURE.md    # System design & data flow
│   ├── DECISIONS.md       # Technical trade-offs & rationale
│   └── PERFORMANCE.md     # Benchmarks & optimization notes
├── src/
│   ├── api/               # Dog API v2 client + retry logic
│   ├── components/
│   │   ├── breed/         # BreedCard, TraitBar, FilterPanel, SizeBadge
│   │   └── common/        # ErrorBoundary, SyncBanner
│   ├── db/                # expo-sqlite database schema & CRUD
│   ├── hooks/             # useBreedSync, useBreedSearch
│   ├── navigation/        # AppNavigator (Bottom Tabs + Stack)
│   ├── screens/           # BreedListScreen, BreedDetailScreen, FavouritesScreen
│   ├── store/             # Zustand breed store & filter selectors
│   ├── types/             # Strict TypeScript types
│   ├── utils/             # Theme tokens, helpers, constants
│   └── __tests__/         # Unit test suites
├── App.tsx                # App entry with SafeAreaProvider & ErrorBoundary
└── package.json
```