
from typing import List, Dict, Any
import requests
import functools
from config import DDRAGON_VERSION


def get_item_data(version: str = DDRAGON_VERSION) -> Dict[str, Any]:
    url = f"https://ddragon.leagueoflegends.com/cdn/{version}/data/en_US/item.json"
    response = requests.get(url)
    response.raise_for_status()
    data = response.json()
    return data['data']


@functools.lru_cache(maxsize=1)
def get_cached_item_data(version: str = DDRAGON_VERSION) -> Dict[str, Any]:
    return get_item_data(version)


def get_champion_data(version: str = DDRAGON_VERSION) -> Dict[str, Any]:
    url = f"https://ddragon.leagueoflegends.com/cdn/{version}/data/en_US/champion.json"
    response = requests.get(url)
    response.raise_for_status()
    data = response.json()
    return data['data']


@functools.lru_cache(maxsize=1)
def get_cached_champion_data(version: str = DDRAGON_VERSION) -> Dict[str, Any]:
    return get_champion_data(version)


def generate_best_item_tool(
    champion: str,
    current_items: List[str],
    gold: int,
    enemy_champions: List[str],
    enemy_items: List[List[str]],
    game_time: int,
    prefer_full_items: bool = True,
    max_alternatives: int = 3,
    exclude_current_items: bool = True,
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

    # Determine a basic reasoning prefix
    if tag_counter:
        most_common_tag = max(tag_counter, key=tag_counter.get)
        count = tag_counter[most_common_tag]
        reasoning_prefix = (
            f"Most common enemy tag: {most_common_tag} "
            f"(count: {count})."
        )
    else:
        reasoning_prefix = "No dominant enemy tag detected."

    item_data = get_cached_item_data()
    all_items = list(item_data.keys())

    item_details = {}
    candidates: List[Dict[str, Any]] = []
    for item_id, item in item_data.items():
        gold_info = item.get('gold', {}) or {}
        total = gold_info.get('total')
        name = item.get('name')
        tags = item.get('tags', [])
        item_details[item_id] = {
            'name': name,
            'gold': gold_info,
            'tags': tags,
        }

        # Consider as candidate only if it has a numeric total cost
        try:
            total_cost = int(total) if total is not None else None
        except Exception:
            total_cost = None

        if total_cost is None:
            continue

        # If prefer_full_items, bias toward items with components (from) or higher cost
        from_components = bool(item.get('from'))
        into_components = bool(item.get('into'))

        # Determine if item is a full/final built item (has components and is not upgraded further)
        is_final_built_item = from_components and not into_components

        # Determine if item is boots (by tag or name)
        name_l = (name or '').lower() if name else ''
        has_boots_tag = False
        try:
            has_boots_tag = (
                isinstance(tags, (list, tuple)) and
                any(str(t).lower() == 'boots' for t in tags)
            )
        except Exception:
            has_boots_tag = False

        # Exclude obvious consumable items (potions, elixirs, etc.) which are not final built items
        is_consumable = False
        try:
            if isinstance(item.get('consumed'), bool):
                is_consumable = bool(item.get('consumed'))
        except Exception:
            is_consumable = False
        if not is_consumable:
            # also check common name substrings
            if 'potion' in name_l or 'elixir' in name_l or 'flask' in name_l:
                is_consumable = True
        if is_consumable:
            continue

        # Exclude items by blacklist substrings
        # (problematic components or champion-specific artifacts)
        blacklist_substrings = [
            'corrupting', 'corrupting potion', 'kircheis',
            'kircheis shard', 'jarvan'
        ]
        if any(sub in name_l for sub in blacklist_substrings):
            continue

        # Exclude items that have explicit 'Consumable' tag or similar
        try:
            if (isinstance(tags, (list, tuple)) and
                    any(str(t).lower() == 'consumable' for t in tags)):
                continue
        except Exception:
            pass

        # Only consider final built items or boots as candidates when recommending completed items
        if not (is_final_built_item or has_boots_tag or 'boot' in name_l):
            continue

        # Save candidate with metadata for scoring
        candidates.append({
            'id': item_id,
            'name': name,
            'total': total_cost,
            'tags': tags,
            'from': item.get('from') or [],
            'is_boot': (has_boots_tag or 'boot' in name_l),
        })

    # Gather champion-specific recommended items (if present) to bias scoring
    champ_entry = champ_data.get(champion) or {}
    champ_recommended_ids = set()
    try:
        for rec in champ_entry.get('recommended', []) or []:
            # Some recommended blocks include a 'map' or 'mode' or 'type' field
            blocks = rec.get('blocks', []) if isinstance(rec, dict) else []
            for b in blocks:
                for it in b.get('items', []) or []:
                    iid = str(it.get('id') or it)
                    champ_recommended_ids.add(iid)
    except Exception:
        champ_recommended_ids = set()

    # Optionally respect game mode from extra_context to prefer mode-specific recommendations
    game_mode = None
    if isinstance(extra_context, dict):
        game_mode = extra_context.get('game_mode')

    # Determine whether the player already has boots in current_items
    player_has_boots = False
    try:
        current_set = set(str(x) for x in (current_items or []))
        for cid in current_set:
            item_obj = item_data.get(cid)
            if not item_obj:
                continue
            t = item_obj.get('tags', [])
            nm = str(item_obj.get('name') or '').lower()
            is_boots = (
                (isinstance(t, (list, tuple)) and
                 any(str(tt).lower() == 'boots' for tt in t)) or
                'boot' in nm
            )
            if is_boots:
                player_has_boots = True
                break
    except Exception:
        player_has_boots = False

    # Scoring: lower distance to gold is better;
    # counter tags boost score; prefer_full_items adds small bonus
    def score_candidate(cand: Dict[str, Any]) -> float:
        dist = abs((cand.get('total') or 0) - int(gold or 0))
        score = float(dist)
        # boost if item matches enemy tag (counter)
        cand_tags = cand.get('tags') or []
        if any(t in tag_counter for t in cand_tags):
            # reduce score to prefer
            score *= 0.6
        # small preference for full items when requested
        if prefer_full_items and (cand.get('from') and len(cand.get('from')) > 0):
            score *= 0.9
        # penalize if same as current items (unless exclude_current_items False)
        if exclude_current_items and str(cand.get('id')) in (current_items or []):
            score *= 5.0
        # penalize boots slightly unless player already has boots
        try:
            if cand.get('is_boot') and not player_has_boots:
                score *= 1.5
        except Exception:
            pass
        # champion-specific boost if in recommended list
        if str(cand.get('id')) in champ_recommended_ids:
            score *= 0.5
        # small boost if game_mode matches a recommended block name in champion data (best-effort)
        if game_mode and champ_entry:
            try:
                for rec in champ_entry.get('recommended', []) or []:
                    # block might have a 'type' or 'map' or similar
                    rec_map = rec.get('map') if isinstance(rec, dict) else None
                    rec_mode = rec.get('mode') if isinstance(rec, dict) else None
                    if rec_map == game_mode or rec_mode == game_mode:
                        # prefer items in those blocks
                        for b in (rec.get('blocks') or []):
                            for it in (b.get('items') or []):
                                if str(it.get('id') or it) == str(cand.get('id')):
                                    score *= 0.6
                                    raise StopIteration
            except StopIteration:
                pass
        return score

    # Rank candidates
    ranked = sorted(candidates, key=score_candidate)

    # Build alternatives (top N), ensure we return something even if it's the same
    alternatives = []
    seen_ids = set()
    seen_primary_tags = set()
    boots_count = 0
    for c in ranked:
        cid = str(c.get('id'))
        if cid in seen_ids:
            continue
        # enforce diversity: prefer candidates with new primary tag
        cand_tags = c.get('tags') or []
        primary_tag = (
            cand_tags[0]
            if isinstance(cand_tags, (list, tuple)) and len(cand_tags) > 0
            else None
        )
        if primary_tag and primary_tag in seen_primary_tags:
            # allow but deprioritize duplicates by skipping sometimes
            # try to skip duplicate-tag items unless we have too few alternatives
            if len(alternatives) >= max_alternatives - 1:
                # allow to fill remaining slots
                pass
            else:
                continue

        # If too many boots would be included and the player doesn't
        # already have boots, skip extra boots
        try:
            if c.get('is_boot') and not player_has_boots and boots_count >= 1:
                continue
        except Exception:
            pass

        seen_ids.add(cid)
        if primary_tag:
            seen_primary_tags.add(primary_tag)
        alternatives.append({
            'id': cid,
            'name': c.get('name'),
            'total': c.get('total'),
            'tags': c.get('tags'),
            'is_boot': c.get('is_boot')
        })
        try:
            if c.get('is_boot'):
                boots_count += 1
        except Exception:
            pass
        if len(alternatives) >= max_alternatives:
            break

    recommended = alternatives[0] if alternatives else None

    reasoning = (
        reasoning_prefix +
        ' Recommended items are chosen by closeness to available gold, '
        'counter tags, and full-item preference.'
    )

    return {
        'recommended_item': recommended.get('name') if recommended else None,
        'recommended_item_id': recommended.get('id') if recommended else None,
        'alternatives': alternatives,
        'reasoning': reasoning,
        'tag_counts': tag_counter,
        'enemy_champion_infos': champion_infos,
        'all_items': all_items,
        'item_details': item_details,
    }
