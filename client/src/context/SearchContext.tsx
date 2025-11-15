import React, { useCallback } from 'react';
import { SearchContext } from './SearchContext';

import { useQueryClient, useIsFetching } from '@tanstack/react-query';



export const SearchProvider: React.FC<{
  children: React.ReactNode;
  initialGameName: string;
  initialTagLine: string;
  queryKey: (gameName: string, tagLine: string) => unknown[];
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
