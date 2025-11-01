import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import { useEffect } from 'react';
import { showErrorToast } from './ErrorToast';

export function useQueryWithGlobalError<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends readonly unknown[] = readonly unknown[]
>(options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>) {
  const result = useQuery(options);
  useEffect(() => {
    if (result.isError && result.error instanceof Error) {
      showErrorToast(result.error);
    }
  }, [result.isError, result.error]);
  return result;
}
