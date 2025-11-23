import React from 'react';
import type { Champion as ChampionType } from '../components/ChampionList';

export type SlotSide = 'left' | 'right';

export type ContextValue = {
  champions: ChampionType[];
  loading: boolean;
  error: string | null;
  leftSlots: (string | null)[];
  rightSlots: (string | null)[];
  leftAssignedData: (ChampionType | null)[];
  rightAssignedData: (ChampionType | null)[];
  pickIndex: number;
  selectedSlot: { side: SlotSide; index: number } | null;
  setSelectedSlot: (s: { side: SlotSide; index: number } | null) => void;
  handleSlotClick: (side: SlotSide, index: number) => void;
  handleChampionClick: (id: string) => void;
  clearDraft: () => void;
};

export const DraftPlannerContext = React.createContext<ContextValue | undefined>(undefined);

export function useDraftPlanner() {
  const ctx = React.useContext(DraftPlannerContext);
  if (!ctx) throw new Error('useDraftPlanner must be used within DraftPlannerProvider');
  return ctx;
}
