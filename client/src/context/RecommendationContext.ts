import React from 'react';

type Recommendation = Record<string, unknown>;

export type RecommendationContextType = {
  recommendations: Recommendation[] | null;
  recEvents: Array<{ itemId: number; timestamp: number }> | null;
  recLoading: boolean;
  recError: string | null;
  requestRecommendations: () => Promise<void>;
};

export const RecommendationContext = React.createContext<RecommendationContextType | null>(null);

export const useRecommendations = () => {
  const ctx = React.useContext(RecommendationContext);
  if (!ctx) throw new Error('useRecommendations must be used within RecommendationProvider');
  return ctx;
};
