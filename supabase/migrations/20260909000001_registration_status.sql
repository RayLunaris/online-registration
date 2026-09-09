-- Migration: 20260909000001_registration_status.sql
-- Description: Add registration status control (manual toggle & scheduled auto-close) to schools table

-- 1. Alter schools table
ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS registration_status TEXT CHECK (registration_status IN ('open', 'closed')) DEFAULT 'open',
ADD COLUMN IF NOT EXISTS registration_close_date TIMESTAMPTZ NULL;

-- 2. Create function get_registration_status()
CREATE OR REPLACE FUNCTION public.get_registration_status()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status TEXT;
  v_close_date TIMESTAMPTZ;
BEGIN
  SELECT registration_status, registration_close_date
  INTO v_status, v_close_date
  FROM public.schools
  LIMIT 1;

  -- If no school record exists yet, default to open (true)
  IF NOT FOUND THEN
    RETURN true;
  END IF;

  -- 1. Manual closed override wins
  IF v_status = 'closed' THEN
    RETURN false;
  END IF;

  -- 2. Automatic scheduled close date passed
  IF v_close_date IS NOT NULL AND now() > v_close_date THEN
    RETURN false;
  END IF;

  -- 3. Otherwise registration is open
  RETURN true;
END;
$$;

-- 3. Grant permissions for public/anon and authenticated users
GRANT EXECUTE ON FUNCTION public.get_registration_status() TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.get_registration_status() IS 'Calculates effective SPMB registration status considering manual admin toggle and automatic close date.';
