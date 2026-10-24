# Technical Decisions

## 1. State Management: Zustand

**Chosen:** Zustand  
**Alternatives considered:** Redux Toolkit, Jotai, Context+Reducer

**Rationale:**
- Minimal boilerplate for a single-domain app (breeds, filters, sync)
- Selector-based access without Provider nesting
- Built-in support for computed getters (`getFilteredBreeds`)
- Tiny bundle footprint (~1 KB gzipped)
- Redux Toolkit would add unnecessary complexity (slices, reducers, selectors, devtools) for this scale

## 2. Database: expo-sqlite (SQLite)

**Chosen:** expo-sqlite  
**Alternatives considered:** WatermelonDB, AsyncStorage

**Rationale:**
- Native SQLite is ideal for structured relational data with indexes
- WAL journal mode gives significantly better read performance during concurrent writes
- AsyncStorage is a plain key-value store — querying 283 breeds with filters would require loading everything into memory first
- WatermelonDB adds ORM complexity and a heavier learning curve without meaningful benefit at 283 records

**Schema decisions:**
- Breed images stored as `images_json TEXT` (JSON-encoded array). SQLite doesn't support arrays natively, and a separate `images` table would require JOINs for every list render. Since image arrays are always read with their parent breed, denormalisation is the right trade-off.
- `PRAGMA journal_mode = WAL` enabled for concurrent read/write performance.
- Indexes on `group_id`, `name`, `size_category`, `hypoallergenic` for filter queries.

## 3. API Layer: Custom hooks + fetch with retry

**Chosen:** Custom `useBreedSync` hook + `fetchWithRetry`  
**Alternatives considered:** React Query, SWR

**Rationale:**
- React Query/SWR are excellent for network-first data that lives in a React cache. Our data lives in SQLite with a custom sync schedule, making their cache layer redundant.
- Custom hook gives full control over the 6-page pagination merge, partial failure handling, and background sync semantics.
- Exponential backoff with jitter implemented in `getRetryDelay()`.

## 4. Offline-First Strategy

**Pattern:** Cache-first with background sync  
- On every app open: load SQLite immediately → show data instantly → check sync timestamp → sync if stale (>30 min)
- On network return (AppState 'active'): re-check and sync if needed
- On sync failure: show error banner + retain cached data — user never sees a blank screen
- Image URLs are stored but images themselves rely on `expo-image`'s built-in disk cache (limited to 50 MB)

## 5. Virtualized List Performance

**Pattern:** `SectionList` with aggressive windowing  
- `initialNumToRender: 8` — renders only what fits on screen initially
- `maxToRenderPerBatch: 8` — limits JS thread work per frame
- `windowSize: 10` — maintains ~5 screens of rendered content
- `removeClippedSubviews: true` on Android — unmounts off-screen views from the native layer
- `BreedCard` wrapped in `React.memo` — prevents re-renders from filter/store updates that don't affect the card's data
- `expo-image` with `recyclingKey` — reuses native image views during fast scroll

**Trade-off explicitly called out:**  
Each row carries 33 fields + a JSON image array, so the perf challenge is payload richness per row, not row count. At 283 records, even rendering all at once would be ~8.3 KB of JS data. The real bottleneck is image loading latency and shadow rendering. We address this by:
1. Using `expo-image` with `cachePolicy="memory-disk"` for instant cache hits
2. Showing placeholder until image loads (no layout shift)
3. Limiting thumbnail size to `thumb` variant (~50px) in the list, upgrading to `medium` in detail view

## 6. Image Caching Strategy

- **List view:** `thumb` variant cached (smallest, fastest)
- **Detail / Gallery:** `medium` for the hero, `large` for full-screen gallery
- **Cache policy:** `expo-image` `memory-disk` — LRU memory cache + persistent disk cache (50 MB limit)
- **Attribution:** Author, license, and source URL surfaced in Gallery tab as required

## 7. Navigation: React Navigation

**Stack + Bottom Tabs**  
- Typed navigation with `BreedsStackParamList` and `MainTabParamList`
- `gestureEnabled: true` on Detail screen for swipe-back
- Header hidden — custom header UI embedded in screens for full design control

## 8. Size Category Derivation

Buckets derived from average male weight:
| Category | Weight range |
|----------|-------------|
| Small    | < 10 kg     |
| Medium   | 10–24 kg    |
| Large    | 25–44 kg    |
| Giant    | ≥ 45 kg     |

## 9. Coat Length Derivation

Heuristic based on breed name (wire detection) and grooming/shedding score average:
- Wire-haired breeds: detected via name substring match
- Short: avg(grooming, shedding) ≤ 2
- Medium: avg ≤ 3.5
- Long: avg > 3.5
