import React from 'react';
import type { Champion as ChampionType } from '../components/ChampionList';
import { PICK_ORDER, CDN_BASE, STORAGE_KEY } from '../lib/draftConstants';
import { API_BASE_URL } from '../api/client';
import { DraftPlannerContext } from './draftPlannerCore';
import type { ContextValue, SlotSide } from './draftPlannerCore';

type ChampionRaw = {
  id: string;
  key: string;
  name: string;
  image?: { full?: string };
};

export const DraftPlannerProvider: React.FC<React.PropsWithChildren<object>> = ({ children }) => {
  const [champions, setChampions] = React.useState<ChampionType[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [leftSlots, setLeftSlots] = React.useState<(string | null)[]>(Array(5).fill(null));
  const [rightSlots, setRightSlots] = React.useState<(string | null)[]>(Array(5).fill(null));
  const [pickIndex, setPickIndex] = React.useState(0);
  const [leftAssignedData, setLeftAssignedData] = React.useState<(ChampionType | null)[]>(Array(5).fill(null));
  const [rightAssignedData, setRightAssignedData] = React.useState<(ChampionType | null)[]>(Array(5).fill(null));
  const [selectedSlot, setSelectedSlot] = React.useState<{ side: SlotSide; index: number } | null>(null);

  React.useEffect(() => {
    let mounted = true;
    async function fetchChampions() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/champions`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const data: Record<string, ChampionRaw> = json?.data || {};
        const list = Object.values(data).map((c: ChampionRaw) => ({
          id: c.id,
          key: c.key,
          name: c.name,
          imageUrl: c.image?.full ? `${CDN_BASE}${c.image.full}` : undefined,
        } as ChampionType));
        list.sort((a, b) => a.name.localeCompare(b.name));
        if (mounted) setChampions(list);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (mounted) setError(msg || 'Failed to load champions');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchChampions();
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { leftSlots?: (string | null)[]; rightSlots?: (string | null)[]; pickIndex?: number };
      if (parsed.leftSlots && Array.isArray(parsed.leftSlots)) {
        setLeftSlots(parsed.leftSlots.map((v) => (v === null ? null : v)));
        const leftFallback = parsed.leftSlots.map((v) => (v ? { id: v, name: v, imageUrl: `${CDN_BASE}${v}.png` } as ChampionType : null));
        setLeftAssignedData(leftFallback);
      }
      if (parsed.rightSlots && Array.isArray(parsed.rightSlots)) {
        setRightSlots(parsed.rightSlots.map((v) => (v === null ? null : v)));
          const rightFallback = parsed.rightSlots.map((v) => (v ? { id: v, name: v, imageUrl: `${CDN_BASE}${v}.png` } as ChampionType : null));
          setRightAssignedData(rightFallback);
      }
      if (typeof parsed.pickIndex === 'number') setPickIndex(parsed.pickIndex);
  }, []);

  React.useEffect(() => {
    if (!champions || champions.length === 0) return;
    const normalize = (slots: (string | null)[]) =>
      slots.map((v) => {
        if (!v) return null;
        const byId = champions.find((c) => c.id === v);
        if (byId) return byId.id;
        const byKey = champions.find((c) => c.key === v);
        if (byKey) return byKey.id;
        const q = v.trim().toLowerCase();
        const byName = champions.find((c) => c.name.trim().toLowerCase() === q);
        if (byName) return byName.id;
        return null;
      });

    const normalizedLeft = normalize(leftSlots);
    const normalizedRight = normalize(rightSlots);
    const leftChanged = normalizedLeft.some((s, i) => s !== leftSlots[i]);
    const rightChanged = normalizedRight.some((s, i) => s !== rightSlots[i]);
    if (leftChanged) setLeftSlots(normalizedLeft);
    if (rightChanged) setRightSlots(normalizedRight);
  }, [champions, leftSlots, rightSlots]);

  React.useEffect(() => {
      const leftData = leftSlots.map((id) => {
        if (!id) return null;
        const found = champions.find((c) => c.id === id);
        if (found) return found;
        return { id, name: id, imageUrl: `${CDN_BASE}${id}.png` } as ChampionType;
      });
      const rightData = rightSlots.map((id) => {
        if (!id) return null;
        const found = champions.find((c) => c.id === id);
        if (found) return found;
        return { id, name: id, imageUrl: `${CDN_BASE}${id}.png` } as ChampionType;
      });
      setLeftAssignedData(leftData);
      setRightAssignedData(rightData);

      if (champions && champions.length > 0) {
        const mapToNameOrNull = (slots: (string | null)[]) =>
          slots.map((v) => {
            if (!v) return null;
            const found = champions.find((c) => c.id === v || c.name === v || c.key === v);
            return found ? found.name : null;
          });
        const toSave = JSON.stringify({ leftSlots: mapToNameOrNull(leftSlots), rightSlots: mapToNameOrNull(rightSlots), pickIndex });
          localStorage.setItem(STORAGE_KEY, toSave);
      }
  }, [leftSlots, rightSlots, pickIndex, champions]);

  function handleSlotClick(side: SlotSide, index: number) {
    setSelectedSlot((prev) => (prev && prev.side === side && prev.index === index ? null : { side, index }));
    const idx = PICK_ORDER.findIndex((o) => o.side === side && o.index === index);
    if (idx !== -1) setPickIndex(idx);
  }

  function handleChampionClick(champId: string) {
    if (selectedSlot) {
      const { side, index } = selectedSlot;
      if (side === 'left') setLeftSlots((prev) => { const next = [...prev]; next[index] = champId === next[index] ? null : champId; return next; });
      else setRightSlots((prev) => { const next = [...prev]; next[index] = champId === next[index] ? null : champId; return next; });
      return;
    }
    if (pickIndex >= PICK_ORDER.length) return;
    const slot = PICK_ORDER[pickIndex];
    if (slot.side === 'left') setLeftSlots((prev) => { const next = [...prev]; next[slot.index] = champId; return next; });
    else setRightSlots((prev) => { const next = [...prev]; next[slot.index] = champId; return next; });
    setPickIndex((p) => Math.min(p + 1, PICK_ORDER.length));
  }

  function clearDraft() {
    setLeftSlots(Array(5).fill(null));
    setRightSlots(Array(5).fill(null));
    setPickIndex(0);
    setSelectedSlot(null);
    setLeftAssignedData(Array(5).fill(null));
    setRightAssignedData(Array(5).fill(null));
    localStorage.removeItem(STORAGE_KEY);
  }

  const value: ContextValue = {
    champions,
    loading,
    error,
    leftSlots,
    rightSlots,
    leftAssignedData,
    rightAssignedData,
    pickIndex,
    selectedSlot,
    setSelectedSlot,
    handleSlotClick,
    handleChampionClick,
    clearDraft,
  };

  return <DraftPlannerContext.Provider value={value}>{children}</DraftPlannerContext.Provider>;
};
