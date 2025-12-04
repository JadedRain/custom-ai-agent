import React from 'react';
import { DDRAGON_VERSION } from '../config/constants';

type PlayerCardProps = {
  p: Record<string, unknown>;
  itemData: Record<string, unknown> | null;
  onSelect?: (puuid: string, name: string) => void;
};

const VERSION = DDRAGON_VERSION;
const formatChampionName = (name: string) => {
  const specialCases: Record<string, string> = {
    'FiddleSticks': 'Fiddlesticks',
    'MonkeyKing': 'Wukong',
    'Nunu&Willump': 'Nunu',
    'RenataGlasc': 'Renata',
  };
  return specialCases[name] || name;
};

const ITEM_URL = `https://ddragon.leagueoflegends.com/cdn/${VERSION}/img/item/`;

export const PlayerCard: React.FC<PlayerCardProps> = ({ p, itemData, onSelect }) => {
  const champName = formatChampionName(String(p.championName));
  const riotName = String(p.riotIdGameName || p.summonerName || 'Unknown');
  const riotTag = String(p.riotIdTagline || '');

  const mainItems = Array.from({ length: 6 }).map((_, i) => {
    const raw = p[`item${i}`] as unknown;
    const itemId = Number(raw as number) || 0;
    if (!itemId || itemId === 0) return null;
    let name = '';
    let img = ITEM_URL + 'empty.png';
    let loaded = false;
    if (itemData && itemData[String(itemId)]) {
      const itemObj = itemData[String(itemId)] as Record<string, unknown>;
      name = String(itemObj.name || '');
      img = `${ITEM_URL}${itemId}.png`;
      loaded = true;
    }
    return { id: itemId, name, img, loaded };
  });

  const trinketRaw = p['item6'] as unknown;
  const trinketId = Number(trinketRaw as number) || 0;
  let trinket: { id: number; name: string; img: string; loaded: boolean } | null = null;
  if (trinketId && trinketId !== 0) {
    let name = '';
    let img = ITEM_URL + 'empty.png';
    let loaded = false;
    if (itemData && itemData[String(trinketId)]) {
      const tObj = itemData[String(trinketId)] as Record<string, unknown>;
      name = String(tObj.name || '');
      img = `${ITEM_URL}${trinketId}.png`;
      loaded = true;
    }
    trinket = { id: trinketId, name, img, loaded };
  }

  const kills = Number(p.kills || 0);
  const deaths = Number(p.deaths || 0);
  const assists = Number(p.assists || 0);
  const cs = Number(p.totalMinionsKilled || 0) + Number(p.neutralMinionsKilled || 0);
  const vision = Number(p.visionScore || 0);
  const gold = Number(p.goldEarned || 0) || 0;
  const level = Number(p.champLevel || 0);

  return (
    <div
      key={String(p.puuid)}
      className="flex flex-col py-3 border-b border-neutral-700 last:border-b-0 cursor-pointer hover:bg-neutral-700/30"
      onClick={() => onSelect && onSelect(String(p.puuid), riotName + (riotTag ? `#${riotTag}` : ''))}
    >
      <div className="flex items-center gap-3">
        <div className="w-48 flex items-center gap-2">
          <img
            src={`https://ddragon.leagueoflegends.com/cdn/${VERSION}/img/champion/${champName}.png`}
            alt={champName}
            className="w-10 h-10 rounded-full border border-neutral-600"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="flex flex-col">
            <div className="font-medium">{riotName} {riotTag ? <span className="text-primary-300">#{riotTag}</span> : null}</div>
            <div className="text-sm text-neutral-400">{String(p.championName)} • Lv {level} • {String(p.teamPosition)}</div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="text-lg font-semibold">{kills}</div>
                <div className="text-neutral-400">/</div>
                <div className="text-lg font-semibold">{deaths}</div>
                <div className="text-neutral-400">/</div>
                <div className="text-lg font-semibold">{assists}</div>
              </div>
              <div className="text-sm text-neutral-400">KDA: {deaths === 0 ? 'Perfect' : ((kills + assists) / Math.max(1, deaths)).toFixed(2)}</div>
            </div>

            <div className="flex items-center gap-4 text-sm text-neutral-300">
              <div>CS <span className="font-medium text-white">{cs}</span></div>
              <div>Vision <span className="font-medium text-white">{vision}</span></div>
              <div>Gold <span className="font-medium text-white">{gold}</span></div>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-3">
            <div className="flex items-center">
              {mainItems.map((item, i) =>
                item ? (
                  item.loaded ? (
                    <img
                      key={i}
                      src={item.img}
                      alt={item.name}
                      title={item.name}
                      className="w-7 h-7 border border-neutral-600 rounded bg-neutral-800 mr-1"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <span key={i} className="w-7 h-7 border border-neutral-700 rounded bg-neutral-900 inline-block mr-1" />
                  )
                ) : (
                  <span key={i} className="w-7 h-7 border border-neutral-700 rounded bg-neutral-900 inline-block mr-1" />
                )
              )}
            </div>

            <div className="ml-2">
              {trinket ? (
                trinket.loaded ? (
                  <img
                    src={trinket.img}
                    alt={trinket.name}
                    title={trinket.name}
                    className="w-7 h-7 border border-yellow-700 rounded bg-neutral-800"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <span className="w-7 h-7 border border-yellow-900 rounded bg-neutral-900 inline-block" />
                )
              ) : (
                <span className="w-7 h-7 border border-yellow-900 rounded bg-neutral-900 inline-block" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
