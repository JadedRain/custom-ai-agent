import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { showErrorToast } from './ErrorToast';

export function useQueryWithGlobalError(options: any) {
  const result = useQuery(options);
  useEffect(() => {
    if (result.isError && result.error instanceof Error) {
      showErrorToast(result.error);
    }
  }, [result.isError, result.error]);
  return result;
}
