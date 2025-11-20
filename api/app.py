from flask import Flask, jsonify, request, g
from flask_cors import CORS
from dotenv import load_dotenv
from riot_api import get_summoner_by_riot_id, get_match_history
from riot_api import get_match_details, get_match_timeline
from auth_middleware import init_auth_middleware
from database import init_db, db
from models import User, UserPreference, BuildType
from ai_chat_tools import get_cached_champion_data

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


@app.route('/api/champions', methods=['GET'])
def champions():
    """Return cached champion data from ddragon for the Draft Planner UI.

    Response JSON shape: { data: { <championId>: { ...championData } } }
    The champion data is the same structure returned by Riot ddragon `champion.json`.
    """
    try:
        champ_data = get_cached_champion_data()
        return jsonify({'data': champ_data})
    except Exception as e:
        return jsonify({'error': 'Failed to load champion data', 'detail': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
