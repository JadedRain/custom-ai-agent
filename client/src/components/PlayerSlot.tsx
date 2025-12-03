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
  const baseClasses = 'w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer green-bg-medium border-2';
  const selectedBorder = isSelected ? 'border-green-text shadow-lg' : isNext ? 'border-green-text-light' : 'green-border';
  const hoverClasses = 'hover:green-bg-light hover:border-green-text-light';

  if (side === 'left') {
    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${selectedBorder} ${hoverClasses} text-left`}
      >
        <div className="w-12 h-12 rounded-full green-bg-light border-2 green-border overflow-hidden flex items-center justify-center transition-colors hover:border-green-text">
          {champ?.imageUrl ? (
            <img src={champ.imageUrl} alt={champ.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-neutral-400 text-xl">+</span>
          )}
        </div>
        <div className="flex-1">
          <div className="text-sm text-neutral-400 text-xs">Player {index + 1}</div>
          <div className="text-white font-medium">{champ ? champ.name : 'Empty'}</div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${selectedBorder} ${hoverClasses} justify-end text-right`}
    >
      <div className="flex-1">
        <div className="text-sm text-neutral-400 text-xs">Player {index + 1}</div>
        <div className="text-white font-medium">{champ ? champ.name : 'Empty'}</div>
      </div>
      <div className="w-12 h-12 rounded-full green-bg-light border-2 green-border overflow-hidden flex items-center justify-center transition-colors hover:border-green-text">
        {champ?.imageUrl ? (
          <img src={champ.imageUrl} alt={champ.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-neutral-400 text-xl">+</span>
        )}
      </div>
    </button>
  );
};

export default PlayerSlot;
