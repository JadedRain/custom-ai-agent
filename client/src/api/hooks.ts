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
