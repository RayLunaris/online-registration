import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { 
  StudentCompleteDetail, 
  Major, 
  SourceSchool, 
  Announcement, 
  School,
  StudentStatus
} from '@/types/spmb';
import { DEFAULT_SCHOOL, DEFAULT_MAJORS, DEFAULT_SOURCE_SCHOOLS } from './schoolService';
import { DEFAULT_ANNOUNCEMENTS } from './announcementService';
import { mockStudentStore } from './studentService';

export interface DailyRegistrationTrend {
  date: string;
  dayName: string;
  fullDayName: string;
  formattedDate: string;
  count: number;
  isToday: boolean;
}

export interface DashboardStats {
  totalStudents: number;
  targetStudents: number;
  statusCounts: {
    waiting: number;
    verified: number;
    accepted: number;
    rejected: number;
  };
  majorStats: {
    id: string;
    code: string;
    name: string;
    quota: number;
    count: number;
  }[];
  recentStudents: StudentCompleteDetail[];
  dailyTrend: DailyRegistrationTrend[];
}

const INDONESIAN_DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const INDONESIAN_FULL_DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

/**
 * Calculates the exact daily registration volume for the last 7 days ending on today
 */
export function calculateDailyTrend(students: Array<{ created_at?: string }>): DailyRegistrationTrend[] {
  const trend: DailyRegistrationTrend[] = [];
  const now = new Date();

  // 7 days ending with today (i = 6 down to 0)
  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() - i);

    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const dayOfWeek = targetDate.getDay();

    // Filter students registered on this local date
    const count = students.filter((s) => {
      if (!s.created_at) return false;
      const sDate = new Date(s.created_at);
      const sYear = sDate.getFullYear();
      const sMonth = String(sDate.getMonth() + 1).padStart(2, '0');
      const sDay = String(sDate.getDate()).padStart(2, '0');
      return `${sYear}-${sMonth}-${sDay}` === dateStr;
    }).length;

    trend.push({
      date: dateStr,
      formattedDate: `${day}/${month}`,
      dayName: INDONESIAN_DAY_NAMES[dayOfWeek],
      fullDayName: INDONESIAN_FULL_DAY_NAMES[dayOfWeek],
      count,
      isToday: i === 0,
    });
  }

  return trend;
}

export const adminService = {
  /**
   * Get High-Level Dashboard Analytics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    if (!isSupabaseConfigured()) {
      const students = mockStudentStore;
      const targetStudents = 400;

      const statusCounts = {
        waiting: students.filter((s) => s.status === 'Menunggu Verifikasi' || s.status === 'Draft').length,
        verified: students.filter((s) => s.status === 'Terverifikasi').length,
        accepted: students.filter((s) => s.status === 'Diterima').length,
        rejected: students.filter((s) => s.status === 'Tidak Diterima').length,
      };

      const majorStats = DEFAULT_MAJORS.map((m) => {
        const count = students.filter((s) => {
          const ch1 = s.major_choices?.find((c) => c.choice_order === 1);
          return ch1?.major_id === m.id;
        }).length;

        return {
          id: m.id,
          code: m.code,
          name: m.name,
          quota: m.quota,
          count,
        };
      });

      return {
        totalStudents: students.length,
        targetStudents,
        statusCounts,
        majorStats,
        recentStudents: students.slice(0, 5),
        dailyTrend: calculateDailyTrend(students),
      };
    }

    try {
      // 1. Fetch Students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          *,
          major_choices (*, major:majors(*)),
          parent_data (*)
        `)
        .order('created_at', { ascending: false });

      if (studentsError) throw studentsError;
      const students = (studentsData || []) as unknown as StudentCompleteDetail[];

      // 2. Fetch Majors
      const { data: majorsData } = await supabase
        .from('majors')
        .select('*')
        .order('code', { ascending: true });

      const majors = (majorsData || []) as Major[];

      // 3. Fetch School Profile
      const { data: schoolData } = await supabase
        .from('schools')
        .select('target_students')
        .limit(1)
        .maybeSingle();

      const targetStudents = schoolData?.target_students || 400;

      // Calculate Status Counts
      const statusCounts = {
        waiting: students.filter((s) => s.status === 'Menunggu Verifikasi' || s.status === 'Draft').length,
        verified: students.filter((s) => s.status === 'Terverifikasi').length,
        accepted: students.filter((s) => s.status === 'Diterima').length,
        rejected: students.filter((s) => s.status === 'Tidak Diterima').length,
      };

      // Calculate Major Counts (based on Choice 1)
      const majorStats = majors.map((m) => {
        const count = students.filter((s) => {
          const ch1 = s.major_choices?.find((c) => c.choice_order === 1);
          return ch1?.major_id === m.id;
        }).length;

        return {
          id: m.id,
          code: m.code,
          name: m.name,
          quota: m.quota,
          count,
        };
      });

      return {
        totalStudents: students.length,
        targetStudents,
        statusCounts,
        majorStats,
        recentStudents: students.slice(0, 5),
        dailyTrend: calculateDailyTrend(students),
      };
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      return {
        totalStudents: 0,
        targetStudents: 400,
        statusCounts: { waiting: 0, verified: 0, accepted: 0, rejected: 0 },
        majorStats: [],
        recentStudents: [],
        dailyTrend: calculateDailyTrend([]),
      };
    }
  },

  /**
   * STUDENT MANAGEMENT
   */
  async getAllStudents(filter?: { status?: string; majorId?: string; search?: string }): Promise<StudentCompleteDetail[]> {
    if (!isSupabaseConfigured()) {
      let results = [...mockStudentStore];
      if (filter?.status && filter.status !== 'Semua') {
        results = results.filter((s) => s.status === filter.status);
      }
      if (filter?.search && filter.search.trim()) {
        const q = filter.search.trim().toLowerCase();
        results = results.filter((s) =>
          s.full_name.toLowerCase().includes(q) ||
          s.registration_number.toLowerCase().includes(q) ||
          s.source_school_name.toLowerCase().includes(q)
        );
      }
      if (filter?.majorId && filter.majorId !== 'Semua') {
        results = results.filter((s) => {
          const ch1 = s.major_choices?.find((c) => c.choice_order === 1);
          return ch1?.major_id === filter.majorId;
        });
      }
      return results;
    }

    try {
      let query = supabase
        .from('students')
        .select(`
          *,
          parent_data (*),
          report_scores (*),
          achievements (*),
          documents (*),
          major_choices (*, major:majors(*)),
          selection_results (*)
        `)
        .order('created_at', { ascending: false });

      if (filter?.status && filter.status !== 'Semua') {
        query = query.eq('status', filter.status as any);
      }

      if (filter?.search && filter.search.trim()) {
        const q = filter.search.trim();
        query = query.or(`full_name.ilike.%${q}%,registration_number.ilike.%${q}%,source_school_name.ilike.%${q}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      let results = (data || []) as unknown as StudentCompleteDetail[];

      if (filter?.majorId && filter.majorId !== 'Semua') {
        results = results.filter((s) => {
          const ch1 = s.major_choices?.find((c) => c.choice_order === 1);
          return ch1?.major_id === filter.majorId;
        });
      }

      return results;
    } catch (err) {
      console.error('Error fetching all students:', err);
      return [];
    }
  },

  async getStudentById(idOrRegNumber: string): Promise<StudentCompleteDetail | null> {
    if (!isSupabaseConfigured()) {
      const s = mockStudentStore.find(
        (st) => st.id === idOrRegNumber || st.registration_number === idOrRegNumber
      );
      return s || null;
    }

    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          parent_data (*),
          report_scores (*),
          achievements (*),
          documents (*),
          major_choices (*, major:majors(*)),
          selection_results (*)
        `)
        .or(`id.eq.${idOrRegNumber},registration_number.eq.${idOrRegNumber}`)
        .maybeSingle();

      if (error) throw error;
      return (data as unknown as StudentCompleteDetail) || null;
    } catch (err) {
      console.error('Error fetching student by ID:', err);
      return null;
    }
  },

  async updateStudentStatus(
    studentId: string,
    status: StudentStatus,
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) {
      const idx = mockStudentStore.findIndex((s) => s.id === studentId);
      if (idx !== -1) {
        mockStudentStore[idx].status = status;
        if (notes !== undefined) mockStudentStore[idx].notes = notes;
        mockStudentStore[idx].updated_at = new Date().toISOString();
      }
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('students')
        .update({
          status,
          notes: notes !== undefined ? notes : undefined,
          updated_at: new Date().toISOString(),
        })
        .eq('id', studentId);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal memperbarui status siswa.' };
    }
  },

  async deleteStudent(studentId: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) {
      const idx = mockStudentStore.findIndex((s) => s.id === studentId);
      if (idx !== -1) {
        mockStudentStore.splice(idx, 1);
      }
      return { success: true };
    }

    try {
      const { error } = await supabase.from('students').delete().eq('id', studentId);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal menghapus data pendaftar.' };
    }
  },

  /**
   * MAJORS CRUD
   */
  async getAllMajors(): Promise<Major[]> {
    if (!isSupabaseConfigured()) return DEFAULT_MAJORS;
    const { data, error } = await supabase.from('majors').select('*').order('code', { ascending: true });
    if (error || !data) return DEFAULT_MAJORS;
    return data as Major[];
  },

  async saveMajor(major: Partial<Major>): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) return { success: true };

    try {
      if (major.id) {
        // Update
        const { error } = await supabase
          .from('majors')
          .update({
            code: major.code,
            name: major.name,
            description: major.description,
            quota: Number(major.quota),
            is_active: major.is_active,
            icon: major.icon || 'Code',
            updated_at: new Date().toISOString(),
          })
          .eq('id', major.id);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase.from('majors').insert({
          code: major.code!,
          name: major.name!,
          description: major.description,
          quota: Number(major.quota) || 100,
          is_active: major.is_active ?? true,
          icon: major.icon || 'Code',
        });
        if (error) throw error;
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal menyimpan data jurusan.' };
    }
  },

  async deleteMajor(majorId: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) return { success: true };
    try {
      const { error } = await supabase.from('majors').delete().eq('id', majorId);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal menghapus jurusan.' };
    }
  },

  /**
   * SOURCE SCHOOLS CRUD
   */
  async getAllSourceSchools(): Promise<SourceSchool[]> {
    if (!isSupabaseConfigured()) return DEFAULT_SOURCE_SCHOOLS;
    const { data, error } = await supabase.from('source_schools').select('*').order('name', { ascending: true });
    if (error || !data) return DEFAULT_SOURCE_SCHOOLS;
    return data as SourceSchool[];
  },

  async saveSourceSchool(school: Partial<SourceSchool>): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) return { success: true };
    try {
      if (school.id) {
        const { error } = await supabase
          .from('source_schools')
          .update({
            name: school.name,
            npsn: school.npsn || null,
            city: school.city,
            province: school.province,
          })
          .eq('id', school.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('source_schools').insert({
          name: school.name!,
          npsn: school.npsn || null,
          city: school.city || 'Jakarta Selatan',
          province: school.province || 'DKI Jakarta',
        });
        if (error) throw error;
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal menyimpan sekolah asal.' };
    }
  },

  async deleteSourceSchool(schoolId: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) return { success: true };
    try {
      const { error } = await supabase.from('source_schools').delete().eq('id', schoolId);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal menghapus asal sekolah.' };
    }
  },

  /**
   * ANNOUNCEMENTS CRUD
   */
  async getAllAnnouncements(): Promise<Announcement[]> {
    if (!isSupabaseConfigured()) return DEFAULT_ANNOUNCEMENTS;
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return DEFAULT_ANNOUNCEMENTS;
    return data as Announcement[];
  },

  async saveAnnouncement(announcement: Partial<Announcement>): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) return { success: true };
    try {
      const slug = announcement.slug || announcement.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `ann-${Date.now()}`;
      
      if (announcement.id) {
        const { error } = await supabase
          .from('announcements')
          .update({
            title: announcement.title,
            slug,
            content: announcement.content,
            category: announcement.category || 'Pengumuman',
            status: announcement.status || 'Published',
            thumbnail_url: announcement.thumbnail_url || null,
            published_at: announcement.status === 'Published' ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', announcement.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('announcements').insert({
          title: announcement.title!,
          slug,
          content: announcement.content!,
          category: announcement.category || 'Pengumuman',
          status: announcement.status || 'Published',
          thumbnail_url: announcement.thumbnail_url || null,
          published_at: announcement.status === 'Published' ? new Date().toISOString() : null,
        });
        if (error) throw error;
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal menyimpan pengumuman.' };
    }
  },

  async deleteAnnouncement(announcementId: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) return { success: true };
    try {
      const { error } = await supabase.from('announcements').delete().eq('id', announcementId);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal menghapus pengumuman.' };
    }
  },

  /**
   * SCHOOL SETTINGS
   */
  async getSchoolSettings(): Promise<School> {
    if (!isSupabaseConfigured()) return DEFAULT_SCHOOL;
    const { data, error } = await supabase.from('schools').select('*').limit(1).maybeSingle();
    if (error || !data) return DEFAULT_SCHOOL;
    return data as School;
  },

  async updateSchoolSettings(settings: Partial<School>): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) return { success: true };
    try {
      const existing = await this.getSchoolSettings();
      const { error } = await supabase
        .from('schools')
        .update({
          name: settings.name,
          npsn: settings.npsn,
          address: settings.address,
          phone: settings.phone,
          email: settings.email,
          academic_year: settings.academic_year,
          target_students: Number(settings.target_students),
          hero_tagline: settings.hero_tagline,
          hero_description: settings.hero_description,
          logo_url: settings.logo_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal memperbarui pengaturan sekolah.' };
    }
  },
};
