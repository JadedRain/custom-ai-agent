import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

export function TestQueryErrorButton() {
  const [enabled, setEnabled] = useState(false);
  useQuery({
    queryKey: ['error-demo-btn'],
    queryFn: async () => {
      throw new Error('Demo query error from button!');
    },
    enabled,
    retry: false,
  });
  return (
    <button
      className="ml-4 bg-primary-200 hover:bg-primary-300 text-white px-4 py-2 rounded"
      onClick={() => setEnabled(true)}
    >
      Trigger Query Error
    </button>
  );
}
