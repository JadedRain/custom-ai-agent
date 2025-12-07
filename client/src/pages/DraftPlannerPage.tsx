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
    <div className="min-h-screen green-bg-dark text-white pt-16 md:pt-20 px-2 py-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Clear button */}
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold green-text-light">Draft Planner</h1>
          <button
            onClick={() => clearDraft()}
            className="px-4 py-2 md:px-6 md:py-2.5 text-white rounded-lg text-sm md:text-base font-medium transition-all min-h-[44px] hover:scale-105 active:scale-95"
            style={{ backgroundColor: '#3d6b57' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5ecc8f'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3d6b57'}
          >
            Clear Draft
          </button>
        </div>

        {/* Mobile/Tablet Layout - Stack vertically */}
        <div className="lg:hidden space-y-4">
          {/* Selected Champion Display */}
          {selectedAssignedChampion && (
            <div className="flex items-center justify-center gap-3 p-3 green-bg-medium rounded-lg border-2 border-green-text/30">
              <div className="w-14 h-14 rounded-lg bg-neutral-800/50 overflow-hidden border-2 border-green-text flex items-center justify-center shadow-lg">
                {selectedAssignedChampion.imageUrl ? (
                  <img src={selectedAssignedChampion.imageUrl} alt={selectedAssignedChampion.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-neutral-400 text-xs text-center">{selectedAssignedChampion.name}</div>
                )}
              </div>
              <div className="flex flex-col">
                <div className="text-xs text-neutral-400 uppercase tracking-wide">Selected</div>
                <div className="text-white text-base font-bold">{selectedAssignedChampion.name}</div>
              </div>
            </div>
          )}

          {/* Champion List */}
          <div className="w-full overflow-hidden green-bg-medium rounded-lg p-2">
            <ChampionList champions={champions} loading={loading} error={error} onChampionClick={handleChampionClick} />
          </div>

          {/* Left Team */}
          <div className="green-bg-medium rounded-lg p-4">
            <h2 className="text-base font-bold green-text mb-3 uppercase tracking-wide">Team 1</h2>
            <div className="space-y-2">
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
          <div className="green-bg-medium rounded-lg p-4">
            <h2 className="text-base font-bold green-text mb-3 uppercase tracking-wide">Team 2</h2>
            <div className="space-y-2">
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

          <div className="h-96">
            <DraftAiChat 
              leftTeam={leftTeam} 
              rightTeam={rightTeam} 
              itemData={itemData}
              userSide={selectedSlot?.side}
            />
          </div>
        </div>

        <div className="hidden lg:grid grid-cols-12 gap-6">
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
          <div className="hidden lg:flex mt-6 items-center justify-center gap-4">
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

        <div className="hidden lg:block mt-6 h-64 max-w-4xl mx-auto">
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
