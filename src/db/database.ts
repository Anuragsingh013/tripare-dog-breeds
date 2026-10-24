import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { Breed, Group, BreedImage } from '../types';

let db: SQLite.SQLiteDatabase | null = null;

// In-memory fallback for Web or environments without native SQLite
let memBreeds: Breed[] = [];
let memGroups: Group[] = [];
let memMeta: Record<string, string> = {};

export async function getDb(): Promise<SQLite.SQLiteDatabase | null> {
  if (Platform.OS === 'web') return null;
  try {
    if (!db) {
      db = await SQLite.openDatabaseAsync('dogbreeds.db');
      await initSchema(db);
    }
    return db;
  } catch (e) {
    console.warn('SQLite unavailable, using fallback', e);
    return null;
  }
}

async function initSchema(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS breeds (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      temperament TEXT,
      other_names TEXT,
      origin TEXT,
      life_min REAL NOT NULL DEFAULT 0,
      life_max REAL NOT NULL DEFAULT 0,
      male_weight_min REAL NOT NULL DEFAULT 0,
      male_weight_max REAL NOT NULL DEFAULT 0,
      female_weight_min REAL NOT NULL DEFAULT 0,
      female_weight_max REAL NOT NULL DEFAULT 0,
      male_height_min REAL NOT NULL DEFAULT 0,
      male_height_max REAL NOT NULL DEFAULT 0,
      female_height_min REAL NOT NULL DEFAULT 0,
      female_height_max REAL NOT NULL DEFAULT 0,
      hypoallergenic INTEGER NOT NULL DEFAULT 0,
      energy REAL NOT NULL DEFAULT 3,
      barking REAL NOT NULL DEFAULT 3,
      drooling REAL NOT NULL DEFAULT 3,
      grooming REAL NOT NULL DEFAULT 3,
      shedding REAL NOT NULL DEFAULT 3,
      trainability REAL NOT NULL DEFAULT 3,
      good_with_dogs REAL NOT NULL DEFAULT 3,
      good_with_strangers REAL NOT NULL DEFAULT 3,
      good_with_children REAL NOT NULL DEFAULT 3,
      apartment_friendly REAL NOT NULL DEFAULT 3,
      exercise_minutes REAL NOT NULL DEFAULT 60,
      group_id TEXT,
      group_name TEXT,
      size_category TEXT NOT NULL DEFAULT 'medium',
      coat_length TEXT NOT NULL DEFAULT 'medium',
      images_json TEXT NOT NULL DEFAULT '[]',
      cached_at INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS sync_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_breeds_group ON breeds(group_id);
    CREATE INDEX IF NOT EXISTS idx_breeds_name ON breeds(name);
    CREATE INDEX IF NOT EXISTS idx_breeds_size ON breeds(size_category);
    CREATE INDEX IF NOT EXISTS idx_breeds_hypo ON breeds(hypoallergenic);
  `);
}

// Groups

export async function saveGroups(groups: Group[]): Promise<void> {
  const database = await getDb();
  if (!database) {
    memGroups = [...groups];
    return;
  }
  await database.withTransactionAsync(async () => {
    for (const g of groups) {
      await database.runAsync(
        'INSERT OR REPLACE INTO groups (id, name) VALUES (?, ?)',
        [g.id, g.name]
      );
    }
  });
}

export async function loadGroups(): Promise<Group[]> {
  const database = await getDb();
  if (!database) {
    return memGroups;
  }
  const rows = await database.getAllAsync<{ id: string; name: string }>(
    'SELECT id, name FROM groups ORDER BY name'
  );
  return rows;
}

// Breeds

export async function saveBreeds(breeds: Breed[]): Promise<void> {
  const database = await getDb();
  if (!database) {
    memBreeds = [...breeds];
    return;
  }
  await database.withTransactionAsync(async () => {
    for (const b of breeds) {
      await database.runAsync(
        `INSERT OR REPLACE INTO breeds VALUES (
          ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
        )`,
        [
          b.id, b.name, b.description, b.temperament, b.otherNames, b.origin,
          b.lifeMin, b.lifeMax,
          b.maleWeightMin, b.maleWeightMax,
          b.femaleWeightMin, b.femaleWeightMax,
          b.maleHeightMin, b.maleHeightMax,
          b.femaleHeightMin, b.femaleHeightMax,
          b.hypoallergenic ? 1 : 0,
          b.energy, b.barking, b.drooling, b.grooming, b.shedding,
          b.trainability, b.goodWithDogs, b.goodWithStrangers,
          b.goodWithChildren, b.apartmentFriendly, b.exerciseMinutes,
          b.groupId, b.groupName,
          b.sizeCategory, b.coatLength,
          JSON.stringify(b.images),
          b.cachedAt,
        ]
      );
    }
  });
}

function rowToBreed(row: Record<string, unknown>): Breed {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string,
    temperament: row.temperament as string | null,
    otherNames: row.other_names as string | null,
    origin: row.origin as string | null,
    lifeMin: row.life_min as number,
    lifeMax: row.life_max as number,
    maleWeightMin: row.male_weight_min as number,
    maleWeightMax: row.male_weight_max as number,
    femaleWeightMin: row.female_weight_min as number,
    femaleWeightMax: row.female_weight_max as number,
    maleHeightMin: row.male_height_min as number,
    maleHeightMax: row.male_height_max as number,
    femaleHeightMin: row.female_height_min as number,
    femaleHeightMax: row.female_height_max as number,
    hypoallergenic: (row.hypoallergenic as number) === 1,
    energy: row.energy as number,
    barking: row.barking as number,
    drooling: row.drooling as number,
    grooming: row.grooming as number,
    shedding: row.shedding as number,
    trainability: row.trainability as number,
    goodWithDogs: row.good_with_dogs as number,
    goodWithStrangers: row.good_with_strangers as number,
    goodWithChildren: row.good_with_children as number,
    apartmentFriendly: row.apartment_friendly as number,
    exerciseMinutes: row.exercise_minutes as number,
    groupId: row.group_id as string | null,
    groupName: row.group_name as string | null,
    sizeCategory: row.size_category as Breed['sizeCategory'],
    coatLength: row.coat_length as Breed['coatLength'],
    images: JSON.parse(row.images_json as string) as BreedImage[],
    cachedAt: row.cached_at as number,
  };
}

export async function loadAllBreeds(): Promise<Breed[]> {
  const database = await getDb();
  if (!database) {
    return memBreeds;
  }
  const rows = await database.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM breeds ORDER BY name'
  );
  return rows.map(rowToBreed);
}

export async function loadBreedById(id: string): Promise<Breed | null> {
  const database = await getDb();
  if (!database) {
    return memBreeds.find((b) => b.id === id) ?? null;
  }
  const row = await database.getFirstAsync<Record<string, unknown>>(
    'SELECT * FROM breeds WHERE id = ?',
    [id]
  );
  return row ? rowToBreed(row) : null;
}

export async function getBreedsCount(): Promise<number> {
  const database = await getDb();
  if (!database) {
    return memBreeds.length;
  }
  const row = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM breeds'
  );
  return row?.count ?? 0;
}

// Sync metadata

export async function getSyncMeta(key: string): Promise<string | null> {
  const database = await getDb();
  if (!database) {
    return memMeta[key] ?? null;
  }
  const row = await database.getFirstAsync<{ value: string }>(
    'SELECT value FROM sync_meta WHERE key = ?',
    [key]
  );
  return row?.value ?? null;
}

export async function setSyncMeta(key: string, value: string): Promise<void> {
  const database = await getDb();
  if (!database) {
    memMeta[key] = value;
    return;
  }
  await database.runAsync(
    'INSERT OR REPLACE INTO sync_meta (key, value) VALUES (?, ?)',
    [key, value]
  );
}

export async function getLastSyncedAt(): Promise<number | null> {
  const val = await getSyncMeta('last_synced_at');
  return val ? parseInt(val, 10) : null;
}

export async function setLastSyncedAt(ts: number): Promise<void> {
  await setSyncMeta('last_synced_at', ts.toString());
}