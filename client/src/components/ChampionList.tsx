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
    <div className="w-full max-w-[640px] aspect-square green-bg-medium rounded-lg border green-border p-4 overflow-auto pb-8">
      <div className="mb-4 flex justify-end">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search champions"
          className="px-3 py-1.5 green-bg-light text-white rounded border green-border focus:outline-none focus:ring-1 text-sm"
          style={{ backgroundColor: '#1a2f27', borderColor: '#3d6b57' }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#5ecc8f'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#3d6b57'}
        />
      </div>
      {loading && <div className="text-white">Loading champions...</div>}
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
                <div className="w-20 h-20 green-bg-light rounded-sm overflow-hidden border green-border flex items-center justify-center hover:border-green-text transition-colors">
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt={c.name} className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-neutral-400">{c.name}</div>
                  )}
                </div>
                <div className="text-sm text-white truncate text-center w-20">{c.name}</div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default ChampionList;
