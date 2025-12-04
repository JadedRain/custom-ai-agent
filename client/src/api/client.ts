const RAW_API_URL = import.meta.env.VITE_API_URL;
// If the env points to the Docker service hostname like "http://api:5000", browsers can't resolve that
// from the host. Prefer a relative path in that case so the frontend talks to the same origin: `/api/...`.
export const API_BASE_URL = RAW_API_URL && RAW_API_URL.includes('://api') ? '' : (RAW_API_URL || '');

export interface Summoner {
  puuid: string;
  gameName: string;
  tagLine: string;
  profileIconId?: number;
  summonerLevel?: number;
}

export interface MatchParticipant {
  puuid: string;
  championName?: string;
  champion?: string;
  win: boolean;
  kills?: number;
  deaths?: number;
  assists?: number;
  totalMinionsKilled?: number;
  neutralMinionsKilled?: number;
  visionScore?: number;
  teamId?: number;
  riotIdGameName?: string;
  summonerName?: string;
  [key: string]: unknown;
}

export interface MatchInfo {
  participants: MatchParticipant[];
  gameMode?: string;
  queueId?: number;
  [key: string]: unknown;
}

export interface MatchMetadata {
  matchId: string;
  [key: string]: unknown;
}

export interface Match {
  metadata: MatchMetadata;
  info: MatchInfo;
  [key: string]: unknown;
}

export interface MatchHistoryResponse {
  summoner: Summoner;
  matches: Match[];
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
      `${API_BASE_URL}/api/summoner/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
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
      `${API_BASE_URL}/api/player-match-history/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}?count=${count}`,
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
  getAdminUsers: async (token: string): Promise<{ users: { user: User; preference: UserPreference | null }[] }> => {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/users`,
      {
        headers: createHeaders(token),
      }
    );
    if (!response.ok) {
      throw new Error('Failed to fetch admin users');
    }
    return response.json();
  },
  generateBestItems: async (calls: Array<{ name: string; parameters: Record<string, unknown> }>, token?: string) => {
    const payload = {
      messages: [{ role: 'user', content: 'Requesting best-item tool calls' }],
      tool_calls: calls,
    };

    const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: createHeaders(token),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const txt = await response.text();
      throw new Error(`AI request failed: ${response.status} ${txt}`);
    }

    return response.json();
  },
};
