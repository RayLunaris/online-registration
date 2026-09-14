import { useEffect, useRef, useCallback } from 'react';
import { RegistrationFormData } from '@/types/spmb';

const DRAFT_KEY = 'registration_draft_v1';
const DEBOUNCE_MS = 800;

export interface DraftPayload {
  formData: RegistrationFormData;
  currentStep: number;
  savedAt: string;
}

export interface SaveDraftOptions {
  immediate?: boolean;
}

/** Read the saved draft from localStorage, or return null if absent/corrupt. */
export function readDraft(): DraftPayload | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DraftPayload;
  } catch {
    return null;
  }
}

/** Immediately remove the saved draft (call after successful submit or manual reset). */
export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Quota exceeded or private browsing — silently ignore
  }
}

/**
 * useFormDraft
 *
 * Persists registration form data and current wizard step to localStorage.
 * Supports debounced writes for rapid keystrokes, immediate writes for step navigation,
 * and flushes pending writes on beforeunload/pagehide so closing the tab never loses progress.
 */
export function useFormDraft() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPayloadRef = useRef<DraftPayload | null>(null);

  const writeToStorage = useCallback((payload: DraftPayload) => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
      pendingPayloadRef.current = null;
    } catch {
      // Quota exceeded or private browsing — silently ignore
    }
  }, []);

  const saveDraft = useCallback(
    (formData: RegistrationFormData, currentStep: number, options?: SaveDraftOptions) => {
      const payload: DraftPayload = {
        formData,
        currentStep,
        savedAt: new Date().toISOString(),
      };
      pendingPayloadRef.current = payload;

      if (options?.immediate) {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        writeToStorage(payload);
        return;
      }

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        writeToStorage(payload);
        timerRef.current = null;
      }, DEBOUNCE_MS);
    },
    [writeToStorage]
  );

  // Flush any pending write immediately
  const flush = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (pendingPayloadRef.current) {
      writeToStorage(pendingPayloadRef.current);
    }
  }, [writeToStorage]);

  // Flush on tab close / pagehide / unmount so closing the tab never loses progress
  useEffect(() => {
    const handleBeforeUnload = () => {
      flush();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      flush();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, [flush]);

  return { saveDraft, flush };
}
