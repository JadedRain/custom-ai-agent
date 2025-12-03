import { useQuery } from '@tanstack/react-query';
import { useAuth } from 'react-oidc-context';
import { API_BASE_URL } from './client';

export const useMatchTimeline = (matchId: string) => {
  const auth = useAuth();
  return useQuery({
    queryKey: ['matchTimeline', matchId],
    queryFn: async () => {
      if (!matchId) return undefined;
      const url = `${API_BASE_URL}/api/match-timeline/${matchId}`;
      const response = await fetch(url, { headers: auth.user?.access_token ? { Authorization: `Bearer ${auth.user.access_token}` } : {} });
      if (!response.ok) throw new Error('Failed to fetch match timeline');
      return response.json();
    },
    enabled: !!matchId && !!auth.user?.access_token,
  });
};
