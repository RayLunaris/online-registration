/**
 * registrationStatus.ts
 *
 * Single source of truth for resolving the effective registration open/closed
 * state from a school profile record.
 *
 * Priority waterfall (mirrors the PostgreSQL get_registration_status() RPC):
 *   1. RPC result (authoritative, server-side)   — used when available
 *   2. manual `registration_status` field         — 'closed' wins immediately
 *   3. scheduled `registration_close_date`        — closes when past
 *   4. default open
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { School } from '@/types/spmb';

// ─── Pure helpers ─────────────────────────────────────────────────────────────

/** Returns true if `isoDateStr` represents a moment already in the past. */
export function isDateExpiredUtil(isoDateStr: string | null | undefined): boolean {
  if (!isoDateStr) return false;
  const ts = new Date(isoDateStr).getTime();
  return !isNaN(ts) && Date.now() > ts;
}

// ─── Shared data type ─────────────────────────────────────────────────────────

export interface RegistrationStatusData {
  /** Final effective open/closed state (RPC takes precedence when available). */
  isOpen: boolean;
  /** The raw manual toggle value from the school row. */
  status: 'open' | 'closed';
  /** ISO string of the auto-close deadline, or null if not set. */
  closeDate: string | null;
  /** True when isOpen=false was caused by the scheduled date passing. */
  isClosedByDate: boolean;
  /** True when the scheduled close date is in the past (regardless of manual status). */
  isDateExpired: boolean;
}

// ─── Core computation ─────────────────────────────────────────────────────────

/**
 * Derives the full registration status from a school profile object.
 * Pure and synchronous — no I/O.
 *
 * @param school     School row (or partial) with status fields.
 * @param rpcIsOpen  Optional boolean from get_registration_status() RPC.
 *                   Overrides the locally-computed isOpen when non-null.
 */
export function computeRegistrationStatus(
  school: Pick<School, 'registration_status' | 'registration_close_date'>,
  rpcIsOpen: boolean | null = null,
): RegistrationStatusData {
  const manualStatus: 'open' | 'closed' =
    (school.registration_status as 'open' | 'closed') || 'open';
  const closeDate = school.registration_close_date || null;
  const dateExpired = isDateExpiredUtil(closeDate);

  let isClosedByDate = false;
  let effectiveIsOpen: boolean;

  if (manualStatus === 'closed') {
    effectiveIsOpen = false;
    isClosedByDate = false;
  } else if (dateExpired) {
    effectiveIsOpen = false;
    isClosedByDate = true;
  } else {
    effectiveIsOpen = true;
    isClosedByDate = false;
  }

  return {
    isOpen: rpcIsOpen !== null ? rpcIsOpen : effectiveIsOpen,
    status: manualStatus,
    closeDate,
    isClosedByDate,
    isDateExpired: dateExpired,
  };
}

// ─── Async orchestrator ───────────────────────────────────────────────────────

/**
 * Fetches the RPC boolean (best-effort) and school profile, then returns a
 * fully-resolved RegistrationStatusData.
 *
 * @param getSchoolProfile  Injected fn that returns the school row — avoids a
 *                          circular import from schoolService.
 */
export async function fetchRegistrationStatus(
  getSchoolProfile: () => Promise<Pick<School, 'registration_status' | 'registration_close_date'>>,
): Promise<RegistrationStatusData> {
  let rpcResult: boolean | null = null;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.rpc('get_registration_status');
      if (!error && typeof data === 'boolean') {
        rpcResult = data;
      }
    } catch (rpcErr) {
      console.warn('RPC get_registration_status failed, computing locally:', rpcErr);
    }
  }

  const school = await getSchoolProfile();
  return computeRegistrationStatus(school, rpcResult);
}
