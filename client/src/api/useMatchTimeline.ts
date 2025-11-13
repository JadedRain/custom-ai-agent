import { useQuery } from '@tanstack/react-query';
import { useAuth } from 'react-oidc-context';

export const useMatchTimeline = (matchId: string) => {
  const auth = useAuth();
  return useQuery({
    queryKey: ['matchTimeline', matchId],
    queryFn: async () => {
      if (!matchId) return undefined;
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/match-timeline/${matchId}`,
        { headers: auth.user?.access_token ? { Authorization: `Bearer ${auth.user.access_token}` } : {} }
      );
      if (!response.ok) throw new Error('Failed to fetch match timeline');
      return response.json();
    },
    enabled: !!matchId && !!auth.user?.access_token,
  });
};
