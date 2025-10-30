import { useState } from 'react';
import { useQueryWithGlobalError } from './useQueryWithGlobalError';

export function TestQueryErrorButton() {
  const [enabled, setEnabled] = useState(false);
  useQueryWithGlobalError({
    queryKey: ['error-demo-btn'],
    queryFn: async () => {
      throw new Error('Demo query error from button!');
    },
    enabled,
    retry: false,
  });
  return (
    <button
      className="ml-4 bg-purple-600 text-white px-4 py-2 rounded"
      onClick={() => setEnabled(true)}
    >
      Trigger Query Error
    </button>
  );
}
