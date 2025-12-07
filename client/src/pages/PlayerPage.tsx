import { useAuth } from 'react-oidc-context';
import { useSummoner, usePlayerMatchHistory } from '../api/hooks';
import { useParams } from 'react-router-dom';
import { PlayerMatchList } from '../components/PlayerMatchList';
import { useGameData } from '../context/gameDataHelpers';
import { DDRAGON_VERSION } from '../config/constants';
import { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';





function PlayerPageInner() {
  const auth = useAuth();
  const { gameName = '', tagLine = '' } = useParams();
  const { itemLoading, itemError } = useGameData();
  const [matchCount, setMatchCount] = useState(10);

  const { data: summoner, isLoading, error } = useSummoner(gameName, tagLine);
  const {
    data: matchHistoryData,
    isLoading: isMatchesLoading,
    error: matchesError,
  } = usePlayerMatchHistory(gameName, tagLine, matchCount);

  // Show toast on error
  useEffect(() => {
    if (error) {
      toast.error(`Failed to load player: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        duration: 4000,
        position: 'top-right',
      });
    }
  }, [error]);

  useEffect(() => {
    if (matchesError) {
      toast.error(`Failed to load matches: ${matchesError instanceof Error ? matchesError.message : 'Unknown error'}`, {
        duration: 4000,
        position: 'top-right',
      });
    }
  }, [matchesError]);

  const loadMoreMatches = () => {
    setMatchCount(prev => prev + 20);
  };

  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen green-bg-medium text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Sign In</h1>
          <div className="green-bg-light green-border border rounded p-6">
            <p className="text-white text-lg">
              Please sign in to view players and match history.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (itemLoading) {
    return (
      <div className="min-h-screen green-bg-medium text-white p-8">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
          <FaSpinner className="text-6xl green-text animate-spin mb-4" />
          <h1 className="text-2xl font-bold">Loading game data...</h1>
        </div>
      </div>
    );
  }

  if (itemError) {
    return (
      <div className="min-h-screen green-bg-medium text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Error loading game data</h1>
          <div className="green-bg-light green-border border rounded p-6">
            <p className="text-white text-lg">{itemError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen green-bg-dark p-8">
      <div className="max-w-4xl mx-auto">

        {isLoading && (
          <div className="text-center py-12 flex flex-col items-center">
            <FaSpinner className="text-5xl green-text animate-spin mb-4" />
            <p className="text-xl">Loading player data...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded p-4">
            <p className="text-white">Error: {error instanceof Error ? error.message : 'Failed to load player'}</p>
          </div>
        )}

        {summoner && (
          <div className="green-bg-medium green-border border rounded-lg p-6 flex items-center gap-6">
            <div className="w-24 h-24 rounded-full green-bg-light green-border border-4 overflow-hidden flex items-center justify-center">
              {summoner.profileIconId ? (
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/profileicon/${summoner.profileIconId}.png`}
                  alt="Profile Icon"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold green-text">
                  {summoner.gameName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold green-text-light">
                {summoner.gameName}
              </h1>
              <p className="text-neutral-400 text-lg">#{summoner.tagLine}</p>
              {summoner.summonerLevel && (
                <p className="text-neutral-500 text-sm">Level {summoner.summonerLevel}</p>
              )}
            </div>
          </div>
        )}

        {matchHistoryData && summoner && (
          <div className="mt-6 green-bg-medium green-border border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 green-text-light">Recent Matches</h3>
            <PlayerMatchList matches={matchHistoryData.matches} summonerPuuid={summoner.puuid} />
            
            {matchHistoryData.matches.length >= matchCount && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={loadMoreMatches}
                  disabled={isMatchesLoading}
                  className="px-6 py-3 rounded text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  style={{ backgroundColor: '#3d8b64' }}
                  onMouseEnter={(e) => !isMatchesLoading && (e.currentTarget.style.backgroundColor = '#4fa876')}
                  onMouseLeave={(e) => !isMatchesLoading && (e.currentTarget.style.backgroundColor = '#3d8b64')}
                >
                  {isMatchesLoading && <FaSpinner className="animate-spin" />}
                  {isMatchesLoading ? 'Loading...' : 'Load More Matches'}
                </button>
              </div>
            )}
          </div>
        )}

        {isMatchesLoading && !matchHistoryData && (
          <div className="text-center py-6 flex flex-col items-center">
            <FaSpinner className="text-4xl green-text animate-spin mb-3" />
            <p className="text-lg text-white">Loading match history...</p>
          </div>
        )}

        {matchesError && (
          <div className="bg-red-900/20 border border-red-700 rounded p-4 mt-4">
            <p className="text-white">Error loading matches: {matchesError instanceof Error ? matchesError.message : 'Failed to load matches'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function PlayerPage() {
  return <PlayerPageInner />;
}
