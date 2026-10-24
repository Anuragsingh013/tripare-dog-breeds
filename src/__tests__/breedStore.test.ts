import * as breedStore from '../store/breedStore';
import type { Breed } from '../types';

const makeMockBreed = (overrides: Partial<Breed> = {}): Breed => ({
  id: 'b1',
  name: 'Golden Retriever',
  description: 'Friendly dog',
  temperament: 'Friendly',
  otherNames: null,
  origin: 'Scotland',
  lifeMin: 10,
  lifeMax: 12,
  maleWeightMin: 29,
  maleWeightMax: 34,
  femaleWeightMin: 25,
  femaleWeightMax: 29,
  maleHeightMin: 58,
  maleHeightMax: 61,
  femaleHeightMin: 55,
  femaleHeightMax: 57,
  hypoallergenic: false,
  energy: 4,
  barking: 3,
  drooling: 3,
  grooming: 4,
  shedding: 4,
  trainability: 5,
  goodWithDogs: 5,
  goodWithStrangers: 5,
  goodWithChildren: 5,
  apartmentFriendly: 3,
  exerciseMinutes: 120,
  groupId: 'g1',
  groupName: 'Sporting',
  sizeCategory: 'large',
  coatLength: 'long',
  images: [],
  cachedAt: Date.now(),
  ...overrides,
});

describe('breedStore.getFilteredBreeds', () => {
  beforeEach(() => {
    const store = breedStore.useBreedStore.getState();
    store.setBreeds([makeMockBreed()]);
    store.resetFilters();
  });

  it('returns all breeds with no filters', () => {
    const breeds = breedStore.useBreedStore.getState().getFilteredBreeds();
    expect(breeds.length).toBe(1);
  });

  it('filters by search name', () => {
    breedStore.useBreedStore.getState().setFilters({ search: 'golden' });
    const breeds = breedStore.useBreedStore.getState().getFilteredBreeds();
    expect(breeds.length).toBe(1);
  });

  it('excludes non-matching search', () => {
    breedStore.useBreedStore.getState().setFilters({ search: 'poodle' });
    const breeds = breedStore.useBreedStore.getState().getFilteredBreeds();
    expect(breeds.length).toBe(0);
  });

  it('filters by size category', () => {
    breedStore.useBreedStore.getState().setFilters({ sizes: ['small'] });
    const breeds = breedStore.useBreedStore.getState().getFilteredBreeds();
    expect(breeds.length).toBe(0);
  });

  it('filters by hypoallergenic', () => {
    breedStore.useBreedStore.getState().setFilters({ hypoallergenic: true });
    const breeds = breedStore.useBreedStore.getState().getFilteredBreeds();
    expect(breeds.length).toBe(0);
  });

  it('filters by min energy', () => {
    breedStore.useBreedStore.getState().setFilters({ minEnergy: 4 });
    const breeds = breedStore.useBreedStore.getState().getFilteredBreeds();
    expect(breeds.length).toBe(1);
  });

  it('excludes breed below min energy threshold', () => {
    breedStore.useBreedStore.getState().setFilters({ minEnergy: 5 });
    const breeds = breedStore.useBreedStore.getState().getFilteredBreeds();
    expect(breeds.length).toBe(0);
  });

  it('toggles favourites correctly', () => {
    const store = breedStore.useBreedStore.getState();
    store.toggleFavourite('b1');
    expect(breedStore.useBreedStore.getState().favouriteIds.has('b1')).toBe(true);
    store.toggleFavourite('b1');
    expect(breedStore.useBreedStore.getState().favouriteIds.has('b1')).toBe(false);
  });
});
