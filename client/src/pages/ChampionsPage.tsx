import ChampionList from '../components/ChampionList';
import { useAllChampions } from '../api/hooks';
import type { DDragonChampion } from '../api/hooks';
import { useNavigate } from 'react-router-dom';

export default function ChampionsPage() {
  const nav = useNavigate();
  const { data, isLoading, error } = useAllChampions();

  const champions = data ? data.list.map((c: DDragonChampion & { imageUrl?: string }) => ({ id: c.id, name: c.name, key: c.key, imageUrl: c.imageUrl })) : [];

  return (
    <div className="min-h-screen green-bg-dark text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 green-text-light">Champions</h1>

        <div className="flex justify-center">
          <ChampionList
            champions={champions}
            loading={isLoading}
            error={error instanceof Error ? (error.message) : (error ? String(error) : null)}
            onChampionClick={(id) => nav(`/champion/${encodeURIComponent(id)}`)}
          />
        </div>
      </div>
    </div>
  );
}
