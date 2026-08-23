-- ============================================================================
-- Migration 03: Row Level Security (RLS) Policies
-- ============================================================================

-- Helper function: Check if current authenticated user is an admin/operator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        auth.role() = 'authenticated' AND EXISTS (
            SELECT 1 FROM public.admin_profiles
            WHERE user_id = auth.uid()
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 1. Enable RLS on all tables
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.majors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.major_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.selection_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;


-- 2. Policies for: schools
DROP POLICY IF EXISTS "Public can view school profile" ON public.schools;
CREATE POLICY "Public can view school profile"
    ON public.schools FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can manage school profile" ON public.schools;
CREATE POLICY "Admins can manage school profile"
    ON public.schools FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());


-- 3. Policies for: majors
DROP POLICY IF EXISTS "Public can view active majors" ON public.majors;
CREATE POLICY "Public can view active majors"
    ON public.majors FOR SELECT
    USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage majors" ON public.majors;
CREATE POLICY "Admins can manage majors"
    ON public.majors FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());


-- 4. Policies for: source_schools
DROP POLICY IF EXISTS "Public can view source schools" ON public.source_schools;
CREATE POLICY "Public can view source schools"
    ON public.source_schools FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can manage source schools" ON public.source_schools;
CREATE POLICY "Admins can manage source schools"
    ON public.source_schools FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());


-- 5. Policies for: students
DROP POLICY IF EXISTS "Public can submit registration" ON public.students;
CREATE POLICY "Public can submit registration"
    ON public.students FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Public can check student status" ON public.students;
CREATE POLICY "Public can check student status"
    ON public.students FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins have full access to students" ON public.students;
CREATE POLICY "Admins have full access to students"
    ON public.students FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());


-- 6. Policies for: parent_data
DROP POLICY IF EXISTS "Public can submit parent data" ON public.parent_data;
CREATE POLICY "Public can submit parent data"
    ON public.parent_data FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins have full access to parent data" ON public.parent_data;
CREATE POLICY "Admins have full access to parent data"
    ON public.parent_data FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());


-- 7. Policies for: report_scores
DROP POLICY IF EXISTS "Public can submit report scores" ON public.report_scores;
CREATE POLICY "Public can submit report scores"
    ON public.report_scores FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view report scores" ON public.report_scores;
CREATE POLICY "Public can view report scores"
    ON public.report_scores FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins have full access to report scores" ON public.report_scores;
CREATE POLICY "Admins have full access to report scores"
    ON public.report_scores FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());


-- 8. Policies for: achievements
DROP POLICY IF EXISTS "Public can submit achievements" ON public.achievements;
CREATE POLICY "Public can submit achievements"
    ON public.achievements FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view achievements" ON public.achievements;
CREATE POLICY "Public can view achievements"
    ON public.achievements FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins have full access to achievements" ON public.achievements;
CREATE POLICY "Admins have full access to achievements"
    ON public.achievements FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());


-- 9. Policies for: documents
DROP POLICY IF EXISTS "Public can upload documents" ON public.documents;
CREATE POLICY "Public can upload documents"
    ON public.documents FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view documents" ON public.documents;
CREATE POLICY "Public can view documents"
    ON public.documents FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins have full access to documents" ON public.documents;
CREATE POLICY "Admins have full access to documents"
    ON public.documents FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());


-- 10. Policies for: major_choices
DROP POLICY IF EXISTS "Public can submit major choices" ON public.major_choices;
CREATE POLICY "Public can submit major choices"
    ON public.major_choices FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view major choices" ON public.major_choices;
CREATE POLICY "Public can view major choices"
    ON public.major_choices FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins have full access to major choices" ON public.major_choices;
CREATE POLICY "Admins have full access to major choices"
    ON public.major_choices FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());


-- 11. Policies for: selection_results
DROP POLICY IF EXISTS "Public can view published selection results" ON public.selection_results;
CREATE POLICY "Public can view published selection results"
    ON public.selection_results FOR SELECT
    USING (published_at IS NOT NULL OR public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to selection results" ON public.selection_results;
CREATE POLICY "Admins have full access to selection results"
    ON public.selection_results FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());


-- 12. Policies for: announcements
DROP POLICY IF EXISTS "Public can view published announcements" ON public.announcements;
CREATE POLICY "Public can view published announcements"
    ON public.announcements FOR SELECT
    USING (status = 'Published' OR public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to announcements" ON public.announcements;
CREATE POLICY "Admins have full access to announcements"
    ON public.announcements FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());


-- 13. Policies for: admin_profiles
DROP POLICY IF EXISTS "Admins can view their own profile" ON public.admin_profiles;
CREATE POLICY "Admins can view their own profile"
    ON public.admin_profiles FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage admin profiles" ON public.admin_profiles;
CREATE POLICY "Admins can manage admin profiles"
    ON public.admin_profiles FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
