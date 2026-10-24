import { create } from 'zustand';
import { Breed, Group, BreedFilters, SyncState, DEFAULT_FILTERS, SizeCategory, CoatLength } from '../types';

interface BreedStore {
  // Data
  breeds: Record<string, Breed>;     // normalised cache keyed by id
  groups: Group[];
  filters: BreedFilters;
  sync: SyncState;
  favouriteIds: Set<string>;

  // Actions
  setBreeds: (breeds: Breed[]) => void;
  updateBreed: (breed: Breed) => void;
  setGroups: (groups: Group[]) => void;
  setFilters: (filters: Partial<BreedFilters>) => void;
  resetFilters: () => void;
  setSyncState: (state: Partial<SyncState>) => void;
  toggleFavourite: (id: string) => void;

  // Derived selectors (computed inline)
  getFilteredBreeds: () => Breed[];
  getBreedById: (id: string) => Breed | undefined;
}

export const useBreedStore = create<BreedStore>((set, get) => ({
  breeds: {},
  groups: [],
  filters: DEFAULT_FILTERS,
  sync: { status: 'idle', lastSyncedAt: null, error: null, progress: 0 },
  favouriteIds: new Set(),

  setBreeds: (breeds) =>
    set(() => {
      const record: Record<string, Breed> = {};
      for (const b of breeds) record[b.id] = b;
      return { breeds: record };
    }),

  updateBreed: (breed) =>
    set((state) => ({
      breeds: { ...state.breeds, [breed.id]: breed },
    })),

  setGroups: (groups) => set({ groups }),

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  setSyncState: (partial) =>
    set((state) => ({ sync: { ...state.sync, ...partial } })),

  toggleFavourite: (id) =>
    set((state) => {
      const next = new Set(state.favouriteIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { favouriteIds: next };
    }),

  getBreedById: (id) => get().breeds[id],

  getFilteredBreeds: () => {
    const { breeds, filters } = get();
    const allBreeds = Object.values(breeds);

    return allBreeds.filter((b) => {
      // Search filter
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchName = b.name.toLowerCase().includes(q);
        const matchOther = b.otherNames?.toLowerCase().includes(q) ?? false;
        if (!matchName && !matchOther) return false;
      }

      // Group filter
      if (filters.groupIds.length > 0 && b.groupId) {
        if (!filters.groupIds.includes(b.groupId)) return false;
      }

      // Size filter
      if (filters.sizes.length > 0) {
        if (!filters.sizes.includes(b.sizeCategory)) return false;
      }

      // Coat filter
      if (filters.coatLengths.length > 0) {
        if (!filters.coatLengths.includes(b.coatLength)) return false;
      }

      // Hypoallergenic
      if (filters.hypoallergenic !== null) {
        if (b.hypoallergenic !== filters.hypoallergenic) return false;
      }

      // Trait thresholds
      if (filters.minEnergy !== null && b.energy < filters.minEnergy) return false;
      if (filters.minGoodWithChildren !== null && b.goodWithChildren < filters.minGoodWithChildren) return false;
      if (filters.minGoodWithDogs !== null && b.goodWithDogs < filters.minGoodWithDogs) return false;
      if (filters.minGoodWithStrangers !== null && b.goodWithStrangers < filters.minGoodWithStrangers) return false;

      return true;
    });
  },
}));
