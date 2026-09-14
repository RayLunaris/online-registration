import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
  Building2, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Award,
  Image as ImageIcon,
  Power,
  CalendarClock,
  CalendarX,
  AlertTriangle,
  Info,
  Upload,
  RotateCcw,
  Link as LinkIcon,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { adminService } from '@/services/adminService';
import { uploadStorageFile } from '@/lib/supabase';
import { School } from '@/types/spmb';

function toDatetimeLocal(isoStr?: string | null): string {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(val: string): string | null {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function formatIndonesianDateTime(isoString?: string | null): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export const AdminSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Partial<School>>({});
  const [initialSettings, setInitialSettings] = useState<Partial<School>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoInputMode, setLogoInputMode] = useState<'upload' | 'url'>('upload');
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const bypassBlockerRef = useRef(false);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await adminService.getSchoolSettings();
      setSettings(data);
      setInitialSettings(data);
    } catch (err) {
      console.error('Error loading school settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Determine if form has unsaved modifications
  const isDirty = useMemo(() => {
    if (loading || !initialSettings || Object.keys(initialSettings).length === 0) {
      return false;
    }
    const normalize = (s: Partial<School>) => ({
      name: s.name ?? '',
      npsn: s.npsn ?? '',
      academic_year: s.academic_year ?? '',
      target_students: Number(s.target_students ?? 0),
      logo_url: s.logo_url ?? '',
      address: s.address ?? '',
      phone: s.phone ?? '',
      email: s.email ?? '',
      hero_tagline: s.hero_tagline ?? '',
      hero_description: s.hero_description ?? '',
      show_public_leaderboard: Boolean(s.show_public_leaderboard),
      registration_status: s.registration_status ?? 'open',
      registration_close_date: s.registration_close_date
        ? new Date(s.registration_close_date).getTime()
        : null,
    });

    return JSON.stringify(normalize(settings)) !== JSON.stringify(normalize(initialSettings));
  }, [settings, initialSettings, loading]);

  // 1. Browser unload / refresh / close tab warning
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (bypassBlockerRef.current) return;
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  // 2. In-app navigation blocking (Sidebar links, Header links, Logout)
  useEffect(() => {
    if (!isDirty) return;

    const handleClickCapture = async (e: MouseEvent) => {
      if (bypassBlockerRef.current) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest('a');
      const button = target.closest('button');

      if (anchor) {
        const href = anchor.getAttribute('href');
        if (!href || href === '#' || href.startsWith('javascript:')) return;
        if (anchor.target === '_blank') return;

        try {
          const targetUrl = new URL(anchor.href, window.location.origin);
          if (
            targetUrl.origin === window.location.origin &&
            targetUrl.pathname === window.location.pathname &&
            targetUrl.search === window.location.search
          ) {
            return;
          }

          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();

          const result = await Swal.fire({
            title: 'Perubahan Belum Disimpan!',
            text: 'Ada perubahan pengaturan yang belum disimpan. Yakin ingin meninggalkan halaman ini? Perubahan Anda akan hilang.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Tinggalkan',
            cancelButtonText: 'Tetap di Halaman',
            reverseButtons: true,
          });

          if (result.isConfirmed) {
            bypassBlockerRef.current = true;
            if (targetUrl.origin === window.location.origin) {
              navigate(targetUrl.pathname + targetUrl.search + targetUrl.hash);
            } else {
              window.location.href = anchor.href;
            }
          }
        } catch {
          // Ignore URL parse error
        }
        return;
      }

      if (button) {
        const text = button.textContent?.toLowerCase() || '';
        const isLogout = text.includes('keluar sesi') || text.includes('logout');
        if (isLogout) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();

          const result = await Swal.fire({
            title: 'Perubahan Belum Disimpan!',
            text: 'Ada perubahan pengaturan yang belum disimpan. Yakin ingin keluar sesi? Perubahan Anda akan hilang.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Tetap Keluar',
            cancelButtonText: 'Batal',
            reverseButtons: true,
          });

          if (result.isConfirmed) {
            bypassBlockerRef.current = true;
            button.click();
          }
        }
      }
    };

    window.addEventListener('click', handleClickCapture, true);
    return () => {
      window.removeEventListener('click', handleClickCapture, true);
    };
  }, [isDirty, navigate]);

  // 3. Browser Back/Forward buttons interception
  useEffect(() => {
    if (!isDirty) return;

    window.history.pushState({ unsavedChangesBlocker: true }, '', window.location.href);

    const handlePopState = async () => {
      if (bypassBlockerRef.current) return;

      window.history.pushState({ unsavedChangesBlocker: true }, '', window.location.href);

      const result = await Swal.fire({
        title: 'Perubahan Belum Disimpan!',
        text: 'Ada perubahan pengaturan yang belum disimpan. Yakin ingin meninggalkan halaman ini? Perubahan Anda akan hilang.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Ya, Tinggalkan',
        cancelButtonText: 'Tetap di Halaman',
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        bypassBlockerRef.current = true;
        window.history.back();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isDirty]);

  const handleResetForm = async () => {
    if (!isDirty) return;
    const result = await Swal.fire({
      title: 'Batalkan Perubahan?',
      text: 'Semua perubahan yang belum disimpan akan dikembalikan ke data awal.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#64748b',
      cancelButtonColor: '#0d9488',
      confirmButtonText: 'Ya, Batalkan Perubahan',
      cancelButtonText: 'Lanjutkan Mengedit',
      reverseButtons: true,
    });
    if (result.isConfirmed) {
      setSettings({ ...initialSettings });
      setSuccessMsg('Perubahan berhasil dibatalkan dan dikembalikan ke data awal.');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleHeaderReset = async () => {
    if (isDirty) {
      const result = await Swal.fire({
        title: 'Muat Ulang Pengaturan?',
        text: 'Perubahan yang belum disimpan akan hilang jika data dimuat ulang dari server.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Ya, Muat Ulang',
        cancelButtonText: 'Batal',
        reverseButtons: true,
      });
      if (!result.isConfirmed) return;
    }
    loadSettings();
  };

  const isManualClosed = settings.registration_status === 'closed';
  const isDateExpired = Boolean(
    settings.registration_close_date && 
    new Date(settings.registration_close_date).getTime() < Date.now()
  );
  const isEffectiveOpen = !isManualClosed && !isDateExpired;
  const isClosedByDate = !isManualClosed && isDateExpired;

  const handleToggleClick = async () => {
    if (!isEffectiveOpen) {
      // Currently effectively closed (by manual OR by date) -> ask confirmation before reopening
      const result = await Swal.fire({
        title: 'Konfirmasi Buka Pendaftaran',
        text: isDateExpired
          ? 'Pendaftaran akan dibuka kembali untuk publik dan jadwal tutup otomatis yang telah lewat akan direset. Lanjutkan?'
          : 'Pendaftaran akan dibuka kembali untuk publik. Calon siswa dapat mengisi formulir pendaftaran. Lanjutkan?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#0d9488',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Ya, Buka Pendaftaran',
        cancelButtonText: 'Batal',
      });

      if (result.isConfirmed) {
        // If closed by expired date, clear the date so manual override takes effect
        const newCloseDate = isDateExpired ? null : settings.registration_close_date;
        const updated = {
          ...settings,
          registration_status: 'open' as const,
          registration_close_date: newCloseDate,
        };
        setSettings(updated);
        try {
          const res = await adminService.updateRegistrationStatus('open', newCloseDate);
          if (res.success) {
            setInitialSettings(prev => ({ ...prev, ...updated }));
            window.dispatchEvent(new CustomEvent('school_settings_updated'));
            setSuccessMsg('Pendaftaran berhasil DIBUKA kembali untuk publik.');
            setTimeout(() => setSuccessMsg(''), 4000);
            Swal.fire({
              title: 'Pendaftaran Dibuka',
              text: 'Status pendaftaran berhasil diubah menjadi AKTIF untuk publik.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
            });
          } else {
            setErrorMsg(res.error || 'Gagal mengubah status pendaftaran.');
            Swal.fire('Gagal', res.error || 'Gagal mengubah status pendaftaran', 'error');
          }
        } catch (err: any) {
          setErrorMsg(err.message || 'Gagal mengubah status pendaftaran.');
          Swal.fire('Error', err.message || 'Terjadi kesalahan sistem', 'error');
        }
      }
    } else {
      // Currently effectively open -> ask confirmation before closing
      const result = await Swal.fire({
        title: 'Konfirmasi Tutup Pendaftaran',
        text: 'Pendaftaran akan langsung ditutup untuk publik. Calon siswa tidak dapat mengisi formulir pendaftaran baru. Lanjutkan?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Ya, Tutup Pendaftaran',
        cancelButtonText: 'Batal',
      });

      if (result.isConfirmed) {
        const newCloseDate = isDateExpired ? null : settings.registration_close_date;
        const updated = {
          ...settings,
          registration_status: 'closed' as const,
          registration_close_date: newCloseDate,
        };
        setSettings(updated);
        try {
          const res = await adminService.updateRegistrationStatus('closed', newCloseDate);
          if (res.success) {
            setInitialSettings(prev => ({ ...prev, ...updated }));
            window.dispatchEvent(new CustomEvent('school_settings_updated'));
            setSuccessMsg('Pendaftaran berhasil DITUTUP untuk publik.');
            setTimeout(() => setSuccessMsg(''), 4000);
            Swal.fire({
              title: 'Pendaftaran Ditutup',
              text: 'Status pendaftaran berhasil diubah menjadi DITUTUP untuk publik.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
            });
          } else {
            setErrorMsg(res.error || 'Gagal mengubah status pendaftaran.');
            Swal.fire('Gagal', res.error || 'Gagal mengubah status pendaftaran', 'error');
          }
        } catch (err: any) {
          setErrorMsg(err.message || 'Gagal mengubah status pendaftaran.');
          Swal.fire('Error', err.message || 'Terjadi kesalahan sistem', 'error');
        }
      }
    }
  };

  const handleClearCloseDate = async () => {
    const updated = { ...settings, registration_close_date: null };
    setSettings(updated);
    try {
      await adminService.updateSchoolSettings({ registration_close_date: null });
      setInitialSettings(prev => ({ ...prev, registration_close_date: null }));
      window.dispatchEvent(new CustomEvent('school_settings_updated'));
      setSuccessMsg('Jadwal tutup otomatis berhasil dihapus.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menghapus jadwal.');
    }
  };

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Ukuran file logo terlalu besar. Maksimal 2MB.');
      setTimeout(() => setErrorMsg(''), 4000);
      if (logoFileInputRef.current) logoFileInputRef.current.value = '';
      return;
    }

    // Validate type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Format file tidak didukung. Harap gunakan format PNG, JPG, SVG, atau WebP.');
      setTimeout(() => setErrorMsg(''), 4000);
      if (logoFileInputRef.current) logoFileInputRef.current.value = '';
      return;
    }

    setIsUploadingLogo(true);
    try {
      const ext = file.name.split('.').pop() || 'png';
      const fileName = `logo-${Date.now()}.${ext}`;
      const { data, error } = await uploadStorageFile('school-assets', fileName, file);

      if (error || !data?.publicUrl) {
        // Fallback: read as Base64 data URL (offline / mock env).
        // The URL only lives in local state until the user clicks "Simpan Perubahan".
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Url = reader.result as string;
          setSettings(prev => ({ ...prev, logo_url: base64Url }));
          setSuccessMsg('Logo sekolah berhasil dipilih! Klik "Simpan Perubahan" untuk menerapkan.');
          setTimeout(() => setSuccessMsg(''), 4000);
          setIsUploadingLogo(false);
        };
        reader.readAsDataURL(file);
      } else {
        // File is already persisted in Supabase storage — auto-save the URL to the DB
        // immediately so the pointer is never lost even if the admin navigates away
        // without clicking "Simpan Perubahan".
        const publicUrl = data.publicUrl;
        setSettings(prev => ({ ...prev, logo_url: publicUrl }));

        const saveRes = await adminService.updateSchoolSettings({ logo_url: publicUrl });
        if (saveRes.success) {
          setInitialSettings(prev => ({ ...prev, logo_url: publicUrl }));
          window.dispatchEvent(new CustomEvent('school_settings_updated'));
          setSuccessMsg('Logo sekolah berhasil diunggah dan disimpan otomatis!');
        } else {
          // Storage upload succeeded but DB update failed — keep local state dirty so
          // the unsaved-changes blocker still fires on navigation.
          setSuccessMsg('Logo diunggah ke storage. Klik "Simpan Perubahan" untuk menerapkan ke profil sekolah.');
        }
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (err: any) {
      console.error('Error uploading logo:', err);
      // Fallback to FileReader on any unexpected error
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Url = reader.result as string;
        setSettings(prev => ({ ...prev, logo_url: base64Url }));
        setSuccessMsg('Logo sekolah berhasil dipilih. Klik "Simpan Perubahan" untuk menerapkan.');
        setTimeout(() => setSuccessMsg(''), 4000);
        setIsUploadingLogo(false);
      };
      reader.readAsDataURL(file);
    } finally {
      // Always reset the file input and spinner (for the synchronous success path;
      // FileReader paths reset isUploadingLogo inside their own onloadend callbacks).
      if (logoFileInputRef.current) logoFileInputRef.current.value = '';
      setIsUploadingLogo(false);
    }
  };

  const handleResetLogo = () => {
    setSettings(prev => ({ ...prev, logo_url: '/images/logo-icon.png' }));
    setSuccessMsg('Logo telah dikembalikan ke logo default SPMB.');
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await adminService.updateSchoolSettings(settings);
      if (res.success) {
        setInitialSettings({ ...settings });
        setSuccessMsg('Pengaturan profil sekolah dan konfigurasi SPMB berhasil diperbarui!');
        window.dispatchEvent(new CustomEvent('school_settings_updated'));
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(res.error || 'Gagal menyimpan pengaturan sekolah.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center space-y-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent mx-auto" />
        <p className="text-xs text-slate-500">Memuat pengaturan sekolah...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 max-w-4xl ${isDirty ? 'pb-24' : ''}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Pengaturan & Konfigurasi Sekolah
            </h1>
            {isDirty && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 font-semibold text-[11px] animate-pulse shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Belum Disimpan
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Atur identitas resmi sekolah, tahun pelajaran aktif, kontak sekretariat, dan teks landing page.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleHeaderReset}
          className="text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 gap-1.5 shadow-2xs"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Reset</span>
        </Button>
      </div>

      {successMsg && (
        <Alert className="bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <AlertTitle>Berhasil Disimpan</AlertTitle>
          <AlertDescription className="text-xs">{successMsg}</AlertDescription>
        </Alert>
      )}

      {errorMsg && (
        <Alert variant="destructive" className="bg-red-50 dark:bg-red-950/80 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertTitle>Gagal Menyimpan</AlertTitle>
          <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* SETTINGS FORM */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* CARD 0. STATUS PENDAFTARAN (PPDB / SPMB) - PALING ATAS */}
        <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-sm overflow-hidden">
          <div className={`h-1.5 ${isEffectiveOpen ? 'bg-emerald-500' : 'bg-red-500'}`} />
          
          <CardHeader className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800/80 flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Power className={`h-5 w-5 ${isEffectiveOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`} />
                Status Pendaftaran
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kontrol pembukaan formulir pendaftaran PPDB secara manual dan otomatis
              </CardDescription>
            </div>

            {/* Indikator status besar di kanan atas: badge hijau "AKTIF" atau badge merah "DITUTUP" */}
            <div>
              {isEffectiveOpen ? (
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs tracking-wider shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>AKTIF</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-50 dark:bg-red-950/80 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-300 font-extrabold text-xs tracking-wider shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span>DITUTUP</span>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-5 space-y-5 text-xs">
            {/* Banner Kuning jika status efektif = closed karena tanggal (bukan manual) */}
            {isClosedByDate && settings.registration_close_date && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 dark:bg-amber-950/60 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Pendaftaran Tertutup Secara Otomatis</p>
                  <p className="text-xs leading-relaxed">
                    Ditutup otomatis pada <strong className="font-bold underline">{formatIndonesianDateTime(settings.registration_close_date)}</strong>. Aktifkan toggle di atas untuk membuka kembali.
                  </p>
                </div>
              </div>
            )}

            {/* TOGGLE SWITCH BESAR: "Buka Pendaftaran" / "Tutup Pendaftaran" */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {isEffectiveOpen ? 'Pendaftaran Terbuka (Aktif)' : 'Pendaftaran Ditutup'}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                    settings.registration_status === 'closed' 
                      ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300' 
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  }`}>
                    Manual: {settings.registration_status === 'closed' ? 'Closed' : 'Open'}
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  {!isEffectiveOpen
                    ? (isClosedByDate 
                        ? 'Pendaftaran tertutup otomatis karena jadwal tutup telah lewat. Klik toggle switch untuk membuka kembali.'
                        : 'Pendaftaran sedang ditutup manual oleh panitia. Calon siswa baru tidak dapat mengisi formulir.')
                    : 'Pendaftaran aktif menerima berkas pendaftaran calon siswa baru.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleToggleClick}
                className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                  isEffectiveOpen ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                role="switch"
                aria-checked={isEffectiveOpen}
                title={isEffectiveOpen ? 'Klik untuk Tutup Pendaftaran' : 'Klik untuk Buka Pendaftaran'}
              >
                <span className="sr-only">Toggle Pendaftaran</span>
                <span
                  className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isEffectiveOpen ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* FIELD TERPISAH (OPSIONAL): DATE-TIME PICKER "TUTUP OTOMATIS PADA" */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="registration_close_date" 
                  className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <CalendarClock className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span>Tutup Otomatis Pada (Opsional)</span>
                </label>

                {settings.registration_close_date && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearCloseDate}
                    className="h-7 px-2 text-[11px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 gap-1"
                  >
                    <CalendarX className="h-3.5 w-3.5" />
                    <span>Hapus Jadwal</span>
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                <div className="space-y-1">
                  <Input
                    type="datetime-local"
                    id="registration_close_date"
                    name="registration_close_date"
                    value={toDatetimeLocal(settings.registration_close_date)}
                    onChange={(e) => {
                      const iso = fromDatetimeLocal(e.target.value);
                      setSettings({ ...settings, registration_close_date: iso });
                    }}
                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                  {settings.registration_close_date && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                      Pendaftaran akan otomatis tertutup pada tanggal ini meski toggle di atas masih Aktif.
                    </p>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800/60 leading-relaxed">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                    <Info className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 inline mr-1 -mt-0.5" />
                    Logika Override:
                  </span>
                  Admin tetap bisa membuka lagi meski tanggal otomatis sudah lewat, cukup dengan mengaktifkan toggle switch di atas.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 1. Identitas Resmi Sekolah */}
        <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs">
          <CardHeader className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <CardTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              Identitas Resmi Sekolah
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Data ini akan dicetak pada Kartu Pendaftaran PDF dan header web
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label htmlFor="school_name" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">Nama Resmi Sekolah *</label>
                <Input
                  id="school_name"
                  name="name"
                  value={settings.name || ''}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="school_npsn" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">NPSN Sekolah *</label>
                <Input
                  id="school_npsn"
                  name="npsn"
                  value={settings.npsn || ''}
                  onChange={(e) => setSettings({ ...settings, npsn: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="school_academic_year" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">Tahun Pelajaran SPMB Aktif *</label>
                <Input
                  id="school_academic_year"
                  name="academic_year"
                  value={settings.academic_year || '2026/2027'}
                  onChange={(e) => setSettings({ ...settings, academic_year: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                  placeholder="2026/2027"
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="school_target_students" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">Target Total Kuota Siswa Baru</label>
                <Input
                  id="school_target_students"
                  name="target_students"
                  type="number"
                  value={settings.target_students || 400}
                  onChange={(e) => setSettings({ ...settings, target_students: Number(e.target.value) })}
                  className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="school_address" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">Alamat Lengkap Sekolah *</label>
              <textarea
                id="school_address"
                name="address"
                rows={2}
                value={settings.address || ''}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-white text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="school_phone" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">No. Telepon / Hotline Panitia</label>
                <Input
                  id="school_phone"
                  name="phone"
                  value={settings.phone || ''}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="school_email" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">Alamat Email Resmi Sekolah</label>
                <Input
                  id="school_email"
                  name="email"
                  type="email"
                  value={settings.email || ''}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Bagian Logo Sekolah & Identitas SPMB */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-slate-800 dark:text-slate-200 font-semibold flex items-center gap-1.5 text-xs sm:text-sm">
                  <ImageIcon className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span>Logo Sekolah & Lambang SPMB</span>
                </label>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setLogoInputMode('upload')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      logoInputMode === 'upload'
                        ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Upload className="h-3 w-3 inline-block mr-1" />
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogoInputMode('url')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      logoInputMode === 'url'
                        ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <LinkIcon className="h-3 w-3 inline-block mr-1" />
                    Input URL
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                {/* Mode Upload File */}
                <div className="md:col-span-2 space-y-2">
                  {logoInputMode === 'upload' ? (
                    <div className="space-y-2">
                      <input
                        ref={logoFileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                        className="hidden"
                        onChange={handleLogoFileChange}
                      />
                      
                      <div
                        onClick={() => !isUploadingLogo && logoFileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                          isUploadingLogo
                            ? 'border-teal-400 bg-teal-50/50 dark:bg-teal-950/20 cursor-wait'
                            : 'border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-400 bg-slate-50/70 dark:bg-slate-900/50 hover:bg-teal-50/30'
                        }`}
                      >
                        {isUploadingLogo ? (
                          <div className="flex flex-col items-center space-y-2 py-2">
                            <Loader2 className="h-8 w-8 text-teal-600 dark:text-teal-400 animate-spin" />
                            <span className="text-xs font-semibold text-teal-800 dark:text-teal-300">
                              Sedang mengunggah dan memproses logo...
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center space-y-2">
                            <div className="h-10 w-10 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 flex items-center justify-center shadow-2xs">
                              <Upload className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                                Klik untuk memilih file logo sekolah
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                Mendukung format PNG, JPG, JPEG, SVG, atau WebP (Maks. 2MB)
                              </p>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="mt-1 h-7 text-xs border-teal-600/30 text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950"
                            >
                              Pilih Gambar dari Perangkat
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Mode Input URL Manual */
                    <div className="space-y-1.5">
                      <Input
                        id="school_logo_url"
                        name="logo_url"
                        value={settings.logo_url || ''}
                        onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                        className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                        placeholder="https://... atau /images/logo-icon.png"
                      />
                      <p className="text-[11px] text-slate-500">
                        Gunakan tautan URL gambar resmi sekolah atau path lokal seperti <code className="text-teal-600 dark:text-teal-400">/images/logo-icon.png</code>.
                      </p>
                    </div>
                  )}

                  {/* Actions & Info Footer */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleResetLogo}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Kembalikan ke Logo Default</span>
                    </button>

                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      Disarankan rasio 1:1 atau latar transparan
                    </span>
                  </div>
                </div>

                {/* Live Preview Card */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center space-y-2">
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Pratinjau Logo Aktif
                  </span>

                  <div className="h-20 w-20 rounded-xl bg-white p-2 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xs relative group">
                    <img 
                      src={settings.logo_url || '/images/logo-icon.png'} 
                      alt="Preview Logo Sekolah" 
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/logo-icon.png';
                      }}
                    />
                  </div>

                  <div className="space-y-1 w-full">
                    <div className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {settings.logo_url && settings.logo_url !== '/images/logo-icon.png' 
                        ? 'Logo Kustom' 
                        : 'Logo Standar'}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Tampil di Navbar, Footer, Kop PDF, dan Sidebar
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Hero & Tampilan Publik Landing Page */}
        <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs">
          <CardHeader className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <CardTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              Teks & Banner Landing Page Publik
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Kustomisasi slogan dan narasi promosi yang tampil di halaman beranda
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs">
            <div className="space-y-1">
              <label htmlFor="school_hero_tagline" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">Tagline Utama Hero Banner</label>
              <Input
                id="school_hero_tagline"
                name="hero_tagline"
                value={settings.hero_tagline || ''}
                onChange={(e) => setSettings({ ...settings, hero_tagline: e.target.value })}
                className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                placeholder="Membangun Generasi Vokasi Berkarakter, Cerdas, dan Siap Kerja Global"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="school_hero_description" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">Deskripsi Singkat Hero</label>
              <textarea
                id="school_hero_description"
                name="hero_description"
                rows={2}
                value={settings.hero_description || ''}
                onChange={(e) => setSettings({ ...settings, hero_description: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-white text-xs"
                placeholder="Penerimaan Peserta Didik Baru (PPDB/SPMB) Tahun Pelajaran 2026/2027 telah dibuka secara daring."
              />
            </div>
          </CardContent>
        </Card>

        {/* 3. Publikasi Peringkat Publik (Leaderboard) */}
        <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs">
          <CardHeader className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <CardTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              Publikasi Peringkat Publik (Leaderboard)
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Kontrol visibilitas tabel hasil scoring sementara di halaman publik /peringkat
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs">
            <div className="flex items-start sm:items-center justify-between gap-4 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
              <div className="space-y-1">
                <label htmlFor="show_public_leaderboard" className="text-slate-800 dark:text-slate-200 font-semibold cursor-pointer block text-xs">
                  Tampilkan Peringkat Publik
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Jika diaktifkan, halaman <code className="text-teal-600 dark:text-teal-400 font-mono">/peringkat</code> dapat diakses oleh siapa saja tanpa login (nama disamarkan untuk privasi) dan tautan menu &quot;Lihat Peringkat&quot; akan muncul di navigasi landing page. Jika nonaktif, halaman akan menampilkan pesan bahwa peringkat belum dipublikasikan.
                </p>
              </div>
              <input
                id="show_public_leaderboard"
                name="show_public_leaderboard"
                type="checkbox"
                checked={settings.show_public_leaderboard ?? false}
                onChange={(e) => setSettings({ ...settings, show_public_leaderboard: e.target.checked })}
                className="h-5 w-5 rounded border-slate-300 dark:border-slate-700 text-teal-600 focus:ring-teal-500 cursor-pointer shrink-0 mt-0.5 sm:mt-0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-8 h-10 gap-2 shadow-md shadow-teal-600/30"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Menyimpan Perubahan...' : 'Simpan Seluruh Pengaturan'}</span>
          </Button>
        </div>
      </form>

      {/* STICKY BOTTOM UNSAVED CHANGES BANNER */}
      {isDirty && (
        <div className="fixed bottom-4 left-4 right-4 md:left-72 md:right-8 z-40 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-slate-900/95 dark:bg-slate-950/95 text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-amber-500/40 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs sm:text-sm text-white">Ada Perubahan Belum Disimpan</span>
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping inline-block" />
                </div>
                <p className="text-[11px] text-slate-300">
                  Pengaturan profil sekolah belum disimpan ke database.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetForm}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:text-white h-9 px-3.5 gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Batalkan</span>
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={saving}
                onClick={(e) => handleSave(e as any)}
                className="text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold h-9 px-5 gap-1.5 shadow-md shadow-teal-600/30"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    <span>Simpan Perubahan</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
