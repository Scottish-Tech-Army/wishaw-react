/**
 * AppProviders.tsx
 *
 * Single wrapper that nests all global context providers in the
 * correct order:
 *
 *   DataProvider        — must be outermost; AuthProvider reads from it
 *     └─ AuthProvider   — reads DataContext to validate login
 *          └─ children
 *
 * Usage in main.tsx:
 *   <AppProviders>
 *     <App />
 *   </AppProviders>
 */

import type { ReactNode } from 'react';
import { DataProvider } from './DataContext';
import { AuthProvider } from './AuthContext';

interface Props {
  readonly children: ReactNode;
}

export function AppProviders({ children }: Props) {
  return (
    <DataProvider>
      <AuthProvider>{children}</AuthProvider>
    </DataProvider>
  );
}
