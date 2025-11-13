import React, { createContext, useContext, useCallback } from 'react';
import { useQueryClient, useIsFetching } from '@tanstack/react-query';

interface SearchContextType {
  gameName: string;
  tagLine: string;
  isLoading: boolean;
  onSearch: (gameName: string, tagLine: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearchContext = () => {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearchContext must be used within a SearchProvider');
  return ctx;
};

export const SearchProvider: React.FC<{
  children: React.ReactNode;
  initialGameName: string;
  initialTagLine: string;
  queryKey: (gameName: string, tagLine: string) => any[];
}> = ({ children, initialGameName, initialTagLine, queryKey }) => {
  const [gameName, setGameName] = React.useState(initialGameName);
  const [tagLine, setTagLine] = React.useState(initialTagLine);
  const queryClient = useQueryClient();
  const isLoading = useIsFetching({ queryKey: queryKey(gameName, tagLine) }) > 0;

  const onSearch = useCallback((newGameName: string, newTagLine: string) => {
    setGameName(newGameName);
    setTagLine(newTagLine);
    queryClient.invalidateQueries({ queryKey: queryKey(newGameName, newTagLine) });
  }, [queryClient, queryKey]);

  return (
    <SearchContext.Provider value={{ gameName, tagLine, isLoading, onSearch }}>
      {children}
    </SearchContext.Provider>
  );
};
