import React from 'react';
import { apiClient } from '../api/client';
import { RecommendationContext } from './RecommendationContext';

type Recommendation = Record<string, unknown>;

type ProviderProps = {
  match: Record<string, unknown>;
  timeline: Record<string, unknown>;
  itemData: Record<string, unknown> | null;
  selectedPlayerPuuid: string;
  token?: string | undefined;
  children: React.ReactNode;
};

export const RecommendationProvider: React.FC<ProviderProps> = ({ match, timeline, itemData, selectedPlayerPuuid, token, children }) => {
  const [recommendations, setRecommendations] = React.useState<Recommendation[] | null>(null);
  const [recEvents, setRecEvents] = React.useState<Array<{ itemId: number; timestamp: number }> | null>(null);
  const [recLoading, setRecLoading] = React.useState(false);
  const [recError, setRecError] = React.useState<string | null>(null);

  const requestRecommendations = React.useCallback(async () => {
    if (!timeline || !selectedPlayerPuuid || !itemData) return;
    setRecLoading(true);
    setRecError(null);
    setRecommendations(null);

    try {
      const frames = (timeline?.info as Record<string, unknown> | undefined)?.frames as Array<Record<string, unknown>> | undefined;
      const events: Array<Record<string, unknown>> = frames?.flatMap((f) => (Array.isArray(f.events) ? (f.events as Array<Record<string, unknown>>) : [])) || [];
      const participants = (timeline?.info as Record<string, unknown> | undefined)?.participants as Array<Record<string, unknown>> | undefined;
      const participant = participants?.find((p) => String(p.puuid) === selectedPlayerPuuid);
      if (!participant) throw new Error('Participant not found');
      const participantId = Number(participant.participantId as number) || 0;

      const itemEvents = events.filter((e) => {
        const eType = String(e.type || '');
        const ePartId = Number(e.participantId as number) || 0;
        return ePartId === participantId && eType === 'ITEM_PURCHASED';
      }).map((e) => ({ itemId: Number(e.itemId as number) || 0, timestamp: Number(e.timestamp as number) || 0, type: String(e.type || '')})).filter((e) => e.itemId && itemData[String(e.itemId)]).sort((a,b) => a.timestamp - b.timestamp);

      const displayedEvents = itemEvents.filter((e) => {
        const idStr = String(e.itemId);
        const itemObj = itemData[idStr] as Record<string, unknown> | undefined;
        if (!itemObj) return false;
        const from = itemObj.from as unknown;
        const into = itemObj.into as unknown;
        const tags = itemObj.tags as unknown;
        const name = String(itemObj.name || '').toLowerCase();

        const isBuiltFromComponents = Array.isArray(from) && (from as unknown[]).length > 0;
        const isUpgradeable = Array.isArray(into) && (into as unknown[]).length > 0;
        const isFinalBuiltItem = isBuiltFromComponents && !isUpgradeable;
        const hasBootsTag = Array.isArray(tags) && (tags as unknown[]).includes('Boots');
        const nameHasBoot = name.includes('boot');

        return isFinalBuiltItem || hasBootsTag || nameHasBoot;
      });

      const dedupedEvents = displayedEvents.filter((e, idx) => {
        const thisIdStr = String(e.itemId);
        const upgradedLater = displayedEvents.slice(idx + 1).some((later) => {
          const laterItem = itemData[String(later.itemId)] as Record<string, unknown> | undefined;
          if (!laterItem) return false;
          const laterFrom = laterItem.from as unknown;
          if (!Array.isArray(laterFrom)) return false;
          return (laterFrom as unknown[]).map(String).includes(thisIdStr);
        });
        return !upgradedLater;
      });

      const isBootEvent = (ev: { itemId: number }) => {
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

      const inventories: Record<number, number[]> = {};
      const allParticipantIds = (participants || []).map(p => Number(p.participantId as number) || 0);
      allParticipantIds.forEach(id => (inventories[id] = []));

      const sortedEvents = events.slice().sort((a,b) => (Number(a.timestamp as number) || 0) - (Number(b.timestamp as number) || 0));

      const calls: Array<{ name: string; parameters: Record<string, unknown> }> = [];

      for (const ev of sortedEvents) {
        const ts = Number(ev.timestamp as number) || 0;
        const pid = Number(ev.participantId as number) || 0;
        const type = String(ev.type || '');
        const itemId = Number(ev.itemId as number) || 0;

        if (type === 'ITEM_PURCHASED' && itemId) {
          inventories[pid] = inventories[pid] || [];
          inventories[pid].push(itemId);
        } else if (type === 'ITEM_SOLD' && itemId) {
          inventories[pid] = inventories[pid] || [];
          const idx = inventories[pid].indexOf(itemId);
          if (idx >= 0) inventories[pid].splice(idx, 1);
        }

        const matching = finalEvents.filter(fe => fe.timestamp === ts);
        for (let i = 0; i < matching.length; i++) {
          const enemyChampions: string[] = [];
          const enemyItems: string[][] = [];
          const teamId = Number(participant.teamId as number) || 0;
          for (const p of participants || []) {
            const pid2 = Number(p.participantId as number) || 0;
            if (Number(p.teamId as number) === teamId) continue;
            enemyChampions.push(String(p.championName || p.champion || ''));
            const itemsArr = (inventories[pid2] || []).map(i => String(i));
            enemyItems.push(itemsArr);
          }

          const playerItems = (inventories[participantId] || []).map(i => String(i));

          const frame = (frames || []).slice().reverse().find((f) => (Number(f.timestamp as number) || 0) <= ts);
          const pFrame = frame && frame.participantFrames ? (frame.participantFrames as Record<string, unknown>)[String(participantId)] as Record<string, unknown> | undefined : undefined;

          const gold = pFrame ? Number(pFrame['currentGold'] ?? pFrame['totalGold'] ?? 0) : 0;

          calls.push({
            name: 'generate_best_item',
            parameters: {
              champion: String(participant.championName || participant.champion || ''),
              current_items: playerItems,
              gold: Number(gold || 0),
              enemy_champions: enemyChampions,
              enemy_items: enemyItems,
              game_time: Number(ts || 0),
              prefer_full_items: true,
              max_alternatives: 3,
              exclude_current_items: true,
              extra_context: {
                game_mode: (match?.info as Record<string, unknown>)?.gameMode as string | undefined,
              }
            }
          });
        }
      }

      if (calls.length === 0) {
        setRecError('No final build timestamps found to recommend for.');
        setRecLoading(false);
        return;
      }

      const resp = await apiClient.generateBestItems(calls, token);

      const toolResponses = resp?.tool_responses || resp?.toolResponses || null;
      const mapped: Array<Record<string, unknown>> = [];
      if (Array.isArray(toolResponses)) {
        for (let i = 0; i < toolResponses.length; i++) {
          const r = toolResponses[i];
          const result = r.result || r;
          mapped.push(result as Record<string, unknown>);
        }
      }

      const MAX_RECOMMENDATIONS = 6;
      const limitedMapped = mapped.slice(0, MAX_RECOMMENDATIONS);
      const limitedEvents = finalEvents.map(fe => ({ itemId: fe.itemId, timestamp: fe.timestamp })).slice(0, MAX_RECOMMENDATIONS);

      setRecommendations(limitedMapped);
      setRecEvents(limitedEvents);
      setRecLoading(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setRecError(message);
      setRecLoading(false);
    }
  }, [timeline, selectedPlayerPuuid, itemData, match, token]);

  const value = React.useMemo(() => ({ recommendations, recEvents, recLoading, recError, requestRecommendations }), [recommendations, recEvents, recLoading, recError, requestRecommendations]);

  return (
    <RecommendationContext.Provider value={value}>
      {children}
    </RecommendationContext.Provider>
  );
};

export default RecommendationProvider;
