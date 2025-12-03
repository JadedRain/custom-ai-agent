import React from 'react';
import { useRecommendations } from '../context/RecommendationContext.ts';
import { DDRAGON_VERSION } from '../config/constants';

const VERSION = DDRAGON_VERSION;
const ITEM_URL = `https://ddragon.leagueoflegends.com/cdn/${VERSION}/img/item/`;

type Props = {
  itemData: Record<string, unknown> | null;
  selectedPlayerName: string;
};

export const RecommendationsPanel: React.FC<Props> = ({ itemData, selectedPlayerName }) => {
  const { recommendations, recEvents, recLoading, recError, requestRecommendations } = useRecommendations();

  return (
    <div className="mt-4">
      <div className="flex justify-center">
        <button
          className="px-4 py-2 green-btn text-white font-semibold rounded shadow-md transition-colors"
          onClick={() => requestRecommendations()}
          disabled={recLoading}
        >
          {recLoading ? 'Requesting...' : 'Get AI Recommendations'}
        </button>
      </div>

      {recError && <div className="text-red-400 mt-2 text-center">{recError}</div>}

      {recommendations && recEvents && (
        <div className="mt-4 bg-neutral-800/60 rounded p-4">
          <h3 className="text-lg font-semibold mb-2">AI Recommendations for {selectedPlayerName}</h3>
          <div className="space-y-3">
            {recommendations.map((rec, i) => {
              const ev = recEvents[i];
              const currentItemId = ev ? String(ev.itemId || '') : '';
              const currentItemObj = currentItemId && itemData ? (itemData[currentItemId] as Record<string, unknown> | undefined) : undefined;
              const currentItemName = currentItemObj ? String(currentItemObj.name || '') : '';

              const recommendedId = String(rec?.recommended_item_id ?? rec?.recommended_item ?? '');
              const recommendedObj = recommendedId && itemData ? (itemData[recommendedId] as Record<string, unknown> | undefined) : undefined;
              const recommendedName = recommendedObj ? String(recommendedObj.name || '') : String(rec?.recommended_item ?? rec?.recommended_item_name ?? rec?.recommended_item_id ?? 'Unknown');

              const reasoningRaw = String(rec?.reasoning ?? '');
              const tagCounts = rec?.tag_counts as Record<string, number> | undefined;
              const alternatives = Array.isArray(rec?.alternatives) ? (rec?.alternatives as Array<Record<string, unknown>>) : [];

              const noChange = String(rec?.recommended_item_id || '') === String(ev?.itemId || '') || (currentItemName && String(recommendedName).toLowerCase().includes(String(currentItemName).toLowerCase()));

              let displayedReasoning = reasoningRaw || '';
              if (displayedReasoning && displayedReasoning.toLowerCase().includes('no dominant')) {
                const parts: string[] = [];
                if (tagCounts && Object.keys(tagCounts).length > 0) {
                  const tc = Object.entries(tagCounts).map(([k, v]) => `${k}: ${v}`).join(', ');
                  parts.push(`Enemy tags: ${tc}.`);
                }
                if (alternatives.length > 0) {
                  const altNames = alternatives.map(a => String(a?.name || a?.id || '')).slice(0, 3).join(', ');
                  parts.push(`Top alternatives: ${altNames}.`);
                }
                if (parts.length > 0) displayedReasoning = parts.join(' ');
              }

              return (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-20 text-sm text-neutral-400">{ev ? `${Math.floor((ev.timestamp||0)/60000)}:${String(Math.floor(((ev.timestamp||0)/1000)%60)).padStart(2,'0')}` : ''}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-neutral-400">Current</div>
                        {currentItemObj ? (
                          <img src={`${ITEM_URL}${currentItemId}.png`} alt={currentItemName} className="w-7 h-7 rounded border border-neutral-700" />
                        ) : (
                          <div className="w-7 h-7 bg-neutral-900 rounded border border-neutral-700" />
                        )}
                        <div className="text-sm">{currentItemName || '—'}</div>
                      </div>

                      <div className="flex items-center gap-2 ml-6">
                        <div className="text-xs text-neutral-400">Recommended</div>
                        {recommendedObj ? (
                          <img src={`${ITEM_URL}${recommendedId}.png`} alt={recommendedName} className="w-6 h-6 rounded border border-yellow-500" />
                        ) : (
                          <div className="w-6 h-6 bg-neutral-900 rounded border border-neutral-700" />
                        )}
                        <div className="text-sm">{recommendedName} {noChange ? <span className="text-neutral-400">(no change)</span> : null}</div>
                      </div>
                    </div>

                    {displayedReasoning ? <div className="text-xs text-neutral-400 mt-1">{displayedReasoning}</div> : null}

                    {alternatives.length > 0 ? (
                      <div className="text-xs text-neutral-400 mt-2">
                        <div className="font-semibold">Other options:</div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {alternatives.slice(0, 3).map((a, ai) => {
                            const aid = String(a?.id || a?.recommended_item_id || a?.id || '');
                            const aObj = aid && itemData ? (itemData[aid] as Record<string, unknown> | undefined) : undefined;
                            const aName = aObj ? String(aObj.name || '') : String(a?.name || a?.id || '');
                            return (
                              <div key={ai} className="flex items-center gap-2 px-2 py-1 bg-neutral-800 rounded text-sm border border-neutral-700">
                                {aObj ? <img src={`${ITEM_URL}${aid}.png`} alt={aName} className="w-5 h-5" /> : <div className="w-5 h-5 bg-neutral-900 rounded" />}
                                <div>{aName}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationsPanel;
