import { Database } from './database';

export type School = Database['public']['Tables']['schools']['Row'];
export type Major = Database['public']['Tables']['majors']['Row'];
export type SourceSchool = Database['public']['Tables']['source_schools']['Row'];
export type Student = Database['public']['Tables']['students']['Row'];
export type ParentData = Database['public']['Tables']['parent_data']['Row'];
export type ReportScore = Database['public']['Tables']['report_scores']['Row'];
export type Achievement = Database['public']['Tables']['achievements']['Row'];
export type DocumentItem = Database['public']['Tables']['documents']['Row'];
export type MajorChoice = Database['public']['Tables']['major_choices']['Row'];
export type SelectionResult = Database['public']['Tables']['selection_results']['Row'];
export type Announcement = Database['public']['Tables']['announcements']['Row'];
export type AdminProfile = Database['public']['Tables']['admin_profiles']['Row'];
export type PublicLeaderboardEntry = Database['public']['Views']['public_leaderboard']['Row'];

export type StudentStatus = Student['status'];
export type SelectionStatus = SelectionResult['status'];
export type AchievementLevel = Achievement['level'];

export interface StudentCompleteDetail extends Student {
  parent_data?: ParentData | null;
  report_scores?: ReportScore[];
  achievements?: Achievement[];
  documents?: DocumentItem[];
  major_choices?: (MajorChoice & { major?: Major })[];
  selection_results?: SelectionResult | null;
}

export interface RegistrationFormData {
  // Personal Data
  full_name: string;
  nisn?: string;
  nik?: string;
  birth_place: string;
  birth_date: string;
  gender: 'Laki-laki' | 'Perempuan';
  religion: string;
  address: string;
  phone: string;
  email: string;

  // Source School
  source_school_id?: string;
  source_school_name: string;
  graduation_year: number;

  // Parent Data
  father_name: string;
  mother_name: string;
  parent_job?: string;
  parent_phone: string;
  parent_address?: string;

  // Major Choices
  choice_1_major_id: string;
  choice_2_major_id?: string;

  // Report Scores: Semester 1 - 5 for 5 subjects
  report_scores: {
    semester: number;
    subject: string;
    score: number;
  }[];

  // Achievements
  achievements?: {
    level: AchievementLevel;
    title: string;
    description?: string;
    file_url?: string;
  }[];

  // Documents
  photo_url?: string;
  diploma_url?: string;
  family_card_url?: string;
}

export const SUBJECT_LIST = [
  'Matematika',
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'IPA',
  'IPS',
] as const;

export const ACHIEVEMENT_POINTS: Record<AchievementLevel, number> = {
  Internasional: 100,
  Nasional: 80,
  Provinsi: 60,
  'Kabupaten/Kota': 40,
  Sekolah: 20,
};
