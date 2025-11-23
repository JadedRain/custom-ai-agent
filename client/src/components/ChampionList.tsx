import React from 'react';

export type Champion = {
  id: string;
  name: string;
  key?: string;
  imageUrl?: string;
};

interface Props {
  champions: Champion[];
  loading: boolean;
  error: string | null;
  onChampionClick: (id: string) => void;
}

const ChampionList: React.FC<Props> = ({ champions, loading, error, onChampionClick }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filtered = React.useMemo(() => {
    if (!searchTerm) return champions;
    const q = searchTerm.toLowerCase();
    return champions.filter((c) => c.name.toLowerCase().includes(q));
  }, [champions, searchTerm]);

  return (
    <div className="w-full max-w-[640px] aspect-square bg-neutral-900/40 rounded-lg border border-neutral-700 p-4 overflow-auto pb-8">
      <div className="mb-4 flex justify-end">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search champions"
          className="px-3 py-1.5 bg-neutral-800/20 text-neutral-200 rounded border border-neutral-700 focus:outline-none focus:border-primary-300 text-sm"
        />
      </div>
      {loading && <div className="text-neutral-200">Loading champions...</div>}
      {error && <div className="text-red-400">Error: {error}</div>}

      {!loading && !error && (
        filtered.length === 0 ? (
          <div className="text-neutral-400 text-center w-full">No champions match "{searchTerm}"</div>
        ) : (
          <div className="grid grid-cols-6 gap-4">
            {filtered.map((c) => (
              <div
                key={c.id}
                onClick={() => onChampionClick(c.id)}
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
  );
};

export default ChampionList;
