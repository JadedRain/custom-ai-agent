import { useState } from 'react';
import { BuildPreferenceSelector } from '../components/BuildPreferenceSelector';
import { useAuth } from 'react-oidc-context';
import { useUserPreferences } from '../api/hooks';
import type { BuildType } from '../api/client';

export function SettingsPage() {
  const auth = useAuth();
  const { data, isLoading, error } = useUserPreferences();
  const [selectedBuildType, setSelectedBuildType] = useState<BuildType | null>(null);

  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen green-bg-medium text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Settings</h1>
          <div className="green-bg-light green-border border rounded p-6">
            <p className="text-white text-lg">
              Please sign in to view and manage your settings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (data && selectedBuildType === null) {
    setSelectedBuildType(data.preference.build_type);
  }


  return (
    <div className="min-h-screen green-bg-dark text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 green-text-light">Settings</h1>

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-xl">Loading settings...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded p-4 mb-6">
            <p className="text-primary-50">
              Error: {error instanceof Error ? error.message : 'Failed to load settings'}
            </p>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            <div className="green-bg-medium green-border border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 green-text-light">Account Information</h2>
              <div className="space-y-2 text-neutral-100">
                <p>
                  <span className="font-medium text-white">Username:</span>{' '}
                  {data.user.username || 'N/A'}
                </p>
                <p>
                  <span className="font-medium text-white">Email:</span>{' '}
                  {data.user.email || 'N/A'}
                </p>
                <p className="text-sm text-neutral-200">
                  Member since: {new Date(data.user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <BuildPreferenceSelector />
          </div>
        )}
      </div>
    </div>
  );
}
