export interface SearchContextType {
  gameName: string;
  tagLine: string;
  isLoading: boolean;
  onSearch: (gameName: string, tagLine: string) => void;
}

import { createContext } from 'react';
export const SearchContext = createContext<SearchContextType | undefined>(undefined);
