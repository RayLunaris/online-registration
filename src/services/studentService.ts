import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { RegistrationFormData, StudentCompleteDetail, ACHIEVEMENT_POINTS } from '@/types/spmb';
import { Database } from '@/types/database';

import { DEFAULT_MAJORS } from './schoolService';

// In-memory store fallback for demo mode with pre-seeded sample data
export const mockStudentStore: StudentCompleteDetail[] = [
  {
    id: 'mock-student-1',
    registration_number: 'REG-2026-00001',
    full_name: 'Muhammad Rayhan Pratama',
    nisn: '0061234567',
    nik: '3201012345670001',
    birth_place: 'Jakarta',
    birth_date: '2008-05-14',
    gender: 'Laki-laki',
    religion: 'Islam',
    address: 'Jl. Melati No. 12, Kebayoran Baru, Jakarta Selatan',
    phone: '081234567890',
    email: 'rayhan.pratama@example.com',
    source_school_id: 'src-1',
    source_school_name: 'SMP Negeri 1 Jakarta',
    graduation_year: 2026,
    status: 'Menunggu Verifikasi',
    average_report_score: 88.5,
    achievement_score: 20,
    total_score: 67.95,
    notes: null,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    parent_data: {
      id: 'p-mock-1',
      student_id: 'mock-student-1',
      father_name: 'Bambang Pratama',
      mother_name: 'Dewi Lestari',
      parent_job: 'Wiraswasta',
      parent_phone: '081298765432',
      parent_address: 'Jl. Melati No. 12, Jakarta Selatan',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    major_choices: [
      {
        id: 'mc-1-1',
        student_id: 'mock-student-1',
        major_id: 'm1',
        choice_order: 1,
        created_at: new Date().toISOString(),
        major: DEFAULT_MAJORS[0], // RPL
      },
      {
        id: 'mc-1-2',
        student_id: 'mock-student-1',
        major_id: 'm3',
        choice_order: 2,
        created_at: new Date().toISOString(),
        major: DEFAULT_MAJORS[2], // DKV
      }
    ],
    report_scores: [
      { id: 'rs-1', student_id: 'mock-student-1', semester: 1, subject: 'Matematika', score: 88, created_at: new Date().toISOString() },
      { id: 'rs-2', student_id: 'mock-student-1', semester: 1, subject: 'Bahasa Indonesia', score: 90, created_at: new Date().toISOString() },
      { id: 'rs-3', student_id: 'mock-student-1', semester: 1, subject: 'Bahasa Inggris', score: 86, created_at: new Date().toISOString() },
      { id: 'rs-4', student_id: 'mock-student-1', semester: 1, subject: 'IPA', score: 90, created_at: new Date().toISOString() },
    ],
    achievements: [
      { id: 'ach-1', student_id: 'mock-student-1', level: 'Kabupaten/Kota', title: 'Juara 2 LKS Web Tech Tingkat Kota', description: 'Juara 2 bidang teknologi informasi', points: 20, file_url: null, created_at: new Date().toISOString() }
    ],
  },
  {
    id: 'mock-student-2',
    registration_number: 'REG-2026-00002',
    full_name: 'Siti Aisyah Rahmawati',
    nisn: '0069876543',
    nik: '3201019876540002',
    birth_place: 'Bandung',
    birth_date: '2008-08-20',
    gender: 'Perempuan',
    religion: 'Islam',
    address: 'Jl. Anggrek No. 45, Tebet, Jakarta Selatan',
    phone: '081234567891',
    email: 'aisyah.rahma@example.com',
    source_school_id: 'src-2',
    source_school_name: 'SMP Negeri 5 Jakarta',
    graduation_year: 2026,
    status: 'Menunggu Verifikasi',
    average_report_score: 92.0,
    achievement_score: 30,
    total_score: 73.40,
    notes: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    parent_data: {
      id: 'p-mock-2',
      student_id: 'mock-student-2',
      father_name: 'Ahmad Dahlan',
      mother_name: 'Nurjanah',
      parent_job: 'Pegawai Swasta',
      parent_phone: '081398765432',
      parent_address: 'Jl. Anggrek No. 45, Tebet',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    major_choices: [
      {
        id: 'mc-2-1',
        student_id: 'mock-student-2',
        major_id: 'm4',
        choice_order: 1,
        created_at: new Date().toISOString(),
        major: DEFAULT_MAJORS[3], // AKL
      },
      {
        id: 'mc-2-2',
        student_id: 'mock-student-2',
        major_id: 'm3',
        choice_order: 2,
        created_at: new Date().toISOString(),
        major: DEFAULT_MAJORS[2], // DKV
      }
    ],
    report_scores: [
      { id: 'rs-5', student_id: 'mock-student-2', semester: 1, subject: 'Matematika', score: 94, created_at: new Date().toISOString() },
      { id: 'rs-6', student_id: 'mock-student-2', semester: 1, subject: 'Bahasa Indonesia', score: 90, created_at: new Date().toISOString() },
      { id: 'rs-7', student_id: 'mock-student-2', semester: 1, subject: 'Bahasa Inggris', score: 92, created_at: new Date().toISOString() },
      { id: 'rs-8', student_id: 'mock-student-2', semester: 1, subject: 'IPA', score: 92, created_at: new Date().toISOString() },
    ],
    achievements: [
      { id: 'ach-2', student_id: 'mock-student-2', level: 'Provinsi', title: 'Juara 1 Olimpiade Sains Provinsi', description: 'Juara 1 Bidang Matematika & Akuntansi', points: 30, file_url: null, created_at: new Date().toISOString() }
    ],
  },
  {
    id: 'mock-student-3',
    registration_number: 'REG-2026-00003',
    full_name: 'Budi Prasetyo Utomo',
    nisn: '0065432109',
    nik: '3201015432100003',
    birth_place: 'Jakarta',
    birth_date: '2008-03-10',
    gender: 'Laki-laki',
    religion: 'Islam',
    address: 'Jl. Mawar No. 8, Cilandak, Jakarta Selatan',
    phone: '081234567892',
    email: 'budi.prasetyo@example.com',
    source_school_id: 'src-1',
    source_school_name: 'SMP Negeri 1 Jakarta',
    graduation_year: 2026,
    status: 'Menunggu Verifikasi',
    average_report_score: 85.0,
    achievement_score: 10,
    total_score: 62.50,
    notes: null,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    parent_data: {
      id: 'p-mock-3',
      student_id: 'mock-student-3',
      father_name: 'Joko Utomo',
      mother_name: 'Sri Wahyuni',
      parent_job: 'PNS',
      parent_phone: '081498765432',
      parent_address: 'Jl. Mawar No. 8, Cilandak',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    major_choices: [
      {
        id: 'mc-3-1',
        student_id: 'mock-student-3',
        major_id: 'm4',
        choice_order: 1,
        created_at: new Date().toISOString(),
        major: DEFAULT_MAJORS[3], // AKL
      },
      {
        id: 'mc-3-2',
        student_id: 'mock-student-3',
        major_id: 'm1',
        choice_order: 2,
        created_at: new Date().toISOString(),
        major: DEFAULT_MAJORS[0], // RPL
      }
    ],
    report_scores: [
      { id: 'rs-9', student_id: 'mock-student-3', semester: 1, subject: 'Matematika', score: 85, created_at: new Date().toISOString() },
      { id: 'rs-10', student_id: 'mock-student-3', semester: 1, subject: 'Bahasa Indonesia', score: 85, created_at: new Date().toISOString() },
    ],
    achievements: [
      { id: 'ach-3', student_id: 'mock-student-3', level: 'Sekolah', title: 'Ketua OSIS SMPN 1 Jakarta', description: 'Kepemimpinan dan keorganisasian sekolah', points: 10, file_url: null, created_at: new Date().toISOString() }
    ],
  }
];

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

      const ch1MajorObj = DEFAULT_MAJORS.find(m => m.id === formData.choice_1_major_id) || DEFAULT_MAJORS[0];
      const ch2MajorObj = formData.choice_2_major_id ? DEFAULT_MAJORS.find(m => m.id === formData.choice_2_major_id) : undefined;

      const majorChoices: any[] = [
        {
          id: `mc1-${newId}`,
          student_id: newId,
          major_id: formData.choice_1_major_id || ch1MajorObj.id,
          choice_order: 1,
          created_at: new Date().toISOString(),
          major: ch1MajorObj,
        }
      ];

      if (formData.choice_2_major_id && formData.choice_2_major_id !== formData.choice_1_major_id) {
        majorChoices.push({
          id: `mc2-${newId}`,
          student_id: newId,
          major_id: formData.choice_2_major_id,
          choice_order: 2,
          created_at: new Date().toISOString(),
          major: ch2MajorObj,
        });
      }

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
        major_choices: majorChoices,
        report_scores: (formData.report_scores || []).map((sc, i) => ({
          id: `rs-${newId}-${i}`,
          student_id: newId,
          semester: sc.semester,
          subject: sc.subject,
          score: sc.score,
          created_at: new Date().toISOString(),
        })),
        achievements: (formData.achievements || []).map((ach, i) => ({
          id: `ach-${newId}-${i}`,
          student_id: newId,
          level: ach.level,
          title: ach.title,
          description: ach.description || null,
          file_url: ach.file_url || null,
          points: ACHIEVEMENT_POINTS[ach.level] || 0,
          created_at: new Date().toISOString(),
        })),
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
