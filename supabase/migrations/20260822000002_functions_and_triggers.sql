-- ============================================================================
-- Migration 02: PostgreSQL Functions, Triggers, & Scoring Engine
-- ============================================================================

-- 1. Helper function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
DROP TRIGGER IF EXISTS trg_schools_updated_at ON public.schools;
CREATE TRIGGER trg_schools_updated_at
    BEFORE UPDATE ON public.schools
    FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_majors_updated_at ON public.majors;
CREATE TRIGGER trg_majors_updated_at
    BEFORE UPDATE ON public.majors
    FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_students_updated_at ON public.students;
CREATE TRIGGER trg_students_updated_at
    BEFORE UPDATE ON public.students
    FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_parent_data_updated_at ON public.parent_data;
CREATE TRIGGER trg_parent_data_updated_at
    BEFORE UPDATE ON public.parent_data
    FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_selection_results_updated_at ON public.selection_results;
CREATE TRIGGER trg_selection_results_updated_at
    BEFORE UPDATE ON public.selection_results
    FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_announcements_updated_at ON public.announcements;
CREATE TRIGGER trg_announcements_updated_at
    BEFORE UPDATE ON public.announcements
    FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_admin_profiles_updated_at ON public.admin_profiles;
CREATE TRIGGER trg_admin_profiles_updated_at
    BEFORE UPDATE ON public.admin_profiles
    FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


-- 2. Sequence & Trigger for Registration Number Generation (REG-YYYY-XXXXX)
CREATE SEQUENCE IF NOT EXISTS public.registration_number_seq START 1;

CREATE OR REPLACE FUNCTION public.fn_generate_registration_number()
RETURNS TRIGGER AS $$
DECLARE
    v_year TEXT;
    v_seq_num BIGINT;
    v_new_reg_num TEXT;
BEGIN
    IF NEW.registration_number IS NULL OR NEW.registration_number = '' THEN
        v_year := to_char(now(), 'YYYY');
        v_seq_num := nextval('public.registration_number_seq');
        v_new_reg_num := 'REG-' || v_year || '-' || lpad(v_seq_num::TEXT, 5, '0');
        NEW.registration_number := v_new_reg_num;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_registration_number ON public.students;
CREATE TRIGGER trg_generate_registration_number
    BEFORE INSERT ON public.students
    FOR EACH ROW EXECUTE FUNCTION public.fn_generate_registration_number();


-- 3. Auto calculate points for achievements based on level
CREATE OR REPLACE FUNCTION public.fn_set_achievement_points()
RETURNS TRIGGER AS $$
BEGIN
    NEW.points := CASE NEW.level
        WHEN 'Internasional' THEN 100.00
        WHEN 'Nasional' THEN 80.00
        WHEN 'Provinsi' THEN 60.00
        WHEN 'Kabupaten/Kota' THEN 40.00
        WHEN 'Sekolah' THEN 20.00
        ELSE 0.00
    END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_achievement_points ON public.achievements;
CREATE TRIGGER trg_set_achievement_points
    BEFORE INSERT OR UPDATE ON public.achievements
    FOR EACH ROW EXECUTE FUNCTION public.fn_set_achievement_points();


-- 4. Scoring Engine Function: Calculates 70% Report Average + 30% Achievement Score
CREATE OR REPLACE FUNCTION public.fn_calculate_student_score(p_student_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    v_avg_report NUMERIC(6,2) := 0.00;
    v_max_achievement NUMERIC(6,2) := 0.00;
    v_total_score NUMERIC(6,2) := 0.00;
BEGIN
    -- 1. Hitung rata-rata nilai rapor dari seluruh semester & mapel yang dimasukkan
    SELECT COALESCE(AVG(score), 0.00)
    INTO v_avg_report
    FROM public.report_scores
    WHERE student_id = p_student_id;

    -- 2. Ambil nilai prestasi tertinggi (atau akumulasi maksimal 100 poin)
    SELECT COALESCE(MAX(points), 0.00)
    INTO v_max_achievement
    FROM public.achievements
    WHERE student_id = p_student_id;

    -- 3. Formula: 70% Rapor + 30% Prestasi
    v_total_score := (v_avg_report * 0.70) + (v_max_achievement * 0.30);

    -- 4. Update tabel students
    UPDATE public.students
    SET 
        average_report_score = v_avg_report,
        achievement_score = v_max_achievement,
        total_score = v_total_score,
        updated_at = now()
    WHERE id = p_student_id;

    RETURN v_total_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5. Trigger to recalculate score when report_scores or achievements change
CREATE OR REPLACE FUNCTION public.fn_trigger_recalculate_student_score()
RETURNS TRIGGER AS $$
DECLARE
    v_target_student_id UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_target_student_id := OLD.student_id;
    ELSE
        v_target_student_id := NEW.student_id;
    END IF;

    PERFORM public.fn_calculate_student_score(v_target_student_id);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_recalc_score_report ON public.report_scores;
CREATE TRIGGER trg_recalc_score_report
    AFTER INSERT OR UPDATE OR DELETE ON public.report_scores
    FOR EACH ROW EXECUTE FUNCTION public.fn_trigger_recalculate_student_score();

DROP TRIGGER IF EXISTS trg_recalc_score_achievement ON public.achievements;
CREATE TRIGGER trg_recalc_score_achievement
    AFTER INSERT OR UPDATE OR DELETE ON public.achievements
    FOR EACH ROW EXECUTE FUNCTION public.fn_trigger_recalculate_student_score();


-- 6. Trigger to create admin profile automatically upon Supabase Auth sign-up
CREATE OR REPLACE FUNCTION public.fn_handle_new_admin_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.admin_profiles (user_id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Admin SPMB'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'admin')
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.fn_handle_new_admin_user();
