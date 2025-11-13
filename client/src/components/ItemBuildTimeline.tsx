import React from 'react';

export type ItemBuildTimelineProps = {
  timeline: any;
  puuid: string;
  itemData: Record<string, any>;
};

export const ItemBuildTimeline: React.FC<ItemBuildTimelineProps> = ({ timeline, puuid, itemData }) => {
  const events: any[] = timeline?.info?.frames?.flatMap((f: any) => f.events) || [];
  const participant = timeline?.info?.participants?.find((p: any) => p.puuid === puuid);
  const participantId = participant?.participantId;
  const itemEvents = events.filter((e: any) =>
    e.participantId === participantId && ["ITEM_PURCHASED", "ITEM_UNDO", "ITEM_SOLD", "ITEM_DESTROYED"].includes(e.type)
  );
  const buildEvents = itemEvents.map((e: any) => ({
    type: e.type,
    itemId: e.itemId,
    timestamp: e.timestamp
  })).filter(e => e.itemId && itemData[e.itemId]);
  buildEvents.sort((a, b) => a.timestamp - b.timestamp);

  function formatTime(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }
  return (
    <div>
      <h3 className="text-lg font-bold mb-2">Item Build Timeline</h3>
      <ul className="space-y-2">
        {buildEvents.map((e, i) => (
          <li key={i} className="flex items-center gap-3">
            <img
              src={`https://ddragon.leagueoflegends.com/cdn/15.22.1/img/item/${e.itemId}.png`}
              alt={itemData[e.itemId]?.name}
              title={itemData[e.itemId]?.name}
              className="w-8 h-8 border border-neutral-700 rounded bg-neutral-800"
            />
            <span className="font-semibold">{itemData[e.itemId]?.name}</span>
            <span className="text-xs text-neutral-400 ml-2">{formatTime(e.timestamp)}</span>
            <span className="text-xs ml-2">({e.type.replace('ITEM_', '').toLowerCase()})</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
