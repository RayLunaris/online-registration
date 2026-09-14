import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  AlertCircle, 
  ArrowLeft,
  RefreshCw,
  Share2,
  Copy,
  Check,
  Link2,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { studentService } from '@/services/studentService';
import { StudentCompleteDetail } from '@/types/spmb';
import { StatusResultCard } from '@/components/common/StatusResultCard';

export const StatusCheckPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialReg = searchParams.get('reg') || '';

  const [regNumber, setRegNumber] = useState(initialReg);
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState<StudentCompleteDetail | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const getShareUrl = (reg: string) => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}${window.location.pathname}?reg=${encodeURIComponent(reg)}`;
  };

  const handleCopyLink = async (regToCopy?: string) => {
    const reg = regToCopy || student?.registration_number || regNumber;
    if (!reg) return;
    const url = getShareUrl(reg);

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy share link:', err);
    }
  };

  const handleShare = async () => {
    if (!student) return;
    const url = getShareUrl(student.registration_number);
    const title = `Hasil Pengecekan Status SPMB - ${student.full_name}`;
    const text = `Cek hasil status pendaftaran SPMB atas nama ${student.full_name} (${student.registration_number}): ${student.status}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    }
    // Fallback if Web Share API is not available
    handleCopyLink(student.registration_number);
  };

  const handleWhatsAppShare = () => {
    if (!student) return;
    const url = getShareUrl(student.registration_number);
    const text = encodeURIComponent(
      `Halo! Berikut tautan resmi hasil pengecekan status pendaftaran SPMB:\n` +
      `*Nama:* ${student.full_name}\n` +
      `*No. Pendaftaran:* ${student.registration_number}\n` +
      `*Status:* ${student.status}\n\n` +
      `Buka tautan: ${url}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleSearch = async (queryNumber: string) => {
    if (loading) return; // prevent concurrent duplicate requests
    if (!queryNumber.trim()) {
      setErrorMsg('Silakan masukkan nomor pendaftaran terlebih dahulu.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const data = await studentService.getStudentByRegistrationNumber(queryNumber.trim());
      setStudent(data);
      if (!data) {
        setErrorMsg(`Nomor pendaftaran "${queryNumber.trim()}" tidak ditemukan. Pastikan format nomor sudah sesuai (contoh: REG-2026-00001).`);
      } else {
        setSearchParams({ reg: queryNumber.trim() });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat memeriksa status pendaftaran.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialReg) {
      handleSearch(initialReg);
    }
  }, [initialReg]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-12 transition-colors duration-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Breadcrumb Back Button */}
        <div className="mb-6 print:hidden">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 gap-1.5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Link>
        </div>

        {/* Search Card */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm mb-8 print:hidden">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                <Search className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                  Cek Status Pendaftaran & Hasil Seleksi
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Masukkan nomor pendaftaran resmi (contoh: REG-2026-00001) untuk memeriksa berkas dan status kelulusan.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch(regNumber);
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <label htmlFor="status-check-reg-input" className="sr-only">Nomor Pendaftaran</label>
              <Input
                id="status-check-reg-input"
                name="regNumber"
                placeholder="Nomor Pendaftaran (misal: REG-2026-00001)"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                aria-label="Nomor Pendaftaran"
                autoComplete="off"
                className="h-11 text-base uppercase font-mono tracking-wider focus-visible:ring-teal-600 dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-500"
              />
              <Button
                type="submit"
                disabled={loading}
                className="h-11 px-7 bg-teal-600 hover:bg-teal-700 text-white font-semibold shrink-0 gap-2 shadow-xs cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Memeriksa...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>Cari Data</span>
                  </>
                )}
              </Button>
            </form>

            {errorMsg && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Pemberitahuan</AlertTitle>
                <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Result Detail */}
        {student && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* Direct Link & Share Banner */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-xs print:hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 shrink-0">
                  <Link2 className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Tautan Langsung Hasil</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 font-mono font-semibold">
                      ?reg={student.registration_number}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-xs sm:max-w-md mt-0.5">
                    {getShareUrl(student.registration_number)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleWhatsAppShare}
                  className="text-xs h-9 px-3 gap-1.5 border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-medium cursor-pointer"
                  title="Bagikan via WhatsApp"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>WhatsApp</span>
                </Button>

                {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="text-xs h-9 px-3 gap-1.5 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 cursor-pointer"
                    title="Bagikan Tautan"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>Bagikan</span>
                  </Button>
                )}

                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleCopyLink(student.registration_number)}
                  className={`text-xs h-9 px-3.5 gap-1.5 transition-all font-semibold shadow-xs cursor-pointer ${
                    copied
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
                  title="Salin tautan ke papan klip"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Tautan Disalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Salin Tautan</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            <StatusResultCard
              student={student}
              onResetSearch={() => {
                setStudent(null);
                setRegNumber('');
                setSearchParams({});
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

