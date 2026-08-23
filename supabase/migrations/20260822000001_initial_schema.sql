-- ============================================================================
-- Migration 01: Initial Schema for SPMB (Sistem Penerimaan Murid Baru)
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Table: schools (School Profile & Configuration)
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
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Table: majors (Jurusan / Kompetensi Keahlian)
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

-- 3. Table: source_schools (Asal Sekolah Master)
CREATE TABLE IF NOT EXISTS public.source_schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    npsn VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Table: students (Calon Siswa / Pendaftar)
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

-- 5. Table: parent_data (Data Orang Tua / Wali)
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

-- 6. Table: report_scores (Nilai Rapor 5 Semester)
CREATE TABLE IF NOT EXISTS public.report_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 5),
    subject VARCHAR(100) NOT NULL,
    score NUMERIC(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_student_semester_subject UNIQUE (student_id, semester, subject)
);

-- 7. Table: achievements (Prestasi & Sertifikat Siswa)
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

-- 8. Table: documents (Upload Berkas Siswa)
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

-- 9. Table: major_choices (Pilihan Jurusan Pendaftar)
CREATE TABLE IF NOT EXISTS public.major_choices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    major_id UUID NOT NULL REFERENCES public.majors(id) ON DELETE RESTRICT,
    choice_order INT NOT NULL CHECK (choice_order IN (1, 2)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_student_choice_order UNIQUE (student_id, choice_order),
    CONSTRAINT unique_student_major UNIQUE (student_id, major_id)
);

-- 10. Table: selection_results (Hasil Seleksi Penerimaan)
CREATE TABLE IF NOT EXISTS public.selection_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL UNIQUE REFERENCES public.students(id) ON DELETE CASCADE,
    major_id UUID REFERENCES public.majors(id) ON DELETE SET NULL,
    score NUMERIC(6,2) NOT NULL,
    rank INT,
    status VARCHAR(50) NOT NULL DEFAULT 'Belum Diproses' CHECK (status IN ('Diterima', 'Tidak Diterima', 'Cadangan', 'Belum Diproses')),
    published_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Table: announcements (Berita & Pengumuman)
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

-- 12. Table: admin_profiles (Admin / Operator Profile)
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'operator')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices for performance
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
