import React from 'react';
import type { Match } from '../api/client';
import { Link } from 'react-router-dom';

interface PlayerMatchListItemProps {
  match: Match;
  summonerPuuid: string;
}

const formatChampionName = (championName: string): string => {
  const specialCases: Record<string, string> = {
    'FiddleSticks': 'Fiddlesticks',
    'MonkeyKing': 'MonkeyKing',
    'Nunu&Willump': 'Nunu',
    'RenataGlasc': 'Renata',
    'KSante': 'KSante',
    'BelVeth': 'Belveth',
  };
  return specialCases[championName] || championName;
};

export const PlayerMatchListItem: React.FC<PlayerMatchListItemProps> = ({ match, summonerPuuid }) => {
  const participant = match.info.participants.find((p) => p.puuid === summonerPuuid);
  const champion = participant?.championName || participant?.champion || 'Unknown';
  const win = participant?.win;
  const gameMode = match?.info?.gameMode || 'Unknown';
  const queueId = match?.info?.queueId;
  const formattedChampionName = formatChampionName(champion);
  const championImageUrl = champion !== 'Unknown'
    ? `https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/${formattedChampionName}.png`
    : null;
  const queueNames: Record<number, string> = {
    400: 'Normal Draft',
    420: 'Ranked Solo/Duo',
    430: 'Normal Blind',
    440: 'Ranked Flex',
    450: 'ARAM',
    700: 'Clash',
    900: 'URF',
    1020: 'One For All',
    1300: 'Nexus Blitz',
    1700: 'Arena',
  };
  const queueName = queueId ? queueNames[queueId] || `Queue ${queueId}` : gameMode;

  return (
    <li>
      <Link
        to={`/match/${match.metadata?.matchId}`}
        className="flex items-center justify-between bg-neutral-800/40 p-3 rounded hover:bg-primary-800 transition-colors"
        style={{ textDecoration: 'none' }}
      >
        <div className="flex items-center gap-4">
          <span className={`px-2 py-1 rounded text-sm font-medium ${win ? 'bg-primary-200 text-white' : 'bg-primary-800 text-white'}`}>
            {win ? 'Win' : 'Loss'}
          </span>
          {championImageUrl && (
            <img
              src={championImageUrl}
              alt={champion}
              className="w-10 h-10 rounded-full border-2 border-neutral-600"
            />
          )}
          <span className="text-white font-medium">{champion}</span>
          <span className="text-neutral-200 text-sm">• {queueName}</span>
        </div>
        <div className="text-neutral-200 text-sm">{match.metadata?.matchId ? match.metadata.matchId.slice(0, 8) : ''}</div>
      </Link>
    </li>
  );
};
