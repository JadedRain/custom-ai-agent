import React from 'react';

export type Champion = {
  id: string;
  name: string;
  imageUrl?: string;
};

interface PlayerSlotProps {
  side: 'left' | 'right';
  index: number;
  champ?: Champion | null;
  isSelected?: boolean;
  isNext?: boolean;
  onClick?: () => void;
}

const PlayerSlot: React.FC<PlayerSlotProps> = ({ side, index, champ, isSelected = false, isNext = false, onClick }) => {
  const selectedClass = isSelected ? 'ring-2 ring-primary-300' : '';
  const nextClass = isNext ? 'ring-2 ring-primary-100/60' : '';

  if (side === 'left') {
    return (
      <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 text-left p-2 rounded ${selectedClass} ${nextClass}`}
      >
        <div className="w-14 h-14 rounded-full bg-neutral-800/30 border-2 border-neutral-700 overflow-hidden flex items-center justify-center">
          {champ?.imageUrl ? (
            <img src={champ.imageUrl} alt={champ.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-neutral-400">+</span>
          )}
        </div>
        <div className="text-neutral-300">{champ ? champ.name : `Player ${index + 1}`}</div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 justify-end p-2 rounded ${selectedClass} ${nextClass}`}
    >
      <div className="text-neutral-300">{champ ? champ.name : `Player ${index + 1}`}</div>
      <div className="w-14 h-14 rounded-full bg-neutral-800/30 border-2 border-neutral-700 overflow-hidden flex items-center justify-center">
        {champ?.imageUrl ? (
          <img src={champ.imageUrl} alt={champ.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-neutral-400">+</span>
        )}
      </div>
    </button>
  );
};

export default PlayerSlot;
