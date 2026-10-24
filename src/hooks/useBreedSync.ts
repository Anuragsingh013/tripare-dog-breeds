import { useCallback } from 'react';
import { useBreedStore } from '../store/breedStore';
import { fetchAllBreeds, fetchGroups } from '../api/dogApi';
import { saveBreeds, saveGroups, loadAllBreeds, loadGroups, getLastSyncedAt, setLastSyncedAt } from '../db/database';
import { normaliseBreed, normaliseGroup } from '../utils/helpers';
import { SYNC_INTERVAL_MS } from '../utils/constants';
import { Breed } from '../types';

export function useBreedSync() {
  const { setBreeds, setGroups, setSyncState, sync } = useBreedStore();

  const performSync = useCallback(async (force = false) => {
    if (sync.status === 'syncing') return;

    // Always load from SQLite first — guarantees offline operation
    const cachedBreeds = await loadAllBreeds();
    const cachedGroups = await loadGroups();

    if (cachedBreeds.length > 0) {
      setBreeds(cachedBreeds);
      setGroups(cachedGroups);
    }

    const lastSynced = await getLastSyncedAt();
    const needsSync = force || !lastSynced || (Date.now() - lastSynced) > SYNC_INTERVAL_MS;

    if (!needsSync) {
      setSyncState({ status: 'success', lastSyncedAt: lastSynced, error: null });
      return;
    }

    try {
      setSyncState({ status: 'syncing', error: null, progress: 0 });

      // Fetch groups first (needed for breed normalisation)
      const groupsRes = await fetchGroups();
      const groups = groupsRes.data.map(normaliseGroup);
      await saveGroups(groups);
      setGroups(groups);

      // Fetch + merge all 6 pages of breeds
      const apiBreeds = await fetchAllBreeds((progress) => {
        setSyncState({ progress });
      });

      const breeds: Breed[] = apiBreeds.map((b) => normaliseBreed(b, groups, []));
      await saveBreeds(breeds);
      setBreeds(breeds);

      const now = Date.now();
      await setLastSyncedAt(now);
      setSyncState({
        status: 'success',
        lastSyncedAt: now,
        error: null,
        progress: 1,
      });

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sync failed';
      setSyncState({ status: 'error', error: message });

      // Ensure cached data is shown even on total failure
      if (cachedBreeds.length === 0) {
        const fallback = await loadAllBreeds();
        if (fallback.length > 0) {
          setBreeds(fallback);
          setGroups(await loadGroups());
        }
      }
    }
  }, [sync.status, setBreeds, setGroups, setSyncState]);

  return { performSync, syncState: sync };
}
