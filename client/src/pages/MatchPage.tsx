


import React from 'react';
import { useParams } from 'react-router-dom';
import { useMatchDetails } from '../api/hooks';
import { useMatchTimeline } from '../api/useMatchTimeline';
import { ItemBuildTimeline } from '../components/ItemBuildTimeline';
import { useGameData } from '../context/gameDataHelpers';

const VERSION = '15.22.1';
const ITEM_URL = `https://ddragon.leagueoflegends.com/cdn/${VERSION}/img/item/`;

const MatchPage: React.FC = () => {

    const [selectedPlayer, setSelectedPlayer] = React.useState<
        { puuid: string; name: string } | null
    >(null);
    const { matchId = '' } = useParams();
    const { data: match, isLoading, error } = useMatchDetails(matchId);
    const { data: timeline, isLoading: timelineLoading, error: timelineError } = useMatchTimeline(matchId);
    const { itemData, itemLoading, itemError } = useGameData();

    if (isLoading || itemLoading) return <div className="p-8 text-white">Loading match details...</div>;
    if (error || itemError) return <div className="p-8 text-red-400">Error loading match details.</div>;
    if (!match) return <div className="p-8 text-white">No match data found.</div>;

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

    const formatChampionName = (name: string) => {
        const specialCases: Record<string, string> = {
            'FiddleSticks': 'Fiddlesticks',
            'MonkeyKing': 'Wukong',
            'Nunu&Willump': 'Nunu',
            'RenataGlasc': 'Renata',
        };
        return specialCases[name] || name;
    };

    const renderPlayer = (
        p: Record<string, unknown>,
        itemData: Record<string, unknown> | null
    ) => {
        const champName = formatChampionName(String(p.championName));
        const riotName = String(p.riotIdGameName || p.summonerName || 'Unknown');
        const riotTag = String(p.riotIdTagline || '');
        const mainItems = Array.from({ length: 6 }).map((_, i) => {
            const raw = p[`item${i}`] as unknown;
            const itemId = Number(raw as number) || 0;
            if (!itemId || itemId === 0) return null;
            let name = '';
            let img = ITEM_URL + 'empty.png';
            let loaded = false;
            if (itemData && itemData[String(itemId)]) {
                const itemObj = itemData[String(itemId)] as Record<string, unknown>;
                name = String(itemObj.name || '');
                img = `${ITEM_URL}${itemId}.png`;
                loaded = true;
            }
            return { id: itemId, name, img, loaded };
        });
        const trinketRaw = p['item6'] as unknown;
        const trinketId = Number(trinketRaw as number) || 0;
        let trinket = null;
        if (trinketId && trinketId !== 0) {
            let name = '';
            let img = ITEM_URL + 'empty.png';
            let loaded = false;
            if (itemData && itemData[String(trinketId)]) {
                const tObj = itemData[String(trinketId)] as Record<string, unknown>;
                name = String(tObj.name || '');
                img = `${ITEM_URL}${trinketId}.png`;
                loaded = true;
            }
            trinket = { id: trinketId, name, img, loaded };
        }
        return (
            <div
                key={String(p.puuid)}
                className="flex flex-col py-2 border-b border-neutral-700 last:border-b-0 cursor-pointer hover:bg-neutral-700/40"
                onClick={() =>
                    setSelectedPlayer({
                        puuid: String(p.puuid),
                        name: riotName + (riotTag ? `#${riotTag}` : ''),
                    })
                }
            >
                <div className="flex items-center gap-2">
                    <span className="w-40">{riotName}<span className="text-primary-300">#{riotTag}</span></span>
                    <span className="w-32 flex items-center gap-1">
                        <img
                            src={`https://ddragon.leagueoflegends.com/cdn/${VERSION}/img/champion/${champName}.png`}
                            alt={champName}
                            className="w-8 h-8 rounded-full border border-neutral-600"
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        {String(p.championName)}
                    </span>
                    <span className="flex items-start ml-2 gap-2">
                        {/* Main items: 2 rows of 3 */}
                        <span className="flex flex-col gap-0.5">
                            <span className="flex gap-0.5">
                                {mainItems.slice(0, 3).map((item, i) =>
                                    item ? (
                                        item.loaded ? (
                                            <img
                                                key={i}
                                                src={item.img}
                                                alt={item.name}
                                                title={item.name}
                                                className="w-6 h-6 border border-neutral-600 rounded bg-neutral-800"
                                                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                            />
                                        ) : (
                                            <span key={i} className="w-6 h-6 border border-neutral-700 rounded bg-neutral-900 inline-block" />
                                        )
                                    ) : (
                                        <span key={i} className="w-6 h-6 border border-neutral-700 rounded bg-neutral-900 inline-block" />
                                    )
                                )}
                            </span>
                            <span className="flex gap-0.5">
                                {mainItems.slice(3, 6).map((item, i) =>
                                    item ? (
                                        item.loaded ? (
                                            <img
                                                key={i}
                                                src={item.img}
                                                alt={item.name}
                                                title={item.name}
                                                className="w-6 h-6 border border-neutral-600 rounded bg-neutral-800"
                                                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                            />
                                        ) : (
                                            <span key={i} className="w-6 h-6 border border-neutral-700 rounded bg-neutral-900 inline-block" />
                                        )
                                    ) : (
                                        <span key={i} className="w-6 h-6 border border-neutral-700 rounded bg-neutral-900 inline-block" />
                                    )
                                )}
                            </span>
                        </span>
                        {/* Trinket/Ward, aligned with top row */}
                        <span className="flex flex-col justify-start ml-2">
                            {trinket ? (
                                trinket.loaded ? (
                                    <img
                                        src={trinket.img}
                                        alt={trinket.name}
                                        title={trinket.name}
                                        className="w-6 h-6 border border-yellow-700 rounded bg-neutral-800"
                                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                ) : (
                                    <span className="w-6 h-6 border border-yellow-900 rounded bg-neutral-900 inline-block" />
                                )
                            ) : (
                                <span className="w-6 h-6 border border-yellow-900 rounded bg-neutral-900 inline-block" />
                            )}
                        </span>
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-primary-700 text-white p-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Match: {matchId}</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Team 1 */}
                    <div>
                        <h2 className="text-xl font-bold mb-2 text-blue-300">Team 1</h2>
                        <div className="bg-neutral-800/60 rounded p-4">
                            {teams['100'].map(p => renderPlayer(p as Record<string, unknown>, itemData))}
                        </div>
                    </div>
                    {/* Team 2 */}
                    <div>
                        <h2 className="text-xl font-bold mb-2 text-red-300">Team 2</h2>
                        <div className="bg-neutral-800/60 rounded p-4">
                            {teams['200'].map(p => renderPlayer(p as Record<string, unknown>, itemData))}
                        </div>
                    </div>
                </div>
                {selectedPlayer && (
                    <>
                        <h2 className="text-2xl font-semibold text-primary-200 mb-4 text-center">{selectedPlayer.name}</h2>
                        <div className="max-w-2xl mx-auto bg-neutral-900/80 rounded p-4 mb-8">
                            {timelineLoading && <div className="text-white">Loading timeline...</div>}
                            {timelineError && <div className="text-red-400">Error loading timeline.</div>}
                            {timeline && itemData && (
                                <ItemBuildTimeline timeline={timeline} puuid={selectedPlayer.puuid} itemData={itemData} />
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MatchPage;
