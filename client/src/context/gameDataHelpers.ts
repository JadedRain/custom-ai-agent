
import { useContext } from 'react';
import { GameDataContext } from './GameDataContext.ts';
import type { GameDataContextType } from './GameDataContext.ts';

export function useGameData(): GameDataContextType {
  const ctx = useContext(GameDataContext);
  if (!ctx) throw new Error('useGameData must be used within a GameDataProvider');
  return ctx;
}
