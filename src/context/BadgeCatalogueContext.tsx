/**
 * BadgeCatalogueContext
 *
 * Provides the badge catalogue's `refresh` callback across the student portal
 * without prop-drilling through the router.
 *
 * The context lives in StudentLayout (always mounted). StudentBadges registers
 * its `refresh` via `registerBadgeRefresh` on mount and clears it on unmount.
 * EvidenceSubmission calls `refreshBadges()` after a successful submission —
 * this is a no-op if StudentBadges is not currently mounted.
 *
 * Usage — in StudentLayout:
 *   <BadgeCatalogueProvider>
 *     <Outlet />
 *   </BadgeCatalogueProvider>
 *
 * Usage — producer (StudentBadges.tsx):
 *   const { registerBadgeRefresh } = useBadgeCatalogueContext();
 *   useEffect(() => {
 *     registerBadgeRefresh(refresh);
 *     return () => registerBadgeRefresh(null);
 *   }, [refresh, registerBadgeRefresh]);
 *
 * Usage — consumer (EvidenceSubmission.tsx):
 *   const { refreshBadges } = useBadgeCatalogueContext();
 *   // call refreshBadges() after a successful evidence submission
 */

import { createContext, useCallback, useContext, useRef } from "react";
import type { ReactNode } from "react";

interface BadgeCatalogueContextType {
  /**
   * Re-fetches the badge catalogue.
   * Is a no-op when StudentBadges is not currently mounted.
   */
  refreshBadges: () => void;
  /**
   * Called by StudentBadges on mount to register its refresh callback,
   * and with `null` on unmount to clear it.
   */
  registerBadgeRefresh: (fn: (() => void) | null) => void;
}

const BadgeCatalogueContext = createContext<BadgeCatalogueContextType>({
  refreshBadges: () => undefined,
  registerBadgeRefresh: () => undefined,
});

export function BadgeCatalogueProvider({ children }: { children: ReactNode }) {
  // Store the refresh fn in a ref so changing it never triggers a re-render
  const refreshRef = useRef<(() => void) | null>(null);

  const registerBadgeRefresh = useCallback((fn: (() => void) | null) => {
    refreshRef.current = fn;
  }, []);

  const refreshBadges = useCallback(() => {
    refreshRef.current?.();
  }, []);

  return (
    <BadgeCatalogueContext.Provider value={{ refreshBadges, registerBadgeRefresh }}>
      {children}
    </BadgeCatalogueContext.Provider>
  );
}

export function useBadgeCatalogueContext(): BadgeCatalogueContextType {
  return useContext(BadgeCatalogueContext);
}
