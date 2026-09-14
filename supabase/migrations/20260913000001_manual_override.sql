-- ============================================================================
-- Migration: Add is_manual_override flag to selection_results
-- PRD 5.4.2: Menandai hasil seleksi manual override agar tidak tertimpa seleksi ulang
-- ============================================================================

ALTER TABLE public.selection_results 
ADD COLUMN IF NOT EXISTS is_manual_override BOOLEAN NOT NULL DEFAULT false;

-- Add index for quick lookup of manual overrides
CREATE INDEX IF NOT EXISTS idx_selection_results_manual_override 
ON public.selection_results (student_id) 
WHERE is_manual_override = true;
