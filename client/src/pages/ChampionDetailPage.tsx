import { useParams, Link } from 'react-router-dom';
import { useAllChampions } from '../api/hooks';
import type { DDragonChampion } from '../api/hooks';
import { CDN_BASE } from '../lib/draftConstants';

export default function ChampionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useAllChampions();

  if (isLoading) return <div className="p-8">Loading champion...</div>;
  if (error) return <div className="p-8">Error loading champion</div>;
  if (!data) return <div className="p-8">No champion data</div>;

  const champId = id ? decodeURIComponent(id) : '';
  const champ: DDragonChampion | undefined = data.byId[champId];

  if (!champ) {
    return (
      <div className="min-h-screen page-bg p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Champion not found</h1>
          <Link to="/champions" className="text-primary-300">Back to champions</Link>
        </div>
      </div>
    );
  }

  const imageUrl = champ.image?.full ? `${CDN_BASE}${champ.image.full}` : undefined;

  return (
    <div className="min-h-screen page-bg p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-6 items-center mb-6">
          <div className="rounded overflow-hidden inline-flex items-center justify-center p-0">
                {imageUrl ? <img src={imageUrl} alt={champ.name} className="w-64 h-64 object-contain" /> : <div className="text-neutral-400">{champ.name}</div>}
              </div>
          <div>
            <h1 className="text-4xl font-bold">{champ.name}</h1>
            <div className="text-neutral-300">{champ.title}</div>
            <div className="mt-2 text-neutral-400">{champ.blurb}</div>
          </div>
        </div>

        <section className="card-bg rounded p-4 mb-6">
          <h2 className="text-2xl font-semibold mb-3">Base Stats</h2>
          <div className="grid grid-cols-2 gap-2">
            {champ.stats && Object.entries(champ.stats).map(([k, v]) => (
              <div key={k} className="flex justify-between text-neutral-200">
                <div className="capitalize">{k.replace(/_/g, ' ')}</div>
                <div className="font-mono">{v}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="card-bg rounded p-4 mb-6">
          <h2 className="text-2xl font-semibold mb-3">Abilities</h2>

          <div className="space-y-4">
            {champ.passive && (
              <div className="flex gap-4 items-start">
                <div className="w-20 h-20 bg-neutral-800/40 rounded overflow-hidden border-2 border-neutral-600 flex items-center justify-center p-2">
                  {champ.passive.image?.full ? (
                    <img src={`${CDN_BASE}${champ.passive.image.full}`} alt={champ.passive.name} className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-neutral-400">P</div>
                  )}
                </div>
                <div>
                  <div className="font-medium text-white">{champ.passive.name}</div>
                  <div className="text-neutral-300">{champ.passive.description}</div>
                </div>
              </div>
            )}

            {champ.spells && champ.spells.map((s, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <div className="w-14 h-14 bg-neutral-800/40 rounded overflow-hidden border-2 border-neutral-600 flex items-center justify-center p-2">
                  {s.image?.full ? (
                    <img src={`${CDN_BASE}${s.image.full}`} alt={s.name} className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-neutral-400">{['Q','W','E','R'][idx] || idx}</div>
                  )}
                </div>
                <div>
                  <div className="font-medium text-white">{s.name}</div>
                  <div className="text-neutral-300 mb-1">{s.description}</div>
                  {s.tooltip && <div className="text-neutral-400 text-sm" dangerouslySetInnerHTML={{ __html: s.tooltip }} />}
                </div>
              </div>
            ))}
          </div>
        </section>

        <Link to="/champions" className="text-primary-300">Back to champions</Link>
      </div>
    </div>
  );
}
