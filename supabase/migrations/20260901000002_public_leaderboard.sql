-- ============================================================================
-- Migration: Public Leaderboard VIEW & Privacy Masking Function
-- ============================================================================

-- 1. ALTER TABLE: schools - Add show_public_leaderboard toggle
ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS show_public_leaderboard BOOLEAN NOT NULL DEFAULT false;

-- 2. FUNCTION: mask_name(full_name TEXT) RETURNS TEXT
-- Masking pattern: Ambil kata pertama nama lengkap + inisial huruf pertama kata kedua + titik.
-- Contoh: "Ahmad Fauzi Rahman" -> "Ahmad F.", "Siti Nurhaliza" -> "Siti N.", "Budi" -> "Budi"
CREATE OR REPLACE FUNCTION public.mask_name(full_name TEXT)
RETURNS TEXT AS $$
DECLARE
    v_trimmed TEXT;
    v_parts TEXT[];
BEGIN
    v_trimmed := TRIM(COALESCE(full_name, ''));
    IF v_trimmed = '' THEN
        RETURN '';
    END IF;

    -- Split string by one or more whitespace characters
    v_parts := regexp_split_to_array(v_trimmed, '\s+');

    -- Jika terdiri dari 2 kata atau lebih, ambil kata pertama + spasi + inisial kata kedua + titik
    IF array_length(v_parts, 1) >= 2 THEN
        RETURN v_parts[1] || ' ' || UPPER(SUBSTRING(v_parts[2] FROM 1 FOR 1)) || '.';
    ELSE
        -- Jika hanya 1 kata nama tunggal
        RETURN v_parts[1];
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE SECURITY DEFINER;

-- 3. VIEW: public_leaderboard
-- Hanya meng-expose kolom yang aman untuk publik tanpa data sensitif:
-- - registration_number (untuk pencarian posisi siswa)
-- - masked_name (nama tersamar dengan function mask_name)
-- - major_id & major_name
-- - total_score (skor akumulasi)
-- - rank_in_major (peringkat siswa dalam jurusan tersebut)
-- - is_within_quota (apakah peringkat berada dalam batas kuota jurusan)
DROP VIEW IF EXISTS public.public_leaderboard CASCADE;

CREATE OR REPLACE VIEW public.public_leaderboard AS
SELECT 
    s.registration_number,
    public.mask_name(s.full_name) AS masked_name,
    m.id AS major_id,
    m.name AS major_name,
    COALESCE(sr.score, s.total_score, 0.00) AS total_score,
    (
        ROW_NUMBER() OVER (
            PARTITION BY m.id 
            ORDER BY 
                COALESCE(sr.score, s.total_score, 0.00) DESC,
                COALESCE(s.average_report_score, 0.00) DESC,
                COALESCE(s.achievement_score, 0.00) DESC,
                s.created_at ASC
        )
    )::INT AS rank_in_major,
    (
        ROW_NUMBER() OVER (
            PARTITION BY m.id 
            ORDER BY 
                COALESCE(sr.score, s.total_score, 0.00) DESC,
                COALESCE(s.average_report_score, 0.00) DESC,
                COALESCE(s.achievement_score, 0.00) DESC,
                s.created_at ASC
        ) <= m.quota
    )::BOOLEAN AS is_within_quota
FROM public.students s
LEFT JOIN public.selection_results sr ON sr.student_id = s.id
LEFT JOIN public.major_choices mc1 ON mc1.student_id = s.id AND mc1.choice_order = 1
INNER JOIN public.majors m ON m.id = COALESCE(sr.final_accepted_major_id, sr.choice1_major_id, sr.major_id, mc1.major_id)
WHERE 
    s.status NOT IN ('Draft')
    AND m.is_active = true
ORDER BY m.id, total_score DESC;

-- 4. PERMISSIONS & RLS FOR VIEW
-- View public_leaderboard dapat di-SELECT oleh siapa saja (anon & authenticated)
-- karena seluruh data privasi telah di-mask di level database (SQL View).
ALTER VIEW public.public_leaderboard OWNER TO postgres;
GRANT SELECT ON public.public_leaderboard TO anon, authenticated;
