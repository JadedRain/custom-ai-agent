import { useAuth } from 'react-oidc-context';
import { useSummoner, usePlayerMatchHistory } from '../api/hooks';
import { useParams } from 'react-router-dom';
import { PlayerMatchList } from '../components/PlayerMatchList';
import { useGameData } from '../context/gameDataHelpers';





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

        {matchHistoryData && summoner && (
          <div className="mt-6 card-bg rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Recent Matches</h3>
            <PlayerMatchList matches={matchHistoryData.matches} summonerPuuid={summoner.puuid} />
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
