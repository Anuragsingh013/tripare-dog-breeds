import { useState, useCallback, useRef } from 'react';
import { debounce } from '../utils/helpers';
import { useBreedStore } from '../store/breedStore';

export function useBreedSearch() {
  const [displaySearch, setDisplaySearch] = useState('');
  const { setFilters } = useBreedStore();

  const debouncedSearch = useRef(
    debounce((text: string) => {
      setFilters({ search: text });
    }, 300)
  ).current;

  const handleSearchChange = useCallback(
    (text: string) => {
      setDisplaySearch(text);
      debouncedSearch(text);
    },
    [debouncedSearch]
  );

  const clearSearch = useCallback(() => {
    setDisplaySearch('');
    setFilters({ search: '' });
  }, [setFilters]);

  return { displaySearch, handleSearchChange, clearSearch };
}
