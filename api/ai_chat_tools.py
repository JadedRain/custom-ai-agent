
from typing import List, Dict, Any
import requests
import functools


def get_item_data(version: str = '15.22.1') -> Dict[str, Any]:
    url = f"https://ddragon.leagueoflegends.com/cdn/{version}/data/en_US/item.json"
    response = requests.get(url)
    response.raise_for_status()
    data = response.json()
    return data['data']


@functools.lru_cache(maxsize=1)
def get_cached_item_data(version: str = '15.22.1') -> Dict[str, Any]:
    return get_item_data(version)


def get_champion_data(version: str = '15.22.1') -> Dict[str, Any]:
    url = f"https://ddragon.leagueoflegends.com/cdn/{version}/data/en_US/champion.json"
    response = requests.get(url)
    response.raise_for_status()
    data = response.json()
    return data['data']


@functools.lru_cache(maxsize=1)
def get_cached_champion_data(version: str = '15.22.1') -> Dict[str, Any]:
    return get_champion_data(version)


def generate_best_item_tool(
    champion: str,
    current_items: List[str],
    gold: int,
    enemy_champions: List[str],
    enemy_items: List[List[str]],
    game_time: int,
    extra_context: Dict[str, Any] = None
) -> Dict[str, Any]:
    champ_data = get_cached_champion_data()

    tag_counter = {}
    champion_infos = {}
    for champ in enemy_champions:
        champ_info = champ_data.get(champ)
        if not champ_info:
            continue
        tags = champ_info.get('tags', [])
        for tag in tags:
            tag_counter[tag] = tag_counter.get(tag, 0) + 1
        champion_infos[champ] = champ_info.get('info', {})

    if tag_counter:
        most_common_tag = max(tag_counter, key=tag_counter.get)
        recommended_item = f"Counter to {most_common_tag}"
        reasoning = (
            f"Most common enemy tag: {most_common_tag} "
            f"(count: {tag_counter[most_common_tag]})."
        )
    else:
        recommended_item = "Infinity Edge"
        reasoning = "No tags found for enemy champions. Defaulting to a strong damage item."

    item_data = get_cached_item_data()
    all_items = list(item_data.keys())

    item_details = {}
    for item_id, item in item_data.items():
        item_details[item_id] = {
            'name': item.get('name'),
            'gold': item.get('gold', {}),
            'tags': item.get('tags', [])
        }

    return {
        'recommended_item': recommended_item,
        'reasoning': reasoning,
        'tag_counts': tag_counter,
        'enemy_champion_infos': champion_infos,
        'all_items': all_items,
        'item_details': item_details
    }
