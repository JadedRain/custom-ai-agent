import React from 'react';
import PlayerSlot from '../components/PlayerSlot';
import ChampionList from '../components/ChampionList';
import { DraftPlannerProvider } from '../context/DraftPlannerContext';
import { useDraftPlanner } from '../context/draftPlannerCore';
import { PICK_ORDER } from '../lib/draftConstants';
import { useAuth } from 'react-oidc-context';
import { AuthButton } from '../components/AuthButton';
import { DraftAiChat } from '../components/DraftAiChat';
import { useGameData } from '../context/gameDataHelpers';


export default function DraftPlannerPage() {
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen green-bg-medium text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Draft Planner</h1>
          <div className="green-bg-light green-border border rounded p-6">
            <p className="text-white text-lg mb-4">Please sign in to view and use the Draft Planner.</p>
            <AuthButton />
          </div>
        </div>
      </div>
    );
  }

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
  
  const { itemData } = useGameData();

  function getChampionById(id?: string | null) {
    if (!id) return undefined;
    return champions.find((c) => c.id === id);
  }

  const selectedAssignedChampion = React.useMemo(() => {
    if (!selectedSlot) return undefined;
    const id = selectedSlot.side === 'left' ? leftSlots[selectedSlot.index] : rightSlots[selectedSlot.index];
    return champions.find((c) => c.id === id);
  }, [selectedSlot, leftSlots, rightSlots, champions]);

  const leftTeam = leftSlots.map((champId, i) => {
    const champ = getChampionById(champId) ?? leftAssignedData[i];
    return { id: champId || undefined, name: champ?.name };
  });

  const rightTeam = rightSlots.map((champId, i) => {
    const champ = getChampionById(champId) ?? rightAssignedData[i];
    return { id: champId || undefined, name: champ?.name };
  });

  return (
    <div className="min-h-screen green-bg-dark text-white pt-20 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Clear button */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl md:text-3xl font-bold green-text-light">Draft Planner</h1>
          <button
            onClick={() => clearDraft()}
            className="px-3 py-2 md:px-4 md:py-2 text-white rounded text-sm transition-colors min-h-[44px]"
            style={{ backgroundColor: '#3d6b57' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5ecc8f'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3d6b57'}
          >
            Clear Draft
          </button>
        </div>

        {/* Mobile Layout - Stack vertically */}
        <div className="md:hidden space-y-6">
          {/* Left Team */}
          <div>
            <h2 className="text-lg font-semibold green-text mb-3">Team 1 (Left)</h2>
            <div className="grid grid-cols-5 gap-2">
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
          </div>

          {/* Right Team */}
          <div>
            <h2 className="text-lg font-semibold green-text mb-3">Team 2 (Right)</h2>
            <div className="grid grid-cols-5 gap-2">
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

          {/* Champion List */}
          <div className="w-full overflow-hidden">
            <ChampionList champions={champions} loading={loading} error={error} onChampionClick={handleChampionClick} />
          </div>

          {/* Selected Champion Display */}
          {selectedAssignedChampion && (
            <div className="flex items-center justify-center gap-4 p-4 green-bg-medium rounded-lg">
              <div className="w-16 h-16 rounded bg-neutral-800/30 overflow-hidden border border-neutral-700 flex items-center justify-center">
                {selectedAssignedChampion.imageUrl ? (
                  <img src={selectedAssignedChampion.imageUrl} alt={selectedAssignedChampion.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-neutral-400 text-xs text-center">{selectedAssignedChampion.name}</div>
                )}
              </div>
              <div className="text-neutral-200 text-lg font-medium">{selectedAssignedChampion.name}</div>
            </div>
          )}

          <div className="h-80">
            <DraftAiChat 
              leftTeam={leftTeam} 
              rightTeam={rightTeam} 
              itemData={itemData}
              userSide={selectedSlot?.side}
            />
          </div>
        </div>

        <div className="hidden md:grid grid-cols-12 gap-6">
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
          <div className="hidden md:flex mt-6 items-center justify-center gap-4">
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

        <div className="hidden md:block mt-6 h-64 max-w-4xl mx-auto">
          <DraftAiChat 
            leftTeam={leftTeam} 
            rightTeam={rightTeam} 
            itemData={itemData}
            userSide={selectedSlot?.side}
          />
        </div>
      </div>
    </div>
  );
}
