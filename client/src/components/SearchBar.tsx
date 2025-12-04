import React from 'react';
import { useSearchContext } from '../context/searchContextHelpers';
import { useNavigate } from 'react-router-dom';

const SearchBar: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { gameName, tagLine } = useSearchContext();
  const [localGameName, setLocalGameName] = React.useState(gameName);
  const [localTagLine, setLocalTagLine] = React.useState(tagLine);
  const navigate = useNavigate();

  React.useEffect(() => {
    setLocalGameName(gameName);
    setLocalTagLine(tagLine);
  }, [gameName, tagLine]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (localGameName && localTagLine) {
      navigate(`/player/${encodeURIComponent(localGameName)}/${encodeURIComponent(localTagLine)}`);
    }
  }

  const containerClass = compact ? 'mb-0' : 'mb-8';
  // Make compact only slightly smaller than normal: slightly reduced min-widths, padding, and button size
  const gameInputClass = compact
    ? 'flex-[2] min-w-[180px] px-3 py-1.5 text-sm text-white rounded-l-md green-border border focus:outline-none focus:ring-1 focus:ring-green-500 green-bg-medium placeholder-gray-400'
    : 'flex-[2] min-w-[200px] px-4 py-2 text-white rounded-l-md green-border border focus:outline-none focus:ring-1 focus:ring-green-500 green-bg-medium placeholder-gray-400';
  const tagInputClass = compact
    ? 'w-28 px-3 py-1.5 text-sm text-white rounded-r-md green-border border focus:outline-none focus:ring-1 focus:ring-green-500 green-bg-medium placeholder-gray-400'
    : 'w-32 px-4 py-2 text-white rounded-r-md green-border border focus:outline-none focus:ring-1 focus:ring-green-500 green-bg-medium placeholder-gray-400';
  const buttonClass = compact
    ? 'px-4 py-1.5 text-white font-semibold rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ml-2 text-sm'
    : 'px-6 py-2 text-white font-semibold rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ml-2';

  return (
    <form onSubmit={handleSubmit} className={containerClass}>
      <div className="flex items-stretch relative">
        <input
          type="text"
          value={localGameName}
          onChange={(e) => setLocalGameName(e.target.value)}
          placeholder="Search For Player"
          className={gameInputClass}
          style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
        />
        <input
          type="text"
          value={localTagLine}
          onChange={(e) => setLocalTagLine(e.target.value)}
          placeholder="Tag (e.g., NA1)"
          className={tagInputClass}
          style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
        />
        <button
          type="submit"
          className={buttonClass}
          style={{ backgroundColor: '#3d8b64' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4fa876'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3d8b64'}
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
