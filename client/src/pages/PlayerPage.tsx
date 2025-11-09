import { useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useSummoner, usePlayerMatchHistory } from '../api/hooks';
import type { Match } from '../api/client';

// Helper function to format champion names for Data Dragon URLs
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

export function PlayerPage() {
  const auth = useAuth();
  const [gameName, setGameName] = useState('JadedRain');
  const [tagLine, setTagLine] = useState('NA1');
  const [searchName, setSearchName] = useState('JadedRain');
  const [searchTag, setSearchTag] = useState('NA1');

  const { data: summoner, isLoading, error } = useSummoner(searchName, searchTag);
  const {
    data: matchHistoryData,
    isLoading: isMatchesLoading,
    error: matchesError,
  } = usePlayerMatchHistory(searchName, searchTag, 10);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchName(gameName);
    setSearchTag(tagLine);
  };

  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Player Lookup</h1>
          <div className="bg-yellow-900/50 border border-yellow-700 rounded p-6">
            <p className="text-yellow-200 text-lg">
              Please sign in to search for players and view match history.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Player Lookup</h1>
        
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder="Game Name"
              className="flex-1 px-4 py-2 bg-gray-800 rounded border border-gray-700 focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              value={tagLine}
              onChange={(e) => setTagLine(e.target.value)}
              placeholder="Tag (e.g., NA1)"
              className="w-32 px-4 py-2 bg-gray-800 rounded border border-gray-700 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold"
            >
              Search
            </button>
          </div>
        </form>

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-xl">Loading player data...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded p-4">
            <p className="text-red-200">Error: {error instanceof Error ? error.message : 'Failed to load player'}</p>
          </div>
        )}

        {summoner && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">
              {summoner.gameName}#{summoner.tagLine}
            </h2>
            <div className="text-gray-400">
              <p>PUUID: {summoner.puuid}</p>
            </div>
          </div>
        )}

        {/* Match history: show Win/Loss and champion for the searched player */}
        {matchHistoryData && summoner && (
          <div className="mt-6 bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Recent Matches</h3>
            <ul className="space-y-2">
              {matchHistoryData.matches.length === 0 && (
                <li className="text-gray-400">No recent matches found.</li>
              )}

              {matchHistoryData.matches.map((match: Match) => {
                // match is the full Riot match object; find the participant by puuid
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
                
                // Map common queue IDs to readable names
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
                  <li key={match.metadata?.matchId || Math.random()} className="flex items-center justify-between bg-gray-900/40 p-3 rounded">
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${win ? 'bg-green-700 text-green-100' : 'bg-red-800 text-red-100'}`}>
                        {win ? 'Win' : 'Loss'}
                      </span>
                      {championImageUrl && (
                        <img 
                          src={championImageUrl} 
                          alt={champion}
                          className="w-10 h-10 rounded-full border-2 border-gray-700"
                        />
                      )}
                      <span className="text-gray-200 font-medium">{champion}</span>
                      <span className="text-gray-400 text-sm">• {queueName}</span>
                    </div>
                    <div className="text-gray-400 text-sm">{match.metadata?.matchId ? match.metadata.matchId.slice(0, 8) : ''}</div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {isMatchesLoading && (
          <div className="text-center py-6">
            <p className="text-lg text-gray-300">Loading match history...</p>
          </div>
        )}

        {matchesError && (
          <div className="bg-red-900/50 border border-red-700 rounded p-4 mt-4">
            <p className="text-red-200">Error loading matches: {matchesError instanceof Error ? matchesError.message : 'Failed to load matches'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
