export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      schools: {
        Row: {
          id: string;
          name: string;
          npsn: string;
          address: string;
          phone: string | null;
          email: string | null;
          academic_year: string;
          logo_url: string | null;
          target_students: number;
          hero_tagline: string | null;
          hero_description: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name?: string;
          npsn?: string;
          address?: string;
          phone?: string | null;
          email?: string | null;
          academic_year?: string;
          logo_url?: string | null;
          target_students?: number;
          hero_tagline?: string | null;
          hero_description?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          npsn?: string;
          address?: string;
          phone?: string | null;
          email?: string | null;
          academic_year?: string;
          logo_url?: string | null;
          target_students?: number;
          hero_tagline?: string | null;
          hero_description?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      majors: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string | null;
          quota: number;
          is_active: boolean;
          icon: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          description?: string | null;
          quota?: number;
          is_active?: boolean;
          icon?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          description?: string | null;
          quota?: number;
          is_active?: boolean;
          icon?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      source_schools: {
        Row: {
          id: string;
          npsn: string | null;
          name: string;
          city: string;
          province: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          npsn?: string | null;
          name: string;
          city: string;
          province: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          npsn?: string | null;
          name?: string;
          city?: string;
          province?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      students: {
        Row: {
          id: string;
          registration_number: string;
          full_name: string;
          nisn: string | null;
          nik: string | null;
          birth_place: string;
          birth_date: string;
          gender: 'Laki-laki' | 'Perempuan' | 'L' | 'P';
          religion: string;
          address: string;
          phone: string;
          email: string;
          source_school_id: string | null;
          source_school_name: string;
          graduation_year: number;
          status: 'Draft' | 'Menunggu Verifikasi' | 'Terverifikasi' | 'Diterima' | 'Tidak Diterima';
          total_score: number;
          average_report_score: number;
          achievement_score: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          registration_number?: string;
          full_name: string;
          nisn?: string | null;
          nik?: string | null;
          birth_place: string;
          birth_date: string;
          gender: 'Laki-laki' | 'Perempuan' | 'L' | 'P';
          religion: string;
          address: string;
          phone: string;
          email: string;
          source_school_id?: string | null;
          source_school_name: string;
          graduation_year?: number;
          status?: 'Draft' | 'Menunggu Verifikasi' | 'Terverifikasi' | 'Diterima' | 'Tidak Diterima';
          total_score?: number;
          average_report_score?: number;
          achievement_score?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          registration_number?: string;
          full_name?: string;
          nisn?: string | null;
          nik?: string | null;
          birth_place?: string;
          birth_date?: string;
          gender?: 'Laki-laki' | 'Perempuan' | 'L' | 'P';
          religion?: string;
          address?: string;
          phone?: string;
          email?: string;
          source_school_id?: string | null;
          source_school_name?: string;
          graduation_year?: number;
          status?: 'Draft' | 'Menunggu Verifikasi' | 'Terverifikasi' | 'Diterima' | 'Tidak Diterima';
          total_score?: number;
          average_report_score?: number;
          achievement_score?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      parent_data: {
        Row: {
          id: string;
          student_id: string;
          father_name: string;
          mother_name: string;
          parent_job: string | null;
          parent_phone: string;
          parent_address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          father_name: string;
          mother_name: string;
          parent_job?: string | null;
          parent_phone: string;
          parent_address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          father_name?: string;
          mother_name?: string;
          parent_job?: string | null;
          parent_phone?: string;
          parent_address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      report_scores: {
        Row: {
          id: string;
          student_id: string;
          semester: number;
          subject: string;
          score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          semester: number;
          subject: string;
          score: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          semester?: number;
          subject?: string;
          score?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      achievements: {
        Row: {
          id: string;
          student_id: string;
          level: 'Internasional' | 'Nasional' | 'Provinsi' | 'Kabupaten/Kota' | 'Sekolah';
          title: string;
          description: string | null;
          points: number;
          file_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          level: 'Internasional' | 'Nasional' | 'Provinsi' | 'Kabupaten/Kota' | 'Sekolah';
          title: string;
          description?: string | null;
          points?: number;
          file_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          level?: 'Internasional' | 'Nasional' | 'Provinsi' | 'Kabupaten/Kota' | 'Sekolah';
          title?: string;
          description?: string | null;
          points?: number;
          file_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          student_id: string;
          document_type: 'foto_3x4' | 'ijazah_skl' | 'kartu_keluarga' | 'akta_kelahiran' | 'sertifikat_prestasi' | 'lainnya';
          file_url: string;
          file_name: string | null;
          file_size: number | null;
          mime_type: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          document_type: 'foto_3x4' | 'ijazah_skl' | 'kartu_keluarga' | 'akta_kelahiran' | 'sertifikat_prestasi' | 'lainnya';
          file_url: string;
          file_name?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          document_type?: 'foto_3x4' | 'ijazah_skl' | 'kartu_keluarga' | 'akta_kelahiran' | 'sertifikat_prestasi' | 'lainnya';
          file_url?: string;
          file_name?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      major_choices: {
        Row: {
          id: string;
          student_id: string;
          major_id: string;
          choice_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          major_id: string;
          choice_order: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          major_id?: string;
          choice_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      selection_results: {
        Row: {
          id: string;
          student_id: string;
          major_id: string | null;
          choice1_major_id: string | null;
          choice1_rank: number | null;
          choice1_status: 'accepted' | 'rejected' | 'pending';
          choice2_major_id: string | null;
          choice2_rank: number | null;
          choice2_status: 'accepted' | 'rejected' | 'not_applicable' | 'pending';
          final_accepted_major_id: string | null;
          final_accepted_from_priority: number | null;
          score: number;
          rank: number | null;
          status: 'Diterima' | 'Tidak Diterima' | 'Belum Diproses';
          published_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          major_id?: string | null;
          choice1_major_id?: string | null;
          choice1_rank?: number | null;
          choice1_status?: 'accepted' | 'rejected' | 'pending';
          choice2_major_id?: string | null;
          choice2_rank?: number | null;
          choice2_status?: 'accepted' | 'rejected' | 'not_applicable' | 'pending';
          final_accepted_major_id?: string | null;
          final_accepted_from_priority?: number | null;
          score: number;
          rank?: number | null;
          status?: 'Diterima' | 'Tidak Diterima' | 'Belum Diproses';
          published_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          major_id?: string | null;
          choice1_major_id?: string | null;
          choice1_rank?: number | null;
          choice1_status?: 'accepted' | 'rejected' | 'pending';
          choice2_major_id?: string | null;
          choice2_rank?: number | null;
          choice2_status?: 'accepted' | 'rejected' | 'not_applicable' | 'pending';
          final_accepted_major_id?: string | null;
          final_accepted_from_priority?: number | null;
          score?: number;
          rank?: number | null;
          status?: 'Diterima' | 'Tidak Diterima' | 'Belum Diproses';
          published_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string;
          category: 'Pengumuman' | 'Berita' | 'Panduan';
          status: 'Draft' | 'Published' | 'Archived';
          thumbnail_url: string | null;
          author_id: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          content: string;
          category?: 'Pengumuman' | 'Berita' | 'Panduan';
          status?: 'Draft' | 'Published' | 'Archived';
          thumbnail_url?: string | null;
          author_id?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          content?: string;
          category?: 'Pengumuman' | 'Berita' | 'Panduan';
          status?: 'Draft' | 'Published' | 'Archived';
          thumbnail_url?: string | null;
          author_id?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      admin_profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          role: 'super_admin' | 'admin' | 'operator';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          role?: 'super_admin' | 'admin' | 'operator';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          role?: 'super_admin' | 'admin' | 'operator';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      fn_calculate_student_score: {
        Args: { p_student_id: string };
        Returns: number;
      };
      run_selection_process: {
        Args: Record<PropertyKey, never>;
        Returns: {
          success: boolean;
          total_processed: number;
          total_accepted_choice_1: number;
          total_accepted_choice_2: number;
          total_rejected: number;
          details_by_major: any[];
          published_at: string;
        };
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
