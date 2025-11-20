import React from 'react';
import PlayerSlot from '../components/PlayerSlot';

type ChampionRaw = {
  id: string;
  key: string;
  name: string;
  title?: string;
  image?: { full?: string };
  tags?: string[];
};

type Champion = {
  id: string;
  name: string;
  imageUrl?: string;
};

const CDN_BASE = 'https://ddragon.leagueoflegends.com/cdn/15.22.1/img/champion/';

export default function DraftPlannerPage() {
  const [champions, setChampions] = React.useState<Champion[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');

  const [leftSlots, setLeftSlots] = React.useState<(string | null)[]>(Array(5).fill(null));
  const [rightSlots, setRightSlots] = React.useState<(string | null)[]>(Array(5).fill(null));
  const [pickIndex, setPickIndex] = React.useState(0);
  const [leftAssignedData, setLeftAssignedData] = React.useState<(Champion | null)[]>(Array(5).fill(null));
  const [rightAssignedData, setRightAssignedData] = React.useState<(Champion | null)[]>(Array(5).fill(null));

  const [selectedSlot, setSelectedSlot] = React.useState<{ side: 'left' | 'right'; index: number } | null>(null);

  React.useEffect(() => {
    let mounted = true;
    async function fetchChampions() {
      setLoading(true);
      setError(null);
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_BASE}/api/champions`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const data: Record<string, ChampionRaw> = json?.data || {};
        const list = Object.values(data).map((c) => ({
          id: c.id,
          name: c.name,
          imageUrl: c.image?.full ? `${CDN_BASE}${c.image.full}` : undefined,
        } as Champion));
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

  const STORAGE_KEY = 'draft_planner_state_v1';
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          leftSlots?: (string | null)[];
          rightSlots?: (string | null)[];
          pickIndex?: number;
          leftAssignedData?: (Champion | null)[];
          rightAssignedData?: (Champion | null)[];
        };
        // prefer explicit slot id arrays, but fall back to assigned data if missing
        if (parsed.leftSlots && Array.isArray(parsed.leftSlots)) {
          setLeftSlots(parsed.leftSlots);
        } else if (parsed.leftAssignedData && Array.isArray(parsed.leftAssignedData)) {
          setLeftSlots(parsed.leftAssignedData.map((c) => (c && (c as Champion).id) || null));
        }
        if (parsed.rightSlots && Array.isArray(parsed.rightSlots)) {
          setRightSlots(parsed.rightSlots);
        } else if (parsed.rightAssignedData && Array.isArray(parsed.rightAssignedData)) {
          setRightSlots(parsed.rightAssignedData.map((c) => (c && (c as Champion).id) || null));
        }
        if (typeof parsed.pickIndex === 'number') setPickIndex(parsed.pickIndex);
        if (parsed.leftAssignedData && Array.isArray(parsed.leftAssignedData)) setLeftAssignedData(parsed.leftAssignedData);
        if (parsed.rightAssignedData && Array.isArray(parsed.rightAssignedData)) setRightAssignedData(parsed.rightAssignedData);
        // Debug: report a compact summary of what we loaded to help diagnose missing state
        try {
          const summary = {
            leftSlotsPresent: Array.isArray(parsed.leftSlots),
            rightSlotsPresent: Array.isArray(parsed.rightSlots),
            leftSlotsCount: Array.isArray(parsed.leftSlots) ? parsed.leftSlots.filter(Boolean).length : 0,
            rightSlotsCount: Array.isArray(parsed.rightSlots) ? parsed.rightSlots.filter(Boolean).length : 0,
            leftAssignedCount: Array.isArray(parsed.leftAssignedData) ? parsed.leftAssignedData.filter(Boolean).length : 0,
            rightAssignedCount: Array.isArray(parsed.rightAssignedData) ? parsed.rightAssignedData.filter(Boolean).length : 0,
            pickIndex: typeof parsed.pickIndex === 'number' ? parsed.pickIndex : null,
          };
          console.debug('[DraftPlanner] loaded draft state', summary);
        } catch {
          // ignore debug errors
        }
      } else {
        // no saved state
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  React.useEffect(() => {
    try {
      const leftData = leftSlots.map((id) => {
        if (!id) return null;
        const found = champions.find((c) => c.id === id);
        if (found) return found;
        return { id, name: id, imageUrl: `${CDN_BASE}${id}.png` } as Champion;
      });
      const rightData = rightSlots.map((id) => {
        if (!id) return null;
        const found = champions.find((c) => c.id === id);
        if (found) return found;
        return { id, name: id, imageUrl: `${CDN_BASE}${id}.png` } as Champion;
      });
      setLeftAssignedData(leftData);
      setRightAssignedData(rightData);

      const toSave = JSON.stringify({ leftSlots, rightSlots, pickIndex, leftAssignedData: leftData, rightAssignedData: rightData });
      localStorage.setItem(STORAGE_KEY, toSave);
    } catch {
      // ignore storage errors
    }
  }, [leftSlots, rightSlots, pickIndex, champions]);

  const filteredChampions = React.useMemo(() => {
    if (!searchTerm) return champions;
    const q = searchTerm.toLowerCase();
    return champions.filter((c) => c.name.toLowerCase().includes(q));
  }, [champions, searchTerm]);

  // Prevent the whole page from scrolling while this page is mounted.
  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev || '';
    };
  }, []);

  function handleSlotClick(side: 'left' | 'right', index: number) {
    if (selectedSlot && selectedSlot.side === side && selectedSlot.index === index) {
      setSelectedSlot(null);
    } else {
      setSelectedSlot({ side, index });
    }
    // if user manually selects a slot, advance the automatic pickIndex to that position
    const order = [
      { side: 'left', index: 0 },
      { side: 'right', index: 0 },
      { side: 'right', index: 1 },
      { side: 'left', index: 1 },
      { side: 'left', index: 2 },
      { side: 'right', index: 2 },
      { side: 'right', index: 3 },
      { side: 'left', index: 3 },
      { side: 'left', index: 4 },
      { side: 'right', index: 4 },
    ];
    const idx = order.findIndex((o) => o.side === side && o.index === index);
    if (idx !== -1) setPickIndex(idx);
  }

  function handleChampionClick(champId: string) {
    if (selectedSlot) {
      const { side, index } = selectedSlot;
      if (side === 'left') {
        setLeftSlots((prev) => {
          const next = [...prev];
          next[index] = champId === next[index] ? null : champId;
          return next;
        });
      } else {
        setRightSlots((prev) => {
          const next = [...prev];
          next[index] = champId === next[index] ? null : champId;
          return next;
        });
      }
      // keep manual selection after assign
      return;
    }

    // Automatic pick following defined order when no manual slot selected
    const order = [
      { side: 'left', index: 0 },
      { side: 'right', index: 0 },
      { side: 'right', index: 1 },
      { side: 'left', index: 1 },
      { side: 'left', index: 2 },
      { side: 'right', index: 2 },
      { side: 'right', index: 3 },
      { side: 'left', index: 3 },
      { side: 'left', index: 4 },
      { side: 'right', index: 4 },
    ];
    if (pickIndex >= order.length) return; // all picks assigned
    const slot = order[pickIndex];
    if (slot.side === 'left') {
      setLeftSlots((prev) => {
        const next = [...prev];
        next[slot.index] = champId;
        return next;
      });
    } else {
      setRightSlots((prev) => {
        const next = [...prev];
        next[slot.index] = champId;
        return next;
      });
    }
    setPickIndex((p) => Math.min(p + 1, order.length));
  }

  function getChampionById(id?: string | null) {
    if (!id) return undefined;
    return champions.find((c) => c.id === id);
  }

  const selectedAssignedChampion = React.useMemo(() => {
    if (!selectedSlot) return undefined;
    const id = selectedSlot.side === 'left' ? leftSlots[selectedSlot.index] : rightSlots[selectedSlot.index];
    return champions.find((c) => c.id === id);
  }, [selectedSlot, leftSlots, rightSlots, champions]);

  return (
    <div className="min-h-screen page-bg pt-20 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-6 mb-4 items-center">
          <div className="col-span-2" />
          <div className="col-span-7 flex justify-end">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search champions"
              className="px-3 py-1.5 bg-neutral-800/20 text-neutral-200 rounded border border-neutral-700 focus:outline-none focus:border-primary-300 text-sm"
            />
          </div>
          <div className="col-span-3 flex justify-end">
            <button
              onClick={() => {
                // clear draft
                setLeftSlots(Array(5).fill(null));
                setRightSlots(Array(5).fill(null));
                setPickIndex(0);
                setSelectedSlot(null);
                setLeftAssignedData(Array(5).fill(null));
                setRightAssignedData(Array(5).fill(null));
                try {
                  localStorage.removeItem(STORAGE_KEY);
                } catch {
                  // ignore
                }
              }}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
            >
              Clear Draft
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-2 flex flex-col items-start gap-4">
            {leftSlots.map((champId, i) => {
              const champ = getChampionById(champId) ?? leftAssignedData[i];
              const isSelected = selectedSlot?.side === 'left' && selectedSlot.index === i;
              const order = [
                { side: 'left', index: 0 },
                { side: 'right', index: 0 },
                { side: 'right', index: 1 },
                { side: 'left', index: 1 },
                { side: 'left', index: 2 },
                { side: 'right', index: 2 },
                { side: 'right', index: 3 },
                { side: 'left', index: 3 },
                { side: 'left', index: 4 },
                { side: 'right', index: 4 },
              ];
              const next = order[pickIndex];
              const isNext = next?.side === 'left' && next?.index === i;
              return (
                <PlayerSlot
                  key={i}
                  side="left"
                  index={i}
                  champ={champ}
                  isSelected={isSelected}
                  isNext={isNext}
                  onClick={() => handleSlotClick('left', i)}
                />
              );
            })}
          </div>

          <div className="col-span-8">
            <div className="flex justify-center">
              <div className="w-full max-w-[640px] aspect-square bg-neutral-900/40 rounded-lg border border-neutral-700 p-4 overflow-auto pb-8">
                {loading && <div className="text-neutral-200">Loading champions...</div>}
                {error && <div className="text-red-400">Error: {error}</div>}

                {!loading && !error && (
                  filteredChampions.length === 0 ? (
                    <div className="text-neutral-400 text-center w-full">No champions match "{searchTerm}"</div>
                  ) : (
                    <div className="grid grid-cols-6 gap-4">
                      {filteredChampions.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => handleChampionClick(c.id)}
                          className="flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transform transition overflow-visible"
                        >
                          <div className="w-20 h-20 bg-neutral-800/40 rounded-sm overflow-hidden border border-neutral-700 flex items-center justify-center">
                            {c.imageUrl ? (
                              <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="text-neutral-400">{c.name}</div>
                            )}
                          </div>
                          <div className="text-sm text-neutral-200 truncate text-center w-20">{c.name}</div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="col-span-2 flex flex-col items-end gap-4">
            {rightSlots.map((champId, i) => {
              const champ = getChampionById(champId) ?? rightAssignedData[i];
              const isSelected = selectedSlot?.side === 'right' && selectedSlot.index === i;
              const order = [
                { side: 'left', index: 0 },
                { side: 'right', index: 0 },
                { side: 'right', index: 1 },
                { side: 'left', index: 1 },
                { side: 'left', index: 2 },
                { side: 'right', index: 2 },
                { side: 'right', index: 3 },
                { side: 'left', index: 3 },
                { side: 'left', index: 4 },
                { side: 'right', index: 4 },
              ];
              const next = order[pickIndex];
              const isNext = next?.side === 'right' && next?.index === i;
              return (
                <PlayerSlot
                  key={i}
                  side="right"
                  index={i}
                  champ={champ}
                  isSelected={isSelected}
                  isNext={isNext}
                  onClick={() => handleSlotClick('right', i)}
                />
              );
            })}
          </div>
        </div>

        {selectedAssignedChampion && (
          <div className="mt-6 flex items-center justify-center gap-4">
            <div className="w-16 h-16 rounded bg-neutral-800/30 overflow-hidden border border-neutral-700 flex items-center justify-center">
              {selectedAssignedChampion.imageUrl ? (
                <img src={selectedAssignedChampion.imageUrl} alt={selectedAssignedChampion.name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-neutral-400">{selectedAssignedChampion.name}</div>
              )}
            </div>
            <div className="text-neutral-200 text-lg font-medium">{selectedAssignedChampion.name}</div>
          </div>
        )}
      </div>
    </div>
  );
}
