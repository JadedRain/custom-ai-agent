const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface Summoner {
  puuid: string;
  gameName: string;
  tagLine: string;
}

export interface MatchHistoryResponse {
  summoner: Summoner;
  matches: any[];
}

export type BuildType = 'greedy' | 'defensive' | 'offensive';

export interface UserPreference {
  id: number;
  user_id: number;
  build_type: BuildType;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  keycloak_sub: string;
  email: string | null;
  username: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserPreferencesResponse {
  user: User;
  preference: UserPreference;
}

const createHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export const apiClient = {
  getSummoner: async (gameName: string, tagLine: string, token?: string): Promise<Summoner> => {
    const response = await fetch(
      `${API_BASE_URL}/api/summoner/${gameName}/${tagLine}`,
      {
        headers: createHeaders(token),
      }
    );
    if (!response.ok) {
      throw new Error('Failed to fetch summoner');
    }
    return response.json();
  },

  getPlayerMatchHistory: async (gameName: string, tagLine: string, count = 10, token?: string): Promise<MatchHistoryResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/api/player-match-history/${gameName}/${tagLine}?count=${count}`,
      {
        headers: createHeaders(token),
      }
    );
    if (!response.ok) {
      throw new Error('Failed to fetch match history');
    }
    return response.json();
  },

  getUserPreferences: async (token: string): Promise<UserPreferencesResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/api/user/preferences`,
      {
        headers: createHeaders(token),
      }
    );
    if (!response.ok) {
      throw new Error('Failed to fetch user preferences');
    }
    return response.json();
  },

  updateUserPreferences: async (buildType: BuildType, token: string): Promise<UserPreferencesResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/api/user/preferences`,
      {
        method: 'PUT',
        headers: createHeaders(token),
        body: JSON.stringify({ build_type: buildType }),
      }
    );
    if (!response.ok) {
      throw new Error('Failed to update user preferences');
    }
    return response.json();
  },
};
