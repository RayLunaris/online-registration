import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFormDraft, readDraft, clearDraft } from '@/hooks/useFormDraft';
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
  Image as ImageIcon,
  AlertTriangle,
  Save,
  FileSpreadsheet,
  Zap,
  Keyboard,
  ArrowUpDown,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { schoolService } from '@/services/schoolService';
import { studentService } from '@/services/studentService';
import { uploadStorageFile } from '@/lib/supabase';
import { 
  Major, 
  SourceSchool, 
  RegistrationFormData, 
  SUBJECT_LIST, 
  AchievementLevel,
  ACHIEVEMENT_POINTS 
} from '@/types/spmb';
import { useSchool } from '@/context/SchoolContext';
import { 
  personalDataSchema, 
  parentDataSchema, 
  majorChoiceSchema, 
  reportScoresSchema, 
  documentsSchema 
} from '@/schemas/registrationSchema';
import { RegistrationSuccessCard } from '@/components/registration/RegistrationSuccessCard';
import { RegistrationClosedPage } from '@/pages/public/RegistrationClosedPage';
import { useRegistrationStatus } from '@/hooks/useRegistrationStatus';
import { formatScore } from '@/lib/utils';

const INITIAL_REPORT_SCORES = [1, 2, 3, 4, 5].flatMap((semester) =>
  SUBJECT_LIST.map((subject) => ({
    semester,
    subject,
    score: 80,
  }))
);

const getCellId = (semester: number, subjIdx: number) => `rapor_cell_${semester}_${subjIdx}`;

interface ParsedScoreItem {
  semester: number;
  subject: string;
  score: number;
}

function parseExcelScores(text: string, isTransposed: boolean): ParsedScoreItem[] {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const grid = lines.map((line) =>
    line
      .split(/\t|,|;/)
      .map((c) => c.trim())
      .filter(Boolean)
  );

  const flatNumbers = grid
    .flat()
    .map((v) => parseFloat(v.replace(/,/g, '.')))
    .filter((n) => !isNaN(n));

  const result: ParsedScoreItem[] = [];

  if (flatNumbers.length === 25) {
    let idx = 0;
    for (let sem = 1; sem <= 5; sem++) {
      for (let s = 0; s < SUBJECT_LIST.length; s++) {
        const val = flatNumbers[idx++];
        result.push({
          semester: sem,
          subject: SUBJECT_LIST[s],
          score: Math.min(100, Math.max(0, Math.round(val))),
        });
      }
    }
    return result;
  }

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const num = parseFloat(grid[r][c].replace(/,/g, '.'));
      if (isNaN(num)) continue;
      const clamped = Math.min(100, Math.max(0, Math.round(num)));

      if (isTransposed) {
        if (r < SUBJECT_LIST.length && c < 5) {
          result.push({
            semester: c + 1,
            subject: SUBJECT_LIST[r],
            score: clamped,
          });
        }
      } else {
        if (r < 5 && c < SUBJECT_LIST.length) {
          result.push({
            semester: r + 1,
            subject: SUBJECT_LIST[c],
            score: clamped,
          });
        }
      }
    }
  }

  return result;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const WIZARD_STEPS = [
  { id: 1, title: 'Data Diri', subtitle: 'Biodata & Asal Sekolah', icon: User },
  { id: 2, title: 'Orang Tua', subtitle: 'Data Ayah & Ibu', icon: Users },
  { id: 3, title: 'Jurusan', subtitle: 'Pilihan Program', icon: GraduationCap },
  { id: 4, title: 'Nilai Rapor', subtitle: 'Nilai 5 Semester', icon: BookOpen },
  { id: 5, title: 'Berkas', subtitle: 'Upload Foto & Dokumen', icon: Upload },
  { id: 6, title: 'Konfirmasi', subtitle: 'Review & Kirim', icon: ShieldCheck },
];

const INITIAL_FORM_DATA: RegistrationFormData = {
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
};

export const RegistrationPage: React.FC = () => {
  const registrationStatus = useRegistrationStatus();
  const { saveDraft } = useFormDraft();

  // Lazy-initialize currentStep from saved draft so reopen tab instantly resumes on that step
  const [currentStep, setCurrentStep] = useState<number>(() => {
    const draft = readDraft();
    if (draft?.currentStep && draft.currentStep >= 1 && draft.currentStep <= 6) {
      return draft.currentStep;
    }
    return 1;
  });

  const [draftRestoredAt, setDraftRestoredAt] = useState<string | null>(() => {
    const draft = readDraft();
    return draft?.savedAt || null;
  });

  const { school } = useSchool();
  const [majors, setMajors] = useState<Major[]>([]);
  const [sourceSchools, setSourceSchools] = useState<SourceSchool[]>([]);

  // Form State initialized with draft if available, else INITIAL_FORM_DATA
  const [formData, setFormData] = useState<RegistrationFormData>(() => {
    const draft = readDraft();
    if (draft?.formData) {
      return {
        ...INITIAL_FORM_DATA,
        ...draft.formData,
        report_scores: draft.formData.report_scores?.length === 25
          ? draft.formData.report_scores
          : INITIAL_REPORT_SCORES,
      };
    }
    return INITIAL_FORM_DATA;
  });

  // Local File Previews & Upload Status
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const photoPreviewUrlRef = useRef<string | null>(null);

  // Revoke object URL on unmount to prevent memory leak
  useEffect(() => {
    return () => {
      if (photoPreviewUrlRef.current) {
        URL.revokeObjectURL(photoPreviewUrlRef.current);
      }
    };
  }, []);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadFileInfo, setUploadFileInfo] = useState<Record<string, { name: string; size: string }>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successRegNumber, setSuccessRegNumber] = useState<string | null>(null);

  // Excel Spreadsheet Paste & Keyboard Navigation States
  const [isPasteDialogOpen, setIsPasteDialogOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [pasteIsTransposed, setPasteIsTransposed] = useState(false);

  const parsedExcelScores = useMemo(() => {
    return parseExcelScores(pasteText, pasteIsTransposed);
  }, [pasteText, pasteIsTransposed]);

  // Autosave draft on every formData / step change (debounced 800ms, paused on submit success)
  useEffect(() => {
    if (!successRegNumber) {
      saveDraft(formData, currentStep);
    }
  }, [formData, currentStep, successRegNumber, saveDraft]);

  useEffect(() => {
    const initData = async () => {
      const [majorsData, schoolsData] = await Promise.all([
        schoolService.getMajors(),
        schoolService.getSourceSchools(),
      ]);
      setMajors(majorsData);
      setSourceSchools(schoolsData);

      // Only set default major if choice_1_major_id is not already populated from draft
      if (majorsData.length > 0) {
        setFormData((prev) => {
          if (prev.choice_1_major_id) return prev;
          return {
            ...prev,
            choice_1_major_id: majorsData[0]?.id || '',
          };
        });
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

  // Realtime field updater that clears error when user starts typing
  const handleFieldChange = (field: keyof RegistrationFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    }
  };

  // Validate step before proceeding
  const validateStep = (step: number): boolean => {
    setErrors({});
    try {
      if (step === 1) {
        personalDataSchema.parse({
          full_name: formData.full_name?.trim() || '',
          nisn: formData.nisn?.trim() ? formData.nisn.trim() : undefined,
          nik: formData.nik?.trim() ? formData.nik.trim() : undefined,
          birth_place: formData.birth_place?.trim() || '',
          birth_date: formData.birth_date || '',
          gender: formData.gender,
          religion: formData.religion,
          address: formData.address?.trim() || '',
          phone: formData.phone?.trim() || '',
          email: formData.email?.trim() || '',
          source_school_name: formData.source_school_name?.trim() || '',
          graduation_year: Number(formData.graduation_year),
        });
      } else if (step === 2) {
        parentDataSchema.parse({
          father_name: formData.father_name?.trim() || '',
          mother_name: formData.mother_name?.trim() || '',
          parent_job: formData.parent_job?.trim() || undefined,
          parent_phone: formData.parent_phone?.trim() || '',
          parent_address: formData.parent_address?.trim() || undefined,
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
      const issues = err.issues || err.errors;
      if (issues) {
        const errorMap: Record<string, string> = {};
        issues.forEach((e: any) => {
          const field = e.path.join('.');
          errorMap[field] = e.message;
        });
        setErrors(errorMap);

        // Scroll to the error banner so user sees the list immediately
        setTimeout(() => {
          const errorBanner = document.getElementById('step-validation-alert');
          if (errorBanner) {
            errorBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            window.scrollTo({ top: 160, behavior: 'smooth' });
          }
        }, 80);
      }
      return false;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setErrors({});
      const nextStep = Math.min(currentStep + 1, 6);
      setCurrentStep(nextStep);
      saveDraft(formData, nextStep, { immediate: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setErrors({});
    const prevStep = Math.max(currentStep - 1, 1);
    setCurrentStep(prevStep);
    saveDraft(formData, prevStep, { immediate: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stepperRef = useRef<HTMLElement>(null);

  const handleStepClick = (targetStepId: number) => {
    if (targetStepId === currentStep) return;

    if (targetStepId < currentStep) {
      setErrors({});
      setCurrentStep(targetStepId);
      saveDraft(formData, targetStepId, { immediate: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Moving forward: validate current step first
    if (validateStep(currentStep)) {
      setErrors({});
      // If jumping ahead to targetStepId, check all intermediate steps
      let target = targetStepId;
      for (let s = currentStep + 1; s < targetStepId; s++) {
        if (!validateStep(s)) {
          target = s;
          break;
        }
      }
      setCurrentStep(target);
      saveDraft(formData, target, { immediate: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepperKeyDown = (e: React.KeyboardEvent, index: number) => {
    const totalSteps = WIZARD_STEPS.length;
    let targetIndex = -1;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      targetIndex = (index + 1) % totalSteps;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      targetIndex = (index - 1 + totalSteps) % totalSteps;
    } else if (e.key === 'Home') {
      e.preventDefault();
      targetIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      targetIndex = totalSteps - 1;
    }

    if (targetIndex !== -1 && stepperRef.current) {
      const buttons = stepperRef.current.querySelectorAll<HTMLButtonElement>('button[data-step-id]');
      if (buttons[targetIndex]) {
        buttons[targetIndex].focus();
      }
    }
  };

  const handleResetDraft = () => {
    clearDraft();
    setDraftRestoredAt(null);
    setCurrentStep(1);
    setErrors({});
    setFormData({
      ...INITIAL_FORM_DATA,
      choice_1_major_id: majors[0]?.id || '',
    });
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

  // Fill all 25 score fields with a single value
  const handleFillAllScores = (value: number) => {
    const clamped = Math.min(100, Math.max(0, value));
    setFormData((prev) => ({
      ...prev,
      report_scores: prev.report_scores.map((sc) => ({ ...sc, score: clamped })),
    }));
  };

  // Copy one semester's scores to all other semesters
  const handleCopySemester = (sourceSemester: number) => {
    setFormData((prev) => {
      const sourceScores = prev.report_scores.filter((sc) => sc.semester === sourceSemester);
      return {
        ...prev,
        report_scores: prev.report_scores.map((sc) => {
          if (sc.semester === sourceSemester) return sc;
          const match = sourceScores.find((s) => s.subject === sc.subject);
          return match ? { ...sc, score: match.score } : sc;
        }),
      };
    });
  };

  // Apply parsed scores from Excel paste dialog
  const handleApplyExcelPaste = () => {
    if (parsedExcelScores.length === 0) return;

    setFormData((prev) => {
      const updated = [...prev.report_scores];
      parsedExcelScores.forEach((item) => {
        const idx = updated.findIndex(
          (s) => s.semester === item.semester && s.subject === item.subject
        );
        if (idx !== -1) {
          updated[idx] = { ...updated[idx], score: item.score };
        }
      });
      return { ...prev, report_scores: updated };
    });

    setIsPasteDialogOpen(false);
    setPasteText('');
  };

  // Keyboard navigation antar cell (ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Enter)
  const handleCellKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    sem: number,
    col: number
  ) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter') {
      e.preventDefault();
      let targetSem = sem;
      let targetCol = col;
      if (sem < 5) {
        targetSem = sem + 1;
      } else if (col < 4) {
        targetSem = 1;
        targetCol = col + 1;
      }
      const nextEl = document.getElementById(getCellId(targetSem, targetCol)) as HTMLInputElement | null;
      if (nextEl) {
        nextEl.focus();
        nextEl.select();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      let targetSem = sem;
      let targetCol = col;
      if (sem > 1) {
        targetSem = sem - 1;
      } else if (col > 0) {
        targetSem = 5;
        targetCol = col - 1;
      }
      const nextEl = document.getElementById(getCellId(targetSem, targetCol)) as HTMLInputElement | null;
      if (nextEl) {
        nextEl.focus();
        nextEl.select();
      }
    } else if (e.key === 'ArrowRight') {
      const input = e.currentTarget;
      const isAtEnd = input.selectionEnd === input.value.length;
      const isAllSelected = input.selectionStart === 0 && input.selectionEnd === input.value.length;
      if (isAtEnd || isAllSelected) {
        let targetSem = sem;
        let targetCol = col;
        if (col < 4) {
          targetCol = col + 1;
        } else if (sem < 5) {
          targetSem = sem + 1;
          targetCol = 0;
        }
        if (targetSem !== sem || targetCol !== col) {
          e.preventDefault();
          const nextEl = document.getElementById(getCellId(targetSem, targetCol)) as HTMLInputElement | null;
          if (nextEl) {
            nextEl.focus();
            nextEl.select();
          }
        }
      }
    } else if (e.key === 'ArrowLeft') {
      const input = e.currentTarget;
      const isAtStart = input.selectionStart === 0;
      const isAllSelected = input.selectionStart === 0 && input.selectionEnd === input.value.length;
      if (isAtStart || isAllSelected) {
        let targetSem = sem;
        let targetCol = col;
        if (col > 0) {
          targetCol = col - 1;
        } else if (sem > 1) {
          targetSem = sem - 1;
          targetCol = 4;
        }
        if (targetSem !== sem || targetCol !== col) {
          e.preventDefault();
          const nextEl = document.getElementById(getCellId(targetSem, targetCol)) as HTMLInputElement | null;
          if (nextEl) {
            nextEl.focus();
            nextEl.select();
          }
        }
      }
    }
  };

  // Direct paste dari Excel ke dalam cell
  const handleCellPaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    startSem: number,
    startCol: number
  ) => {
    const text = e.clipboardData.getData('text');
    if (!text) return;

    const lines = text
      .trim()
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return;

    const grid = lines.map((l) =>
      l
        .split(/\t|,|;/)
        .map((c) => c.trim())
        .filter(Boolean)
    );

    // Single value: biarkan default behavior berjalan
    if (grid.length === 1 && grid[0].length === 1) return;

    e.preventDefault();

    const flatNumbers = grid
      .flat()
      .map((v) => parseFloat(v.replace(/,/g, '.')))
      .filter((n) => !isNaN(n));

    if (flatNumbers.length === 25 && startSem === 1 && startCol === 0) {
      let idx = 0;
      setFormData((prev) => ({
        ...prev,
        report_scores: prev.report_scores.map((sc) => {
          const val = flatNumbers[idx++];
          return typeof val === 'number'
            ? { ...sc, score: Math.min(100, Math.max(0, Math.round(val))) }
            : sc;
        }),
      }));
      return;
    }

    setFormData((prev) => {
      const updated = [...prev.report_scores];
      for (let r = 0; r < grid.length; r++) {
        const targetSem = startSem + r;
        if (targetSem > 5) break;

        for (let c = 0; c < grid[r].length; c++) {
          const targetCol = startCol + c;
          if (targetCol >= SUBJECT_LIST.length) break;

          const subj = SUBJECT_LIST[targetCol];
          const num = parseFloat(grid[r][c].replace(/,/g, '.'));
          if (!isNaN(num)) {
            const clamped = Math.min(100, Math.max(0, Math.round(num)));
            const sIdx = updated.findIndex(
              (s) => s.semester === targetSem && s.subject === subj
            );
            if (sIdx !== -1) {
              updated[sIdx] = { ...updated[sIdx], score: clamped };
            }
          }
        }
      }
      return { ...prev, report_scores: updated };
    });
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

  // Handle File Uploads to Supabase Storage with Progress
  const handleFileUpload = async (
    file: File,
    type: 'photo' | 'diploma' | 'family_card' | 'achievement',
    achievementIndex?: number
  ) => {
    const maxSize = type === 'photo' ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`Ukuran file terlalu besar! Maksimal ${type === 'photo' ? '2MB' : '5MB'}.`);
      return;
    }

    setUploadingFile(type);
    setUploadProgress((prev) => ({ ...prev, [type]: 0 }));
    setUploadFileInfo((prev) => ({
      ...prev,
      [type]: { name: file.name, size: formatFileSize(file.size) },
    }));

    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    const onProgress = (percent: number) => {
      setUploadProgress((prev) => ({ ...prev, [type]: percent }));
    };

    try {
      if (type === 'photo') {
        const filePath = `photos/${fileName}`;
        const { data, error } = await uploadStorageFile('student-photos', filePath, file, onProgress);
        if (error) throw error;
        setFormData((prev) => ({ ...prev, photo_url: data?.publicUrl || '' }));
        // Revoke previous object URL before creating a new one
        if (photoPreviewUrlRef.current) {
          URL.revokeObjectURL(photoPreviewUrlRef.current);
        }
        const objectUrl = URL.createObjectURL(file);
        photoPreviewUrlRef.current = objectUrl;
        setPhotoPreview(objectUrl);
      } else {
        const filePath = `documents/${fileName}`;
        const { data, error } = await uploadStorageFile('student-documents', filePath, file, onProgress);
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
        clearDraft(); // draft no longer needed after successful submission
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

  if (registrationStatus.loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3 bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
        <p className="text-xs text-slate-500 font-medium">Memeriksa status pendaftaran...</p>
      </div>
    );
  }

  // Jika pendaftaran ditutup, JANGAN render form sama sekali. Tampilkan halaman khusus:
  if (!registrationStatus.isOpen) {
    return <RegistrationClosedPage school={school} />;
  }

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-10 transition-colors duration-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 gap-1.5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Link>
        </div>

        {/* Page Title */}
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <Badge variant="secondary" className="text-teal-700 dark:text-teal-300 bg-teal-100/80 dark:bg-teal-950/70 gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Pendaftaran Online SPMB 2026/2027
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Formulir Pendaftaran Siswa Baru
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Lengkapi 6 langkah formulir di bawah ini dengan data yang valid dan benar.
          </p>
        </div>

        {/* STEPPER PROGRESS BAR */}
        <nav
          ref={stepperRef}
          aria-label="Tahapan Formulir Pendaftaran"
          className="bg-white dark:bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8"
        >
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2" role="list">
            {WIZARD_STEPS.map((step, index) => {
              const isCurrent = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} role="listitem">
                  <button
                    data-step-id={step.id}
                    type="button"
                    onClick={() => handleStepClick(step.id)}
                    onKeyDown={(e) => handleStepperKeyDown(e, index)}
                    aria-current={isCurrent ? 'step' : undefined}
                    aria-label={`Langkah ${step.id} dari 6: ${step.title} (${step.subtitle}). Status: ${
                      isCurrent ? 'Sedang aktif' : isCompleted ? 'Selesai' : 'Belum selesai'
                    }`}
                    className={`w-full flex flex-col items-center text-center p-2 rounded-xl transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 ${
                      isCurrent
                        ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold ring-2 ring-teal-600/30 dark:ring-teal-500/40 shadow-2xs'
                        : isCompleted
                        ? 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 transition-colors ${
                        isCurrent
                          ? 'bg-teal-600 text-white shadow-xs'
                          : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {isCompleted ? <Check className="h-4 w-4" /> : step.id}
                    </div>
                    <span className="text-xs leading-tight font-semibold block">{step.title}</span>
                    <span className="text-[10px] text-slate-400 hidden sm:block mt-0.5">{step.subtitle}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </nav>

        {/* Draft restored banner */}
        {draftRestoredAt && (
          <div className="mb-4 flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60 text-teal-800 dark:text-teal-200 text-xs font-medium animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <Save className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
              <span>
                Melanjutkan dari <span className="font-bold">Langkah {currentStep}: {WIZARD_STEPS[currentStep - 1].title}</span> &mdash; draft tersimpan{' '}
                <span className="font-semibold">
                  {new Date(draftRestoredAt).toLocaleString('id-ID', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </span>
            </div>
            <button
              type="button"
              onClick={handleResetDraft}
              className="shrink-0 text-teal-700 dark:text-teal-300 hover:text-teal-900 dark:hover:text-teal-200 font-semibold transition-colors underline underline-offset-2 cursor-pointer"
            >
              Mulai dari awal
            </button>
          </div>
        )}

        {/* FORM CONTENT CARD */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-md overflow-hidden bg-white dark:bg-slate-950">
          <CardHeader className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 block">
                  Langkah {currentStep} dari 6
                </span>
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {WIZARD_STEPS[currentStep - 1].title}: {WIZARD_STEPS[currentStep - 1].subtitle}
                </CardTitle>
              </div>
              <Badge variant="outline" className="text-xs font-mono font-semibold dark:border-slate-700 dark:text-slate-300">
                Tahap {currentStep}/6
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* TOP VALIDATION ERROR BANNER */}
            {Object.keys(errors).length > 0 && (
              <div
                id="step-validation-alert"
                className="p-4 sm:p-5 rounded-2xl bg-amber-50/95 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-600 text-amber-950 dark:text-amber-200 shadow-sm space-y-3 transition-all animate-in fade-in slide-in-from-top-2"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 rounded-xl shrink-0 mt-0.5">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-amber-950 dark:text-amber-100">
                        Perhatian: Ada Data Yang Belum Lengkap / Kurang Tepat
                      </h4>
                      <Badge className="bg-amber-600 text-white hover:bg-amber-700 text-[10px]">
                        {Object.keys(errors).length} Kolom Perlu Diperiksa
                      </Badge>
                    </div>
                    <p className="text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed">
                      Mohon periksa dan lengkapi kolom yang bertanda merah di bawah ini sebelum melanjutkan ke langkah berikutnya:
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs font-medium text-amber-950 dark:text-amber-200">
                      {Object.entries(errors).map(([field, msg]) => (
                        <li
                          key={field}
                          className="flex items-start gap-2 bg-white/90 dark:bg-slate-900/90 p-2.5 rounded-lg border border-amber-200/80 dark:border-amber-800/60 shadow-xs"
                        >
                          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                          <span className="leading-tight text-slate-800 dark:text-slate-200">{msg}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: BIODATA SISWA & ASAL SEKOLAH */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nama Lengkap */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label htmlFor="reg_full_name" className="text-xs font-bold text-slate-700 flex items-center justify-between cursor-pointer">
                      <span>Nama Lengkap Calon Siswa <span className="text-red-500">*</span></span>
                      <span className="text-[10px] text-slate-400 font-normal">Sesuai Ijazah / Akta Kelahiran</span>
                    </label>
                    <Input
                      id="reg_full_name"
                      name="full_name"
                      autoComplete="name"
                      placeholder="Contoh: Muhammad Rizky Pratama"
                      value={formData.full_name}
                      onChange={(e) => handleFieldChange('full_name', e.target.value)}
                      className={errors['full_name'] ? 'border-red-500 bg-red-50/20' : ''}
                    />
                    {errors['full_name'] ? (
                      <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {errors['full_name']}
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-500">Tuliskan nama lengkap tanpa singkatan berlebihan.</p>
                    )}
                  </div>

                  {/* NISN */}
                  <div className="space-y-1.5">
                    <label htmlFor="reg_nisn" className="text-xs font-bold text-slate-700 flex items-center justify-between cursor-pointer">
                      <span>NISN (10 Digit Angka)</span>
                      <span className="text-[10px] text-slate-400 font-normal">Opsional</span>
                    </label>
                    <Input
                      id="reg_nisn"
                      name="nisn"
                      placeholder="Contoh: 0071234567"
                      maxLength={10}
                      value={formData.nisn || ''}
                      onChange={(e) => handleFieldChange('nisn', e.target.value.replace(/[^0-9]/g, ''))}
                      className={errors['nisn'] ? 'border-red-500 bg-red-50/20' : ''}
                    />
                    {errors['nisn'] ? (
                      <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {errors['nisn']}
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-500">Boleh dikosongkan jika belum memiliki NISN.</p>
                    )}
                  </div>

                  {/* NIK */}
                  <div className="space-y-1.5">
                    <label htmlFor="reg_nik" className="text-xs font-bold text-slate-700 flex items-center justify-between cursor-pointer">
                      <span>NIK Calon Siswa (16 Digit)</span>
                      <span className="text-[10px] text-slate-400 font-normal">Opsional</span>
                    </label>
                    <Input
                      id="reg_nik"
                      name="nik"
                      placeholder="Contoh: 3201234567890001"
                      maxLength={16}
                      value={formData.nik || ''}
                      onChange={(e) => handleFieldChange('nik', e.target.value.replace(/[^0-9]/g, ''))}
                      className={errors['nik'] ? 'border-red-500 bg-red-50/20' : ''}
                    />
                    {errors['nik'] ? (
                      <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {errors['nik']}
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-500">16 digit angka yang tercantum di Kartu Keluarga (KK).</p>
                    )}
                  </div>

                  {/* Tempat Lahir */}
                  <div className="space-y-1.5">
                    <label htmlFor="reg_birth_place" className="text-xs font-bold text-slate-700 cursor-pointer">
                      Tempat Lahir <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="reg_birth_place"
                      name="birth_place"
                      autoComplete="address-level2"
                      placeholder="Contoh: Surabaya / Sidoarjo"
                      value={formData.birth_place}
                      onChange={(e) => handleFieldChange('birth_place', e.target.value)}
                      className={errors['birth_place'] ? 'border-red-500 bg-red-50/20' : ''}
                    />
                    {errors['birth_place'] ? (
                      <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {errors['birth_place']}
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-500">Kota atau Kabupaten tempat kelahiran.</p>
                    )}
                  </div>

                  {/* Tanggal Lahir */}
                  <div className="space-y-1.5">
                    <label htmlFor="reg_birth_date" className="text-xs font-bold text-slate-700 cursor-pointer">
                      Tanggal Lahir <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="reg_birth_date"
                      name="birth_date"
                      type="date"
                      autoComplete="bday"
                      value={formData.birth_date}
                      onChange={(e) => handleFieldChange('birth_date', e.target.value)}
                      className={errors['birth_date'] ? 'border-red-500 bg-red-50/20' : ''}
                    />
                    {errors['birth_date'] ? (
                      <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {errors['birth_date']}
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-500">Pilih tanggal, bulan, dan tahun kelahiran.</p>
                    )}
                  </div>

                  {/* Jenis Kelamin */}
                  <div className="space-y-1.5">
                    <label htmlFor="reg_gender" className="text-xs font-bold text-slate-700 cursor-pointer">
                      Jenis Kelamin <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="reg_gender"
                      name="gender"
                      value={formData.gender}
                      onChange={(e) => handleFieldChange('gender', e.target.value as any)}
                      className="w-full h-10 px-3 text-xs bg-background border rounded-md border-input focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>

                  {/* Agama */}
                  <div className="space-y-1.5">
                    <label htmlFor="reg_religion" className="text-xs font-bold text-slate-700 cursor-pointer">
                      Agama <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="reg_religion"
                      name="religion"
                      value={formData.religion}
                      onChange={(e) => handleFieldChange('religion', e.target.value)}
                      className="w-full h-10 px-3 text-xs bg-background border rounded-md border-input focus:ring-2 focus:ring-teal-500"
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
                    <label htmlFor="reg_phone" className="text-xs font-bold text-slate-700 flex items-center justify-between cursor-pointer">
                      <span>No. WhatsApp / HP Siswa <span className="text-red-500">*</span></span>
                      <span className="text-[10px] text-slate-400 font-normal">Min. 10 Digit</span>
                    </label>
                    <Input
                      id="reg_phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="Contoh: 081234567890"
                      value={formData.phone}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      className={errors['phone'] ? 'border-red-500 bg-red-50/20' : ''}
                    />
                    {errors['phone'] ? (
                      <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {errors['phone']}
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-500">Nomor aktif untuk menerima notifikasi info SPMB.</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label htmlFor="reg_email" className="text-xs font-bold text-slate-700 flex items-center justify-between cursor-pointer">
                      <span>Alamat Email Aktif <span className="text-red-500">*</span></span>
                      <span className="text-[10px] text-slate-400 font-normal">Harus format email</span>
                    </label>
                    <Input
                      id="reg_email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="Contoh: siswa@gmail.com"
                      value={formData.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      className={errors['email'] ? 'border-red-500 bg-red-50/20' : ''}
                    />
                    {errors['email'] ? (
                      <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {errors['email']}
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-500">Email untuk menerima salinan bukti pendaftaran.</p>
                    )}
                  </div>

                  {/* Alamat Lengkap */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label htmlFor="reg_address" className="text-xs font-bold text-slate-700 cursor-pointer">
                      Alamat Tempat Tinggal / Domisili Lengkap <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="reg_address"
                      name="address"
                      autoComplete="street-address"
                      rows={2}
                      placeholder="Contoh: Jl. Ahmad Yani No. 45, RT 03/RW 02, Kel. Wonokromo, Kec. Wonokromo, Kota Surabaya"
                      value={formData.address}
                      onChange={(e) => handleFieldChange('address', e.target.value)}
                      className={`w-full p-3 text-xs bg-background border rounded-md border-input focus:ring-2 focus:ring-teal-500 ${
                        errors['address'] ? 'border-red-500 bg-red-50/20' : ''
                      }`}
                    />
                    {errors['address'] ? (
                      <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {errors['address']}
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-500">Tuliskan nama jalan, RT/RW, kelurahan, kecamatan, dan kota domisili.</p>
                    )}
                  </div>
                </div>

                {/* Sub-Section: Asal Sekolah */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    Data Asal Sekolah (SMP / MTs)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Pilih Master Asal Sekolah */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <label htmlFor="reg_source_school_name" className="text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                        Nama SMP / MTs Asal <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="reg_source_school_name"
                        name="source_school_name"
                        list="source-schools-list"
                        placeholder="Ketik atau pilih nama SMP/MTs asal Anda"
                        value={formData.source_school_name}
                        onChange={(e) => {
                          const val = e.target.value;
                          const found = sourceSchools.find((s) => s.name.toLowerCase() === val.toLowerCase());
                          setFormData((prev) => ({
                            ...prev,
                            source_school_name: val,
                            source_school_id: found ? found.id : undefined,
                          }));
                          if (errors['source_school_name']) {
                            setErrors((prev) => {
                              const next = { ...prev };
                              delete next['source_school_name'];
                              return next;
                            });
                          }
                        }}
                        className={errors['source_school_name'] ? 'border-red-500 bg-red-50/20' : ''}
                      />
                      <datalist id="source-schools-list">
                        {sourceSchools.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.city} - NPSN: {s.npsn || '-'}
                          </option>
                        ))}
                      </datalist>
                      {errors['source_school_name'] ? (
                        <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          {errors['source_school_name']}
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Ketik nama SMP/MTs Anda jika tidak ada di pilihan daftar.</p>
                      )}
                    </div>

                    {/* Tahun Lulus */}
                    <div className="space-y-1.5">
                      <label htmlFor="reg_graduation_year" className="text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                        Tahun Lulus SMP <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="reg_graduation_year"
                        name="graduation_year"
                        value={formData.graduation_year}
                        onChange={(e) => handleFieldChange('graduation_year', Number(e.target.value))}
                        className="w-full h-10 px-3 text-xs bg-background border rounded-md border-input focus:ring-2 focus:ring-teal-500"
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
                    <label htmlFor="reg_father_name" className="text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                      Nama Lengkap Ayah Kandung / Wali <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="reg_father_name"
                      name="father_name"
                      placeholder="Contoh: Ahmad Hidayat"
                      value={formData.father_name}
                      onChange={(e) => handleFieldChange('father_name', e.target.value)}
                      className={errors['father_name'] ? 'border-red-500 bg-red-50/20' : ''}
                    />
                    {errors['father_name'] ? (
                      <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {errors['father_name']}
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Tuliskan nama lengkap ayah atau wali siswa.</p>
                    )}
                  </div>

                  {/* Nama Ibu */}
                  <div className="space-y-1.5">
                    <label htmlFor="reg_mother_name" className="text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                      Nama Lengkap Ibu Kandung <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="reg_mother_name"
                      name="mother_name"
                      placeholder="Contoh: Siti Aminah"
                      value={formData.mother_name}
                      onChange={(e) => handleFieldChange('mother_name', e.target.value)}
                      className={errors['mother_name'] ? 'border-red-500 bg-red-50/20' : ''}
                    />
                    {errors['mother_name'] ? (
                      <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {errors['mother_name']}
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Tuliskan nama lengkap ibu kandung.</p>
                    )}
                  </div>

                  {/* Pekerjaan Orang Tua */}
                  <div className="space-y-1.5">
                    <label htmlFor="reg_parent_job" className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between cursor-pointer">
                      <span>Pekerjaan Orang Tua / Wali</span>
                      <span className="text-[10px] text-slate-400 font-normal">Opsional</span>
                    </label>
                    <Input
                      id="reg_parent_job"
                      name="parent_job"
                      placeholder="Contoh: Karyawan Swasta / Wiraswasta / PNS / Petani"
                      value={formData.parent_job || ''}
                      onChange={(e) => handleFieldChange('parent_job', e.target.value)}
                    />
                  </div>

                  {/* No HP Orang Tua */}
                  <div className="space-y-1.5">
                    <label htmlFor="reg_parent_phone" className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between cursor-pointer">
                      <span>No. WhatsApp / HP Orang Tua <span className="text-red-500">*</span></span>
                      <span className="text-[10px] text-slate-400 font-normal">Min. 10 Digit</span>
                    </label>
                    <Input
                      id="reg_parent_phone"
                      name="parent_phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="Contoh: 081298765432"
                      value={formData.parent_phone}
                      onChange={(e) => handleFieldChange('parent_phone', e.target.value)}
                      className={errors['parent_phone'] ? 'border-red-500 bg-red-50/20' : ''}
                    />
                    {errors['parent_phone'] ? (
                      <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {errors['parent_phone']}
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Nomor aktif orang tua yang dapat dihubungi sekolah.</p>
                    )}
                  </div>

                  {/* Alamat Orang Tua */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="reg_parent_address" className="text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                        Alamat Orang Tua / Wali
                      </label>
                      <button
                        type="button"
                        onClick={() => handleFieldChange('parent_address', formData.address)}
                        className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-semibold"
                      >
                        Sama dengan alamat siswa
                      </button>
                    </div>
                    <textarea
                      id="reg_parent_address"
                      name="parent_address"
                      rows={2}
                      placeholder="Alamat tempat tinggal orang tua (boleh dikosongkan jika sama)"
                      value={formData.parent_address || ''}
                      onChange={(e) => handleFieldChange('parent_address', e.target.value)}
                      className="w-full p-3 text-xs bg-background border rounded-md border-input focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: PILIHAN JURUSAN */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 text-xs text-teal-900 dark:text-teal-200 flex items-start gap-2.5">
                  <Info className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span>
                    Pilihlah <strong>Pilihan 1</strong> sebagai jurusan prioritas utama Anda. Anda juga dapat memilih <strong>Pilihan 2</strong> sebagai opsi alternatif apabila kuota pilihan utama telah penuh.
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Pilihan 1 */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span className="h-5 w-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">1</span>
                      <span>Pilihan Jurusan 1 (Prioritas Utama) <span className="text-red-500">*</span></span>
                    </label>
                    <div role="radiogroup" aria-label="Pilihan Jurusan 1 (Prioritas Utama)" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {majors.map((major) => {
                        const isSelected = formData.choice_1_major_id === major.id;
                        return (
                          <div
                            key={major.id}
                            role="radio"
                            aria-checked={isSelected}
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleFieldChange('choice_1_major_id', major.id); }}
                            onClick={() => handleFieldChange('choice_1_major_id', major.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                              isSelected
                                ? 'border-teal-600 bg-teal-50/70 dark:bg-teal-950/40 dark:border-teal-500 ring-2 ring-teal-600/20 shadow-sm'
                                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-slate-900 dark:text-white text-sm">{major.name}</span>
                              <Badge variant="outline" className="text-[10px] font-bold">
                                {major.code}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{major.description}</p>
                            <div className="mt-2 text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                              Kuota: {major.quota} Siswa
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {errors['choice_1_major_id'] && (
                      <p className="text-[11px] text-red-500 font-medium flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {errors['choice_1_major_id']}
                      </p>
                    )}
                  </div>

                  {/* Pilihan 2 */}
                  <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
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
                                handleFieldChange('choice_2_major_id', isSelected2 ? '' : major.id);
                              }
                            }}
                            className={`p-4 rounded-xl border transition-all ${
                              isSelected1
                                ? 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 opacity-50 cursor-not-allowed'
                                : isSelected2
                                ? 'border-teal-600 bg-teal-50/70 dark:bg-teal-950/40 dark:border-teal-500 ring-2 ring-teal-600/20 shadow-sm cursor-pointer'
                                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/60 cursor-pointer'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-slate-900 dark:text-white text-sm">{major.name}</span>
                              <Badge variant="outline" className="text-[10px] font-bold">
                                {major.code}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{major.description}</p>
                            {isSelected1 && (
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block mt-2">
                                (Sudah dipilih sebagai Pilihan 1)
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {errors['choice_2_major_id'] && (
                      <p className="text-[11px] text-red-500 font-medium flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {errors['choice_2_major_id']}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: NILAI RAPOR 5 SEMESTER */}
            {currentStep === 4 && (
              <div className="space-y-6">
                {/* Live Average Score Banner */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                  <div>
                    <span className="text-xs text-teal-100 block">Kalkulator Nilai Otomatis (Bobot 70%)</span>
                    <h4 className="text-lg font-bold">Rata-rata Nilai Rapor Semester 1 - 5</h4>
                  </div>
                  <div className="text-3xl font-extrabold font-mono bg-white/10 px-4 py-1.5 rounded-lg backdrop-blur-sm">
                    {formatScore(averageReportScore)}
                  </div>
                </div>

                {/* Quick-fill & Spreadsheet Tools */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Tombol Cepat: Isi Semua 80 */}
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleFillAllScores(80)}
                        className="h-8 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white gap-1.5 shadow-xs shrink-0 cursor-pointer"
                        title="Isi seluruh 25 nilai mata pelajaran Semester 1-5 dengan nilai 80"
                      >
                        <Zap className="h-3.5 w-3.5 text-amber-300" />
                        Isi Semua 80
                      </Button>

                      {/* Tombol Paste dari Excel */}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setIsPasteDialogOpen(true)}
                        className="h-8 text-xs font-semibold border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/50 gap-1.5 shrink-0 cursor-pointer"
                        title="Buka dialog untuk paste tabel nilai dari Excel atau Google Sheets"
                      >
                        <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        Paste dari Excel
                      </Button>

                      {/* Custom Fill Input */}
                      <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Nilai lain:</span>
                        <Input
                          id="fill_all_score_input"
                          type="number"
                          min={0}
                          max={100}
                          defaultValue={85}
                          className="h-7 w-14 text-xs font-mono text-center p-1 dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleFillAllScores(Number((e.target as HTMLInputElement).value));
                            }
                          }}
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs px-2 text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/50 cursor-pointer"
                          onClick={() => {
                            const el = document.getElementById('fill_all_score_input') as HTMLInputElement | null;
                            handleFillAllScores(el ? Number(el.value) : 85);
                          }}
                        >
                          Terapkan
                        </Button>
                      </div>
                    </div>

                    {/* Keyboard Navigation Helper */}
                    <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
                      <Keyboard className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                      <span>Navigasi: <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono text-[10px]">↑</kbd> <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono text-[10px]">↓</kbd> <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono text-[10px]">←</kbd> <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono text-[10px]">→</kbd> <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono text-[10px]">Enter</kbd></span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    💡 <strong>Tips:</strong> Anda bisa langsung menempelkan (<kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-[10px]">Ctrl+V</kbd>) pada cell mana pun untuk mengisi tabel otomatis, atau gunakan tombol panah &amp; Enter untuk berpindah cell cepat.
                  </p>
                </div>

                {/* Score Input by Semester */}
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((semester) => {
                    const semesterScores = formData.report_scores.filter((sc) => sc.semester === semester);
                    const semTotal = semesterScores.reduce((a, c) => a + Number(c.score || 0), 0);
                    const semAvg = semesterScores.length ? semTotal / semesterScores.length : 0;

                    return (
                      <div key={semester} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                            Semester {semester}
                          </h4>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                              Rata-rata: {formatScore(semAvg)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopySemester(semester)}
                              className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors underline underline-offset-2 cursor-pointer"
                              title={`Salin nilai Semester ${semester} ke semua semester lain`}
                            >
                              Salin ke semua
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                          {SUBJECT_LIST.map((subject, subjIdx) => {
                            const scObj = formData.report_scores.find(
                              (s) => s.semester === semester && s.subject === subject
                            );
                            const val = scObj?.score ?? 80;
                            const cellId = getCellId(semester, subjIdx);
                            const fieldId = `rapor_sem${semester}_${subject.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

                            return (
                              <div key={subject} className="space-y-1">
                                <label htmlFor={cellId} className="text-[11px] font-medium text-slate-600 dark:text-slate-400 truncate block cursor-pointer" title={subject}>
                                  {subject}
                                </label>
                                <Input
                                  id={cellId}
                                  name={fieldId}
                                  type="number"
                                  min={0}
                                  max={100}
                                  aria-label={`Nilai ${subject} Semester ${semester}`}
                                  value={val}
                                  onFocus={(e) => e.target.select()}
                                  onKeyDown={(e) => handleCellKeyDown(e, semester, subjIdx)}
                                  onPaste={(e) => handleCellPaste(e, semester, subjIdx)}
                                  onChange={(e) => handleScoreChange(semester, subject, e.target.value)}
                                  className="h-9 text-xs font-mono font-semibold text-center focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
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
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    Upload Dokumen Persyaratan
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Pasfoto 3x4 */}
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-3 text-center flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Pasfoto 3x4 Formal</span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Latar Merah / Biru</p>
                      </div>

                      <div className="py-1">
                        {photoPreview || formData.photo_url ? (
                          <div className="relative inline-block mx-auto">
                            <img
                              src={photoPreview || formData.photo_url}
                              alt="Pasfoto"
                              className="h-28 w-20 object-cover mx-auto rounded-md border border-slate-200 dark:border-slate-700 shadow-xs"
                            />
                            {uploadingFile === 'photo' && (
                              <div className="absolute inset-0 bg-slate-900/60 rounded-md flex flex-col items-center justify-center p-1 text-white">
                                <Loader2 className="h-5 w-5 animate-spin mb-1 text-teal-400" />
                                <span className="text-[10px] font-bold font-mono">{uploadProgress['photo'] || 0}%</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="h-28 w-20 bg-slate-200 dark:bg-slate-800 mx-auto rounded-md flex items-center justify-center text-slate-400 dark:text-slate-500">
                            {uploadingFile === 'photo' ? (
                              <div className="flex flex-col items-center justify-center p-1">
                                <Loader2 className="h-6 w-6 animate-spin text-teal-600 mb-1" />
                                <span className="text-[10px] font-bold font-mono text-teal-700 dark:text-teal-400">{uploadProgress['photo'] || 0}%</span>
                              </div>
                            ) : (
                              <ImageIcon className="h-8 w-8" />
                            )}
                          </div>
                        )}

                        {uploadingFile === 'photo' && (
                          <div className="mt-2 space-y-1 text-left bg-white dark:bg-slate-950 p-2 rounded-lg border border-teal-100 dark:border-teal-900/60 shadow-xs">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-teal-800 dark:text-teal-200 font-semibold truncate max-w-[120px] flex items-center gap-1">
                                <Loader2 className="h-3 w-3 animate-spin text-teal-600 shrink-0" />
                                <span className="truncate">{uploadFileInfo['photo']?.name || 'Pasfoto'}</span>
                              </span>
                              <span className="font-mono font-bold text-teal-700 dark:text-teal-400">{uploadProgress['photo'] || 0}%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-200"
                                style={{ width: `${uploadProgress['photo'] || 0}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                              <span>Mengunggah...</span>
                              <span>{uploadFileInfo['photo']?.size || 'Maks 2MB'}</span>
                            </div>
                          </div>
                        )}

                        {formData.photo_url && uploadingFile !== 'photo' && (
                          <div className="mt-2">
                            <Badge className="bg-emerald-600 text-white text-[10px] gap-1 py-0.5">
                              <Check className="h-3 w-3" /> Terunggah
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div>
                        <label htmlFor="reg_file_photo" className="cursor-pointer inline-block w-full">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={uploadingFile === 'photo'}
                            className="text-xs h-8 gap-1.5 pointer-events-none w-full dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200"
                          >
                            <Upload className="h-3 w-3" />
                            {uploadingFile === 'photo'
                              ? `Mengunggah (${uploadProgress['photo'] || 0}%)...`
                              : photoPreview || formData.photo_url
                              ? 'Ganti Pasfoto'
                              : 'Pilih Foto (JPG/PNG)'}
                          </Button>
                          <input
                            id="reg_file_photo"
                            name="photo"
                            type="file"
                            accept="image/png,image/jpeg,image/jpg"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, 'photo');
                            }}
                          />
                        </label>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Maks. 2MB (Latar Merah/Biru)</p>
                      </div>
                    </div>

                    {/* Scan Ijazah / SKL */}
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-3 text-center flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Scan Ijazah / SKL</span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Surat Keterangan Lulus dari SMP/MTs</p>
                      </div>

                      <div className="py-2">
                        {uploadingFile === 'diploma' ? (
                          <div className="space-y-2 text-left bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-teal-100 dark:border-teal-900/60 shadow-xs">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-teal-800 dark:text-teal-200 truncate max-w-[130px] flex items-center gap-1.5">
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-600 shrink-0" />
                                <span className="truncate">{uploadFileInfo['diploma']?.name || 'Berkas Ijazah'}</span>
                              </span>
                              <span className="font-mono font-bold text-teal-700 dark:text-teal-400">{uploadProgress['diploma'] || 0}%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-200"
                                style={{ width: `${uploadProgress['diploma'] || 0}%` }}
                              />
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500">
                              <span>Mengunggah berkas...</span>
                              <span>{uploadFileInfo['diploma']?.size || 'Maks 5MB'}</span>
                            </div>
                          </div>
                        ) : formData.diploma_url ? (
                          <div className="space-y-1">
                            <Badge className="bg-emerald-600 text-white text-[10px] gap-1 py-1">
                              <Check className="h-3 w-3" /> Terunggah
                            </Badge>
                            {uploadFileInfo['diploma'] && (
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[180px] mx-auto mt-0.5" title={uploadFileInfo['diploma'].name}>
                                {uploadFileInfo['diploma'].name} ({uploadFileInfo['diploma'].size})
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">Belum diunggah</span>
                        )}
                      </div>

                      <div>
                        <label htmlFor="reg_file_diploma" className="cursor-pointer inline-block w-full">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={uploadingFile === 'diploma'}
                            className="text-xs h-8 gap-1.5 pointer-events-none w-full dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200"
                          >
                            <Upload className="h-3 w-3" />
                            {uploadingFile === 'diploma'
                              ? `Mengunggah (${uploadProgress['diploma'] || 0}%)...`
                              : formData.diploma_url
                              ? 'Ganti File (PDF/JPG)'
                              : 'Pilih File (PDF/JPG)'}
                          </Button>
                          <input
                            id="reg_file_diploma"
                            name="diploma"
                            type="file"
                            accept="application/pdf,image/png,image/jpeg,image/jpg"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, 'diploma');
                            }}
                          />
                        </label>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Maksimal 5MB (PDF/JPG/PNG)</p>
                      </div>
                    </div>

                    {/* Scan Kartu Keluarga */}
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-3 text-center flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Scan Kartu Keluarga</span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Kartu Keluarga asli / legalisir</p>
                      </div>

                      <div className="py-2">
                        {uploadingFile === 'family_card' ? (
                          <div className="space-y-2 text-left bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-teal-100 dark:border-teal-900/60 shadow-xs">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-teal-800 dark:text-teal-200 truncate max-w-[130px] flex items-center gap-1.5">
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-600 shrink-0" />
                                <span className="truncate">{uploadFileInfo['family_card']?.name || 'Berkas KK'}</span>
                              </span>
                              <span className="font-mono font-bold text-teal-700 dark:text-teal-400">{uploadProgress['family_card'] || 0}%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-200"
                                style={{ width: `${uploadProgress['family_card'] || 0}%` }}
                              />
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500">
                              <span>Mengunggah berkas...</span>
                              <span>{uploadFileInfo['family_card']?.size || 'Maks 5MB'}</span>
                            </div>
                          </div>
                        ) : formData.family_card_url ? (
                          <div className="space-y-1">
                            <Badge className="bg-emerald-600 text-white text-[10px] gap-1 py-1">
                              <Check className="h-3 w-3" /> Terunggah
                            </Badge>
                            {uploadFileInfo['family_card'] && (
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[180px] mx-auto mt-0.5" title={uploadFileInfo['family_card'].name}>
                                {uploadFileInfo['family_card'].name} ({uploadFileInfo['family_card'].size})
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">Belum diunggah</span>
                        )}
                      </div>

                      <div>
                        <label htmlFor="reg_file_family_card" className="cursor-pointer inline-block w-full">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={uploadingFile === 'family_card'}
                            className="text-xs h-8 gap-1.5 pointer-events-none w-full dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200"
                          >
                            <Upload className="h-3 w-3" />
                            {uploadingFile === 'family_card'
                              ? `Mengunggah (${uploadProgress['family_card'] || 0}%)...`
                              : formData.family_card_url
                              ? 'Ganti File (PDF/JPG)'
                              : 'Pilih File (PDF/JPG)'}
                          </Button>
                          <input
                            id="reg_file_family_card"
                            name="family_card"
                            type="file"
                            accept="application/pdf,image/png,image/jpeg,image/jpg"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, 'family_card');
                            }}
                          />
                        </label>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Maksimal 5MB (PDF/JPG/PNG)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-Section: Prestasi & Sertifikat (Opsional) */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        Piagam / Sertifikat Prestasi (Opsional - Bobot 30%)
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Tambahkan sertifikat kejuaraan lomba akademik atau non-akademik (maks. 3 prestasi).
                      </p>
                    </div>
                    {(formData.achievements || []).length < 3 && (
                      <Button
                        type="button"
                        onClick={addAchievement}
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 gap-1 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50"
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
                        <div key={idx} className="p-4 rounded-xl border border-purple-100 dark:border-purple-900/50 bg-purple-50/40 dark:bg-purple-950/20 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-purple-900 dark:text-purple-200">
                              Prestasi #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeAchievement(idx)}
                              className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <label htmlFor={`ach_level_${idx}`} className="text-[11px] font-medium text-slate-700 dark:text-slate-300 cursor-pointer">Tingkat Kejuaraan</label>
                              <select
                                id={`ach_level_${idx}`}
                                name={`ach_level_${idx}`}
                                value={ach.level}
                                onChange={(e) => updateAchievement(idx, 'level', e.target.value as AchievementLevel)}
                                className="w-full h-9 px-2 text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border rounded-md border-input dark:border-slate-800"
                              >
                                <option value="Internasional">Internasional (100 Poin)</option>
                                <option value="Nasional">Nasional (80 Poin)</option>
                                <option value="Provinsi">Provinsi (60 Poin)</option>
                                <option value="Kabupaten/Kota">Kabupaten/Kota (40 Poin)</option>
                                <option value="Sekolah">Sekolah (20 Poin)</option>
                              </select>
                            </div>

                            <div className="sm:col-span-2 space-y-1">
                              <label htmlFor={`ach_title_${idx}`} className="text-[11px] font-medium text-slate-700 dark:text-slate-300 cursor-pointer">Nama Kejuaraan / Lomba</label>
                              <Input
                                id={`ach_title_${idx}`}
                                name={`ach_title_${idx}`}
                                placeholder="Contoh: Juara 1 Olimpiade Sains Nasional"
                                value={ach.title}
                                onChange={(e) => updateAchievement(idx, 'title', e.target.value)}
                                className="h-9 text-xs bg-white dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 dark:text-slate-400">
                      Belum ada prestasi yang ditambahkan. Klik "Tambah Prestasi" jika Anda memiliki piagam kejuaraan.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 6: REVIEW & KONFIRMASI */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="p-4 bg-teal-50/70 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/60 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 dark:text-teal-200">
                    Ringkasan Pendaftaran
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Nama Lengkap:</span>
                      <strong className="text-slate-800 dark:text-slate-100">{formData.full_name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Asal Sekolah:</span>
                      <strong className="text-slate-800 dark:text-slate-100">{formData.source_school_name} (Lulus {formData.graduation_year})</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Pilihan Jurusan 1:</span>
                      <strong className="text-teal-700 dark:text-teal-300 font-bold">
                        {majors.find((m) => m.id === formData.choice_1_major_id)?.name || '-'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Pilihan Jurusan 2:</span>
                      <strong className="text-slate-700 dark:text-slate-300">
                        {majors.find((m) => m.id === formData.choice_2_major_id)?.name || 'Tidak Memilih'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Rata-rata Rapor (70%):</span>
                      <strong className="text-slate-800 dark:text-slate-100 font-mono text-sm">{formatScore(averageReportScore)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Estimasi Total Skor:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">{formatScore(estimatedTotalScore)}</strong>
                    </div>
                  </div>
                </div>

                {/* Agreement Checkbox */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-3">
                  <label htmlFor="reg_agreement_checkbox" className="flex items-start gap-3 cursor-pointer">
                    <input
                      id="reg_agreement_checkbox"
                      name="agreement"
                      type="checkbox"
                      checked={agreementChecked}
                      onChange={(e) => {
                        setAgreementChecked(e.target.checked);
                        if (errors['agreement']) {
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next['agreement'];
                            return next;
                          });
                        }
                      }}
                      className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 dark:bg-slate-950 text-teal-600 focus:ring-teal-500 mt-0.5"
                    />
                    <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      Saya menyatakan dengan sesungguhnya bahwa seluruh data dan berkas yang saya isikan pada formulir pendaftaran ini adalah <strong>benar, sah, dan dapat dipertanggungjawabkan</strong>. Apabila di kemudian hari ditemukan ketidaksesuaian data, saya bersedia menerima sanksi pembatalan status pendaftaran sesuai ketentuan panitia SPMB.
                    </span>
                  </label>
                  {errors['agreement'] && (
                    <p className="text-[11px] text-red-500 font-medium flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {errors['agreement']}
                    </p>
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
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
              {/* Bottom Mini Alert when error occurs */}
              {Object.keys(errors).length > 0 && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl flex items-center gap-2 text-xs text-red-700 dark:text-red-300 font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                  <span>
                    Masih ada <strong>{Object.keys(errors).length} kolom</strong> yang belum lengkap atau perlu diperbaiki di atas. Silakan lengkapi terlebih dahulu.
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
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
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold h-10 gap-1.5 px-6 shadow-xs"
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
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Paste dari Excel */}
      <Dialog open={isPasteDialogOpen} onOpenChange={setIsPasteDialogOpen}>
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg text-emerald-600 dark:text-emerald-400">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
                Paste Nilai dari Excel / Spreadsheet
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Salin tabel nilai dari Excel atau Google Sheets, lalu tempelkan (Ctrl+V) di kolom teks di bawah.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 my-2">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="spreadsheet_paste_textarea" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">Data Spreadsheet (Tab-separated):</label>
              <button
                type="button"
                onClick={() => setPasteIsTransposed((prev) => !prev)}
                className="text-[11px] font-medium text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ArrowUpDown className="h-3 w-3" />
                {pasteIsTransposed ? 'Format: Baris = Mapel, Kolom = Semester' : 'Format: Baris = Semester, Kolom = Mapel'}
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">(klik untuk tukar)</span>
              </button>
            </div>
            <textarea
              id="spreadsheet_paste_textarea"
              name="spreadsheet_paste_textarea"
              rows={6}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={`Contoh 5 baris × 5 kolom (Semester 1-5):\n80\t85\t82\t88\t84\n82\t84\t86\t85\t87\n85\t88\t90\t86\t89\n88\t90\t89\t88\t91\n90\t92\t91\t90\t95`}
              className="w-full p-2.5 text-xs font-mono border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 resize-y"
            />
          </div>

          {/* Status & Preview */}
          {pasteText.trim() && (
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 space-y-2 text-xs">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Hasil Analisis Data:</span>
                <Badge
                  variant="outline"
                  className={
                    parsedExcelScores.length === 25
                      ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold'
                  }
                >
                  {parsedExcelScores.length} / 25 nilai dikenali
                </Badge>
              </div>

              {parsedExcelScores.length > 0 ? (
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  {parsedExcelScores.length === 25
                    ? '✓ Siap mengisi lengkap 5 semester × 5 mata pelajaran.'
                    : `⚠️ ${parsedExcelScores.length} nilai ditemukan dan akan memperbarui mata pelajaran yang cocok.`}
                </p>
              ) : (
                <p className="text-[11px] text-rose-600 dark:text-rose-400">
                  Format angka tidak dikenali. Pastikan tabel berisi angka nilai (0-100).
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setIsPasteDialogOpen(false);
              setPasteText('');
            }}
          >
            Batal
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={parsedExcelScores.length === 0}
            onClick={handleApplyExcelPaste}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold cursor-pointer"
          >
            Terapkan {parsedExcelScores.length} Nilai ke Formulir
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};
