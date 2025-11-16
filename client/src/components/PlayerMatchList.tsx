import React from 'react';
import type { Match } from '../api/client';
import { PlayerMatchListItem } from './PlayerMatchListItem.tsx';

interface PlayerMatchListProps {
  matches: Match[];
  summonerPuuid: string;
}

export const PlayerMatchList: React.FC<PlayerMatchListProps> = ({ matches, summonerPuuid }) => (
  <ul className="space-y-2">
    {matches.length === 0 && (
      <li className="text-neutral-200">No recent matches found.</li>
    )}
    {matches.map((match) => (
      <PlayerMatchListItem key={match.metadata?.matchId || Math.random()} match={match} summonerPuuid={summonerPuuid} />
    ))}
  </ul>
);
