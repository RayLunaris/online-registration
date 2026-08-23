import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Upload, 
  FileText, 
  Award, 
  GraduationCap, 
  User, 
  Users, 
  BookOpen, 
  ShieldCheck, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Sparkles,
  Info,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { schoolService } from '@/services/schoolService';
import { studentService } from '@/services/studentService';
import { uploadStorageFile } from '@/lib/supabase';
import { 
  School, 
  Major, 
  SourceSchool, 
  RegistrationFormData, 
  SUBJECT_LIST, 
  AchievementLevel, 
  ACHIEVEMENT_POINTS 
} from '@/types/spmb';
import { 
  personalDataSchema, 
  parentDataSchema, 
  majorChoiceSchema, 
  reportScoresSchema, 
  documentsSchema, 
  achievementItemSchema 
} from '@/schemas/registrationSchema';
import { RegistrationSuccessCard } from '@/components/registration/RegistrationSuccessCard';
import { formatScore } from '@/lib/utils';

const INITIAL_REPORT_SCORES = [1, 2, 3, 4, 5].flatMap((semester) =>
  SUBJECT_LIST.map((subject) => ({
    semester,
    subject,
    score: 80,
  }))
);

const WIZARD_STEPS = [
  { id: 1, title: 'Data Diri', subtitle: 'Biodata & Asal Sekolah', icon: User },
  { id: 2, title: 'Orang Tua', subtitle: 'Data Ayah & Ibu', icon: Users },
  { id: 3, title: 'Jurusan', subtitle: 'Pilihan Program', icon: GraduationCap },
  { id: 4, title: 'Nilai Rapor', subtitle: 'Nilai 5 Semester', icon: BookOpen },
  { id: 5, title: 'Berkas', subtitle: 'Upload Foto & Dokumen', icon: Upload },
  { id: 6, title: 'Konfirmasi', subtitle: 'Review & Kirim', icon: ShieldCheck },
];

export const RegistrationPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [school, setSchool] = useState<School | null>(null);
  const [majors, setMajors] = useState<Major[]>([]);
  const [sourceSchools, setSourceSchools] = useState<SourceSchool[]>([]);

  // Form State
  const [formData, setFormData] = useState<RegistrationFormData>({
    full_name: '',
    nisn: '',
    nik: '',
    birth_place: '',
    birth_date: '',
    gender: 'Laki-laki',
    religion: 'Islam',
    address: '',
    phone: '',
    email: '',
    source_school_id: '',
    source_school_name: '',
    graduation_year: 2026,

    father_name: '',
    mother_name: '',
    parent_job: '',
    parent_phone: '',
    parent_address: '',

    choice_1_major_id: '',
    choice_2_major_id: '',

    report_scores: INITIAL_REPORT_SCORES,
    achievements: [],

    photo_url: '',
    diploma_url: '',
    family_card_url: '',
  });

  // Local File Previews & Upload Status
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successRegNumber, setSuccessRegNumber] = useState<string | null>(null);

  useEffect(() => {
    const initData = async () => {
      const [schoolData, majorsData, schoolsData] = await Promise.all([
        schoolService.getSchoolProfile(),
        schoolService.getMajors(),
        schoolService.getSourceSchools(),
      ]);
      setSchool(schoolData);
      setMajors(majorsData);
      setSourceSchools(schoolsData);

      if (majorsData.length > 0) {
        setFormData((prev) => ({
          ...prev,
          choice_1_major_id: majorsData[0]?.id || '',
        }));
      }
    };
    initData();
  }, []);

  // Calculate live score averages
  const totalScores = formData.report_scores.reduce((acc, curr) => acc + Number(curr.score || 0), 0);
  const averageReportScore = formData.report_scores.length ? totalScores / formData.report_scores.length : 0;
  const maxAchievementPoints = (formData.achievements || []).reduce((max, ach) => {
    const pts = ACHIEVEMENT_POINTS[ach.level] || 0;
    return pts > max ? pts : max;
  }, 0);
  const estimatedTotalScore = (averageReportScore * 0.7) + (maxAchievementPoints * 0.3);

  // Validate step before proceeding
  const validateStep = (step: number): boolean => {
    setErrors({});
    try {
      if (step === 1) {
        personalDataSchema.parse({
          full_name: formData.full_name,
          nisn: formData.nisn || undefined,
          nik: formData.nik || undefined,
          birth_place: formData.birth_place,
          birth_date: formData.birth_date,
          gender: formData.gender,
          religion: formData.religion,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          source_school_name: formData.source_school_name,
          graduation_year: Number(formData.graduation_year),
        });
      } else if (step === 2) {
        parentDataSchema.parse({
          father_name: formData.father_name,
          mother_name: formData.mother_name,
          parent_job: formData.parent_job,
          parent_phone: formData.parent_phone,
          parent_address: formData.parent_address,
        });
      } else if (step === 3) {
        majorChoiceSchema.parse({
          choice_1_major_id: formData.choice_1_major_id,
          choice_2_major_id: formData.choice_2_major_id || undefined,
        });
      } else if (step === 4) {
        reportScoresSchema.parse({
          report_scores: formData.report_scores.map((s) => ({
            semester: s.semester,
            subject: s.subject,
            score: Number(s.score),
          })),
        });
      } else if (step === 5) {
        documentsSchema.parse({
          photo_url: formData.photo_url || undefined,
          diploma_url: formData.diploma_url || undefined,
          family_card_url: formData.family_card_url || undefined,
          achievements: formData.achievements,
        });
      }
      return true;
    } catch (err: any) {
      if (err.errors) {
        const errorMap: Record<string, string> = {};
        err.errors.forEach((e: any) => {
          const field = e.path.join('.');
          errorMap[field] = e.message;
        });
        setErrors(errorMap);
      }
      return false;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Score Input
  const handleScoreChange = (semester: number, subject: string, value: string) => {
    const num = value === '' ? 0 : Math.min(100, Math.max(0, Number(value)));
    setFormData((prev) => ({
      ...prev,
      report_scores: prev.report_scores.map((sc) =>
        sc.semester === semester && sc.subject === subject ? { ...sc, score: num } : sc
      ),
    }));
  };

  // Handle Achievements
  const addAchievement = () => {
    if ((formData.achievements || []).length >= 3) return;
    setFormData((prev) => ({
      ...prev,
      achievements: [
        ...(prev.achievements || []),
        { level: 'Kabupaten/Kota', title: '', description: '', file_url: '' },
      ],
    }));
  };

  const removeAchievement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      achievements: (prev.achievements || []).filter((_, i) => i !== index),
    }));
  };

  const updateAchievement = (index: number, key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      achievements: (prev.achievements || []).map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  // Handle File Uploads to Supabase Storage
  const handleFileUpload = async (
    file: File,
    type: 'photo' | 'diploma' | 'family_card' | 'achievement',
    achievementIndex?: number
  ) => {
    setUploadingFile(type);
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    try {
      if (type === 'photo') {
        const filePath = `photos/${fileName}`;
        const { data, error } = await uploadStorageFile('student-photos', filePath, file);
        if (error) throw error;
        setFormData((prev) => ({ ...prev, photo_url: data?.publicUrl || '' }));
        setPhotoPreview(URL.createObjectURL(file));
      } else {
        const filePath = `documents/${fileName}`;
        const { data, error } = await uploadStorageFile('student-documents', filePath, file);
        if (error) throw error;
        const publicUrl = data?.publicUrl || '';

        if (type === 'diploma') {
          setFormData((prev) => ({ ...prev, diploma_url: publicUrl }));
        } else if (type === 'family_card') {
          setFormData((prev) => ({ ...prev, family_card_url: publicUrl }));
        } else if (type === 'achievement' && typeof achievementIndex === 'number') {
          updateAchievement(achievementIndex, 'file_url', publicUrl);
        }
      }
    } catch (err: any) {
      console.error('Error uploading file:', err);
      alert('Gagal mengunggah file. Pastikan format file sesuai (JPG/PNG/PDF).');
    } finally {
      setUploadingFile(null);
    }
  };

  // Handle Final Submission
  const handleSubmitRegistration = async () => {
    if (!agreementChecked) {
      setErrors({ agreement: 'Anda harus menyetujui pernyataan kebenaran data' });
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await studentService.submitRegistration(formData);
      if (res.success && res.registrationNumber) {
        setSuccessRegNumber(res.registrationNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setSubmitError(res.error || 'Terjadi kesalahan saat memproses pendaftaran.');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Terjadi gangguan koneksi server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successRegNumber) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <RegistrationSuccessCard
            registrationNumber={successRegNumber}
            formData={formData}
            school={school}
            majors={majors}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 gap-1.5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Link>
        </div>

        {/* Page Title */}
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <Badge variant="secondary" className="text-blue-700 bg-blue-100 gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Pendaftaran Online SPMB 2026/2027
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Formulir Pendaftaran Siswa Baru
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Lengkapi 6 langkah formulir di bawah ini dengan data yang valid dan benar.
          </p>
        </div>

        {/* STEPPER PROGRESS BAR */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm mb-8">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {WIZARD_STEPS.map((step) => {
              const isCurrent = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const StepIcon = step.icon;

              return (
                <button
                  key={step.id}
                  onClick={() => {
                    if (step.id < currentStep) setCurrentStep(step.id);
                  }}
                  disabled={step.id > currentStep}
                  className={`flex flex-col items-center text-center p-2 rounded-xl transition-all ${
                    isCurrent
                      ? 'bg-blue-50 text-blue-600 font-bold ring-2 ring-blue-600/30'
                      : isCompleted
                      ? 'text-emerald-700 hover:bg-slate-50 cursor-pointer'
                      : 'text-slate-400 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : step.id}
                  </div>
                  <span className="text-xs leading-tight font-semibold block">{step.title}</span>
                  <span className="text-[10px] text-slate-400 hidden sm:block mt-0.5">{step.subtitle}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FORM CONTENT CARD */}
        <Card className="border-slate-200 shadow-md overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/80 border-b border-slate-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
                  Langkah {currentStep} dari 6
                </span>
                <CardTitle className="text-xl font-bold text-slate-900 mt-0.5">
                  {WIZARD_STEPS[currentStep - 1].title}: {WIZARD_STEPS[currentStep - 1].subtitle}
                </CardTitle>
              </div>
              <Badge variant="outline" className="text-xs font-mono font-semibold">
                Tahap {currentStep}/6
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* STEP 1: BIODATA SISWA & ASAL SEKOLAH */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nama Lengkap */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Nama Lengkap Calon Siswa <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Sesuai Akta Kelahiran / Ijazah"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className={errors['full_name'] ? 'border-red-500' : ''}
                    />
                    {errors['full_name'] && (
                      <p className="text-[11px] text-red-500 font-medium">{errors['full_name']}</p>
                    )}
                  </div>

                  {/* NISN */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      NISN (10 Digit)
                    </label>
                    <Input
                      placeholder="Contoh: 0071234567"
                      maxLength={10}
                      value={formData.nisn || ''}
                      onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                      className={errors['nisn'] ? 'border-red-500' : ''}
                    />
                    {errors['nisn'] && (
                      <p className="text-[11px] text-red-500 font-medium">{errors['nisn']}</p>
                    )}
                  </div>

                  {/* NIK */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      NIK (16 Digit KTP/KK)
                    </label>
                    <Input
                      placeholder="16 digit sesuai Kartu Keluarga"
                      maxLength={16}
                      value={formData.nik || ''}
                      onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                      className={errors['nik'] ? 'border-red-500' : ''}
                    />
                    {errors['nik'] && (
                      <p className="text-[11px] text-red-500 font-medium">{errors['nik']}</p>
                    )}
                  </div>

                  {/* Tempat Lahir */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Tempat Lahir <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Kota / Kabupaten Kelahiran"
                      value={formData.birth_place}
                      onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
                      className={errors['birth_place'] ? 'border-red-500' : ''}
                    />
                    {errors['birth_place'] && (
                      <p className="text-[11px] text-red-500 font-medium">{errors['birth_place']}</p>
                    )}
                  </div>

                  {/* Tanggal Lahir */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Tanggal Lahir <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                      className={errors['birth_date'] ? 'border-red-500' : ''}
                    />
                    {errors['birth_date'] && (
                      <p className="text-[11px] text-red-500 font-medium">{errors['birth_date']}</p>
                    )}
                  </div>

                  {/* Jenis Kelamin */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Jenis Kelamin <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-full h-10 px-3 text-xs bg-background border rounded-md border-input focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>

                  {/* Agama */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Agama <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.religion}
                      onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                      className="w-full h-10 px-3 text-xs bg-background border rounded-md border-input focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Islam">Islam</option>
                      <option value="Kristen Protestan">Kristen Protestan</option>
                      <option value="Katolik">Katolik</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Buddha">Buddha</option>
                      <option value="Konghucu">Konghucu</option>
                    </select>
                  </div>

                  {/* No HP / WA */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      No. WhatsApp / HP Aktif <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Contoh: 081234567890"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={errors['phone'] ? 'border-red-500' : ''}
                    />
                    {errors['phone'] && (
                      <p className="text-[11px] text-red-500 font-medium">{errors['phone']}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Alamat Email Aktif <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="nama@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={errors['email'] ? 'border-red-500' : ''}
                    />
                    {errors['email'] && (
                      <p className="text-[11px] text-red-500 font-medium">{errors['email']}</p>
                    )}
                  </div>

                  {/* Alamat Lengkap */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Alamat Domisili Lengkap <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Nama Jalan, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className={`w-full p-3 text-xs bg-background border rounded-md border-input focus:ring-2 focus:ring-blue-500 ${
                        errors['address'] ? 'border-red-500' : ''
                      }`}
                    />
                    {errors['address'] && (
                      <p className="text-[11px] text-red-500 font-medium">{errors['address']}</p>
                    )}
                  </div>
                </div>

                {/* Sub-Section: Asal Sekolah */}
                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-blue-600" />
                    Data Asal Sekolah (SMP / MTs)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Pilih Master Asal Sekolah */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Nama SMP/MTs Asal <span className="text-red-500">*</span>
                      </label>
                      <Input
                        list="source-schools-list"
                        placeholder="Ketik atau pilih nama SMP/MTs Anda"
                        value={formData.source_school_name}
                        onChange={(e) => {
                          const val = e.target.value;
                          const found = sourceSchools.find((s) => s.name.toLowerCase() === val.toLowerCase());
                          setFormData({
                            ...formData,
                            source_school_name: val,
                            source_school_id: found ? found.id : undefined,
                          });
                        }}
                        className={errors['source_school_name'] ? 'border-red-500' : ''}
                      />
                      <datalist id="source-schools-list">
                        {sourceSchools.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.city} - NPSN: {s.npsn || '-'}
                          </option>
                        ))}
                      </datalist>
                      {errors['source_school_name'] && (
                        <p className="text-[11px] text-red-500 font-medium">{errors['source_school_name']}</p>
                      )}
                    </div>

                    {/* Tahun Lulus */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Tahun Lulus SMP <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.graduation_year}
                        onChange={(e) => setFormData({ ...formData, graduation_year: Number(e.target.value) })}
                        className="w-full h-10 px-3 text-xs bg-background border rounded-md border-input focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={2026}>2026 (Tahun Ini)</option>
                        <option value={2025}>2025</option>
                        <option value={2024}>2024</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: DATA ORANG TUA / WALI */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nama Ayah */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Nama Lengkap Ayah Kandung / Wali <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Nama ayah"
                      value={formData.father_name}
                      onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                      className={errors['father_name'] ? 'border-red-500' : ''}
                    />
                    {errors['father_name'] && (
                      <p className="text-[11px] text-red-500 font-medium">{errors['father_name']}</p>
                    )}
                  </div>

                  {/* Nama Ibu */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Nama Lengkap Ibu Kandung <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Nama ibu"
                      value={formData.mother_name}
                      onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
                      className={errors['mother_name'] ? 'border-red-500' : ''}
                    />
                    {errors['mother_name'] && (
                      <p className="text-[11px] text-red-500 font-medium">{errors['mother_name']}</p>
                    )}
                  </div>

                  {/* Pekerjaan Orang Tua */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Pekerjaan Orang Tua / Wali
                    </label>
                    <Input
                      placeholder="Contoh: Karyawan Swasta / Wiraswasta / PNS"
                      value={formData.parent_job || ''}
                      onChange={(e) => setFormData({ ...formData, parent_job: e.target.value })}
                    />
                  </div>

                  {/* No HP Orang Tua */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      No. WhatsApp / HP Orang Tua <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Nomor HP orang tua yang bisa dihubungi"
                      value={formData.parent_phone}
                      onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                      className={errors['parent_phone'] ? 'border-red-500' : ''}
                    />
                    {errors['parent_phone'] && (
                      <p className="text-[11px] text-red-500 font-medium">{errors['parent_phone']}</p>
                    )}
                  </div>

                  {/* Alamat Orang Tua */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        Alamat Orang Tua / Wali
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, parent_address: formData.address })}
                        className="text-[11px] text-blue-600 hover:underline font-semibold"
                      >
                        Sama dengan alamat siswa
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Alamat tempat tinggal orang tua"
                      value={formData.parent_address || ''}
                      onChange={(e) => setFormData({ ...formData, parent_address: e.target.value })}
                      className="w-full p-3 text-xs bg-background border rounded-md border-input focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: PILIHAN JURUSAN */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
                  <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    Pilihlah <strong>Pilihan 1</strong> sebagai jurusan prioritas utama Anda. Anda juga dapat memilih <strong>Pilihan 2</strong> sebagai opsi alternatif apabila kuota pilihan utama telah penuh.
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Pilihan 1 */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                      <span>Pilihan Jurusan 1 (Prioritas Utama) <span className="text-red-500">*</span></span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {majors.map((major) => (
                        <div
                          key={major.id}
                          onClick={() => setFormData({ ...formData, choice_1_major_id: major.id })}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            formData.choice_1_major_id === major.id
                              ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-600/20 shadow-sm'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-900 text-sm">{major.name}</span>
                            <Badge variant="outline" className="text-[10px] font-bold">
                              {major.code}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2">{major.description}</p>
                          <div className="mt-2 text-[11px] font-semibold text-blue-600">
                            Kuota: {major.quota} Siswa
                          </div>
                        </div>
                      ))}
                    </div>
                    {errors['choice_1_major_id'] && (
                      <p className="text-[11px] text-red-500 font-medium">{errors['choice_1_major_id']}</p>
                    )}
                  </div>

                  {/* Pilihan 2 */}
                  <div className="space-y-2 pt-4 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="h-5 w-5 rounded-full bg-slate-600 text-white flex items-center justify-center text-[10px]">2</span>
                      <span>Pilihan Jurusan 2 (Alternatif / Opsional)</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {majors.map((major) => {
                        const isSelected1 = formData.choice_1_major_id === major.id;
                        const isSelected2 = formData.choice_2_major_id === major.id;

                        return (
                          <div
                            key={major.id}
                            onClick={() => {
                              if (!isSelected1) {
                                setFormData({
                                  ...formData,
                                  choice_2_major_id: isSelected2 ? '' : major.id,
                                });
                              }
                            }}
                            className={`p-4 rounded-xl border transition-all ${
                              isSelected1
                                ? 'border-slate-200 bg-slate-100 opacity-50 cursor-not-allowed'
                                : isSelected2
                                ? 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-600/20 shadow-sm cursor-pointer'
                                : 'border-slate-200 hover:bg-slate-50 cursor-pointer'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-slate-900 text-sm">{major.name}</span>
                              <Badge variant="outline" className="text-[10px] font-bold">
                                {major.code}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2">{major.description}</p>
                            {isSelected1 && (
                              <span className="text-[10px] text-amber-600 font-semibold block mt-2">
                                (Sudah dipilih sebagai Pilihan 1)
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {errors['choice_2_major_id'] && (
                      <p className="text-[11px] text-red-500 font-medium">{errors['choice_2_major_id']}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: NILAI RAPOR 5 SEMESTER */}
            {currentStep === 4 && (
              <div className="space-y-6">
                {/* Live Average Score Banner */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                  <div>
                    <span className="text-xs text-blue-100 block">Kalkulator Nilai Otomatis (Bobot 70%)</span>
                    <h4 className="text-lg font-bold">Rata-rata Nilai Rapor Semester 1 - 5</h4>
                  </div>
                  <div className="text-3xl font-extrabold font-mono bg-white/10 px-4 py-1.5 rounded-lg backdrop-blur-sm">
                    {formatScore(averageReportScore)}
                  </div>
                </div>

                {/* Score Input by Semester */}
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((semester) => {
                    const semesterScores = formData.report_scores.filter((sc) => sc.semester === semester);
                    const semTotal = semesterScores.reduce((a, c) => a + Number(c.score || 0), 0);
                    const semAvg = semesterScores.length ? semTotal / semesterScores.length : 0;

                    return (
                      <div key={semester} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Semester {semester}
                          </h4>
                          <span className="text-xs font-semibold text-blue-600">
                            Rata-rata: {formatScore(semAvg)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                          {SUBJECT_LIST.map((subject) => {
                            const scObj = formData.report_scores.find(
                              (s) => s.semester === semester && s.subject === subject
                            );
                            const val = scObj?.score ?? 80;

                            return (
                              <div key={subject} className="space-y-1">
                                <label className="text-[11px] font-medium text-slate-600 truncate block">
                                  {subject}
                                </label>
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={val}
                                  onChange={(e) => handleScoreChange(semester, subject, e.target.value)}
                                  className="h-9 text-xs font-mono font-semibold text-center"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 5: PRESTASI & UNGGAH BERKAS */}
            {currentStep === 5 && (
              <div className="space-y-8">
                {/* Upload Dokumen Wajib */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    Upload Dokumen Persyaratan
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Pasfoto 3x4 */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 text-center">
                      <span className="text-xs font-bold text-slate-800 block">Pasfoto 3x4 Formal</span>
                      {photoPreview || formData.photo_url ? (
                        <img
                          src={photoPreview || formData.photo_url}
                          alt="Pasfoto"
                          className="h-28 w-20 object-cover mx-auto rounded-md border"
                        />
                      ) : (
                        <div className="h-28 w-20 bg-slate-200 mx-auto rounded-md flex items-center justify-center text-slate-400">
                          <ImageIcon className="h-8 w-8" />
                        </div>
                      )}
                      <label className="cursor-pointer inline-block">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={uploadingFile === 'photo'}
                          className="text-xs h-8 gap-1.5 pointer-events-none"
                        >
                          <Upload className="h-3 w-3" />
                          {uploadingFile === 'photo' ? 'Mengunggah...' : 'Pilih Foto (JPG/PNG)'}
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, 'photo');
                          }}
                        />
                      </label>
                      <p className="text-[10px] text-slate-500">Maks. 2MB (Latar Merah/Biru)</p>
                    </div>

                    {/* Scan Ijazah / SKL */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 text-center flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Scan Ijazah / SKL</span>
                        <p className="text-[11px] text-slate-500 mt-1">Surat Keterangan Lulus dari SMP/MTs</p>
                      </div>
                      <div className="py-2">
                        {formData.diploma_url ? (
                          <Badge className="bg-emerald-600 text-white text-[10px] gap-1 py-1">
                            <Check className="h-3 w-3" /> Terunggah
                          </Badge>
                        ) : (
                          <span className="text-[11px] text-slate-400">Belum diunggah</span>
                        )}
                      </div>
                      <label className="cursor-pointer inline-block">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={uploadingFile === 'diploma'}
                          className="text-xs h-8 gap-1.5 pointer-events-none w-full"
                        >
                          <Upload className="h-3 w-3" />
                          {uploadingFile === 'diploma' ? 'Mengunggah...' : 'Pilih File (PDF/JPG)'}
                        </Button>
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, 'diploma');
                          }}
                        />
                      </label>
                      <p className="text-[10px] text-slate-500">Maksimal 5MB</p>
                    </div>

                    {/* Scan Kartu Keluarga */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 text-center flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Scan Kartu Keluarga</span>
                        <p className="text-[11px] text-slate-500 mt-1">Kartu Keluarga asli / legalisir</p>
                      </div>
                      <div className="py-2">
                        {formData.family_card_url ? (
                          <Badge className="bg-emerald-600 text-white text-[10px] gap-1 py-1">
                            <Check className="h-3 w-3" /> Terunggah
                          </Badge>
                        ) : (
                          <span className="text-[11px] text-slate-400">Belum diunggah</span>
                        )}
                      </div>
                      <label className="cursor-pointer inline-block">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={uploadingFile === 'family_card'}
                          className="text-xs h-8 gap-1.5 pointer-events-none w-full"
                        >
                          <Upload className="h-3 w-3" />
                          {uploadingFile === 'family_card' ? 'Mengunggah...' : 'Pilih File (PDF/JPG)'}
                        </Button>
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, 'family_card');
                          }}
                        />
                      </label>
                      <p className="text-[10px] text-slate-500">Maksimal 5MB</p>
                    </div>
                  </div>
                </div>

                {/* Sub-Section: Prestasi & Sertifikat (Opsional) */}
                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Award className="h-4 w-4 text-purple-600" />
                        Piagam / Sertifikat Prestasi (Opsional - Bobot 30%)
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Tambahkan sertifikat kejuaraan lomba akademik atau non-akademik (maks. 3 prestasi).
                      </p>
                    </div>
                    {(formData.achievements || []).length < 3 && (
                      <Button
                        type="button"
                        onClick={addAchievement}
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 gap-1 border-purple-200 text-purple-700 hover:bg-purple-50"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Tambah Prestasi
                      </Button>
                    )}
                  </div>

                  {/* Achievements List */}
                  {(formData.achievements || []).length > 0 ? (
                    <div className="space-y-3">
                      {(formData.achievements || []).map((ach, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-purple-100 bg-purple-50/40 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-purple-900">
                              Prestasi #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeAchievement(idx)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <label className="text-[11px] font-medium text-slate-700">Tingkat Kejuaraan</label>
                              <select
                                value={ach.level}
                                onChange={(e) => updateAchievement(idx, 'level', e.target.value as AchievementLevel)}
                                className="w-full h-9 px-2 text-xs bg-white border rounded-md border-input"
                              >
                                <option value="Internasional">Internasional (100 Poin)</option>
                                <option value="Nasional">Nasional (80 Poin)</option>
                                <option value="Provinsi">Provinsi (60 Poin)</option>
                                <option value="Kabupaten/Kota">Kabupaten/Kota (40 Poin)</option>
                                <option value="Sekolah">Sekolah (20 Poin)</option>
                              </select>
                            </div>

                            <div className="sm:col-span-2 space-y-1">
                              <label className="text-[11px] font-medium text-slate-700">Nama Kejuaraan / Lomba</label>
                              <Input
                                placeholder="Contoh: Juara 1 Olimpiade Sains Nasional"
                                value={ach.title}
                                onChange={(e) => updateAchievement(idx, 'title', e.target.value)}
                                className="h-9 text-xs bg-white"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 border border-dashed rounded-xl text-xs text-slate-500">
                      Belum ada prestasi yang ditambahkan. Klik "Tambah Prestasi" jika Anda memiliki piagam kejuaraan.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 6: REVIEW & KONFIRMASI */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                    Ringkasan Pendaftaran
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Nama Lengkap:</span>
                      <strong className="text-slate-800">{formData.full_name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Asal Sekolah:</span>
                      <strong className="text-slate-800">{formData.source_school_name} (Lulus {formData.graduation_year})</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Pilihan Jurusan 1:</span>
                      <strong className="text-blue-600 font-bold">
                        {majors.find((m) => m.id === formData.choice_1_major_id)?.name || '-'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Pilihan Jurusan 2:</span>
                      <strong className="text-slate-700">
                        {majors.find((m) => m.id === formData.choice_2_major_id)?.name || 'Tidak Memilih'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Rata-rata Rapor (70%):</span>
                      <strong className="text-slate-800 font-mono text-sm">{formatScore(averageReportScore)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Estimasi Total Skor:</span>
                      <strong className="text-emerald-600 font-mono text-sm">{formatScore(estimatedTotalScore)}</strong>
                    </div>
                  </div>
                </div>

                {/* Agreement Checkbox */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreementChecked}
                      onChange={(e) => setAgreementChecked(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                    />
                    <span className="text-xs text-slate-700 leading-relaxed">
                      Saya menyatakan dengan sesungguhnya bahwa seluruh data dan berkas yang saya isikan pada formulir pendaftaran ini adalah <strong>benar, sah, dan dapat dipertanggungjawabkan</strong>. Apabila di kemudian hari ditemukan ketidaksesuaian data, saya bersedia menerima sanksi pembatalan status pendaftaran sesuai ketentuan panitia SPMB.
                    </span>
                  </label>
                  {errors['agreement'] && (
                    <p className="text-[11px] text-red-500 font-medium">{errors['agreement']}</p>
                  )}
                </div>

                {submitError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Gagal Mengirim Pendaftaran</AlertTitle>
                    <AlertDescription className="text-xs">{submitError}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* ACTION NAVIGATION BUTTONS */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  className="text-xs font-semibold h-10 gap-1.5"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Sebelumnya
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 6 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-10 gap-1.5 px-6"
                >
                  Langkah Selanjutnya
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={isSubmitting || !agreementChecked}
                  onClick={handleSubmitRegistration}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-10 gap-2 px-8 shadow-md shadow-emerald-600/20"
                >
                  {isSubmitting ? (
                    <span>Mengirim Pendaftaran...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Kirim Formulir Pendaftaran</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
