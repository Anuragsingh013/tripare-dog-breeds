let version = '1.0.0';
try {
  const Constants = require('expo-constants');
  version = Constants?.default?.expoConfig?.version ?? Constants?.expoConfig?.version ?? '1.0.0';
} catch {
  // Fallback in test/node environment
}

export const BASE_URL = 'https://dogapi.dog/api/v2';
export const TOTAL_PAGES = 6;
export const PAGE_SIZE = 48;

// Retry config
export const MAX_RETRIES = 3;
export const BASE_RETRY_DELAY_MS = 1000;

// Cache config
export const SYNC_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
export const IMAGE_CACHE_LIMIT_MB = 50;

// App version
export const APP_VERSION = version;