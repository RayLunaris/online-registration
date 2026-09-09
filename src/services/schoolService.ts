import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { School, Major, SourceSchool } from '@/types/spmb';

// Default Fallback Data (Digunakan saat Supabase belum terhubung)
export const DEFAULT_SCHOOL: School = {
  id: 'default-school-id',
  name: 'SMK Negeri 1 Digital Teknologi',
  npsn: '20109988',
  address: 'Jl. Teknologi Informasi No. 45, Kebayoran Baru, Jakarta Selatan',
  phone: '(021) 7890-1234',
  email: 'spmb@smkn1digital.sch.id',
  academic_year: '2026/2027',
  logo_url: '/images/logo-icon.png',
  target_students: 400,
  hero_tagline: 'Membangun Generasi Vokasi Berkarakter, Cerdas, dan Siap Kerja Global',
  hero_description: 'Penerimaan Peserta Didik Baru (PPDB/SPMB) Tahun Pelajaran 2026/2027 telah dibuka secara daring. Fasilitas modern dan kurikulum industri.',
  show_public_leaderboard: true,
  registration_status: 'open',
  registration_close_date: null,
  metadata: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEFAULT_MAJORS: Major[] = [
  {
    id: 'm1',
    code: 'RPL',
    name: 'Rekayasa Perangkat Lunak',
    description: 'Fokus pada pengembangan aplikasi web, mobile (Android/iOS), arsitektur cloud, dan AI.',
    quota: 108,
    is_active: true,
    icon: 'Code',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'm2',
    code: 'TKJ',
    name: 'Teknik Komputer dan Jaringan',
    description: 'Mempelajari infrastruktur jaringan, cybersecurity, server administration, IoT, dan cloud computing.',
    quota: 108,
    is_active: true,
    icon: 'Network',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'm3',
    code: 'DKV',
    name: 'Desain Komunikasi Visual',
    description: 'Mendalami multimedia, motion graphics, desain UI/UX, fotografi, videografi, dan branding digital.',
    quota: 108,
    is_active: true,
    icon: 'Palette',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'm4',
    code: 'AKL',
    name: 'Akuntansi dan Keuangan Lembaga',
    description: 'Mempelajari akuntansi digital, perpajakan, perbankan syariah, dan sistem informasi keuangan modern.',
    quota: 76,
    is_active: true,
    icon: 'Calculator',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const DEFAULT_SOURCE_SCHOOLS: SourceSchool[] = [
  { id: 's1', npsn: '20101001', name: 'SMP Negeri 1 Jakarta', city: 'Jakarta Selatan', province: 'DKI Jakarta', created_at: new Date().toISOString() },
  { id: 's2', npsn: '20101002', name: 'SMP Negeri 19 Jakarta', city: 'Jakarta Selatan', province: 'DKI Jakarta', created_at: new Date().toISOString() },
  { id: 's3', npsn: '20101003', name: 'SMP Negeri 115 Jakarta', city: 'Jakarta Selatan', province: 'DKI Jakarta', created_at: new Date().toISOString() },
  { id: 's4', npsn: '20101004', name: 'MTs Negeri 1 Jakarta', city: 'Jakarta Selatan', province: 'DKI Jakarta', created_at: new Date().toISOString() },
  { id: 's5', npsn: '20102001', name: 'SMP Negeri 1 Depok', city: 'Depok', province: 'Jawa Barat', created_at: new Date().toISOString() },
];

export const schoolService = {
  async getSchoolProfile(): Promise<School> {
    if (!isSupabaseConfigured()) {
      return DEFAULT_SCHOOL;
    }
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      console.warn('Error fetching school profile from Supabase, using default data:', error);
      return DEFAULT_SCHOOL;
    }
    const schoolObj = data as School;
    if (!schoolObj.logo_url || schoolObj.logo_url.includes('unsplash.com') || schoolObj.logo_url.includes('photo-')) {
      schoolObj.logo_url = '/images/logo-icon.png';
    }
    schoolObj.show_public_leaderboard = true;
    return schoolObj;
  },

  async getRegistrationStatus(): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.rpc('get_registration_status');
        if (!error && typeof data === 'boolean') {
          return data;
        }
      } catch (err) {
        console.warn('RPC get_registration_status failed, calculating locally:', err);
      }
    }
    const school = await this.getSchoolProfile();
    if (school.registration_status === 'closed') return false;
    if (school.registration_close_date) {
      const closeTime = new Date(school.registration_close_date).getTime();
      if (!isNaN(closeTime) && Date.now() > closeTime) {
        return false;
      }
    }
    return true;
  },

  async getMajors(): Promise<Major[]> {
    if (!isSupabaseConfigured()) {
      return DEFAULT_MAJORS;
    }
    const { data, error } = await supabase
      .from('majors')
      .select('*')
      .eq('is_active', true)
      .order('code', { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn('Error fetching majors from Supabase, using default data:', error);
      return DEFAULT_MAJORS;
    }
    return data as Major[];
  },

  async getSourceSchools(): Promise<SourceSchool[]> {
    if (!isSupabaseConfigured()) {
      return DEFAULT_SOURCE_SCHOOLS;
    }
    const { data, error } = await supabase
      .from('source_schools')
      .select('*')
      .order('name', { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_SOURCE_SCHOOLS;
    }
    return data as SourceSchool[];
  },
};
