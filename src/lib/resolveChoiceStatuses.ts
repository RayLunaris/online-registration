/**
 * resolveChoiceStatuses.ts
 *
 * Single source of truth for deriving per-choice acceptance statuses and the
 * final "accepted at choice N" flags from a StudentCompleteDetail record.
 *
 * Used by:
 *  - StatusResultCard   (public-facing status page)
 *  - StudentTable       (admin list)
 *
 * Priority:
 *   1. selection_results columns (authoritative after selection engine runs)
 *   2. student.status fallback  (legacy data / mock mode without selection_results)
 */

import { StudentCompleteDetail, Major } from '@/types/spmb';

export type Ch1Status = 'accepted' | 'rejected' | 'pending';
export type Ch2Status = 'accepted' | 'rejected' | 'not_applicable' | 'pending';

export interface ResolvedChoiceStatuses {
  /** Major object for choice 1 (may be undefined if data is incomplete). */
  ch1Major: Major | undefined;
  /** Major object for choice 2, or undefined when student didn't pick one. */
  ch2Major: Major | undefined;
  /** True when the student registered a second-choice major. */
  hasChoice2: boolean;
  /** Rank position within choice-1 quota, or null when not yet computed. */
  ch1Rank: number | null;
  /** Quota capacity for choice-1 major. */
  ch1Quota: number;
  /** Per-choice-1 acceptance outcome. */
  ch1Status: Ch1Status;
  /** Rank position within choice-2 overflow pool, or null when not yet computed. */
  ch2Rank: number | null;
  /** Quota capacity for choice-2 major. */
  ch2Quota: number;
  /** Per-choice-2 acceptance outcome. */
  ch2Status: Ch2Status;
  /** True when final acceptance was via choice 1. */
  isAcceptedChoice1: boolean;
  /** True when final acceptance was via choice 2 (overflow). */
  isAcceptedChoice2: boolean;
}

/**
 * @param student          Full student record with joined relations.
 * @param majorFallbackMap Optional map of major_id → Major for environments
 *                         where major is not inlined on major_choices
 *                         (e.g. admin list with a pre-fetched majorMap).
 */
export function resolveChoiceStatuses(
  student: StudentCompleteDetail,
  majorFallbackMap?: Map<string, Major>,
): ResolvedChoiceStatuses {
  const ch1Choice = student.major_choices?.find((c) => c.choice_order === 1);
  const ch2Choice = student.major_choices?.find((c) => c.choice_order === 2);

  const ch1Major: Major | undefined =
    ch1Choice?.major ||
    (ch1Choice?.major_id ? majorFallbackMap?.get(ch1Choice.major_id) : undefined);

  const ch2Major: Major | undefined =
    ch2Choice?.major ||
    (ch2Choice?.major_id ? majorFallbackMap?.get(ch2Choice.major_id) : undefined);

  const hasChoice2 = Boolean(ch2Major);
  const selRes = student.selection_results;

  // ── Choice 1 ─────────────────────────────────────────────────────────────
  // Use the DB-populated field first; fall back to student.status only for
  // legacy records that predate the selection engine (e.g. mock store entries
  // or rows created before the two-stage scoring migration).
  let ch1Status: Ch1Status = selRes?.choice1_status ?? 'pending';

  if (!selRes?.choice1_status) {
    if (student.status === 'Diterima') {
      // Accepted at priority 2 means choice 1 was displaced
      ch1Status = selRes?.final_accepted_from_priority === 2 ? 'rejected' : 'accepted';
    } else if (student.status === 'Tidak Diterima') {
      ch1Status = 'rejected';
    }
    // Otherwise stays 'pending' (Menunggu Verifikasi / Terverifikasi / etc.)
  }

  // ── Choice 2 ─────────────────────────────────────────────────────────────
  let ch2Status: Ch2Status = hasChoice2
    ? (selRes?.choice2_status ?? 'pending')
    : 'not_applicable';

  if (hasChoice2 && !selRes?.choice2_status) {
    if (ch1Status === 'accepted') {
      // Already placed at choice 1 — choice 2 is never evaluated
      ch2Status = 'not_applicable';
    } else if (student.status === 'Diterima' && selRes?.final_accepted_from_priority === 2) {
      ch2Status = 'accepted';
    } else if (student.status === 'Tidak Diterima') {
      ch2Status = 'rejected';
    }
    // Otherwise stays 'pending'
  }

  // ── Final banners ─────────────────────────────────────────────────────────
  const isAcceptedChoice1 =
    student.status === 'Diterima' &&
    (selRes?.final_accepted_from_priority === 1 ||
      (!selRes?.final_accepted_from_priority && ch1Status === 'accepted'));

  const isAcceptedChoice2 =
    student.status === 'Diterima' &&
    (selRes?.final_accepted_from_priority === 2 || ch2Status === 'accepted');

  return {
    ch1Major,
    ch2Major,
    hasChoice2,
    ch1Rank: selRes?.choice1_rank ?? selRes?.rank ?? null,
    ch1Quota: ch1Major?.quota ?? 72,
    ch1Status,
    ch2Rank: selRes?.choice2_rank ?? null,
    ch2Quota: ch2Major?.quota ?? 36,
    ch2Status,
    isAcceptedChoice1,
    isAcceptedChoice2,
  };
}
