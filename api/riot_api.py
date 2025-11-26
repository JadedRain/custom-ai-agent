import os
import requests

RIOT_API_KEY = os.getenv('RIOT_API_KEY')
AMERICAS_BASE_URL = 'https://americas.api.riotgames.com'
NA_PLATFORM = 'https://na1.api.riotgames.com'


def get_riot_headers():
    return {
        'Accept': 'application/json',
        'X-Riot-Token': RIOT_API_KEY
    }


def get_summoner_by_riot_id(game_name, tag_line):
    url = f'{AMERICAS_BASE_URL}/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}'
    params = {'api_key': RIOT_API_KEY}
    response = requests.get(url, headers=get_riot_headers(), params=params)
    if response.status_code == 200:
        return response.json()
    else:
        return None


def get_match_history(puuid, start=0, count=20):
    url = f'{AMERICAS_BASE_URL}/lol/match/v5/matches/by-puuid/{puuid}/ids'
    params = {
        'api_key': RIOT_API_KEY,
        'start': start,
        'count': count
    }
    response = requests.get(url, headers=get_riot_headers(), params=params)
    if response.status_code == 200:
        return response.json()
    else:
        return None


def get_match_details(match_id):
    url = f'{AMERICAS_BASE_URL}/lol/match/v5/matches/{match_id}'
    params = {'api_key': RIOT_API_KEY}
    response = requests.get(url, headers=get_riot_headers(), params=params)
    if response.status_code == 200:
        return response.json()
    else:
        return None


def get_match_timeline(match_id):
    url = f'{AMERICAS_BASE_URL}/lol/match/v5/matches/{match_id}/timeline'
    params = {'api_key': RIOT_API_KEY}
    response = requests.get(url, headers=get_riot_headers(), params=params)
    if response.status_code == 200:
        return response.json()
    else:
        return None


def get_champion_winrate_na(
    champion_id,
    puuids,
    per_player_count=20,
    max_total_matches=200,
):

    processed = set()
    appearances = 0
    wins = 0
    matches_scanned = 0

    for puuid in puuids:
        try:
            match_ids = get_match_history(puuid, 0, per_player_count) or []
        except Exception:
            match_ids = []

        for mid in match_ids:
            if mid in processed:
                continue
            processed.add(mid)
            matches_scanned += 1

            try:
                detail = get_match_details(mid)
            except Exception:
                detail = None

            if not detail:
                if matches_scanned >= max_total_matches:
                    break
                continue

            participants = detail.get('info', {}).get('participants', [])
            found = None
            for p in participants:
                name = p.get('championName')
                champ_field = p.get('champion')
                champ_id_field = p.get('championId')
                target = str(champion_id).lower()
                if name and name.lower() == target:
                    found = p
                    break
                if champ_field and str(champ_field).lower() == target:
                    found = p
                    break
                if champ_id_field and str(champ_id_field).lower() == target:
                    found = p
                    break

            if found:
                appearances += 1
                if found.get('win'):
                    wins += 1

            if matches_scanned >= max_total_matches:
                break

        if matches_scanned >= max_total_matches:
            break

    result = {
        'champion': champion_id,
        'sampled_puuids': len(puuids),
        'matches_scanned': matches_scanned,
        'appearances': appearances,
        'wins': wins,
        'winrate': (wins / appearances) if appearances > 0 else None,
    }

    return result


def get_puuids_by_rank(
    tier='DIAMOND',
    division=None,
    queue='RANKED_SOLO_5x5',
    max_players=100,
):
    platform = NA_PLATFORM

    entries = []
    divisions = [division] if division else ['I', 'II', 'III', 'IV']
    for div in divisions:
        try:
            url = f"{platform}/lol/league/v4/entries/{queue}/{tier}/{div}"
            resp = requests.get(url, headers=get_riot_headers())
            if resp.status_code != 200:
                continue
            data = resp.json() or []
            entries.extend(data)
        except Exception:
            continue
        if len(entries) >= max_players:
            break

    entries = entries[:max_players]

    puuids = []
    for e in entries:
        enc_id = e.get('summonerId') or e.get('encryptedSummonerId')
        if not enc_id:
            continue
        try:
            url = f"{platform}/lol/summoner/v4/summoners/{enc_id}"
            r2 = requests.get(url, headers=get_riot_headers())
            if r2.status_code != 200:
                continue
            summ = r2.json()
            puuid = summ.get('puuid')
            if puuid:
                puuids.append(puuid)
        except Exception:
            continue

    return puuids


def get_champion_winrate_by_region_rank(
    champion_id,
    region='NA',
    tier='DIAMOND',
    division=None,
    queue='RANKED_SOLO_5x5',
    per_player_count=20,
    max_total_matches=200,
    max_players=50,
):
    puuids = get_puuids_by_rank(
        tier=tier,
        division=division,
        queue=queue,
        max_players=max_players,
    )
    if not puuids:
        return {
            'champion': champion_id,
            'sampled_puuids': 0,
            'matches_scanned': 0,
            'appearances': 0,
            'wins': 0,
            'winrate': None,
        }

    return get_champion_winrate_na(
        champion_id,
        puuids,
        per_player_count=per_player_count,
        max_total_matches=max_total_matches,
    )


def _extract_items_from_participant(p):
    items = []
    for i in range(7):
        v = p.get(f'item{i}')
        # skip null/0 values
        if v is None:
            continue
        try:
            if int(v) == 0:
                continue
        except Exception:
            pass
        items.append(str(v))
    return tuple(items)


def get_champion_item_stats_na(
    champion_id,
    puuids,
    per_player_count=20,
    max_total_matches=200,
):

    processed = set()
    appearances = 0
    wins = 0
    matches_scanned = 0

    builds = {}
    item_counts = {}

    for puuid in puuids:
        try:
            match_ids = get_match_history(puuid, 0, per_player_count) or []
        except Exception:
            match_ids = []

        for mid in match_ids:
            if mid in processed:
                continue
            processed.add(mid)
            matches_scanned += 1

            try:
                detail = get_match_details(mid)
            except Exception:
                detail = None

            if not detail:
                if matches_scanned >= max_total_matches:
                    break
                continue

            participants = detail.get('info', {}).get('participants', [])
            found = None
            for p in participants:
                name = p.get('championName')
                champ_field = p.get('champion')
                champ_id_field = p.get('championId')
                target = str(champion_id).lower()
                if name and name.lower() == target:
                    found = p
                    break
                if champ_field and str(champ_field).lower() == target:
                    found = p
                    break
                if champ_id_field and str(champ_id_field).lower() == target:
                    found = p
                    break

            if found:
                appearances += 1
                win = bool(found.get('win'))
                if win:
                    wins += 1

                items = _extract_items_from_participant(found)
                build_key = ','.join(items) if items else 'none'
                b = builds.setdefault(build_key, {'appearances': 0, 'wins': 0})
                b['appearances'] += 1
                if win:
                    b['wins'] += 1

                for it in items:
                    ic = item_counts.setdefault(it, {'appearances': 0, 'wins': 0})
                    ic['appearances'] += 1
                    if win:
                        ic['wins'] += 1

            if matches_scanned >= max_total_matches:
                break

        if matches_scanned >= max_total_matches:
            break

    for k, v in builds.items():
        v['winrate'] = (v['wins'] / v['appearances']) if v['appearances'] > 0 else None
    for k, v in item_counts.items():
        v['winrate'] = (v['wins'] / v['appearances']) if v['appearances'] > 0 else None

    result = {
        'champion': champion_id,
        'sampled_puuids': len(puuids),
        'matches_scanned': matches_scanned,
        'appearances': appearances,
        'wins': wins,
        'winrate': (wins / appearances) if appearances > 0 else None,
        'builds': builds,
        'items': item_counts,
    }

    return result


def get_champion_item_stats_by_region_rank(
    champion_id,
    region='NA',
    tier='DIAMOND',
    division=None,
    queue='RANKED_SOLO_5x5',
    per_player_count=20,
    max_total_matches=200,
    max_players=50,
):
    puuids = get_puuids_by_rank(tier=tier, division=division, queue=queue, max_players=max_players)
    if not puuids:
        return {
            'champion': champion_id,
            'sampled_puuids': 0,
            'matches_scanned': 0,
            'appearances': 0,
            'wins': 0,
            'winrate': None,
            'builds': {},
            'items': {},
        }

    return get_champion_item_stats_na(
        champion_id,
        puuids,
        per_player_count=per_player_count,
        max_total_matches=max_total_matches,
    )
