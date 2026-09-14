/**
 * SchoolContext.tsx
 *
 * Provides a single shared, cached School profile to the entire React tree.
 * Replaces 8+ independent schoolService.getSchoolProfile() calls with one
 * fetch per navigation session, revalidated whenever settings change.
 *
 * Pattern: stale-while-revalidate via useRef cache + useCallback refetch.
 *   1. On mount — fetch immediately; expose `isLoading=true` until resolved.
 *   2. On `school_settings_updated` window event — re-fetch in background;
 *      consumers see the stale value during the fetch (no loading flicker).
 *   3. `invalidate()` — programmatic revalidation (call after a write).
 */

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { schoolService } from '@/services/schoolService';
import { School } from '@/types/spmb';

interface SchoolContextValue {
  /** Current school profile. Null only during the very first load. */
  school: School | null;
  /** True only during the initial fetch (never true on background revalidation). */
  isLoading: boolean;
  /** Last fetch error, if any. */
  error: Error | null;
  /**
   * Trigger an immediate background revalidation.
   * Call this after any write that changes the school profile.
   */
  invalidate: () => void;
}

const SchoolContext = createContext<SchoolContextValue | undefined>(undefined);

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [school, setSchool] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Guard: prevent setState on unmounted component during background refetches.
  const isMountedRef = useRef(true);
  // Track in-flight fetch to avoid stampedes (e.g. rapid settings saves).
  const fetchInFlightRef = useRef(false);

  const fetchSchool = useCallback(async (isInitial = false) => {
    if (fetchInFlightRef.current) return;
    fetchInFlightRef.current = true;

    if (isInitial) setIsLoading(true);
    // On background revalidation we intentionally do NOT set isLoading=true
    // so consumers don't re-render with a spinner.

    try {
      const data = await schoolService.getSchoolProfile();
      if (isMountedRef.current) {
        setSchool(data);
        setError(null);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
        // Keep stale value on error so UI doesn't blank out.
      }
    } finally {
      fetchInFlightRef.current = false;
      if (isInitial && isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const invalidate = useCallback(() => {
    fetchSchool(false);
  }, [fetchSchool]);

  // Initial fetch
  useEffect(() => {
    isMountedRef.current = true;
    fetchSchool(true);

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchSchool]);

  // Revalidate when any part of the app signals that settings changed.
  // AdminSettingsPage, AdminDashboardPage etc. dispatch this event after saves.
  useEffect(() => {
    const handleUpdate = () => invalidate();
    window.addEventListener('school_settings_updated', handleUpdate);
    return () => window.removeEventListener('school_settings_updated', handleUpdate);
  }, [invalidate]);

  return (
    <SchoolContext.Provider value={{ school, isLoading, error, invalidate }}>
      {children}
    </SchoolContext.Provider>
  );
};

/**
 * useSchool()
 *
 * Returns the shared school profile from context.
 * Must be used inside <SchoolProvider>.
 */
export function useSchool(): SchoolContextValue {
  const ctx = useContext(SchoolContext);
  if (!ctx) {
    throw new Error('useSchool() must be used inside <SchoolProvider>');
  }
  return ctx;
}
