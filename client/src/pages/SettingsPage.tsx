import { useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useUserPreferences, useUpdateUserPreferences } from '../api/hooks';
import type { BuildType } from '../api/client';

export function SettingsPage() {
  const auth = useAuth();
  const { data, isLoading, error } = useUserPreferences();
  const updatePreferences = useUpdateUserPreferences();
  const [selectedBuildType, setSelectedBuildType] = useState<BuildType | null>(null);

  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-primary-700 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Settings</h1>
          <div className="bg-primary-600/50 border border-primary-500 rounded p-6">
            <p className="text-primary-50 text-lg">
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

  const handleSave = async () => {
    if (selectedBuildType) {
      try {
        await updatePreferences.mutateAsync(selectedBuildType);
      } catch (err) {
        console.error('Failed to update preferences:', err);
      }
    }
  };

  const buildTypes: { value: BuildType; label: string; description: string }[] = [
    {
      value: 'greedy',
      label: 'Greedy',
      description: 'Focus on gold generation and economy',
    },
    {
      value: 'defensive',
      label: 'Defensive',
      description: 'Prioritize survivability and tankiness',
    },
    {
      value: 'offensive',
      label: 'Offensive',
      description: 'Maximize damage output and aggression',
    },
  ];

  return (
    <div className="min-h-screen page-bg p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Settings</h1>

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-xl">Loading settings...</p>
          </div>
        )}

        {error && (
          <div className="error-bg border rounded p-4 mb-6">
            <p className="text-primary-50">
              Error: {error instanceof Error ? error.message : 'Failed to load settings'}
            </p>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* User Info Section */}
            <div className="card-bg rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Account Information</h2>
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

            {/* Build Preference Section */}
            <div className="card-bg rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Build Preferences</h2>
              <p className="text-neutral-100 mb-6">
                Choose your preferred build strategy for AI-generated recommendations.
              </p>

              <div className="space-y-4">
                {buildTypes.map((buildType) => (
                  <label
                    key={buildType.value}
                    className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedBuildType === buildType.value
                        ? 'border-primary-300 bg-primary-600/20'
                        : 'border-neutral-600 bg-neutral-800/40 hover:border-neutral-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="buildType"
                      value={buildType.value}
                      checked={selectedBuildType === buildType.value}
                      onChange={(e) => setSelectedBuildType(e.target.value as BuildType)}
                      className="mt-1 mr-4"
                    />
                    <div>
                      <div className="font-semibold text-lg text-white">
                        {buildType.label}
                      </div>
                      <div className="text-neutral-200 text-sm">
                        {buildType.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-4">
                <button
                  onClick={handleSave}
                  disabled={
                    updatePreferences.isPending ||
                    selectedBuildType === data.preference.build_type
                  }
                  className={`px-6 py-2 rounded font-semibold transition-colors ${
                    updatePreferences.isPending ||
                    selectedBuildType === data.preference.build_type
                      ? 'bg-neutral-600 text-neutral-300 cursor-not-allowed'
                      : 'bg-primary-300 hover:bg-primary-400 text-white'
                  }`}
                >
                  {updatePreferences.isPending ? 'Saving...' : 'Save Changes'}
                </button>

                {updatePreferences.isSuccess && (
                  <span className="text-primary-100 text-sm">
                    ✓ Preferences saved successfully
                  </span>
                )}

                {updatePreferences.isError && (
                  <span className="text-primary-800 text-sm">
                    Failed to save preferences
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
