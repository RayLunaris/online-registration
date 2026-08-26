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
  User,
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
          <Badge className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5 py-1.5 px-4 text-sm font-semibold shadow-sm">
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
            {/* Status Banner */}
            <Card className="border-slate-200 overflow-hidden shadow-md">
              <div className="bg-slate-900 p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-teal-400 font-mono tracking-wider block mb-1">
                    NOMOR PENDAFTARAN: {student.registration_number}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{student.full_name}</h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center gap-2">
                    <SchoolIcon className="h-4 w-4 text-teal-400" />
                    <span>Asal Sekolah: {student.source_school_name} (Lulus {student.graduation_year})</span>
                  </p>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                  <span className="text-xs text-slate-400">Status Kelulusan:</span>
                  {getStatusBadge(student.status)}
                </div>
              </div>

              {/* Diterima / Accepted Special Callout Banner */}
              {student.status === 'Diterima' && (
                <div className="bg-emerald-900 border-y border-emerald-700 p-5 sm:p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-800 text-emerald-200 text-xs font-bold uppercase tracking-wider">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Selamat! Anda Dinyatakan Lulus</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      Diterima di: {student.major_choices?.find((c) => c.choice_order === 1)?.major?.name || 'Program Keahlian Pilihan Utama'}
                    </h3>
                    <p className="text-xs text-emerald-200 leading-relaxed max-w-2xl">
                      Segera lakukan daftar ulang fisik di Sekretariat SPMB SMK Negeri 1 Digital Teknologi dengan membawa dokumen persyaratan asli dan Kartu Peserta Resmi.
                    </p>
                  </div>
                  <Link to={`/kartu-peserta/${student.registration_number}`}>
                    <Button className="bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-bold h-11 px-5 gap-2 shadow-lg shrink-0">
                      <Printer className="h-4 w-4 text-emerald-800" />
                      <span>Cetak Kartu Peserta</span>
                    </Button>
                  </Link>
                </div>
              )}
              {/* Cadangan Special Callout Banner */}
              {student.status === 'Cadangan' && (
                <div className="bg-purple-950 border-y border-purple-800 p-5 sm:p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-purple-900 text-purple-200 text-xs font-bold uppercase tracking-wider">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Status: Cadangan (Waiting List)</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      Anda berada dalam kuota cadangan untuk: {student.major_choices?.find((c) => c.choice_order === 1)?.major?.name || 'Program Keahlian'}
                    </h3>
                    <p className="text-xs text-purple-200 leading-relaxed max-w-2xl">
                      Jika terdapat calon siswa utama yang tidak melakukan daftar ulang fisik hingga batas waktu, posisi akan diisi oleh peserta cadangan berdasarkan urutan ranking.
                    </p>
                  </div>
                </div>
              )}

              {/* Tidak Diterima Special Callout Banner */}
              {student.status === 'Tidak Diterima' && (
                <div className="bg-red-950 border-y border-red-800 p-5 sm:p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-red-900 text-red-200 text-xs font-bold uppercase tracking-wider">
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Belum Lolos Seleksi Kuota</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      Mohon maaf, Anda belum memenuhi batas kuota penerimaan SPMB tahun ini.
                    </h3>
                    <p className="text-xs text-red-200 leading-relaxed max-w-2xl">
                      Terima kasih atas partisipasi dan antusiasme Anda. Tetap semangat dalam meraih cita-cita dan mengejar masa depan pendidikan vokasi terbaik!
                    </p>
                  </div>
                </div>
              )}

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
                              ? 'bg-teal-500 text-white ring-4 ring-teal-500/20'
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
                    <div className="p-4 rounded-xl bg-teal-50/80 border border-teal-100">
                      <div className="flex items-center justify-between text-teal-700 text-xs font-semibold">
                        <span>Rata-rata Rapor (70%)</span>
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div className="text-3xl font-extrabold text-teal-900 mt-2 font-mono">
                        {formatScore(student.average_report_score)}
                      </div>
                      <div className="text-[11px] text-teal-700 mt-1">Bobot 70% dari nilai semester 1-5</div>
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
                      <User className="h-4 w-4 text-teal-600" />
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
                      <Link to={`/kartu-peserta/${student.registration_number}`} className="flex-1">
                        <Button
                          className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold h-10 gap-2 shadow-xs rounded-xl"
                        >
                          <Printer className="h-4 w-4" />
                          Kartu Peserta Resmi (PDF & QR)
                        </Button>
                      </Link>
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
