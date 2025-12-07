import React from 'react';
import { useAuth } from 'react-oidc-context';
import { AiChat } from '../components/AiChat';
import { useGameData } from '../context/gameDataHelpers';

const AiAgentPage: React.FC = () => {
  const auth = useAuth();
  const { itemData } = useGameData();

  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen green-bg-dark p-8 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold green-text-light mb-6">AI Agent</h1>
          <p className="text-xl text-neutral-300 mb-8">
            Please sign in to access the AI Agent
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen green-bg-dark p-8 pt-20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold green-text-light mb-2">AI Agent</h1>
        </div>
        
        <div className="h-[calc(100vh-250px)]">
          <AiChat itemData={itemData} />
        </div>
      </div>
    </div>
  );
};

export default AiAgentPage;
