import React from 'react';
import { useSearchContext } from '../context/SearchContext';
import { useNavigate } from 'react-router-dom';

const SearchBar: React.FC = () => {
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

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex items-stretch relative">
        <input
          type="text"
          value={localGameName}
          onChange={(e) => setLocalGameName(e.target.value)}
          placeholder="Search For Player"
          className="flex-[2] min-w-[200px] px-4 py-2 bg-primary-300 text-white rounded-l-md border border-neutral-600 focus:outline-none focus:border-primary-300"
          style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
        />
        <input
          type="text"
          value={localTagLine}
          onChange={(e) => setLocalTagLine(e.target.value)}
          placeholder="Tag (e.g., NA1)"
          className="w-32 px-4 py-2 bg-primary-300 text-white rounded-r-md border border-neutral-600 focus:outline-none focus:border-primary-300"
          style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
        />
        <button
          type="submit"
          className="px-6 py-2 bg-primary-600 hover:bg-primary-400 text-white font-semibold rounded-r-md transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed ml-2"
          style={{ height: '40px' }}
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
