import { useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useUserPreferences, useUpdateUserPreferences } from '../api/hooks';
import type { BuildType } from '../api/client';

export function SettingsPage() {
  const auth = useAuth();
  const { data, isLoading, error } = useUserPreferences();
  const updatePreferences = useUpdateUserPreferences();
  const [selectedBuildType, setSelectedBuildType] = useState<BuildType | null>(null);

  // Show message if user is not authenticated
  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Settings</h1>
          <div className="bg-yellow-900/50 border border-yellow-700 rounded p-6">
            <p className="text-yellow-200 text-lg">
              Please sign in to view and manage your settings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Update selected build type when data loads
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
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Settings</h1>

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-xl">Loading settings...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded p-4 mb-6">
            <p className="text-red-200">
              Error: {error instanceof Error ? error.message : 'Failed to load settings'}
            </p>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* User Info Section */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Account Information</h2>
              <div className="space-y-2 text-gray-300">
                <p>
                  <span className="font-medium text-white">Username:</span>{' '}
                  {data.user.username || 'N/A'}
                </p>
                <p>
                  <span className="font-medium text-white">Email:</span>{' '}
                  {data.user.email || 'N/A'}
                </p>
                <p className="text-sm text-gray-400">
                  Member since: {new Date(data.user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Build Preference Section */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Build Preferences</h2>
              <p className="text-gray-300 mb-6">
                Choose your preferred build strategy for AI-generated recommendations.
              </p>

              <div className="space-y-4">
                {buildTypes.map((buildType) => (
                  <label
                    key={buildType.value}
                    className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedBuildType === buildType.value
                        ? 'border-blue-500 bg-blue-900/20'
                        : 'border-gray-700 bg-gray-900/40 hover:border-gray-600'
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
                      <div className="text-gray-400 text-sm">
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
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {updatePreferences.isPending ? 'Saving...' : 'Save Changes'}
                </button>

                {updatePreferences.isSuccess && (
                  <span className="text-green-400 text-sm">
                    ✓ Preferences saved successfully
                  </span>
                )}

                {updatePreferences.isError && (
                  <span className="text-red-400 text-sm">
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
