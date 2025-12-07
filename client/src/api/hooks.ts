// Fetch match details by matchId
import type { Match } from './client';
import { API_BASE_URL } from './client';

export const useMatchDetails = (matchId: string) => {
  const auth = useAuth();
  return useQuery<Match | undefined>({
    queryKey: ['matchDetails', matchId],
    queryFn: async () => {
      if (!matchId) return undefined;
      const response = await fetch(`${API_BASE_URL}/api/match/${matchId}`, { headers: auth.user?.access_token ? { Authorization: `Bearer ${auth.user.access_token}` } : {} });
      if (!response.ok) throw new Error('Failed to fetch match details');
      return response.json();
    },
    enabled: !!matchId && !!auth.user?.access_token,
  });
};
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from 'react-oidc-context';
import { apiClient, type BuildType } from './client';
import { CDN_BASE } from '../lib/draftConstants';

export type DDragonChampion = {
  id: string;
  key: string;
  name: string;
  title?: string;
  blurb?: string;
  info?: Record<string, unknown>;
  stats?: Record<string, number>;
  passive?: { name: string; description: string; image?: { full: string } };
  spells?: Array<{ name: string; description: string; tooltip?: string; image?: { full: string } }>;
  image?: { full: string };
};

export const useAllChampions = () => {
  return useQuery<{ byId: Record<string, DDragonChampion>; list: Array<DDragonChampion & { imageUrl?: string }> }>({
    queryKey: ['champions'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/champions`);
      if (!response.ok) throw new Error('Failed to fetch champions');
      const json = await response.json();
      const data: Record<string, DDragonChampion> = json.data || {};
      // convert to array and attach imageUrl
      const arr = Object.values(data).map((c) => ({
        ...c,
        imageUrl: c.image?.full ? `${CDN_BASE}${c.image.full}` : undefined,
      }));
      // sort alphabetically
      arr.sort((a, b) => a.name.localeCompare(b.name));
      return { byId: data, list: arr } as { byId: Record<string, DDragonChampion>; list: Array<DDragonChampion & { imageUrl?: string }>; };
    },
  });
};

export const useSummoner = (gameName: string, tagLine: string) => {
  const auth = useAuth();
  
  return useQuery({
    queryKey: ['summoner', gameName, tagLine],
    queryFn: () => apiClient.getSummoner(gameName, tagLine, auth.user?.access_token),
    enabled: !!gameName && !!tagLine && !!auth.user?.access_token,
    retry: 1,
  });
};

export const usePlayerMatchHistory = (gameName: string, tagLine: string, count = 10) => {
  const auth = useAuth();
  
  return useQuery({
    queryKey: ['matchHistory', gameName, tagLine, count],
    queryFn: () => apiClient.getPlayerMatchHistory(gameName, tagLine, count, auth.user?.access_token),
    enabled: !!gameName && !!tagLine && !!auth.user?.access_token,
    retry: 1,
  });
};

export const useUserPreferences = () => {
  const auth = useAuth();
  
  return useQuery({
    queryKey: ['userPreferences'],
    queryFn: () => apiClient.getUserPreferences(auth.user!.access_token),
    enabled: !!auth.user?.access_token,
  });
};

export const useUpdateUserPreferences = () => {
  const auth = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (buildType: BuildType) => 
      apiClient.updateUserPreferences(buildType, auth.user!.access_token),
    onSuccess: () => {
      // Invalidate and refetch user preferences
      queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
    },
  });
};

export const useAdminUsers = () => {
  const auth = useAuth();

  return useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      if (!auth.user?.access_token) throw new Error('Not authenticated');
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, { headers: auth.user?.access_token ? { Authorization: `Bearer ${auth.user.access_token}` } : {} });
      if (!response.ok) throw new Error('Failed to fetch admin users');
      return response.json();
    },
    enabled: !!auth.user?.access_token,
  });
};
