// Fetch match details by matchId
import type { Match } from './client';

export const useMatchDetails = (matchId: string) => {
  const auth = useAuth();
  return useQuery<Match | undefined>({
    queryKey: ['matchDetails', matchId],
    queryFn: async () => {
      if (!matchId) return undefined;
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/match/${matchId}`,
        { headers: auth.user?.access_token ? { Authorization: `Bearer ${auth.user.access_token}` } : {} }
      );
      if (!response.ok) throw new Error('Failed to fetch match details');
      return response.json();
    },
    enabled: !!matchId && !!auth.user?.access_token,
  });
};
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from 'react-oidc-context';
import { apiClient, type BuildType } from './client';

export const useSummoner = (gameName: string, tagLine: string) => {
  const auth = useAuth();
  
  return useQuery({
    queryKey: ['summoner', gameName, tagLine],
    queryFn: () => apiClient.getSummoner(gameName, tagLine, auth.user?.access_token),
    enabled: !!gameName && !!tagLine && !!auth.user?.access_token,
  });
};

export const usePlayerMatchHistory = (gameName: string, tagLine: string, count = 10) => {
  const auth = useAuth();
  
  return useQuery({
    queryKey: ['matchHistory', gameName, tagLine, count],
    queryFn: () => apiClient.getPlayerMatchHistory(gameName, tagLine, count, auth.user?.access_token),
    enabled: !!gameName && !!tagLine && !!auth.user?.access_token,
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
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users`,
        { headers: auth.user?.access_token ? { Authorization: `Bearer ${auth.user.access_token}` } : {} }
      );
      if (!response.ok) throw new Error('Failed to fetch admin users');
      return response.json();
    },
    enabled: !!auth.user?.access_token,
  });
};
