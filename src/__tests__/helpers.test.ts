import { normaliseBreed, normaliseGroup, deriveSizeCategory, deriveCoatLength, formatRelativeTime, debounce } from '../utils/helpers';
import type { ApiBreed, ApiGroup, Group } from '../types';

// Mock breed for testing
const mockApiBreed: ApiBreed = {
  id: 'test-123',
  type: 'breeds',
  attributes: {
    name: 'Test Terrier',
    description: 'A great test breed',
    temperament: 'Friendly, Playful',
    life: { min: 10, max: 15 },
    male_weight: { min: 8, max: 12 },
    female_weight: { min: 6, max: 10 },
    male_height: { min: 30, max: 40 },
    female_height: { min: 28, max: 38 },
    hypoallergenic: true,
    energy: 4,
    barking: 3,
    drooling: 1,
    grooming: 3,
    shedding: 2,
    trainability: 4,
    good_with_dogs: 5,
    good_with_strangers: 3,
    good_with_children: 5,
    apartment_friendly: 4,
    exercise_minutes: 60,
    other_names: 'TT, Testy',
    origin: 'UK',
  },
  relationships: { group: { data: { id: 'group-1', type: 'groups' } } },
};

const mockGroups: Group[] = [{ id: 'group-1', name: 'Terrier' }];

describe('normaliseBreed', () => {
  it('maps API breed to normalised Breed correctly', () => {
    const breed = normaliseBreed(mockApiBreed, mockGroups, []);
    expect(breed.id).toBe('test-123');
    expect(breed.name).toBe('Test Terrier');
    expect(breed.hypoallergenic).toBe(true);
    expect(breed.groupName).toBe('Terrier');
    expect(breed.lifeMin).toBe(10);
    expect(breed.lifeMax).toBe(15);
    expect(breed.energy).toBe(4);
  });

  it('handles missing group gracefully', () => {
    const breedNoGroup: ApiBreed = {
      ...mockApiBreed,
      relationships: { group: { data: null } },
    };
    const breed = normaliseBreed(breedNoGroup, mockGroups, []);
    expect(breed.groupId).toBeNull();
    expect(breed.groupName).toBeNull();
  });
});

describe('deriveSizeCategory', () => {
  it('classifies small breed correctly', () => {
    const attrs = { ...mockApiBreed.attributes, male_weight: { min: 3, max: 6 } };
    expect(deriveSizeCategory(attrs)).toBe('small');
  });

  it('classifies medium breed correctly', () => {
    const attrs = { ...mockApiBreed.attributes, male_weight: { min: 10, max: 20 } };
    expect(deriveSizeCategory(attrs)).toBe('medium');
  });

  it('classifies large breed correctly', () => {
    const attrs = { ...mockApiBreed.attributes, male_weight: { min: 25, max: 40 } };
    expect(deriveSizeCategory(attrs)).toBe('large');
  });

  it('classifies giant breed correctly', () => {
    const attrs = { ...mockApiBreed.attributes, male_weight: { min: 45, max: 90 } };
    expect(deriveSizeCategory(attrs)).toBe('giant');
  });
});

describe('deriveCoatLength', () => {
  it('detects wire coat from breed name', () => {
    const wireBreed: ApiBreed = {
      ...mockApiBreed,
      attributes: { ...mockApiBreed.attributes, name: 'Wire Fox Terrier' },
    };
    expect(deriveCoatLength(wireBreed)).toBe('wire');
  });
});

describe('formatRelativeTime', () => {
  it('returns "just now" for very recent timestamps', () => {
    expect(formatRelativeTime(Date.now() - 30000)).toBe('just now');
  });

  it('returns minutes ago correctly', () => {
    expect(formatRelativeTime(Date.now() - 5 * 60 * 1000)).toBe('5m ago');
  });

  it('returns hours ago correctly', () => {
    expect(formatRelativeTime(Date.now() - 2 * 60 * 60 * 1000)).toBe('2h ago');
  });
});

describe('normaliseGroup', () => {
  it('maps API group to normalised Group', () => {
    const apiGroup: ApiGroup = { id: 'g1', type: 'groups', attributes: { name: 'Herding' } };
    const group = normaliseGroup(apiGroup);
    expect(group.id).toBe('g1');
    expect(group.name).toBe('Herding');
  });
});

describe('debounce', () => {
  it('calls function only once after delay', async () => {
    jest.useFakeTimers();
    const fn = jest.fn();
    const debounced = debounce(fn, 300);
    debounced('a');
    debounced('b');
    debounced('c');
    expect(fn).not.toHaveBeenCalled();
    jest.runAllTimers();
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('c');
    jest.useRealTimers();
  });
});
