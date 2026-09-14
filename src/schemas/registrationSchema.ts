import { z } from 'zod';

export const personalDataSchema = z.object({
  full_name: z.string().trim().min(3, 'Nama lengkap calon siswa wajib diisi (minimal 3 huruf)'),
  nisn: z
    .string()
    .optional()
    .transform((val) => (!val || val.trim() === '' ? undefined : val.trim()))
    .pipe(
      z
        .string()
        .regex(/^[0-9]{10}$/, 'NISN harus tepat 10 digit angka (atau kosongkan jika belum punya)')
        .optional()
    ),
  nik: z
    .string()
    .optional()
    .transform((val) => (!val || val.trim() === '' ? undefined : val.trim()))
    .pipe(
      z
        .string()
        .regex(/^[0-9]{16}$/, 'NIK harus tepat 16 digit angka sesuai Kartu Keluarga/KTP (atau kosongkan)')
        .optional()
    ),
  birth_place: z.string().trim().min(2, 'Tempat lahir wajib diisi (minimal 2 huruf)'),
  birth_date: z.string().min(1, 'Tanggal lahir wajib dipilih'),
  gender: z.enum(['Laki-laki', 'Perempuan'], {
    message: 'Pilih jenis kelamin',
  }),
  religion: z.string().min(1, 'Agama wajib dipilih'),
  address: z.string().trim().min(5, 'Alamat domisili wajib diisi lengkap (minimal 5 karakter)'),
  phone: z
    .string()
    .trim()
    .min(10, 'Nomor HP/WhatsApp minimal 10 digit angka')
    .regex(/^[0-9+ -]+$/, 'Nomor HP/WhatsApp hanya boleh berisi angka (contoh: 081234567890)'),
  email: z.string().trim().email('Format email belum benar (contoh yang benar: nama@gmail.com)'),
  source_school_id: z.string().optional(),
  source_school_name: z.string().trim().min(3, 'Nama asal sekolah SMP/MTs wajib diisi (minimal 3 karakter)'),
  graduation_year: z.number().min(2020, 'Tahun lulus minimal 2020').max(2026, 'Tahun lulus tidak valid'),
});

export const parentDataSchema = z.object({
  father_name: z.string().trim().min(3, 'Nama lengkap ayah kandung/wali wajib diisi (minimal 3 huruf)'),
  mother_name: z.string().trim().min(3, 'Nama lengkap ibu kandung wajib diisi (minimal 3 huruf)'),
  parent_job: z.string().optional(),
  parent_phone: z
    .string()
    .trim()
    .min(10, 'Nomor HP/WhatsApp orang tua minimal 10 digit angka')
    .regex(/^[0-9+ -]+$/, 'Nomor telepon orang tua hanya boleh angka (contoh: 081234567890)'),
  parent_address: z.string().optional(),
});

export const majorChoiceSchema = z
  .object({
    choice_1_major_id: z.string().min(1, 'Pilihan Jurusan 1 (Prioritas Utama) wajib dipilih'),
    choice_2_major_id: z.string().optional(),
  })
  .refine(
    (data) => !data.choice_2_major_id || data.choice_1_major_id !== data.choice_2_major_id,
    {
      message: 'Pilihan Jurusan 2 tidak boleh sama dengan Pilihan Jurusan 1',
      path: ['choice_2_major_id'],
    }
  );

export const reportScoreItemSchema = z.object({
  semester: z.number().min(1).max(5),
  subject: z.string().min(1),
  score: z
    .number({ message: 'Nilai harus berupa angka (0 - 100)' })
    .min(0, 'Nilai minimal 0')
    .max(100, 'Nilai maksimal 100'),
});

export const reportScoresSchema = z.object({
  report_scores: z.array(reportScoreItemSchema).length(25, 'Semua nilai 5 semester (25 nilai) wajib diisi'),
});

export const achievementItemSchema = z.object({
  level: z.enum(['Internasional', 'Nasional', 'Provinsi', 'Kabupaten/Kota', 'Sekolah']),
  title: z.string().trim().min(3, 'Nama kejuaraan/prestasi minimal 3 huruf'),
  description: z.string().optional(),
  file_url: z.string().optional(),
});

export const documentsSchema = z.object({
  photo_url: z.string().optional(),
  diploma_url: z.string().optional(),
  family_card_url: z.string().optional(),
  achievements: z.array(achievementItemSchema).optional(),
});

export const agreementSchema = z.object({
  agreement: z.literal(true, {
    message: 'Anda harus menyetujui pernyataan kebenaran data dengan mencentang kotak persetujuan',
  }),
});

export type PersonalDataInput = z.infer<typeof personalDataSchema>;
export type ParentDataInput = z.infer<typeof parentDataSchema>;
export type MajorChoiceInput = z.infer<typeof majorChoiceSchema>;
export type ReportScoresInput = z.infer<typeof reportScoresSchema>;
export type DocumentsInput = z.infer<typeof documentsSchema>;
export type AgreementInput = z.infer<typeof agreementSchema>;

