import React from 'react';
import { useParams } from 'react-router-dom';
import { useMatchDetails } from '../api/hooks';
import { useMatchTimeline } from '../api/useMatchTimeline';
import { useAuth } from 'react-oidc-context';
import { ItemBuildTimeline } from '../components/ItemBuildTimeline';
import PlayerCard from '../components/PlayerCard';
import RecommendationProvider from '../context/RecommendationContext.tsx';
import RecommendationsPanel from '../components/RecommendationsPanel';
import { useGameData } from '../context/gameDataHelpers';


const MatchPage: React.FC = () => {

    const [selectedPlayer, setSelectedPlayer] = React.useState<
        { puuid: string; name: string } | null
    >(null);
    const auth = useAuth();
    const { matchId = '' } = useParams();
    const { data: match, isLoading, error } = useMatchDetails(matchId);
    const { data: timeline, isLoading: timelineLoading, error: timelineError } = useMatchTimeline(matchId);
    const { itemData, itemLoading, itemError } = useGameData();

    if (isLoading || itemLoading) return <div className="min-h-screen green-bg-dark text-white p-8">Loading match details...</div>;
    if (error || itemError) return <div className="min-h-screen green-bg-dark text-white p-8"><div className="text-red-400">Error loading match details.</div></div>;
    if (!match) return <div className="min-h-screen green-bg-dark text-white p-8">No match data found.</div>;

    const ROLE_ORDER = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY'];
    const teams: Record<string, unknown[]> = match.info.participants.reduce(
        (acc: Record<string, unknown[]>, p: unknown) => {
            const participant = p as Record<string, unknown>;
            if (participant.teamId === 100) acc['100'].push(participant);
            else if (participant.teamId === 200) acc['200'].push(participant);
            return acc;
        },
        { '100': [], '200': [] }
    );
    const sortByRole = (a: unknown, b: unknown) =>
        ROLE_ORDER.indexOf((a as Record<string, unknown>).teamPosition as string) -
        ROLE_ORDER.indexOf((b as Record<string, unknown>).teamPosition as string);
    teams['100'].sort(sortByRole);
    teams['200'].sort(sortByRole);

    return (
        <div className="min-h-screen green-bg-dark text-white p-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 green-text-light">Match: {matchId}</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-xl font-bold mb-2 text-blue-400">Team 1</h2>
                        <div className="bg-neutral-800/60 border border-neutral-700 rounded p-4">
                            {teams['100'].map(p => {
                                const participant = p as Record<string, unknown>;
                                return (
                                    <PlayerCard key={String(participant.puuid)} p={participant} itemData={itemData} onSelect={(puuid, name) => setSelectedPlayer({ puuid, name })} />
                                );
                            })}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold mb-2 text-red-400">Team 2</h2>
                        <div className="bg-neutral-800/60 border border-neutral-700 rounded p-4">
                            {teams['200'].map(p => {
                                const participant = p as Record<string, unknown>;
                                return (
                                    <PlayerCard key={String(participant.puuid)} p={participant} itemData={itemData} onSelect={(puuid, name) => setSelectedPlayer({ puuid, name })} />
                                );
                            })}
                        </div>
                    </div>
                </div>
                {selectedPlayer && (
                    <>
                        <h2 className="text-2xl font-semibold green-text mb-4 text-center">{selectedPlayer.name}</h2>
                        <div className="max-w-2xl mx-auto bg-neutral-900/80 border border-neutral-700 rounded p-4 mb-8">
                            {timelineLoading && <div className="text-white">Loading timeline...</div>}
                            {timelineError && <div className="text-red-400">Error loading timeline.</div>}
                            {timeline && itemData && (
                                <ItemBuildTimeline timeline={timeline} puuid={selectedPlayer.puuid} itemData={itemData} />
                            )}
                            <RecommendationProvider match={match} timeline={timeline} itemData={itemData} selectedPlayerPuuid={selectedPlayer.puuid} token={auth.user?.access_token}>
                                <RecommendationsPanel itemData={itemData} selectedPlayerName={selectedPlayer.name} />
                            </RecommendationProvider>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MatchPage;
