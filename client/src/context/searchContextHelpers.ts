import { useContext } from 'react';
import { SearchContext } from './SearchContext.ts';

export const useSearchContext = () => {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearchContext must be used within a SearchProvider');
  return ctx;
};
