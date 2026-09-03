-- ============================================================================
-- FULL CONSOLIDATED DATABASE SCHEMA & SEED FOR SPMB SUPABASE
-- You can run this directly in the Supabase SQL Editor!
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. TABLES
-- ----------------------------------------------------------------------------

-- Table: schools (School Profile & Configuration)
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL DEFAULT 'SMK Negeri 1 Digital Teknologi',
    npsn VARCHAR(50) NOT NULL DEFAULT '12345678',
    address TEXT NOT NULL DEFAULT 'Jl. Pendidikan No. 123, Kota Cerdas',
    phone VARCHAR(50) DEFAULT '021-12345678',
    email VARCHAR(100) DEFAULT 'info@smkdigital.sch.id',
    academic_year VARCHAR(20) NOT NULL DEFAULT '2026/2027',
    logo_url TEXT,
    target_students INT DEFAULT 500,
    hero_tagline TEXT DEFAULT 'Membangun Generasi Unggul di Era Digital',
    hero_description TEXT DEFAULT 'Bergabunglah dengan SMK terdepan dengan fasilitas modern dan kurikulum industri siap kerja.',
    show_public_leaderboard BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: majors (Jurusan / Kompetensi Keahlian)
CREATE TABLE IF NOT EXISTS public.majors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    quota INT NOT NULL DEFAULT 100 CHECK (quota >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    icon VARCHAR(100) DEFAULT 'Code',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: source_schools (Asal Sekolah Master)
CREATE TABLE IF NOT EXISTS public.source_schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    npsn VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: students (Calon Siswa / Pendaftar)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    nisn VARCHAR(20),
    nik VARCHAR(20),
    birth_place VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('Laki-laki', 'Perempuan', 'L', 'P')),
    religion VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    source_school_id UUID REFERENCES public.source_schools(id) ON DELETE SET NULL,
    source_school_name VARCHAR(255) NOT NULL,
    graduation_year INT NOT NULL DEFAULT 2026,
    status VARCHAR(50) NOT NULL DEFAULT 'Menunggu Verifikasi' CHECK (status IN ('Draft', 'Menunggu Verifikasi', 'Terverifikasi', 'Diterima', 'Tidak Diterima', 'Cadangan')),
    total_score NUMERIC(6,2) DEFAULT 0.00,
    average_report_score NUMERIC(6,2) DEFAULT 0.00,
    achievement_score NUMERIC(6,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: parent_data (Data Orang Tua / Wali)
CREATE TABLE IF NOT EXISTS public.parent_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL UNIQUE REFERENCES public.students(id) ON DELETE CASCADE,
    father_name VARCHAR(255) NOT NULL,
    mother_name VARCHAR(255) NOT NULL,
    parent_job VARCHAR(100),
    parent_phone VARCHAR(50) NOT NULL,
    parent_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: report_scores (Nilai Rapor 5 Semester)
CREATE TABLE IF NOT EXISTS public.report_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 5),
    subject VARCHAR(100) NOT NULL,
    score NUMERIC(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_student_semester_subject UNIQUE (student_id, semester, subject)
);

-- Table: achievements (Prestasi & Sertifikat Siswa)
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    level VARCHAR(50) NOT NULL CHECK (level IN ('Internasional', 'Nasional', 'Provinsi', 'Kabupaten/Kota', 'Sekolah')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    points NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    file_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: documents (Upload Berkas Siswa)
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('foto_3x4', 'ijazah_skl', 'kartu_keluarga', 'akta_kelahiran', 'sertifikat_prestasi', 'lainnya')),
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_size INT,
    mime_type VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: major_choices (Pilihan Jurusan Pendaftar)
CREATE TABLE IF NOT EXISTS public.major_choices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    major_id UUID NOT NULL REFERENCES public.majors(id) ON DELETE RESTRICT,
    choice_order INT NOT NULL CHECK (choice_order IN (1, 2)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_student_choice_order UNIQUE (student_id, choice_order),
    CONSTRAINT unique_student_major UNIQUE (student_id, major_id)
);

-- Table: selection_results (Hasil Seleksi Penerimaan)
CREATE TABLE IF NOT EXISTS public.selection_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL UNIQUE REFERENCES public.students(id) ON DELETE CASCADE,
    major_id UUID REFERENCES public.majors(id) ON DELETE SET NULL,
    choice1_major_id UUID REFERENCES public.majors(id) ON DELETE SET NULL,
    choice1_rank INT,
    choice1_status VARCHAR(50) DEFAULT 'pending' CHECK (choice1_status IN ('accepted', 'rejected', 'pending')),
    choice2_major_id UUID REFERENCES public.majors(id) ON DELETE SET NULL,
    choice2_rank INT,
    choice2_status VARCHAR(50) DEFAULT 'pending' CHECK (choice2_status IN ('accepted', 'rejected', 'not_applicable', 'pending')),
    final_accepted_major_id UUID REFERENCES public.majors(id) ON DELETE SET NULL,
    final_accepted_from_priority INT CHECK (final_accepted_from_priority IN (1, 2)),
    score NUMERIC(6,2) NOT NULL,
    rank INT,
    status VARCHAR(50) NOT NULL DEFAULT 'Belum Diproses' CHECK (status IN ('Diterima', 'Tidak Diterima', 'Belum Diproses')),
    published_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: announcements (Berita & Pengumuman)
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'Pengumuman' CHECK (category IN ('Pengumuman', 'Berita', 'Panduan')),
    status VARCHAR(50) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published', 'Archived')),
    thumbnail_url TEXT,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: admin_profiles (Admin / Operator Profile)
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'operator')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 2. INDICES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_students_registration_number ON public.students(registration_number);
CREATE INDEX IF NOT EXISTS idx_students_nisn ON public.students(nisn);
CREATE INDEX IF NOT EXISTS idx_students_nik ON public.students(nik);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);
CREATE INDEX IF NOT EXISTS idx_students_total_score ON public.students(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_report_scores_student_id ON public.report_scores(student_id);
CREATE INDEX IF NOT EXISTS idx_achievements_student_id ON public.achievements(student_id);
CREATE INDEX IF NOT EXISTS idx_documents_student_id ON public.documents(student_id);
CREATE INDEX IF NOT EXISTS idx_major_choices_student_id ON public.major_choices(student_id);
CREATE INDEX IF NOT EXISTS idx_major_choices_major_id ON public.major_choices(major_id);
CREATE INDEX IF NOT EXISTS idx_announcements_slug ON public.announcements(slug);
CREATE INDEX IF NOT EXISTS idx_announcements_status ON public.announcements(status);

-- ----------------------------------------------------------------------------
-- 3. FUNCTIONS & TRIGGERS
-- ----------------------------------------------------------------------------

-- Updated at function
CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_schools_updated_at ON public.schools;
CREATE TRIGGER trg_schools_updated_at BEFORE UPDATE ON public.schools FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_majors_updated_at ON public.majors;
CREATE TRIGGER trg_majors_updated_at BEFORE UPDATE ON public.majors FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_students_updated_at ON public.students;
CREATE TRIGGER trg_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_parent_data_updated_at ON public.parent_data;
CREATE TRIGGER trg_parent_data_updated_at BEFORE UPDATE ON public.parent_data FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_selection_results_updated_at ON public.selection_results;
CREATE TRIGGER trg_selection_results_updated_at BEFORE UPDATE ON public.selection_results FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_announcements_updated_at ON public.announcements;
CREATE TRIGGER trg_announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_admin_profiles_updated_at ON public.admin_profiles;
CREATE TRIGGER trg_admin_profiles_updated_at BEFORE UPDATE ON public.admin_profiles FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

-- Registration Number Generator
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
CREATE TRIGGER trg_generate_registration_number BEFORE INSERT ON public.students FOR EACH ROW EXECUTE FUNCTION public.fn_generate_registration_number();

-- Achievement Points
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
CREATE TRIGGER trg_set_achievement_points BEFORE INSERT OR UPDATE ON public.achievements FOR EACH ROW EXECUTE FUNCTION public.fn_set_achievement_points();

-- Scoring Engine (70% Rapor + 30% Prestasi)
CREATE OR REPLACE FUNCTION public.fn_calculate_student_score(p_student_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    v_avg_report NUMERIC(6,2) := 0.00;
    v_max_achievement NUMERIC(6,2) := 0.00;
    v_total_score NUMERIC(6,2) := 0.00;
BEGIN
    SELECT COALESCE(AVG(score), 0.00) INTO v_avg_report FROM public.report_scores WHERE student_id = p_student_id;
    SELECT COALESCE(MAX(points), 0.00) INTO v_max_achievement FROM public.achievements WHERE student_id = p_student_id;
    v_total_score := (v_avg_report * 0.70) + (v_max_achievement * 0.30);

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

-- Trigger to recalculate score on changes
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
CREATE TRIGGER trg_recalc_score_report AFTER INSERT OR UPDATE OR DELETE ON public.report_scores FOR EACH ROW EXECUTE FUNCTION public.fn_trigger_recalculate_student_score();

DROP TRIGGER IF EXISTS trg_recalc_score_achievement ON public.achievements;
CREATE TRIGGER trg_recalc_score_achievement AFTER INSERT OR UPDATE OR DELETE ON public.achievements FOR EACH ROW EXECUTE FUNCTION public.fn_trigger_recalculate_student_score();

-- Admin profile trigger from auth.users
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
CREATE TRIGGER trg_on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.fn_handle_new_admin_user();

-- ----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------------------------

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

-- Schools Policies
DROP POLICY IF EXISTS "Public can view school profile" ON public.schools;
CREATE POLICY "Public can view school profile" ON public.schools FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage school profile" ON public.schools;
CREATE POLICY "Admins can manage school profile" ON public.schools FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Majors Policies
DROP POLICY IF EXISTS "Public can view active majors" ON public.majors;
CREATE POLICY "Public can view active majors" ON public.majors FOR SELECT USING (is_active = true OR public.is_admin());
DROP POLICY IF EXISTS "Admins can manage majors" ON public.majors;
CREATE POLICY "Admins can manage majors" ON public.majors FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Source Schools Policies
DROP POLICY IF EXISTS "Public can view source schools" ON public.source_schools;
CREATE POLICY "Public can view source schools" ON public.source_schools FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage source schools" ON public.source_schools;
CREATE POLICY "Admins can manage source schools" ON public.source_schools FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Students Policies
DROP POLICY IF EXISTS "Public can submit registration" ON public.students;
CREATE POLICY "Public can submit registration" ON public.students FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public can check student status" ON public.students;
CREATE POLICY "Public can check student status" ON public.students FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins have full access to students" ON public.students;
CREATE POLICY "Admins have full access to students" ON public.students FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Parent Data Policies
DROP POLICY IF EXISTS "Public can submit parent data" ON public.parent_data;
CREATE POLICY "Public can submit parent data" ON public.parent_data FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins have full access to parent data" ON public.parent_data;
CREATE POLICY "Admins have full access to parent data" ON public.parent_data FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Report Scores Policies
DROP POLICY IF EXISTS "Public can submit report scores" ON public.report_scores;
CREATE POLICY "Public can submit report scores" ON public.report_scores FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public can view report scores" ON public.report_scores;
CREATE POLICY "Public can view report scores" ON public.report_scores FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins have full access to report scores" ON public.report_scores;
CREATE POLICY "Admins have full access to report scores" ON public.report_scores FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Achievements Policies
DROP POLICY IF EXISTS "Public can submit achievements" ON public.achievements;
CREATE POLICY "Public can submit achievements" ON public.achievements FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public can view achievements" ON public.achievements;
CREATE POLICY "Public can view achievements" ON public.achievements FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins have full access to achievements" ON public.achievements;
CREATE POLICY "Admins have full access to achievements" ON public.achievements FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Documents Policies
DROP POLICY IF EXISTS "Public can upload documents" ON public.documents;
CREATE POLICY "Public can upload documents" ON public.documents FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public can view documents" ON public.documents;
CREATE POLICY "Public can view documents" ON public.documents FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins have full access to documents" ON public.documents;
CREATE POLICY "Admins have full access to documents" ON public.documents FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Major Choices Policies
DROP POLICY IF EXISTS "Public can submit major choices" ON public.major_choices;
CREATE POLICY "Public can submit major choices" ON public.major_choices FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public can view major choices" ON public.major_choices;
CREATE POLICY "Public can view major choices" ON public.major_choices FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins have full access to major choices" ON public.major_choices;
CREATE POLICY "Admins have full access to major choices" ON public.major_choices FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Selection Results Policies
DROP POLICY IF EXISTS "Public can view published selection results" ON public.selection_results;
CREATE POLICY "Public can view published selection results" ON public.selection_results FOR SELECT USING (published_at IS NOT NULL OR public.is_admin());
DROP POLICY IF EXISTS "Admins have full access to selection results" ON public.selection_results;
CREATE POLICY "Admins have full access to selection results" ON public.selection_results FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Announcements Policies
DROP POLICY IF EXISTS "Public can view published announcements" ON public.announcements;
CREATE POLICY "Public can view published announcements" ON public.announcements FOR SELECT USING (status = 'Published' OR public.is_admin());
DROP POLICY IF EXISTS "Admins have full access to announcements" ON public.announcements;
CREATE POLICY "Admins have full access to announcements" ON public.announcements FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Admin Profiles Policies
DROP POLICY IF EXISTS "Admins can view their own profile" ON public.admin_profiles;
CREATE POLICY "Admins can view their own profile" ON public.admin_profiles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "Admins can manage admin profiles" ON public.admin_profiles;
CREATE POLICY "Admins can manage admin profiles" ON public.admin_profiles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 5. STORAGE BUCKETS & POLICIES
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('school-assets', 'school-assets', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']),
    ('announcements', 'announcements', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']),
    ('student-photos', 'student-photos', true, 2097152, ARRAY['image/png', 'image/jpeg', 'image/jpg']),
    ('student-documents', 'student-documents', true, 5242880, ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage Policies
DROP POLICY IF EXISTS "Public can view school assets" ON storage.objects;
CREATE POLICY "Public can view school assets" ON storage.objects FOR SELECT USING (bucket_id = 'school-assets');
DROP POLICY IF EXISTS "Admins can manage school assets" ON storage.objects;
CREATE POLICY "Admins can manage school assets" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'school-assets' AND public.is_admin()) WITH CHECK (bucket_id = 'school-assets' AND public.is_admin());

DROP POLICY IF EXISTS "Public can view announcement images" ON storage.objects;
CREATE POLICY "Public can view announcement images" ON storage.objects FOR SELECT USING (bucket_id = 'announcements');
DROP POLICY IF EXISTS "Admins can manage announcement images" ON storage.objects;
CREATE POLICY "Admins can manage announcement images" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'announcements' AND public.is_admin()) WITH CHECK (bucket_id = 'announcements' AND public.is_admin());

DROP POLICY IF EXISTS "Public can upload student photos" ON storage.objects;
CREATE POLICY "Public can upload student photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'student-photos');
DROP POLICY IF EXISTS "Public can view student photos" ON storage.objects;
CREATE POLICY "Public can view student photos" ON storage.objects FOR SELECT USING (bucket_id = 'student-photos');
DROP POLICY IF EXISTS "Admins can manage student photos" ON storage.objects;
CREATE POLICY "Admins can manage student photos" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'student-photos' AND public.is_admin()) WITH CHECK (bucket_id = 'student-photos' AND public.is_admin());

DROP POLICY IF EXISTS "Public can upload student documents" ON storage.objects;
CREATE POLICY "Public can upload student documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'student-documents');
DROP POLICY IF EXISTS "Public can view student documents" ON storage.objects;
CREATE POLICY "Public can view student documents" ON storage.objects FOR SELECT USING (bucket_id = 'student-documents');
DROP POLICY IF EXISTS "Admins can manage student documents" ON storage.objects;
CREATE POLICY "Admins can manage student documents" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'student-documents' AND public.is_admin()) WITH CHECK (bucket_id = 'student-documents' AND public.is_admin());

-- ----------------------------------------------------------------------------
-- 6. SEED DATA
-- ----------------------------------------------------------------------------

-- School profile
INSERT INTO public.schools (
    name, npsn, address, phone, email, academic_year, logo_url, target_students, hero_tagline, hero_description
) VALUES (
    'SMK Negeri 1 Digital Teknologi',
    '20109988',
    'Jl. Teknologi Informasi No. 45, Kebayoran Baru, Jakarta Selatan',
    '(021) 7890-1234',
    'spmb@smkn1digital.sch.id',
    '2026/2027',
    '/images/logo-icon.png',
    400,
    'Membangun Generasi Vokasi Berkarakter, Cerdas, dan Siap Kerja Global',
    'Penerimaan Peserta Didik Baru (PPDB/SPMB) Tahun Pelajaran 2026/2027 telah dibuka. Daftarkan diri Anda sekarang secara daring.'
) ON CONFLICT DO NOTHING;

-- Majors
INSERT INTO public.majors (code, name, description, quota, is_active, icon)
VALUES
    ('RPL', 'Rekayasa Perangkat Lunak', 'Fokus pada pengembangan aplikasi web, mobile, arsitektur cloud, dan kecerdasan buatan (AI).', 108, true, 'Code'),
    ('TKJ', 'Teknik Komputer dan Jaringan', 'Mempelajari infrastruktur jaringan, cybersecurity, server administration, IoT, dan cloud computing.', 108, true, 'Network'),
    ('DKV', 'Desain Komunikasi Visual', 'Mendalami multimedia, motion graphics, desain UI/UX, fotografi, videografi, dan branding digital.', 108, true, 'Palette'),
    ('AKL', 'Akuntansi dan Keuangan Lembaga', 'Mempelajari akuntansi digital, perpajakan, perbankan syariah, dan sistem informasi keuangan modern.', 76, true, 'Calculator')
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    quota = EXCLUDED.quota,
    is_active = EXCLUDED.is_active,
    icon = EXCLUDED.icon;

-- Source schools
INSERT INTO public.source_schools (npsn, name, city, province)
VALUES
    ('20101001', 'SMP Negeri 1 Jakarta', 'Jakarta Selatan', 'DKI Jakarta'),
    ('20101002', 'SMP Negeri 19 Jakarta', 'Jakarta Selatan', 'DKI Jakarta'),
    ('20101003', 'SMP Negeri 115 Jakarta', 'Jakarta Selatan', 'DKI Jakarta'),
    ('20101004', 'MTs Negeri 1 Jakarta', 'Jakarta Selatan', 'DKI Jakarta'),
    ('20102001', 'SMP Negeri 1 Depok', 'Depok', 'Jawa Barat'),
    ('20102002', 'SMP Negeri 2 Depok', 'Depok', 'Jawa Barat'),
    ('20103001', 'SMP Negeri 1 Bogor', 'Bogor', 'Jawa Barat'),
    ('20104001', 'SMP Negeri 1 Tangerang', 'Tangerang', 'Banten'),
    ('20104002', 'SMP Negeri 1 Tangerang Selatan', 'Tangerang Selatan', 'Banten'),
    ('20105001', 'SMP Negeri 1 Bekasi', 'Bekasi', 'Jawa Barat')
ON CONFLICT DO NOTHING;

-- Announcements
INSERT INTO public.announcements (title, slug, content, category, status, published_at)
VALUES
    (
        'Jadwal dan Alur Pendaftaran SPMB Tahun Pelajaran 2026/2027',
        'jadwal-dan-alur-pendaftaran-spmb-2026-2027',
        'Pendaftaran Penerimaan Murid Baru (SPMB) dibuka mulai tanggal 1 Mei 2026 hingga 30 Juni 2026 secara online. Seluruh calon siswa diwajibkan melengkapi biodata, nilai rapor semester 1-5, dan dokumen persyaratan.',
        'Pengumuman',
        'Published',
        now()
    ),
    (
        'Petunjuk Teknis Upload Dokumen dan Sertifikat Prestasi',
        'petunjuk-teknis-upload-dokumen-prestasi',
        'Pastikan foto 3x4 berlatar belakang merah/biru dengan format JPG/PNG maksimal 2MB. Sertifikat prestasi yang diakui adalah kejuaraan tingkat Kabupaten, Provinsi, Nasional, hingga Internasional.',
        'Panduan',
        'Published',
        now()
    ),
    (
        'Kunjungan Industri & Kerjasama Perusahaan Mitra SMK Digital 2026',
        'kunjungan-industri-dan-kerjasama-mitra-2026',
        'SMK Negeri 1 Digital Teknologi menjalin kerjasama strategis dengan lebih dari 30 perusahaan teknologi terkemuka untuk program magang dan rekrutmen kerja lulusan.',
        'Berita',
        'Published',
        now()
    )
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    category = EXCLUDED.category,
    status = EXCLUDED.status;

-- Admin User & Profile Seed (email: admin@smkn1digital.sch.id | pass: admin12345)
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@smkn1digital.sch.id';
    
    IF v_user_id IS NULL THEN
        v_user_id := gen_random_uuid();
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated',
            'admin@smkn1digital.sch.id', crypt('admin12345', gen_salt('bf')), now(),
            '{"provider":"email","providers":["email"]}', '{"full_name":"Administrator SPMB","role":"super_admin"}',
            now(), now(), '', ''
        );
    ELSE
        UPDATE auth.users
        SET 
            encrypted_password = crypt('admin12345', gen_salt('bf')),
            email_confirmed_at = COALESCE(email_confirmed_at, now()),
            raw_user_meta_data = '{"full_name":"Administrator SPMB","role":"super_admin"}'::jsonb,
            updated_at = now()
        WHERE id = v_user_id;
    END IF;

    INSERT INTO public.admin_profiles (user_id, full_name, role)
    VALUES (v_user_id, 'Administrator SPMB', 'super_admin')
    ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';
END $$;

-- 7. Stored Procedure: run_selection_process() with 2-stage cascading logic
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

    -- 3. TAHAP 2: Untuk siswa yang choice1_status = 'rejected', ambil jurusan pilihan 2 mereka
    FOR v_major IN SELECT id, code, name, quota FROM public.majors WHERE is_active = TRUE ORDER BY code ASC LOOP
        SELECT COUNT(*)
        INTO v_accepted_ch1_count
        FROM tmp_selection_calc
        WHERE choice1_major_id = v_major.id AND choice1_status = 'accepted';

        v_sisa_kuota := GREATEST(0, v_major.quota - v_accepted_ch1_count);

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

    UPDATE tmp_selection_calc
    SET choice2_status = 'not_applicable'
    WHERE choice1_status = 'accepted' AND choice2_status = 'pending';

    -- 4. Tentukan final_accepted_major_id, final_accepted_from_priority, dan final_status
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

    SELECT COUNT(*) INTO v_total_accepted_ch1 FROM tmp_selection_calc WHERE final_accepted_from_priority = 1;
    SELECT COUNT(*) INTO v_total_accepted_ch2 FROM tmp_selection_calc WHERE final_accepted_from_priority = 2;
    SELECT COUNT(*) INTO v_total_rejected FROM tmp_selection_calc WHERE final_accepted_major_id IS NULL;

    -- 5. Upsert ke selection_results dan update students table
    INSERT INTO public.selection_results (
        student_id,
        major_id,
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

    UPDATE public.students s
    SET 
        status = t.final_status,
        total_score = t.total_score,
        updated_at = v_now
    FROM tmp_selection_calc t
    WHERE s.id = t.student_id;

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


-- ----------------------------------------------------------------------------
-- 7. PUBLIC LEADERBOARD (VIEW & PRIVACY MASKING FUNCTION)
-- ----------------------------------------------------------------------------

-- Function: mask_name(full_name TEXT) RETURNS TEXT
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

    v_parts := regexp_split_to_array(v_trimmed, '\s+');

    IF array_length(v_parts, 1) >= 2 THEN
        RETURN v_parts[1] || ' ' || UPPER(SUBSTRING(v_parts[2] FROM 1 FOR 1)) || '.';
    ELSE
        RETURN v_parts[1];
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE SECURITY DEFINER;

-- View: public_leaderboard
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

ALTER VIEW public.public_leaderboard OWNER TO postgres;
GRANT SELECT ON public.public_leaderboard TO anon, authenticated;

