import os
import requests
from flask import jsonify

RIOT_API_KEY = os.getenv('RIOT_API_KEY')
AMERICAS_BASE_URL = 'https://americas.api.riotgames.com'

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