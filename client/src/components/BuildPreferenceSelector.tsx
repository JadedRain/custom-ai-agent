import React, { useState, useEffect } from 'react';
import { useUserPreferences, useUpdateUserPreferences } from '../api/hooks';
import type { BuildType } from '../api/client';

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

export const BuildPreferenceSelector: React.FC = () => {
  const { data, isLoading, error } = useUserPreferences();
  const updatePreferences = useUpdateUserPreferences();
  const [selectedBuildType, setSelectedBuildType] = useState<BuildType | null>(null);

  useEffect(() => {
    if (data && selectedBuildType === null) {
      setSelectedBuildType(data.preference.build_type);
    }
  }, [data, selectedBuildType]);

  const handleSave = async () => {
    if (selectedBuildType) {
        await updatePreferences.mutateAsync(selectedBuildType);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12"><p className="text-xl">Loading build preferences...</p></div>;
  }

  if (error) {
    return (
      <div className="error-bg border rounded p-4 mb-6">
        <p className="text-primary-50">
          Error: {error instanceof Error ? error.message : 'Failed to load build preferences'}
        </p>
      </div>
    );
  }

  if (!data) return null;

  return (
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
  );
};
