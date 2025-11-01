import { QueryClient } from '@tanstack/react-query';
import { showErrorToast } from './ErrorToast';

export const queryClient = new QueryClient();

queryClient.getQueryCache().subscribe((event: unknown) => {
  if (event && typeof event === 'object' && 'type' in event && event.type === 'error' && 'error' in event) {
    const error = event.error;
    if (error instanceof Error) {
      showErrorToast(error);
    } else {
      showErrorToast(new Error(String(error)));
    }
  }
});
