import {
  ApiBreed,
  ApiGroup,
  ApiPaginatedResponse,
  ApiSingleResponse,
  BreedImage,
} from '../types';
import { BASE_URL, TOTAL_PAGES, MAX_RETRIES, BASE_RETRY_DELAY_MS } from '../utils/constants';
import { getRetryDelay, sleep } from '../utils/helpers';

// ─── Generic fetch with retry + exponential backoff ─────────────────────────

async function fetchWithRetry<T>(
  url: string,
  retries = MAX_RETRIES
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return (await response.json()) as T;
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await sleep(getRetryDelay(attempt, BASE_RETRY_DELAY_MS));
      }
    }
  }
  throw lastError;
}

// ─── Breed endpoints ─────────────────────────────────────────────────────────

export async function fetchBreedsPage(
  page: number
): Promise<ApiPaginatedResponse<ApiBreed>> {
  return fetchWithRetry<ApiPaginatedResponse<ApiBreed>>(
    `${BASE_URL}/breeds?page[number]=${page}&page[size]=48`
  );
}

/** Fetch all 6 pages and merge into a single array */
export async function fetchAllBreeds(
  onProgress?: (progress: number) => void
): Promise<ApiBreed[]> {
  const all: ApiBreed[] = [];
  for (let page = 1; page <= TOTAL_PAGES; page++) {
    const data = await fetchBreedsPage(page);
    all.push(...data.data);
    onProgress?.(page / TOTAL_PAGES);
    // Stop early if server signals no more pages
    if (data.meta?.pagination?.next === null) break;
  }
  return all;
}

export async function fetchBreedById(id: string): Promise<ApiSingleResponse<ApiBreed>> {
  return fetchWithRetry<ApiSingleResponse<ApiBreed>>(`${BASE_URL}/breeds/${id}`);
}

// ─── Group endpoints ─────────────────────────────────────────────────────────

export async function fetchGroups(): Promise<ApiPaginatedResponse<ApiGroup>> {
  return fetchWithRetry<ApiPaginatedResponse<ApiGroup>>(`${BASE_URL}/groups`);
}

// ─── Image endpoints ─────────────────────────────────────────────────────────

export interface ApiImageResponse {
  data: Array<{
    id: string;
    type: string;
    attributes: {
      url: string;
      thumb: string;
      medium: string;
      large: string;
      author: string | null;
      license: string | null;
      source: string | null;
    };
  }>;
}

export async function fetchBreedImages(breedId: string): Promise<BreedImage[]> {
  try {
    const res = await fetchWithRetry<ApiImageResponse>(
      `${BASE_URL}/breeds/${breedId}/relationships/images`
    );
    return res.data.map((img) => ({
      id: img.id,
      thumb: img.attributes.thumb ?? img.attributes.url,
      medium: img.attributes.medium ?? img.attributes.url,
      large: img.attributes.large ?? img.attributes.url,
      author: img.attributes.author,
      license: img.attributes.license,
      source: img.attributes.source,
    }));
  } catch {
    return [];
  }
}
