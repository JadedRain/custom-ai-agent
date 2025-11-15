import React from 'react';

export type ItemBuildTimelineProps = {
  timeline: Record<string, unknown> | null;
  puuid: string;
  itemData: Record<string, unknown>;
};

type RawEvent = Record<string, unknown>;
type BuildEvent = { type: string; itemId: number; timestamp: number };

export const ItemBuildTimeline: React.FC<ItemBuildTimelineProps> = ({
  timeline,
  puuid,
  itemData,
}) => {
  const frames = (timeline?.info as Record<string, unknown> | undefined)
    ?.frames as Array<Record<string, unknown>> | undefined;

  const events: RawEvent[] =
    frames?.flatMap((f) => (Array.isArray(f.events) ? (f.events as RawEvent[]) : [])) || [];

  const participants = (timeline?.info as Record<string, unknown> | undefined)
    ?.participants as Array<Record<string, unknown>> | undefined;

  const participant = participants?.find((p) => String(p.puuid) === puuid);
  const participantId = participant ? Number(participant.participantId as number) : undefined;

  const itemEvents = events.filter((e) => {
    const eType = String(e.type || '');
    const ePartId = Number(e.participantId as number) || 0;
    return ePartId === participantId && eType === 'ITEM_PURCHASED';
  });

  const buildEvents: BuildEvent[] = itemEvents
    .map((e) => {
      const itemId = Number(e.itemId as number) || 0;
      const timestamp = Number(e.timestamp as number) || 0;
      const type = String(e.type || '');
      return { type, itemId, timestamp };
    })
    .filter((e) => e.itemId && itemData[String(e.itemId)])
    .sort((a, b) => a.timestamp - b.timestamp);

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
        {buildEvents.map((e, i) => {
          const idStr = String(e.itemId);
          const itemObj = itemData[idStr] as Record<string, unknown> | undefined;
          const name = itemObj ? String(itemObj.name || '') : '';
          return (
            <li key={i} className="flex items-center gap-3">
              <img
                src={`https://ddragon.leagueoflegends.com/cdn/15.22.1/img/item/${e.itemId}.png`}
                alt={name}
                title={name}
                className="w-8 h-8 border border-neutral-700 rounded bg-neutral-800"
              />
              <span className="font-semibold">{name}</span>
              <span className="text-xs text-neutral-400 ml-2">{formatTime(e.timestamp)}</span>
              <span className="text-xs ml-2">({e.type.replace('ITEM_', '').toLowerCase()})</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
