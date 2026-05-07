import { useState, useEffect, useCallback } from 'react';

/**
 * useLocalStorage
 *
 * A generic hook that keeps a piece of React state in sync with localStorage.
 * - On first mount it reads from localStorage (if a value exists) or falls
 *   back to `initialValue`.
 * - Every time the state changes it is serialised to localStorage.
 * - If another tab writes to the same key the state is updated automatically
 *   via the `storage` window event.
 *
 * @param key          - The localStorage key to persist under.
 * @param initialValue - Value used when nothing is stored yet.
 *
 * @returns [storedValue, setValue, removeValue]
 */
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // ── 1. Lazy initialiser — reads storage once on mount ───────────────────
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const raw = globalThis.localStorage.getItem(key);
      if (raw === null) return initialValue;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.warn(`[useLocalStorage] Could not read "${key}":`, err);
      return initialValue;
    }
  });

  // ── 2. Write helper ─────────────────────────────────────────────────────
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next =
          typeof value === 'function'
            ? (value as (prev: T) => T)(prev)
            : value;
        try {
          globalThis.localStorage.setItem(key, JSON.stringify(next));
        } catch (err) {
          console.warn(`[useLocalStorage] Could not write "${key}":`, err);
        }
        return next;
      });
    },
    [key]
  );

  // ── 3. Remove helper ────────────────────────────────────────────────────
  const removeValue = useCallback(
    (fallback: T = initialValue) => {
      try {
        globalThis.localStorage.removeItem(key);
      } catch (err) {
        console.warn(`[useLocalStorage] Could not remove "${key}":`, err);
      }
      setStoredValue(fallback);
    },
    // initialValue is intentionally excluded — it is stable at call-site
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  );

  // ── 4. Cross-tab sync ───────────────────────────────────────────────────
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      if (e.newValue === null) {
        setStoredValue(initialValue);
      } else {
        try {
          setStoredValue(JSON.parse(e.newValue) as T);
        } catch {
          console.warn(
            `[useLocalStorage] Could not parse cross-tab value for "${key}"`
          );
        }
      }
    };

    globalThis.addEventListener('storage', onStorage);
    return () => globalThis.removeEventListener('storage', onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
