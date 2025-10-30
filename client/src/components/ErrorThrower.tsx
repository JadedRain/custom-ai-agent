import type { ReactNode } from 'react';

export function ErrorThrower(): ReactNode {
  throw new Error('Test error from render!');
}
