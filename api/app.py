from flask import Flask, jsonify, request, g
import requests
from flask_cors import CORS
from dotenv import load_dotenv
from riot_api import (
    get_summoner_by_riot_id,
    get_match_history,
    get_match_details,
    get_match_timeline,
    get_champion_winrate_na,
    get_champion_winrate_by_region_rank,
    get_champion_item_stats_na,
    get_champion_item_stats_by_region_rank,
)
from auth_middleware import init_auth_middleware
from database import init_db, db
from models import User, UserPreference, BuildType
from ai_chat_tools import (
    get_cached_champion_data,
    get_cached_item_data,
    get_champion_data,
    get_item_data,
    generate_best_item_tool,
    get_champion_details,
    get_matchup_analysis,
)

load_dotenv()

app = Flask(__name__)
CORS(app)

init_db(app)
init_auth_middleware(app)


@app.route('/api/summoner/<game_name>/<tag_line>', methods=['GET'])
def get_summoner(game_name, tag_line):
    summoner_data = get_summoner_by_riot_id(game_name, tag_line)
    if summoner_data:
        return jsonify(summoner_data)
    else:
        return jsonify({'error': 'Summoner not found'}), 404


@app.route('/api/match-history/<puuid>', methods=['GET'])
def match_history(puuid):
    start = request.args.get('start', 0, type=int)
    count = request.args.get('count', 20, type=int)
    match_ids = get_match_history(puuid, start, count)
    if match_ids:
        return jsonify({'matches': match_ids})
    else:
        return jsonify({'error': 'Failed to fetch match history'}), 404


@app.route('/api/match/<match_id>', methods=['GET'])
def match_details(match_id):
    match_data = get_match_details(match_id)
    if match_data:
        return jsonify(match_data)
    else:
        return jsonify({'error': 'Match not found'}), 404


@app.route('/api/player-match-history/<game_name>/<tag_line>', methods=['GET'])
def player_match_history(game_name, tag_line):
    count = request.args.get('count', 10, type=int)
    summoner_data = get_summoner_by_riot_id(game_name, tag_line)
    if not summoner_data:
        return jsonify({'error': 'Summoner not found'}), 404
    puuid = summoner_data.get('puuid')

    match_ids = get_match_history(puuid, 0, count)

    if not match_ids:
        return jsonify({'error': 'No matches found'}), 404

    matches = []
    for match_id in match_ids:
        match_data = get_match_details(match_id)
        if match_data:
            matches.append(match_data)

    return jsonify({
        'summoner': summoner_data,
        'matches': matches
    })


@app.route('/api/match-timeline/<match_id>', methods=['GET'])
def match_timeline(match_id):
    timeline = get_match_timeline(match_id)
    if timeline:
        return jsonify(timeline)
    else:
        return jsonify({'error': 'Timeline not found'}), 404


@app.route('/api/user/preferences', methods=['GET'])
def get_user_preferences():
    if not hasattr(g, 'user') or not g.user:
        return jsonify({'error': 'Not authenticated'}), 401

    keycloak_sub = g.user.get('sub')

    user = User.query.filter_by(keycloak_sub=keycloak_sub).first()

    if not user:
        user = User(
            keycloak_sub=keycloak_sub,
            email=g.user.get('email'),
            username=g.user.get('preferred_username')
        )
        db.session.add(user)
        db.session.commit()

    preference = UserPreference.query.filter_by(user_id=user.id).first()

    if not preference:
        preference = UserPreference(
            user_id=user.id,
            build_type=BuildType.GREEDY
        )
        db.session.add(preference)
        db.session.commit()

    return jsonify({
        'user': user.to_dict(),
        'preference': preference.to_dict()
    })


@app.route('/api/user/preferences', methods=['PUT'])
def update_user_preferences():
    if not hasattr(g, 'user') or not g.user:
        return jsonify({'error': 'Not authenticated'}), 401

    data = request.get_json()

    if not data or 'build_type' not in data:
        return jsonify({'error': 'build_type is required'}), 400

    build_type_str = data['build_type'].lower()

    try:
        build_type = BuildType(build_type_str)
    except ValueError:
        return jsonify({
            'error': 'Invalid build_type. Must be one of: greedy, defensive, offensive'
        }), 400

    keycloak_sub = g.user.get('sub')

    user = User.query.filter_by(keycloak_sub=keycloak_sub).first()

    if not user:
        user = User(
            keycloak_sub=keycloak_sub,
            email=g.user.get('email'),
            username=g.user.get('preferred_username')
        )
        db.session.add(user)
        db.session.commit()

    preference = UserPreference.query.filter_by(user_id=user.id).first()

    if not preference:
        preference = UserPreference(
            user_id=user.id,
            build_type=build_type
        )
        db.session.add(preference)
    else:
        preference.build_type = build_type

    db.session.commit()

    return jsonify({
        'user': user.to_dict(),
        'preference': preference.to_dict(),
        'message': 'Preference updated successfully'
    })


# Empty endpoint for best item generation
@app.route('/api/generate-best-item', methods=['POST'])
def generate_best_item():
    # Placeholder for future implementation
    return jsonify({'error': 'Not implemented'}), 501


@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    payload = request.get_json() or {}
    if 'model' not in payload:
        payload['model'] = 'gpt-oss-120b'
    tool_calls = payload.get('tool_calls') or payload.get('calls') or []

    TOOL_FUNCTIONS = {
        'generate_best_item': generate_best_item_tool,
        'get_champion_data': get_champion_data,
        'get_cached_champion_data': get_cached_champion_data,
        'get_item_data': get_item_data,
        'get_cached_item_data': get_cached_item_data,
        'get_champion_details': get_champion_details,
        'get_matchup_analysis': get_matchup_analysis,
    }

    # Process tool calls if provided
    responses = []
    if tool_calls:
        for call in tool_calls:
            name = call.get('name')
            params = call.get('parameters', {}) or {}
            fn = TOOL_FUNCTIONS.get(name)
            if not fn:
                responses.append({'name': name, 'error': f'Unknown tool: {name}'})
                continue

            try:
                if isinstance(params, dict):
                    result = fn(**params)
                else:
                    result = fn(*params)

                responses.append({'name': name, 'result': result})
            except TypeError as te:
                responses.append({'name': name, 'error': f'Parameter mismatch: {str(te)}'})
            except Exception as e:
                responses.append({'name': name, 'error': f'Execution error: {str(e)}'})

    # Forward to the external LLM endpoint
    external_url = 'http://ai-snow.reindeer-pinecone.ts.net:9292/v1/chat/completions'

    # Check if request contains images (vision request) - needs longer timeout
    has_image = False
    if 'messages' in payload:
        for msg in payload.get('messages', []):
            if isinstance(msg.get('content'), list):
                for content_item in msg['content']:
                    if isinstance(content_item, dict) and content_item.get('type') == 'image_url':
                        has_image = True
                        break
            if has_image:
                break

    # Vision requests need more time for image processing
    if has_image:
        timeout = 300  # 5 minutes for vision requests
        print(f"[AI Chat] Vision request detected, using {timeout}s timeout")
    elif payload.get('model') == 'gemma3-27b':
        timeout = 90
        print(f"[AI Chat] Using gemma3-27b with {timeout}s timeout")
    else:
        timeout = 30
        print(f"[AI Chat] Standard request with {timeout}s timeout")

    try:
        print(f"[AI Chat] Sending request to {external_url}")
        resp = requests.post(external_url, json=payload, timeout=timeout)
        print(f"[AI Chat] Received response with status {resp.status_code}")
        try:
            external_json = resp.json()
        except Exception:
            external_json = {'raw_text': resp.text}

        if isinstance(external_json, dict):
            if responses:
                external_json['tool_responses'] = responses
            return jsonify(external_json), resp.status_code
        else:
            return (
                jsonify({'external': external_json, 'tool_responses': responses}),
                resp.status_code,
            )
    except requests.Timeout:
        print(f"[AI Chat] Request timeout after {timeout} seconds")
        return jsonify({
            'choices': [{
                'message': {
                    'role': 'assistant',
                    'content': (
                        'The AI service is taking too long to respond. '
                        'Please try again with a shorter message or simpler request.'
                    )
                }
            }],
            'error': 'Request timeout',
            'detail': f'Request exceeded {timeout} second timeout',
            'tool_responses': responses,
        }), 200
    except requests.ConnectionError as e:
        print(f"[AI Chat] Connection error: {str(e)}")
        return jsonify({
            'choices': [{
                'message': {
                    'role': 'assistant',
                    'content': (
                        'Unable to connect to AI service. '
                        'The service appears to be offline. Please try again later.'
                    )
                }
            }],
            'error': 'Connection failed',
            'detail': 'Could not reach AI service endpoint',
            'tool_responses': responses,
        }), 200
    except requests.RequestException as e:
        return jsonify({
            'choices': [{
                'message': {
                    'role': 'assistant',
                    'content': (
                        'Unable to connect to AI service. '
                        'The service may be offline or unreachable. '
                        f'Error: {str(e)}'
                    )
                }
            }],
            'error': 'Failed to contact external LLM',
            'detail': str(e),
            'tool_responses': responses,
        }), 200


@app.route('/api/champions', methods=['GET'])
def champions():
    try:
        champ_data = get_cached_champion_data()
        return jsonify({'data': champ_data})
    except Exception as e:
        return jsonify({'error': 'Failed to load champion data', 'detail': str(e)}), 500


@app.route('/api/admin/users', methods=['GET'])
def admin_list_users():
    if not hasattr(g, 'user') or not g.user:
        return jsonify({'error': 'Not authenticated'}), 401

    email = g.user.get('email')
    if not email or email.lower() != 'loganfake@gmail.com':
        return jsonify({'error': 'Forbidden'}), 403

    users = User.query.all()
    result = []
    for u in users:
        pref = None
        try:
            pref_obj = UserPreference.query.filter_by(user_id=u.id).first()
            if pref_obj:
                pref = pref_obj.to_dict()
        except Exception:
            pref = None

        result.append({
            'user': u.to_dict(),
            'preference': pref,
        })

    return jsonify({'users': result})


@app.route('/api/champion-winrate/<champion_id>', methods=['GET'])
def champion_winrate(champion_id):
    puuids_raw = request.args.get('puuids')
    per_player = request.args.get('count', 20, type=int)
    max_total = request.args.get('max', 200, type=int)

    if puuids_raw:
        puuids = [p.strip() for p in puuids_raw.split(',') if p.strip()]
        if not puuids:
            return jsonify({'error': 'No valid puuids provided'}), 400

        try:
            result = get_champion_winrate_na(
                champion_id,
                puuids,
                per_player_count=per_player,
                max_total_matches=max_total,
            )
            return jsonify(result)
        except Exception as e:
            return jsonify({'error': 'Failed to compute winrate', 'detail': str(e)}), 500

    region = request.args.get('region')
    if not region:
        return (
            jsonify({'error': 'Either puuids or region must be provided'}),
            400,
        )

    tier = request.args.get('tier', 'DIAMOND')
    division = request.args.get('division')
    queue = request.args.get('queue', 'RANKED_SOLO_5x5')
    max_players = request.args.get('max_players', 50, type=int)

    try:
        result = get_champion_winrate_by_region_rank(
            champion_id,
            region=region,
            tier=tier,
            division=division,
            queue=queue,
            per_player_count=per_player,
            max_total_matches=max_total,
            max_players=max_players,
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': 'Failed to compute winrate', 'detail': str(e)}), 500


@app.route('/api/champion-item-winrate/<champion_id>', methods=['GET'])
def champion_item_winrate(champion_id):
    # Two modes: puuids OR region/tier (NA)
    puuids_raw = request.args.get('puuids')
    per_player = request.args.get('count', 20, type=int)
    max_total = request.args.get('max', 200, type=int)

    if puuids_raw:
        puuids = [p.strip() for p in puuids_raw.split(',') if p.strip()]
        if not puuids:
            return jsonify({'error': 'No valid puuids provided'}), 400
        try:
            result = get_champion_item_stats_na(
                champion_id,
                puuids,
                per_player_count=per_player,
                max_total_matches=max_total,
            )
            return jsonify(result)
        except Exception as e:
            return jsonify({'error': 'Failed to compute item stats', 'detail': str(e)}), 500

    region = request.args.get('region')
    if not region:
        return (
            jsonify({'error': 'Either puuids or region must be provided'}),
            400,
        )

    tier = request.args.get('tier', 'DIAMOND')
    division = request.args.get('division')
    queue = request.args.get('queue', 'RANKED_SOLO_5x5')
    max_players = request.args.get('max_players', 50, type=int)

    try:
        result = get_champion_item_stats_by_region_rank(
            champion_id,
            region=region,
            tier=tier,
            division=division,
            queue=queue,
            per_player_count=per_player,
            max_total_matches=max_total,
            max_players=max_players,
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': 'Failed to compute item stats', 'detail': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
