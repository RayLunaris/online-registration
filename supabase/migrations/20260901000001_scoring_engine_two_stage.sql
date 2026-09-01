-- ============================================================================
-- Migration: Scoring Engine 2-Stage Multi-Choice Selection
-- ============================================================================

-- 1. ALTER TABLE: selection_results to store evaluations of BOTH choices
ALTER TABLE public.selection_results 
    ADD COLUMN IF NOT EXISTS choice1_major_id UUID REFERENCES public.majors(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS choice1_rank INT,
    ADD COLUMN IF NOT EXISTS choice1_status VARCHAR(50) DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS choice2_major_id UUID REFERENCES public.majors(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS choice2_rank INT,
    ADD COLUMN IF NOT EXISTS choice2_status VARCHAR(50) DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS final_accepted_major_id UUID REFERENCES public.majors(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS final_accepted_from_priority INT CHECK (final_accepted_from_priority IN (1, 2));

-- Add check constraints for statuses if not already present
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_selection_choice1_status'
    ) THEN
        ALTER TABLE public.selection_results
            ADD CONSTRAINT chk_selection_choice1_status 
            CHECK (choice1_status IN ('accepted', 'rejected', 'pending'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_selection_choice2_status'
    ) THEN
        ALTER TABLE public.selection_results
            ADD CONSTRAINT chk_selection_choice2_status 
            CHECK (choice2_status IN ('accepted', 'rejected', 'not_applicable', 'pending'));
    END IF;
END $$;


-- 2. Stored Procedure: run_selection_process() with 2-stage cascading logic
CREATE OR REPLACE FUNCTION public.run_selection_process()
RETURNS JSONB AS $$
DECLARE
    v_total_processed INT := 0;
    v_total_accepted_ch1 INT := 0;
    v_total_accepted_ch2 INT := 0;
    v_total_rejected INT := 0;
    v_now TIMESTAMPTZ := now();
    v_major RECORD;
    v_sisa_kuota INT;
    v_accepted_ch1_count INT;
    v_details_by_major JSONB := '[]'::JSONB;
BEGIN
    -- 1. Pastikan semua siswa (yang tidak dalam status Draft) telah terhitung total_score (70% Rapor + 30% Prestasi)
    PERFORM public.fn_calculate_student_score(s.id)
    FROM public.students s
    WHERE s.status IS DISTINCT FROM 'Draft';

    -- Buat temporary table / workspace untuk kalkulasi alokasi 2 tahap
    CREATE TEMP TABLE IF NOT EXISTS tmp_selection_calc (
        student_id UUID PRIMARY KEY,
        total_score NUMERIC(6,2),
        avg_report NUMERIC(6,2),
        ach_points NUMERIC(6,2),
        created_at TIMESTAMPTZ,
        choice1_major_id UUID,
        choice1_rank INT,
        choice1_status VARCHAR(50) DEFAULT 'pending',
        choice2_major_id UUID,
        choice2_rank INT,
        choice2_status VARCHAR(50) DEFAULT 'pending',
        final_accepted_major_id UUID,
        final_accepted_from_priority INT,
        final_status VARCHAR(50)
    ) ON COMMIT DROP;

    TRUNCATE TABLE tmp_selection_calc;

    -- Masukkan seluruh data siswa aktif dan pilihan jurusannya
    INSERT INTO tmp_selection_calc (
        student_id, total_score, avg_report, ach_points, created_at,
        choice1_major_id, choice2_major_id, choice2_status
    )
    SELECT 
        s.id,
        COALESCE(s.total_score, 0.00),
        COALESCE(s.average_report_score, 0.00),
        COALESCE(s.achievement_score, 0.00),
        s.created_at,
        mc1.major_id AS choice1_major_id,
        mc2.major_id AS choice2_major_id,
        CASE WHEN mc2.major_id IS NULL THEN 'not_applicable' ELSE 'pending' END AS choice2_status
    FROM public.students s
    INNER JOIN public.major_choices mc1 ON mc1.student_id = s.id AND mc1.choice_order = 1
    LEFT JOIN public.major_choices mc2 ON mc2.student_id = s.id AND mc2.choice_order = 2
    WHERE s.status IS DISTINCT FROM 'Draft';

    GET DIAGNOSTICS v_total_processed = ROW_COUNT;

    -- 2. TAHAP 1: Per jurusan, ranking siswa yang memilihnya sebagai PILIHAN 1 (Score DESC)
    -- Rank <= kuota -> choice1_status = 'accepted', sisanya 'rejected'
    FOR v_major IN SELECT id, code, name, quota FROM public.majors WHERE is_active = TRUE ORDER BY code ASC LOOP
        WITH ranked_ch1 AS (
            SELECT 
                student_id,
                ROW_NUMBER() OVER (
                    ORDER BY total_score DESC, avg_report DESC, ach_points DESC, created_at ASC
                ) AS calc_rank
            FROM tmp_selection_calc
            WHERE choice1_major_id = v_major.id
        )
        UPDATE tmp_selection_calc t
        SET 
            choice1_rank = r.calc_rank,
            choice1_status = CASE WHEN r.calc_rank <= v_major.quota THEN 'accepted' ELSE 'rejected' END
        FROM ranked_ch1 r
        WHERE t.student_id = r.student_id;
    END LOOP;

    -- 3. TAHAP 2: Untuk siswa yang choice1_status = 'rejected', ambil jurusan pilihan 2 mereka.
    -- Hitung sisa kuota tiap jurusan (kuota dikurangi yang sudah accepted dari tahap 1 pilihan 1)
    FOR v_major IN SELECT id, code, name, quota FROM public.majors WHERE is_active = TRUE ORDER BY code ASC LOOP
        -- Hitung berapa yang sudah accepted dari pilihan 1 pada jurusan ini
        SELECT COUNT(*)
        INTO v_accepted_ch1_count
        FROM tmp_selection_calc
        WHERE choice1_major_id = v_major.id AND choice1_status = 'accepted';

        v_sisa_kuota := GREATEST(0, v_major.quota - v_accepted_ch1_count);

        -- Ranking siswa yang qualify untuk tahap 2 ini (choice1_status = 'rejected' dan choice2_major_id = v_major.id)
        WITH ranked_ch2 AS (
            SELECT 
                student_id,
                ROW_NUMBER() OVER (
                    ORDER BY total_score DESC, avg_report DESC, ach_points DESC, created_at ASC
                ) AS calc_rank
            FROM tmp_selection_calc
            WHERE choice1_status = 'rejected' AND choice2_major_id = v_major.id
        )
        UPDATE tmp_selection_calc t
        SET 
            choice2_rank = r.calc_rank,
            choice2_status = CASE WHEN (v_sisa_kuota > 0 AND r.calc_rank <= v_sisa_kuota) THEN 'accepted' ELSE 'rejected' END
        FROM ranked_ch2 r
        WHERE t.student_id = r.student_id;

        -- Catat breakdown detail per jurusan
        v_details_by_major := v_details_by_major || jsonb_build_object(
            'major_id', v_major.id,
            'major_code', v_major.code,
            'major_name', v_major.name,
            'quota', v_major.quota,
            'accepted_from_ch1', v_accepted_ch1_count,
            'remaining_quota_for_ch2', v_sisa_kuota,
            'accepted_from_ch2', (
                SELECT COUNT(*) FROM tmp_selection_calc 
                WHERE choice2_major_id = v_major.id AND choice2_status = 'accepted'
            )
        );
    END LOOP;

    -- Bagi siswa yang sudah accepted di pilihan 1, set choice2_status = 'not_applicable' jika belum di-set
    UPDATE tmp_selection_calc
    SET choice2_status = 'not_applicable'
    WHERE choice1_status = 'accepted' AND choice2_status = 'pending';

    -- 4. Tentukan final_accepted_major_id, final_accepted_from_priority, dan final_status:
    -- - Jika choice1_status = 'accepted' -> final = pilihan 1, from_priority = 1, status = 'Diterima'
    -- - Else if choice2_status = 'accepted' -> final = pilihan 2, from_priority = 2, status = 'Diterima'
    -- - Else -> final = NULL, from_priority = NULL, status = 'Tidak Diterima'
    UPDATE tmp_selection_calc
    SET 
        final_accepted_major_id = CASE 
            WHEN choice1_status = 'accepted' THEN choice1_major_id
            WHEN choice2_status = 'accepted' THEN choice2_major_id
            ELSE NULL 
        END,
        final_accepted_from_priority = CASE 
            WHEN choice1_status = 'accepted' THEN 1
            WHEN choice2_status = 'accepted' THEN 2
            ELSE NULL 
        END,
        final_status = CASE 
            WHEN choice1_status = 'accepted' OR choice2_status = 'accepted' THEN 'Diterima'
            ELSE 'Tidak Diterima'
        END;

    -- Hitung agregat total
    SELECT COUNT(*) INTO v_total_accepted_ch1 FROM tmp_selection_calc WHERE final_accepted_from_priority = 1;
    SELECT COUNT(*) INTO v_total_accepted_ch2 FROM tmp_selection_calc WHERE final_accepted_from_priority = 2;
    SELECT COUNT(*) INTO v_total_rejected FROM tmp_selection_calc WHERE final_accepted_major_id IS NULL;

    -- 5. Upsert ke selection_results dan update students table
    INSERT INTO public.selection_results (
        student_id,
        major_id, -- backward compatible alias for final_accepted_major_id
        choice1_major_id,
        choice1_rank,
        choice1_status,
        choice2_major_id,
        choice2_rank,
        choice2_status,
        final_accepted_major_id,
        final_accepted_from_priority,
        score,
        rank,
        status,
        notes,
        published_at,
        updated_at
    )
    SELECT 
        t.student_id,
        t.final_accepted_major_id,
        t.choice1_major_id,
        t.choice1_rank,
        t.choice1_status,
        t.choice2_major_id,
        t.choice2_rank,
        t.choice2_status,
        t.final_accepted_major_id,
        t.final_accepted_from_priority,
        t.total_score,
        CASE WHEN t.final_accepted_from_priority = 1 THEN t.choice1_rank ELSE t.choice2_rank END,
        t.final_status,
        CASE 
            WHEN t.final_accepted_from_priority = 1 THEN 'Diterima pada Pilihan 1 (Utama)'
            WHEN t.final_accepted_from_priority = 2 THEN 'Diterima pada Pilihan 2 (Alternatif - tergeser dari Pilihan 1)'
            ELSE 'Belum memenuhi kuota pada kedua pilihan jurusan'
        END,
        v_now,
        v_now
    FROM tmp_selection_calc t
    ON CONFLICT (student_id) DO UPDATE SET
        major_id = EXCLUDED.major_id,
        choice1_major_id = EXCLUDED.choice1_major_id,
        choice1_rank = EXCLUDED.choice1_rank,
        choice1_status = EXCLUDED.choice1_status,
        choice2_major_id = EXCLUDED.choice2_major_id,
        choice2_rank = EXCLUDED.choice2_rank,
        choice2_status = EXCLUDED.choice2_status,
        final_accepted_major_id = EXCLUDED.final_accepted_major_id,
        final_accepted_from_priority = EXCLUDED.final_accepted_from_priority,
        score = EXCLUDED.score,
        rank = EXCLUDED.rank,
        status = EXCLUDED.status,
        notes = EXCLUDED.notes,
        published_at = EXCLUDED.published_at,
        updated_at = EXCLUDED.updated_at;

    -- Update students status
    UPDATE public.students s
    SET 
        status = t.final_status,
        total_score = t.total_score,
        updated_at = v_now
    FROM tmp_selection_calc t
    WHERE s.id = t.student_id;

    -- 6. Return Summary JSON
    RETURN jsonb_build_object(
        'success', true,
        'total_processed', v_total_processed,
        'total_accepted_choice_1', v_total_accepted_ch1,
        'total_accepted_choice_2', v_total_accepted_ch2,
        'total_rejected', v_total_rejected,
        'details_by_major', v_details_by_major,
        'published_at', v_now
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
