import { z } from 'zod';

export const personalDataSchema = z.object({
  full_name: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  nisn: z
    .string()
    .optional()
    .refine((val) => !val || /^[0-9]{10}$/.test(val), {
      message: 'NISN harus terdiri dari 10 digit angka',
    }),
  nik: z
    .string()
    .optional()
    .refine((val) => !val || /^[0-9]{16}$/.test(val), {
      message: 'NIK harus terdiri dari 16 digit angka',
    }),
  birth_place: z.string().min(2, 'Tempat lahir wajib diisi'),
  birth_date: z.string().min(1, 'Tanggal lahir wajib dipilih'),
  gender: z.enum(['Laki-laki', 'Perempuan'], {
    errorMap: () => ({ message: 'Pilih jenis kelamin' }),
  }),
  religion: z.string().min(1, 'Agama wajib dipilih'),
  address: z.string().min(5, 'Alamat lengkap minimal 5 karakter'),
  phone: z
    .string()
    .min(10, 'Nomor telepon/WhatsApp minimal 10 digit')
    .regex(/^[0-9+ -]+$/, 'Format nomor telepon tidak valid'),
  email: z.string().email('Format email tidak valid'),
  source_school_id: z.string().optional(),
  source_school_name: z.string().min(3, 'Nama asal sekolah minimal 3 karakter'),
  graduation_year: z.number().min(2020).max(2026, 'Tahun lulus tidak valid'),
});

export const parentDataSchema = z.object({
  father_name: z.string().min(3, 'Nama ayah minimal 3 karakter'),
  mother_name: z.string().min(3, 'Nama ibu minimal 3 karakter'),
  parent_job: z.string().optional(),
  parent_phone: z
    .string()
    .min(10, 'Nomor HP/WA orang tua minimal 10 digit')
    .regex(/^[0-9+ -]+$/, 'Format nomor telepon tidak valid'),
  parent_address: z.string().optional(),
});

export const majorChoiceSchema = z
  .object({
    choice_1_major_id: z.string().min(1, 'Pilihan Jurusan 1 wajib dipilih'),
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
    .number({ invalid_type_error: 'Nilai harus berupa angka' })
    .min(0, 'Nilai minimal 0')
    .max(100, 'Nilai maksimal 100'),
});

export const reportScoresSchema = z.object({
  report_scores: z.array(reportScoreItemSchema).min(25, 'Semua nilai 5 semester (25 nilai) wajib diisi'),
});

export const achievementItemSchema = z.object({
  level: z.enum(['Internasional', 'Nasional', 'Provinsi', 'Kabupaten/Kota', 'Sekolah']),
  title: z.string().min(3, 'Nama kejuaraan minimal 3 karakter'),
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
    errorMap: () => ({ message: 'Anda harus menyetujui pernyataan kebenaran data' }),
  }),
});

export type PersonalDataInput = z.infer<typeof personalDataSchema>;
export type ParentDataInput = z.infer<typeof parentDataSchema>;
export type MajorChoiceInput = z.infer<typeof majorChoiceSchema>;
export type ReportScoresInput = z.infer<typeof reportScoresSchema>;
export type DocumentsInput = z.infer<typeof documentsSchema>;
export type AgreementInput = z.infer<typeof agreementSchema>;
