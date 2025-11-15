import { createContext } from 'react';

export type GameDataContextType = {
  itemData: Record<string, unknown> | null;
  itemLoading: boolean;
  itemError: string | null;
};

export const GameDataContext = createContext<GameDataContextType | undefined>(undefined);
