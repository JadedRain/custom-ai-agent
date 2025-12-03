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

  // Only show "completed" final items (not intermediate components) or final boots
  const displayedEvents = buildEvents.filter((e) => {
    const idStr = String(e.itemId);
    const itemObj = itemData[idStr] as Record<string, unknown> | undefined;
    if (!itemObj) return false;

    const from = itemObj.from as unknown;
    const into = itemObj.into as unknown;
    const tags = itemObj.tags as unknown;
    const name = String(itemObj.name || '').toLowerCase();

    // Completed/full item: it is built from components (has `from`) and is not further upgraded (no `into`)
    const isBuiltFromComponents = Array.isArray(from) && (from as unknown[]).length > 0;
    const isUpgradeable = Array.isArray(into) && (into as unknown[]).length > 0;
    const isFinalBuiltItem = isBuiltFromComponents && !isUpgradeable;

    // Boots: include any boot items (we'll dedupe later to keep the final boot)
    const hasBootsTag = Array.isArray(tags) && (tags as unknown[]).includes('Boots');
    const nameHasBoot = name.includes('boot');

    return isFinalBuiltItem || hasBootsTag || nameHasBoot;
  });

  // Remove earlier component purchases if a later event upgrades them into a final item
  const dedupedEvents = displayedEvents.filter((e, idx) => {
    const thisIdStr = String(e.itemId);
    // if any later displayed event has `from` containing this item's id, drop this one
    const upgradedLater = displayedEvents.slice(idx + 1).some((later) => {
      const laterItem = itemData[String(later.itemId)] as Record<string, unknown> | undefined;
      if (!laterItem) return false;
      const laterFrom = laterItem.from as unknown;
      if (!Array.isArray(laterFrom)) return false;
      // compare as strings
      return (laterFrom as unknown[]).map(String).includes(thisIdStr);
    });
    return !upgradedLater;
  });

  // If multiple boot events remain, keep only the last boot purchase (by timestamp)
  const isBootEvent = (ev: BuildEvent) => {
    const obj = itemData[String(ev.itemId)] as Record<string, unknown> | undefined;
    if (!obj) return false;
    const tags = obj.tags as unknown;
    const name = String(obj.name || '').toLowerCase();
    return (Array.isArray(tags) && (tags as unknown[]).includes('Boots')) || name.includes('boot');
  };

  const bootEvents = dedupedEvents.filter(isBootEvent);
  let finalEvents = dedupedEvents;
  if (bootEvents.length > 1) {
    const latestBootTs = Math.max(...bootEvents.map((b) => b.timestamp));
    finalEvents = dedupedEvents.filter((ev) => (isBootEvent(ev) ? ev.timestamp === latestBootTs : true));
  }

  function formatTime(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }

  return (
    <div>
      <h3 className="text-lg font-bold mb-2">Item Build Timeline</h3>
      <div className="w-full">
        <div className="relative w-full">
          <div className="absolute left-0 right-0 top-10 h-px bg-neutral-700" />
          <div className="flex flex-wrap items-start gap-6 px-2 py-3 justify-start">
            {finalEvents.map((e, i) => {
              const idStr = String(e.itemId);
              const itemObj = itemData[idStr] as Record<string, unknown> | undefined;
              const name = itemObj ? String(itemObj.name || '') : '';
              const tags = itemObj?.tags as unknown;
              const isBoot = Array.isArray(tags) && (tags as unknown[]).includes('Boots');

              return (
                <div key={i} className="flex flex-col items-center w-14 min-w-[56px]">
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/15.22.1/img/item/${e.itemId}.png`}
                    alt={name}
                    title={name}
                    className={`w-9 h-9 border rounded bg-neutral-800 ${isBoot ? 'border-yellow-500' : 'border-neutral-700'}`}
                  />
                  <div className="mt-2 text-xs text-neutral-400 text-center">{formatTime(e.timestamp)}</div>
                  <div className="text-[10px] text-neutral-300 text-center truncate w-full">{name}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
