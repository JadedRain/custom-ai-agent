import React from 'react';
import type { Match } from '../api/client';
import { Link } from 'react-router-dom';
import { DDRAGON_VERSION } from '../config/constants';

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
    ? `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${formattedChampionName}.png`
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

  const kills = participant?.kills ?? 0;
  const deaths = participant?.deaths ?? 0;
  const assists = participant?.assists ?? 0;
  const cs = (participant?.totalMinionsKilled ?? 0) + (participant?.neutralMinionsKilled ?? 0);
  const visionScore = participant?.visionScore ?? 0;
  const kda = deaths === 0 ? 'Perfect' : ((kills + assists) / deaths).toFixed(2);
  
  const team1 = match.info.participants.filter((p) => p.teamId === 100);
  const team2 = match.info.participants.filter((p) => p.teamId === 200);

  return (
    <li>
      <Link
        to={`/match/${match.metadata?.matchId}`}
        className="block border p-3 rounded transition-all"
        style={{ 
          textDecoration: 'none',
          backgroundColor: win ? '#1a3d2a' : '#3d1a1a',
          borderColor: win ? '#2d5a3f' : '#5a2d2d',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = win ? '#1f4a33' : '#4a1f1f';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = win ? '#1a3d2a' : '#3d1a1a';
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 flex-1">
            <span 
              className="px-2 py-1 rounded text-xs font-medium"
              style={{
                backgroundColor: win ? '#2d5a3f' : '#5a2d2d',
                color: win ? '#8ee4b3' : '#e48e8e'
              }}
            >
              {win ? 'Win' : 'Loss'}
            </span>
            {championImageUrl && (
              <img
                src={championImageUrl}
                alt={champion}
                className="w-20 h-20 rounded-lg"
                style={{
                  borderColor: win ? '#5ecc8f' : '#cc5e5e',
                  borderWidth: '3px',
                  borderStyle: 'solid'
                }}
              />
            )}
            <div className="flex flex-col gap-1 flex-1">
              <div className="text-neutral-400 text-xs">{queueName}</div>
              <div className="flex flex-col gap-0.5 text-sm">
                <div>
                  <span className="text-white font-semibold">{kills}</span>
                  <span className="text-neutral-500"> / </span>
                  <span className="text-red-400 font-semibold">{deaths}</span>
                  <span className="text-neutral-500"> / </span>
                  <span className="text-white font-semibold">{assists}</span>
                  <span className="text-neutral-500 text-xs ml-2">({kda} KDA)</span>
                </div>
                <div className="flex gap-2 text-xs text-neutral-400">
                  <span>{cs} CS</span>
                  <span>•</span>
                  <span>{visionScore} Vision</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="flex flex-col gap-0.5">
              {team1.map((p, idx) => {
                const pChampion = p.championName || p.champion || 'Unknown';
                const pFormattedName = formatChampionName(pChampion);
                const pImageUrl = pChampion !== 'Unknown'
                  ? `https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/${pFormattedName}.png`
                  : null;
                const pName = p.riotIdGameName || p.summonerName || 'Unknown';
                const isCurrentPlayer = p.puuid === summonerPuuid;
                
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: isCurrentPlayer ? 'rgba(94, 204, 143, 0.2)' : 'rgba(45, 90, 63, 0.2)',
                      borderLeft: isCurrentPlayer ? '2px solid #5ecc8f' : 'none',
                    }}
                    title={`${pName} - ${pChampion}`}
                  >
                    {pImageUrl && (
                      <img
                        src={pImageUrl}
                        alt={pChampion}
                        className="w-4 h-4 rounded"
                      />
                    )}
                    <span className="text-xs text-neutral-300 truncate max-w-[60px]" style={{ fontWeight: isCurrentPlayer ? 'bold' : 'normal' }}>{pName}</span>
                  </div>
                );
              })}
            </div>
            
            <div className="flex flex-col gap-0.5">
              {team2.map((p, idx) => {
                const pChampion = p.championName || p.champion || 'Unknown';
                const pFormattedName = formatChampionName(pChampion);
                const pImageUrl = pChampion !== 'Unknown'
                  ? `https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/${pFormattedName}.png`
                  : null;
                const pName = p.riotIdGameName || p.summonerName || 'Unknown';
                const isCurrentPlayer = p.puuid === summonerPuuid;
                
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: isCurrentPlayer ? 'rgba(94, 204, 143, 0.2)' : 'rgba(90, 45, 45, 0.2)',
                      borderLeft: isCurrentPlayer ? '2px solid #5ecc8f' : 'none',
                    }}
                    title={`${pName} - ${pChampion}`}
                  >
                    {pImageUrl && (
                      <img
                        src={pImageUrl}
                        alt={pChampion}
                        className="w-4 h-4 rounded"
                      />
                    )}
                    <span className="text-xs text-neutral-300 truncate max-w-[60px]" style={{ fontWeight: isCurrentPlayer ? 'bold' : 'normal' }}>{pName}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
};
