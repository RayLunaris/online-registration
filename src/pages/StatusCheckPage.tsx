import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Printer, 
  ArrowLeft,
  Award,
  GraduationCap,
  BookOpen,
  FileCheck,
  User,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  School as SchoolIcon,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { studentService } from '@/services/studentService';
import { StudentCompleteDetail } from '@/types/spmb';
import { formatDate, formatScore } from '@/lib/utils';

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

  const getStatusStepIndex = (status: string) => {
    switch (status) {
      case 'Draft': return 1;
      case 'Menunggu Verifikasi': return 1;
      case 'Terverifikasi': return 2;
      case 'Diterima':
      case 'Tidak Diterima':
      case 'Cadangan': return 3;
      default: return 1;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Diterima':
        return (
          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 py-1.5 px-4 text-sm font-semibold shadow-sm">
            <CheckCircle2 className="h-4 w-4" /> Diterima
          </Badge>
        );
      case 'Tidak Diterima':
        return (
          <Badge variant="destructive" className="gap-1.5 py-1.5 px-4 text-sm font-semibold shadow-sm">
            <XCircle className="h-4 w-4" /> Tidak Diterima
          </Badge>
        );
      case 'Terverifikasi':
        return (
          <Badge className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 py-1.5 px-4 text-sm font-semibold shadow-sm">
            <CheckCircle2 className="h-4 w-4" /> Berkas Terverifikasi
          </Badge>
        );
      case 'Cadangan':
        return (
          <Badge className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5 py-1.5 px-4 text-sm font-semibold shadow-sm">
            <Clock className="h-4 w-4" /> Cadangan
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600 text-white gap-1.5 py-1.5 px-4 text-sm font-semibold shadow-sm">
            <Clock className="h-4 w-4" /> Menunggu Verifikasi
          </Badge>
        );
    }
  };

  const steps = [
    { title: 'Pendaftaran Terkirim', desc: 'Formulir online diterima sistem' },
    { title: 'Verifikasi Berkas', desc: 'Pemeriksaan rapor & berkas persyaratan' },
    { title: 'Seleksi & Perankingan', desc: 'Scoring engine nilai & kuota' },
    { title: 'Pengumuman Hasil', desc: 'Status kelulusan akhir' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Breadcrumb Back Button */}
        <div className="mb-6 print:hidden">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 gap-1.5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Link>
        </div>

        {/* Search Card */}
        <Card className="border-slate-200 shadow-sm mb-8 print:hidden">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
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
              <Input
                placeholder="Nomor Pendaftaran (misal: REG-2026-00001)"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                className="h-11 text-base uppercase font-mono tracking-wider"
              />
              <Button
                type="submit"
                disabled={loading}
                className="h-11 px-7 bg-blue-600 hover:bg-blue-700 text-white font-semibold shrink-0 gap-2"
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
            {/* Status Banner */}
            <Card className="border-slate-200 overflow-hidden shadow-md">
              <div className="bg-slate-900 p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-blue-400 font-mono tracking-wider block mb-1">
                    NOMOR PENDAFTARAN: {student.registration_number}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{student.full_name}</h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center gap-2">
                    <SchoolIcon className="h-4 w-4 text-blue-400" />
                    <span>Asal Sekolah: {student.source_school_name} (Lulus {student.graduation_year})</span>
                  </p>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                  <span className="text-xs text-slate-400">Status Pendaftaran:</span>
                  {getStatusBadge(student.status)}
                </div>
              </div>

              {/* Visual Progress Stepper */}
              <div className="bg-slate-800/90 px-6 py-5 border-t border-slate-700 print:hidden">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {steps.map((st, idx) => {
                    const currentIdx = getStatusStepIndex(student.status);
                    const isDone = currentIdx > idx;
                    const isCurrent = currentIdx === idx;

                    return (
                      <div key={idx} className="flex items-start gap-2.5">
                        <div
                          className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                            isDone
                              ? 'bg-emerald-500 text-white'
                              : isCurrent
                              ? 'bg-blue-500 text-white ring-4 ring-blue-500/20'
                              : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <div>
                          <div
                            className={`text-xs font-bold ${
                              isDone || isCurrent ? 'text-white' : 'text-slate-400'
                            }`}
                          >
                            {st.title}
                          </div>
                          <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                            {st.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <CardContent className="p-6 sm:p-8 space-y-6">
                {/* Scoring Summary Cards */}
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    Rincian Penilaian Seleksi
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-100">
                      <div className="flex items-center justify-between text-blue-700 text-xs font-semibold">
                        <span>Rata-rata Rapor (70%)</span>
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div className="text-3xl font-extrabold text-blue-900 mt-2 font-mono">
                        {formatScore(student.average_report_score)}
                      </div>
                      <div className="text-[11px] text-blue-600 mt-1">Bobot 70% dari nilai semester 1-5</div>
                    </div>

                    <div className="p-4 rounded-xl bg-purple-50/80 border border-purple-100">
                      <div className="flex items-center justify-between text-purple-700 text-xs font-semibold">
                        <span>Poin Prestasi (30%)</span>
                        <Award className="h-4 w-4" />
                      </div>
                      <div className="text-3xl font-extrabold text-purple-900 mt-2 font-mono">
                        {formatScore(student.achievement_score)}
                      </div>
                      <div className="text-[11px] text-purple-600 mt-1">Bobot 30% dari sertifikat kejuaraan</div>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-100">
                      <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold">
                        <span>Total Skor Akhir</span>
                        <GraduationCap className="h-4 w-4" />
                      </div>
                      <div className="text-3xl font-extrabold text-emerald-900 mt-2 font-mono">
                        {formatScore(student.total_score)}
                      </div>
                      <div className="text-[11px] text-emerald-600 mt-1">Skor gabungan penentu ranking</div>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-100">
                  {/* Biodata Lengkap */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      Biodata Pendaftar
                    </h3>
                    <dl className="grid grid-cols-3 gap-2.5 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                      <dt className="text-slate-500 font-medium">Tempat, Tgl Lahir</dt>
                      <dd className="col-span-2 text-slate-800 font-semibold">{student.birth_place}, {formatDate(student.birth_date)}</dd>
                      
                      <dt className="text-slate-500 font-medium">Jenis Kelamin</dt>
                      <dd className="col-span-2 text-slate-800 font-semibold">{student.gender}</dd>

                      <dt className="text-slate-500 font-medium">Agama</dt>
                      <dd className="col-span-2 text-slate-800 font-semibold">{student.religion}</dd>

                      <dt className="text-slate-500 font-medium">No. WhatsApp</dt>
                      <dd className="col-span-2 text-slate-800 font-semibold">{student.phone}</dd>

                      <dt className="text-slate-500 font-medium">Email</dt>
                      <dd className="col-span-2 text-slate-800 font-semibold">{student.email}</dd>

                      <dt className="text-slate-500 font-medium">Alamat</dt>
                      <dd className="col-span-2 text-slate-800 leading-relaxed">{student.address}</dd>
                    </dl>
                  </div>

                  {/* Pilihan Jurusan & Catatan */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                        Pilihan Program Keahlian
                      </h3>
                      <div className="space-y-2">
                        {student.major_choices && student.major_choices.length > 0 ? (
                          student.major_choices.map((choice) => (
                            <div key={choice.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                                  Pilihan {choice.choice_order}
                                </span>
                                <span className="text-xs font-semibold text-slate-900">
                                  {choice.major?.name || 'Jurusan Terpilih'}
                                </span>
                              </div>
                              <Badge variant="outline" className="text-xs font-bold bg-white">
                                {choice.major?.code || 'JUR'}
                              </Badge>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-500 italic">Pilihan jurusan telah tercatat di sistem.</p>
                        )}
                      </div>
                    </div>

                    {/* Catatan Panitia */}
                    {student.notes && (
                      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                        <strong className="block font-semibold mb-0.5">Catatan Panitia SPMB:</strong>
                        <p>{student.notes}</p>
                      </div>
                    )}

                    {/* Print / Action Buttons */}
                    <div className="pt-2 print:hidden flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => window.print()}
                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold h-10 gap-2 shadow-sm"
                      >
                        <Printer className="h-4 w-4" />
                        Cetak Bukti Pendaftaran (PDF)
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setStudent(null);
                          setRegNumber('');
                          setSearchParams({});
                        }}
                        className="text-xs font-semibold h-10 border-slate-300 hover:bg-slate-100"
                      >
                        Cari Nomor Lain
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
