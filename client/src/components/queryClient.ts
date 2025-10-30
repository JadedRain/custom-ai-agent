import { QueryClient } from '@tanstack/react-query';
import { showErrorToast } from './ErrorToast';

export const queryClient = new QueryClient();

queryClient.getQueryCache().subscribe((event: any) => {
  if (event?.type === 'error' && event?.error) {
    if (event.error instanceof Error) {
      showErrorToast(event.error);
    } else {
      showErrorToast(new Error(String(event.error)));
    }
  }
});
