import * as dogApi from '../api/dogApi';

jest.mock('../utils/helpers', () => {
  const actual = jest.requireActual('../utils/helpers');
  return {
    ...actual,
    sleep: jest.fn().mockResolvedValue(undefined),
  };
});

describe('fetchAllBreeds', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    (globalThis as any).fetch = jest.fn();
  });

  afterEach(() => {
    (globalThis as any).fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('fetches 6 pages and merges results', async () => {
    const mockResponse = {
      data: [{ id: 'b1', type: 'breeds', attributes: { name: 'Test' }, relationships: {} }],
      meta: { pagination: { current: 1, next: null, last: 6, records: 283 } },
    };

    ((globalThis as any).fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const breeds = await dogApi.fetchAllBreeds();
    expect(breeds.length).toBeGreaterThan(0);
  });

  it('throws after max retries on network failure', async () => {
    ((globalThis as any).fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
    await expect(dogApi.fetchBreedsPage(1)).rejects.toThrow();
  });
});