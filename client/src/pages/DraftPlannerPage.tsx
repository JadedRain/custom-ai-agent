import React from 'react';
import PlayerSlot from '../components/PlayerSlot';
import ChampionList from '../components/ChampionList';
import { DraftPlannerProvider } from '../context/DraftPlannerContext';
import { useDraftPlanner } from '../context/draftPlannerCore';
import { PICK_ORDER } from '../lib/draftConstants';


export default function DraftPlannerPage() {
  return (
    <DraftPlannerProvider>
      <DraftPlannerPageInner />
    </DraftPlannerProvider>
  );
}

function DraftPlannerPageInner() {
  const {
    champions,
    loading,
    error,
    leftSlots,
    rightSlots,
    leftAssignedData,
    rightAssignedData,
    pickIndex,
    selectedSlot,
    handleSlotClick,
    handleChampionClick,
    clearDraft,
  } = useDraftPlanner();

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
          <div className="col-span-7 flex justify-end" />
          <div className="col-span-3 flex justify-end">
            <button
              onClick={() => clearDraft()}
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
              const next = PICK_ORDER[pickIndex];
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
              <ChampionList champions={champions} loading={loading} error={error} onChampionClick={handleChampionClick} />
            </div>
          </div>

          <div className="col-span-2 flex flex-col items-end gap-4">
            {rightSlots.map((champId, i) => {
              const champ = getChampionById(champId) ?? rightAssignedData[i];
              const isSelected = selectedSlot?.side === 'right' && selectedSlot.index === i;
              const next = PICK_ORDER[pickIndex];
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
