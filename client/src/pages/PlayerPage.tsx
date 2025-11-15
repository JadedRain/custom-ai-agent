import { useAuth } from 'react-oidc-context';
import { useSummoner, usePlayerMatchHistory } from '../api/hooks';
import type { Match } from '../api/client';
import { useParams, Link } from 'react-router-dom';
import { useGameData } from '../context/gameDataHelpers';

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




function PlayerPageInner() {
  const auth = useAuth();
  const { gameName = '', tagLine = '' } = useParams();
  const { itemLoading, itemError } = useGameData();

  const { data: summoner, isLoading, error } = useSummoner(gameName, tagLine);
  const {
    data: matchHistoryData,
    isLoading: isMatchesLoading,
    error: matchesError,
  } = usePlayerMatchHistory(gameName, tagLine, 10);

  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-primary-700 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Sign In</h1>
          <div className="bg-primary-600/50 border border-primary-500 rounded p-6">
            <p className="text-primary-50 text-lg">
              Please sign in to view players and match history.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (itemLoading) {
    return (
      <div className="min-h-screen bg-primary-700 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Loading game data...</h1>
        </div>
      </div>
    );
  }

  if (itemError) {
    return (
      <div className="min-h-screen bg-primary-700 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Error loading game data</h1>
          <div className="bg-primary-600/50 border border-primary-500 rounded p-6">
            <p className="text-primary-50 text-lg">{itemError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg p-8">
      <div className="max-w-4xl mx-auto">

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-xl">Loading player data...</p>
          </div>
        )}

        {error && (
          <div className="error-bg border rounded p-4">
            <p className="text-primary-50">Error: {error instanceof Error ? error.message : 'Failed to load player'}</p>
          </div>
        )}

        {summoner && (
          <div className="card-bg rounded-lg p-6">
            <h1 className="text-6xl font-bold mb-4">
              {summoner.gameName}#{summoner.tagLine}
            </h1>
          </div>
        )}

        {/* Match history: show Win/Loss and champion for the searched player */}
        {matchHistoryData && summoner && (
          <div className="mt-6 card-bg rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Recent Matches</h3>
            <ul className="space-y-2">
              {matchHistoryData.matches.length === 0 && (
                <li className="text-neutral-200">No recent matches found.</li>
              )}

              {matchHistoryData.matches.map((match: Match) => {
                const participant = match.info.participants.find(
                  (p) => p.puuid === summoner.puuid
                );

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
                  <li key={match.metadata?.matchId || Math.random()}>
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
              })}
            </ul>
          </div>
        )}

        {isMatchesLoading && (
          <div className="text-center py-6">
            <p className="text-lg text-neutral-100">Loading match history...</p>
          </div>
        )}

        {matchesError && (
          <div className="error-bg border rounded p-4 mt-4">
            <p className="text-primary-50">Error loading matches: {matchesError instanceof Error ? matchesError.message : 'Failed to load matches'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function PlayerPage() {
  return <PlayerPageInner />;
}
