import { Breed, Group } from '../types';

let memBreeds: Breed[] = [];
let memGroups: Group[] = [];
let memMeta: Record<string, string> = {};

export async function saveGroups(groups: Group[]): Promise<void> {
  memGroups = [...groups];
}

export async function loadGroups(): Promise<Group[]> {
  return memGroups;
}

export async function saveBreeds(breeds: Breed[]): Promise<void> {
  memBreeds = [...breeds];
}

export async function loadAllBreeds(): Promise<Breed[]> {
  return memBreeds;
}

export async function loadBreedById(id: string): Promise<Breed | null> {
  return memBreeds.find((b) => b.id === id) ?? null;
}

export async function getBreedsCount(): Promise<number> {
  return memBreeds.length;
}

export async function getSyncMeta(key: string): Promise<string | null> {
  return memMeta[key] ?? null;
}

export async function setSyncMeta(key: string, value: string): Promise<void> {
  memMeta[key] = value;
}

export async function getLastSyncedAt(): Promise<number | null> {
  const val = await getSyncMeta('last_synced_at');
  return val ? parseInt(val, 10) : null;
}

export async function setLastSyncedAt(ts: number): Promise<void> {
  await setSyncMeta('last_synced_at', ts.toString());
}