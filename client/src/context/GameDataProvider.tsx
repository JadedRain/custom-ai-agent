import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { GameDataContext } from './GameDataContext';
import { DDRAGON_VERSION } from '../config/constants';

const VERSION = DDRAGON_VERSION;
const ITEM_URL = `https://ddragon.leagueoflegends.com/cdn/${VERSION}/data/en_US/item.json`;

export const GameDataProvider = ({ children }: { children: ReactNode }) => {
  const [itemData, setItemData] = useState<Record<string, unknown> | null>(null);
  const [itemLoading, setItemLoading] = useState(true);
  const [itemError, setItemError] = useState<string | null>(null);

  useEffect(() => {
    setItemLoading(true);
    fetch(ITEM_URL)
      .then(res => res.json())
      .then(data => {
        setItemData(data.data);
        setItemLoading(false);
      })
      .catch(() => {
        setItemError('Failed to load item data');
        setItemLoading(false);
      });
  }, []);

  return (
    <GameDataContext.Provider value={{ itemData, itemLoading, itemError }}>
      {children}
    </GameDataContext.Provider>
  );
};
