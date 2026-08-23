import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { RegistrationFormData, StudentCompleteDetail, ACHIEVEMENT_POINTS } from '@/types/spmb';
import { Database } from '@/types/database';

// In-memory store fallback for demo mode
const mockStudentStore: StudentCompleteDetail[] = [];

type StudentInsert = Database['public']['Tables']['students']['Insert'];
type ParentInsert = Database['public']['Tables']['parent_data']['Insert'];
type MajorChoiceInsert = Database['public']['Tables']['major_choices']['Insert'];
type ReportScoreInsert = Database['public']['Tables']['report_scores']['Insert'];
type AchievementInsert = Database['public']['Tables']['achievements']['Insert'];
type DocumentInsert = Database['public']['Tables']['documents']['Insert'];

export const studentService = {
  async submitRegistration(formData: RegistrationFormData): Promise<{
    success: boolean;
    registrationNumber?: string;
    studentId?: string;
    error?: string;
  }> {
    if (!isSupabaseConfigured()) {
      // Offline / Demo Fallback Mode
      const regNum = `REG-2026-${String(mockStudentStore.length + 1).padStart(5, '0')}`;
      const newId = `mock-student-${Date.now()}`;

      // Calculate score
      const totalScores = formData.report_scores.reduce((acc, curr) => acc + Number(curr.score), 0);
      const avgReport = formData.report_scores.length ? totalScores / formData.report_scores.length : 0;
      const maxAchievement = (formData.achievements || []).reduce((max, ach) => {
        const pts = ACHIEVEMENT_POINTS[ach.level] || 0;
        return pts > max ? pts : max;
      }, 0);
      const totalScore = (avgReport * 0.7) + (maxAchievement * 0.3);

      const mockRecord: StudentCompleteDetail = {
        id: newId,
        registration_number: regNum,
        full_name: formData.full_name,
        nisn: formData.nisn || null,
        nik: formData.nik || null,
        birth_place: formData.birth_place,
        birth_date: formData.birth_date,
        gender: formData.gender,
        religion: formData.religion,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        source_school_id: formData.source_school_id || null,
        source_school_name: formData.source_school_name,
        graduation_year: formData.graduation_year,
        status: 'Menunggu Verifikasi',
        average_report_score: avgReport,
        achievement_score: maxAchievement,
        total_score: totalScore,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        parent_data: {
          id: `p-${newId}`,
          student_id: newId,
          father_name: formData.father_name,
          mother_name: formData.mother_name,
          parent_job: formData.parent_job || null,
          parent_phone: formData.parent_phone,
          parent_address: formData.parent_address || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };

      mockStudentStore.push(mockRecord);
      return { success: true, registrationNumber: regNum, studentId: newId };
    }

    try {
      // 1. Insert Student Record
      const studentPayload: StudentInsert = {
        full_name: formData.full_name,
        nisn: formData.nisn || null,
        nik: formData.nik || null,
        birth_place: formData.birth_place,
        birth_date: formData.birth_date,
        gender: formData.gender,
        religion: formData.religion,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        source_school_id: formData.source_school_id || null,
        source_school_name: formData.source_school_name,
        graduation_year: formData.graduation_year,
        status: 'Menunggu Verifikasi',
      };

      const { data: student, error: studentError } = await supabase
        .from('students')
        .insert(studentPayload as any)
        .select()
        .single();

      if (studentError || !student) {
        return { success: false, error: studentError?.message || 'Gagal menyimpan data calon siswa.' };
      }

      const createdStudent = student as unknown as Database['public']['Tables']['students']['Row'];
      const studentId = createdStudent.id;

      // 2. Insert Parent Data
      const parentPayload: ParentInsert = {
        student_id: studentId,
        father_name: formData.father_name,
        mother_name: formData.mother_name,
        parent_job: formData.parent_job || null,
        parent_phone: formData.parent_phone,
        parent_address: formData.parent_address || null,
      };
      const { error: parentError } = await supabase.from('parent_data').insert(parentPayload as any);
      if (parentError) console.error('Error inserting parent data:', parentError);

      // 3. Insert Major Choices
      const majorChoices: MajorChoiceInsert[] = [
        { student_id: studentId, major_id: formData.choice_1_major_id, choice_order: 1 },
      ];
      if (formData.choice_2_major_id && formData.choice_2_major_id !== formData.choice_1_major_id) {
        majorChoices.push({ student_id: studentId, major_id: formData.choice_2_major_id, choice_order: 2 });
      }

      const { error: majorChoiceError } = await supabase.from('major_choices').insert(majorChoices as any);
      if (majorChoiceError) console.error('Error inserting major choices:', majorChoiceError);

      // 4. Insert Report Scores
      if (formData.report_scores && formData.report_scores.length > 0) {
        const scorePayloads: ReportScoreInsert[] = formData.report_scores.map((sc) => ({
          student_id: studentId,
          semester: sc.semester,
          subject: sc.subject,
          score: sc.score,
        }));
        const { error: scoreError } = await supabase.from('report_scores').insert(scorePayloads as any);
        if (scoreError) console.error('Error inserting report scores:', scoreError);
      }

      // 5. Insert Achievements
      if (formData.achievements && formData.achievements.length > 0) {
        const achievementPayloads: AchievementInsert[] = formData.achievements.map((ach) => ({
          student_id: studentId,
          level: ach.level,
          title: ach.title,
          description: ach.description || null,
          file_url: ach.file_url || null,
        }));
        const { error: achError } = await supabase.from('achievements').insert(achievementPayloads as any);
        if (achError) console.error('Error inserting achievements:', achError);
      }

      // 6. Insert Documents
      const docPayloads: DocumentInsert[] = [];
      if (formData.photo_url) {
        docPayloads.push({ student_id: studentId, document_type: 'foto_3x4', file_url: formData.photo_url });
      }
      if (formData.diploma_url) {
        docPayloads.push({ student_id: studentId, document_type: 'ijazah_skl', file_url: formData.diploma_url });
      }
      if (formData.family_card_url) {
        docPayloads.push({ student_id: studentId, document_type: 'kartu_keluarga', file_url: formData.family_card_url });
      }
      if (docPayloads.length > 0) {
        const { error: docError } = await supabase.from('documents').insert(docPayloads as any);
        if (docError) console.error('Error inserting documents:', docError);
      }

      return {
        success: true,
        registrationNumber: createdStudent.registration_number,
        studentId: createdStudent.id,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Terjadi kesalahan sistem saat mendaftar.' };
    }
  },

  async getStudentByRegistrationNumber(regNumber: string): Promise<StudentCompleteDetail | null> {
    const formatted = regNumber.trim().toUpperCase();

    if (!isSupabaseConfigured()) {
      const found = mockStudentStore.find((s) => s.registration_number === formatted);
      return found || null;
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
        .eq('registration_number', formatted)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      return data as unknown as StudentCompleteDetail;
    } catch (err) {
      console.error('Error fetching student by registration number:', err);
      return null;
    }
  },
};
