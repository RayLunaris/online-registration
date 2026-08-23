-- ============================================================================
-- Migration 05: Initial Seed Data for SPMB
-- ============================================================================

-- 1. Insert Default School Configuration
INSERT INTO public.schools (
    name,
    npsn,
    address,
    phone,
    email,
    academic_year,
    logo_url,
    target_students,
    hero_tagline,
    hero_description
)
VALUES (
    'SMK Negeri 1 Digital Teknologi',
    '20109988',
    'Jl. Teknologi Informasi No. 45, Kebayoran Baru, Jakarta Selatan',
    '(021) 7890-1234',
    'spmb@smkn1digital.sch.id',
    '2026/2027',
    'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80',
    400,
    'Membangun Generasi Vokasi Berkarakter, Cerdas, dan Siap Kerja Global',
    'Penerimaan Peserta Didik Baru (PPDB/SPMB) Tahun Pelajaran 2026/2027 telah dibuka. Daftarkan diri Anda sekarang secara daring.'
)
ON CONFLICT DO NOTHING;


-- 2. Insert Default Majors (Kompetensi Keahlian)
INSERT INTO public.majors (code, name, description, quota, is_active, icon)
VALUES
    (
        'RPL',
        'Rekayasa Perangkat Lunak',
        'Fokus pada pengembangan aplikasi web, mobile (Android/iOS), arsitektur cloud, dan kecerdasan buatan (AI).',
        108,
        true,
        'Code'
    ),
    (
        'TKJ',
        'Teknik Komputer dan Jaringan',
        'Mempelajari infrastruktur jaringan, cybersecurity, server administration, IoT, dan cloud computing.',
        108,
        true,
        'Network'
    ),
    (
        'DKV',
        'Desain Komunikasi Visual',
        'Mendalami multimedia, motion graphics, desain UI/UX, fotografi, videografi, dan branding digital.',
        108,
        true,
        'Palette'
    ),
    (
        'AKL',
        'Akuntansi dan Keuangan Lembaga',
        'Mempelajari akuntansi digital, perpajakan, perbankan syariah, dan sistem informasi keuangan modern.',
        76,
        true,
        'Calculator'
    )
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    quota = EXCLUDED.quota,
    is_active = EXCLUDED.is_active,
    icon = EXCLUDED.icon;


-- 3. Insert Master Data Asal Sekolah (SMP / MTs)
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


-- 4. Insert Initial Announcements
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
