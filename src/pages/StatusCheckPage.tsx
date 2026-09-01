import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  AlertCircle, 
  ArrowLeft,
  RefreshCw
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

  const handleSearch = async (queryNumber: string) => {
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
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Breadcrumb Back Button */}
        <div className="mb-6 print:hidden">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-teal-600 gap-1.5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Link>
        </div>

        {/* Search Card */}
        <Card className="border-slate-200 shadow-sm mb-8 print:hidden">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600">
                <Search className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">
                  Cek Status Pendaftaran & Hasil Seleksi
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
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
                className="h-11 text-base uppercase font-mono tracking-wider focus-visible:ring-teal-600"
              />
              <Button
                type="submit"
                disabled={loading}
                className="h-11 px-7 bg-teal-600 hover:bg-teal-700 text-white font-semibold shrink-0 gap-2 shadow-xs"
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
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
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

