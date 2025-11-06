from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
from riot_api import get_summoner_by_riot_id, get_match_history, get_match_details

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'API is running'})

@app.route('/api', methods=['GET'])
def index():
    return jsonify({'message': 'Welcome to the AI Agent API'})

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
    """Get detailed information about a specific match"""
    match_data = get_match_details(match_id)
    
    if match_data:
        return jsonify(match_data)
    else:
        return jsonify({'error': 'Match not found'}), 404

@app.route('/api/player-match-history/<game_name>/<tag_line>', methods=['GET'])
def player_match_history(game_name, tag_line):
    count = request.args.get('count', 10, type=int)
    
    # Get summoner info
    summoner_data = get_summoner_by_riot_id(game_name, tag_line)
    
    if not summoner_data:
        return jsonify({'error': 'Summoner not found'}), 404
    
    puuid = summoner_data.get('puuid')
    
    # Get match IDs
    match_ids = get_match_history(puuid, 0, count)
    
    if not match_ids:
        return jsonify({'error': 'No matches found'}), 404
    
    # Get detailed match data
    matches = []
    for match_id in match_ids:
        match_data = get_match_details(match_id)
        if match_data:
            matches.append(match_data)
    
    return jsonify({
        'summoner': summoner_data,
        'matches': matches
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
