import { SizeCategory, CoatLength, ApiBreed, Breed, ApiGroup, Group, BreedImage, ApiImage } from '../types';

/** Derive size bucket from average male weight in kg */
export function deriveSizeCategory(attrs: ApiBreed['attributes']): SizeCategory {
  const avgWeight = (attrs.male_weight.min + attrs.male_weight.max) / 2;
  if (avgWeight < 10) return 'small';
  if (avgWeight < 25) return 'medium';
  if (avgWeight < 45) return 'large';
  return 'giant';
}

/**
 * Derive coat length from grooming score & shedding.
 * This is a heuristic since the API doesn't expose a "coat_length" field directly.
 * High grooming + high shedding → long; low grooming → short; wire terriers → wire (detected via name).
 */
export function deriveCoatLength(breed: ApiBreed): CoatLength {
  const name = breed.attributes.name.toLowerCase();
  const wireTerms = ['wire', 'wirehaired', 'rough', 'wirehair'];
  if (wireTerms.some((t) => name.includes(t))) return 'wire';

  const grooming = breed.attributes.grooming ?? 3;
  const shedding = breed.attributes.shedding ?? 3;
  const score = (grooming + shedding) / 2;
  if (score <= 2) return 'short';
  if (score <= 3.5) return 'medium';
  return 'long';
}

/** Map raw API breed to normalised app Breed */
export function normaliseBreed(
  apiBreed: ApiBreed,
  groups: Group[],
  images: BreedImage[] = []
): Breed {
  const attrs = apiBreed.attributes;
  const groupId = apiBreed.relationships?.group?.data?.id ?? null;
  const group = groups.find((g) => g.id === groupId) ?? null;

  return {
    id: apiBreed.id,
    name: attrs.name,
    description: attrs.description ?? '',
    temperament: attrs.temperament ?? null,
    otherNames: attrs.other_names ?? null,
    origin: attrs.origin ?? attrs.country_of_origin ?? null,
    lifeMin: attrs.life?.min ?? 0,
    lifeMax: attrs.life?.max ?? 0,
    maleWeightMin: attrs.male_weight?.min ?? 0,
    maleWeightMax: attrs.male_weight?.max ?? 0,
    femaleWeightMin: attrs.female_weight?.min ?? 0,
    femaleWeightMax: attrs.female_weight?.max ?? 0,
    maleHeightMin: attrs.male_height?.min ?? 0,
    maleHeightMax: attrs.male_height?.max ?? 0,
    femaleHeightMin: attrs.female_height?.min ?? 0,
    femaleHeightMax: attrs.female_height?.max ?? 0,
    hypoallergenic: attrs.hypoallergenic ?? false,
    energy: attrs.energy ?? 3,
    barking: attrs.barking ?? 3,
    drooling: attrs.drooling ?? 3,
    grooming: attrs.grooming ?? 3,
    shedding: attrs.shedding ?? 3,
    trainability: attrs.trainability ?? 3,
    goodWithDogs: attrs.good_with_dogs ?? 3,
    goodWithStrangers: attrs.good_with_strangers ?? 3,
    goodWithChildren: attrs.good_with_children ?? 3,
    apartmentFriendly: attrs.apartment_friendly ?? 3,
    exerciseMinutes: attrs.exercise_minutes ?? 60,
    groupId,
    groupName: group?.name ?? null,
    sizeCategory: deriveSizeCategory(attrs),
    coatLength: deriveCoatLength(apiBreed),
    images,
    cachedAt: Date.now(),
  };
}

/** Map raw API group to normalised Group */
export function normaliseGroup(apiGroup: ApiGroup): Group {
  return { id: apiGroup.id, name: apiGroup.attributes.name };
}

/** Format a relative time string */
export function formatRelativeTime(ms: number): string {
  const diff = Date.now() - ms;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/** Debounce utility */
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** Exponential backoff delay */
export function getRetryDelay(attempt: number, baseMs = 1000): number {
  return baseMs * Math.pow(2, attempt) + Math.random() * 500;
}

/** Sleep utility */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
