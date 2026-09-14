-- ============================================================================
-- Migration: Atomic Student Registration Database Transaction
-- ============================================================================

-- Stored procedure to execute the complete student registration process
-- atomically inside a single ACID database transaction.
-- If any part (students, parent_data, major_choices, report_scores, achievements,
-- documents) fails, all changes are automatically rolled back.

CREATE OR REPLACE FUNCTION public.register_student_atomic(p_data JSONB)
RETURNS JSONB AS $$
DECLARE
    v_student_id UUID;
    v_registration_number TEXT;
    v_source_school_id UUID := NULL;
    v_score_item JSONB;
    v_ach_item JSONB;
    v_photo_url TEXT;
    v_diploma_url TEXT;
    v_kk_url TEXT;
    v_choice1_id UUID;
    v_choice2_id UUID;
BEGIN
    -- 1. Parse and validate source_school_id
    IF p_data->>'source_school_id' IS NOT NULL AND p_data->>'source_school_id' <> '' THEN
        BEGIN
            v_source_school_id := (p_data->>'source_school_id')::UUID;
        EXCEPTION WHEN OTHERS THEN
            v_source_school_id := NULL;
        END;
    END IF;

    -- 2. Insert Student Record
    INSERT INTO public.students (
        full_name,
        nisn,
        nik,
        birth_place,
        birth_date,
        gender,
        religion,
        address,
        phone,
        email,
        source_school_id,
        source_school_name,
        graduation_year,
        status
    ) VALUES (
        p_data->>'full_name',
        NULLIF(TRIM(p_data->>'nisn'), ''),
        NULLIF(TRIM(p_data->>'nik'), ''),
        p_data->>'birth_place',
        (p_data->>'birth_date')::DATE,
        p_data->>'gender',
        p_data->>'religion',
        p_data->>'address',
        p_data->>'phone',
        p_data->>'email',
        v_source_school_id,
        p_data->>'source_school_name',
        COALESCE((p_data->>'graduation_year')::INT, 2026),
        'Menunggu Verifikasi'
    )
    RETURNING id, registration_number INTO v_student_id, v_registration_number;

    -- 3. Insert Parent Data
    INSERT INTO public.parent_data (
        student_id,
        father_name,
        mother_name,
        parent_job,
        parent_phone,
        parent_address
    ) VALUES (
        v_student_id,
        p_data->>'father_name',
        p_data->>'mother_name',
        NULLIF(TRIM(p_data->>'parent_job'), ''),
        p_data->>'parent_phone',
        NULLIF(TRIM(p_data->>'parent_address'), '')
    );

    -- 4. Insert Major Choices
    v_choice1_id := (p_data->>'choice_1_major_id')::UUID;
    INSERT INTO public.major_choices (student_id, major_id, choice_order)
    VALUES (v_student_id, v_choice1_id, 1);

    IF p_data->>'choice_2_major_id' IS NOT NULL 
       AND p_data->>'choice_2_major_id' <> '' 
       AND p_data->>'choice_2_major_id' <> p_data->>'choice_1_major_id' THEN
        v_choice2_id := (p_data->>'choice_2_major_id')::UUID;
        INSERT INTO public.major_choices (student_id, major_id, choice_order)
        VALUES (v_student_id, v_choice2_id, 2);
    END IF;

    -- 5. Insert Report Scores (25 records across 5 semesters)
    IF p_data->'report_scores' IS NOT NULL AND jsonb_array_length(p_data->'report_scores') > 0 THEN
        FOR v_score_item IN SELECT * FROM jsonb_array_elements(p_data->'report_scores')
        LOOP
            INSERT INTO public.report_scores (student_id, semester, subject, score)
            VALUES (
                v_student_id,
                (v_score_item->>'semester')::INT,
                v_score_item->>'subject',
                (v_score_item->>'score')::NUMERIC(5,2)
            );
        END LOOP;
    END IF;

    -- 6. Insert Achievements
    IF p_data->'achievements' IS NOT NULL AND jsonb_array_length(p_data->'achievements') > 0 THEN
        FOR v_ach_item IN SELECT * FROM jsonb_array_elements(p_data->'achievements')
        LOOP
            INSERT INTO public.achievements (student_id, level, title, description, file_url)
            VALUES (
                v_student_id,
                v_ach_item->>'level',
                v_ach_item->>'title',
                NULLIF(TRIM(v_ach_item->>'description'), ''),
                NULLIF(TRIM(v_ach_item->>'file_url'), '')
            );
        END LOOP;
    END IF;

    -- 7. Insert Documents
    v_photo_url := NULLIF(TRIM(p_data->>'photo_url'), '');
    IF v_photo_url IS NOT NULL THEN
        INSERT INTO public.documents (student_id, document_type, file_url)
        VALUES (v_student_id, 'foto_3x4', v_photo_url);
    END IF;

    v_diploma_url := NULLIF(TRIM(p_data->>'diploma_url'), '');
    IF v_diploma_url IS NOT NULL THEN
        INSERT INTO public.documents (student_id, document_type, file_url)
        VALUES (v_student_id, 'ijazah_skl', v_diploma_url);
    END IF;

    v_kk_url := NULLIF(TRIM(p_data->>'family_card_url'), '');
    IF v_kk_url IS NOT NULL THEN
        INSERT INTO public.documents (student_id, document_type, file_url)
        VALUES (v_student_id, 'kartu_keluarga', v_kk_url);
    END IF;

    -- 8. Explicitly invoke score calculation to sync average_report_score, achievement_score, and total_score
    PERFORM public.fn_calculate_student_score(v_student_id);

    RETURN jsonb_build_object(
        'success', true,
        'student_id', v_student_id,
        'registration_number', v_registration_number
    );
EXCEPTION WHEN OTHERS THEN
    -- In PostgreSQL functions, any uncaught exception causes an automatic transaction rollback
    RAISE EXCEPTION 'Pendaftaran gagal: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution to all roles including anonymous public applicant
GRANT EXECUTE ON FUNCTION public.register_student_atomic(JSONB) TO anon, authenticated, service_role;
