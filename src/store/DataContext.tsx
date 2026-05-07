/**
 * DataContext.tsx — exports ONLY the DataProvider component.
 *
 * Consumers use:
 *   import { useData }     from './useData'
 *   import { DataContext } from './dataContext'   (lowercase — non-component file)
 */

import {
  useReducer,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';

import type { AppState } from '../types';
import { dataReducer } from './dataReducer';
import { SEED_DATA } from './seedData';
import useLocalStorage from './useLocalStorage';
import { buildDataContextValue, DataContext } from './dataContextCore';

const STORAGE_KEY = 'wishaw_app_state';

/**
 * Backfill firstName / lastName for users that were persisted before those
 * fields were added to the User type. Derives them by splitting displayName.
 * Runs once at startup against the value loaded from localStorage.
 */
function migrateState(raw: AppState): AppState {
  const needsMigration = raw.users.some((u) => !u.firstName || !u.lastName);
  if (!needsMigration) return raw;

  return {
    ...raw,
    users: raw.users.map((u) => {
      if (u.firstName && u.lastName) return u;
      const parts = (u.displayName ?? '').trim().split(' ');
      const firstName = parts[0] ?? u.displayName ?? '';
      const lastName = parts.slice(1).join(' ') || firstName;
      return { ...u, firstName, lastName };
    }),
  };
}

interface Props {
  readonly children: ReactNode;
}

export function DataProvider({ children }: Props) {
  const [persisted, setPersisted] = useLocalStorage<AppState>(STORAGE_KEY, SEED_DATA);
  const [state, dispatch] = useReducer(dataReducer, migrateState(persisted));

  useEffect(() => {
    setPersisted(state);
  }, [state, setPersisted]);

  const value = useMemo(
    () => buildDataContextValue(state, dispatch),
    [state]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
