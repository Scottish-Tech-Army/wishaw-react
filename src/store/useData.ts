/**
 * useData.ts
 *
 * Single public entry-point for consumers of the DataContext.
 * Import everything data-related from here.
 */

export { useData, computeTier, DataContext } from './dataContextCore';
export type { DataAction, DataContextValue } from './dataContextCore';
