import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ArrowRightLeft, 
  ChevronDown, 
  ChevronUp, 
  Printer, 
  Award, 
  BookOpen, 
  Clock,
  ShieldCheck,
  TrendingUp,
  School as SchoolIcon,
  BarChart3,
  Check,
  X,
  Copy,
  Share2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StudentCompleteDetail } from '@/types/spmb';
import { DEFAULT_MAJORS } from '@/services/schoolService';
import { formatScore } from '@/lib/utils';
import { resolveChoiceStatuses } from '@/lib/resolveChoiceStatuses';

interface Props {
  student: StudentCompleteDetail;
  onResetSearch?: () => void;
}

export const StatusResultCard: React.FC<Props> = ({ student, onResetSearch }) => {
  const [isTransparansiOpen, setIsTransparansiOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}?reg=${encodeURIComponent(student.registration_number)}`;
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
      console.error('Failed to copy link:', err);
    }
  };

  // DEFAULT_MAJORS is used as a fallback map for the mock/offline environment
  // where major_choices[].major may not be pre-joined.
  const defaultMajorMap = new Map(DEFAULT_MAJORS.map((m) => [m.id, m]));

  const {
    ch1Major,
    ch2Major,
    hasChoice2,
    ch1Rank,
    ch1Quota,
    ch1Status,
    ch2Rank,
    ch2Quota,
    ch2Status,
    isAcceptedChoice1,
    isAcceptedChoice2,
  } = resolveChoiceStatuses(student, defaultMajorMap);


  return (
    <Card className="border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg bg-white dark:bg-slate-950">
      {/* HEADER: NOMOR PENDAFTARAN & NAMA SISWA */}
      <div className="bg-slate-900 p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs text-teal-400 font-mono tracking-wider">
              NOMOR PENDAFTARAN: {student.registration_number}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors cursor-pointer"
              title="Salin tautan langsung hasil cek status ini"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-300 font-medium">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Salin Tautan</span>
                </>
              )}
            </button>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{student.full_name}</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center gap-2">
            <SchoolIcon className="h-4 w-4 text-teal-400" />
            <span>Asal Sekolah: {student.source_school_name} (Lulusan {student.graduation_year})</span>
          </p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
          <span className="text-xs text-slate-400">Status Keputusan:</span>
          {student.status === 'Diterima' ? (
            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 py-1.5 px-4 text-sm font-semibold shadow-xs">
              <CheckCircle2 className="h-4 w-4" /> Diterima
            </Badge>
          ) : student.status === 'Tidak Diterima' ? (
            <Badge variant="destructive" className="gap-1.5 py-1.5 px-4 text-sm font-semibold shadow-xs">
              <XCircle className="h-4 w-4" /> Tidak Diterima
            </Badge>
          ) : student.status === 'Terverifikasi' ? (
            <Badge className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5 py-1.5 px-4 text-sm font-semibold shadow-xs">
              <ShieldCheck className="h-4 w-4" /> Berkas Terverifikasi
            </Badge>
          ) : (
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white gap-1.5 py-1.5 px-4 text-sm font-semibold shadow-xs">
              <Clock className="h-4 w-4" /> Menunggu Verifikasi
            </Badge>
          )}
        </div>
      </div>

      {/* CALLOUT BANNER SESUAI KEPUTUSAN */}
      {isAcceptedChoice1 && (
        <div className="bg-emerald-900 border-y border-emerald-700 p-5 sm:p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-800 text-emerald-200 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Lolos Prioritas Utama</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Selamat! Anda diterima di {ch1Major?.name || 'Pilihan 1'} (Pilihan 1)
            </h3>
            <p className="text-xs text-emerald-100 leading-relaxed max-w-2xl">
              Skor Anda berhasil memenuhi kuota penerimaan pada pilihan prioritas utama. Segera lakukan daftar ulang fisik di Sekretariat SPMB dengan membawa berkas persyaratan asli dan Kartu Peserta Resmi.
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

      {isAcceptedChoice2 && (
        <div className="bg-indigo-900 border-y border-indigo-700 p-5 sm:p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-800 text-indigo-200 text-xs font-bold uppercase tracking-wider border border-indigo-700">
              <ArrowRightLeft className="h-3.5 w-3.5" />
              <span>Lolos Pilihan 2 (Limpahan Alternatif)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Selamat! Anda diterima di {ch2Major?.name || 'Pilihan 2'} (Pilihan 2).
            </h3>
            <p className="text-xs text-indigo-200 font-medium">
              Kuota Pilihan 1 Anda ({ch1Major?.name || 'Pilihan 1'}) sudah terpenuhi oleh pendaftar dengan nilai lebih tinggi.
            </p>
            <p className="text-xs text-indigo-100 leading-relaxed max-w-2xl mt-1">
              Namun total skor Anda berhasil memenuhi sisa kuota penerimaan pada jurusan Pilihan 2. Segera lakukan daftar ulang fisik di Sekretariat SPMB dengan membawa dokumen asli dan Kartu Peserta Resmi.
            </p>
          </div>
          <Link to={`/kartu-peserta/${student.registration_number}`}>
            <Button className="bg-white text-indigo-900 hover:bg-indigo-50 text-xs font-bold h-11 px-5 gap-2 shadow-lg shrink-0">
              <Printer className="h-4 w-4 text-indigo-800" />
              <span>Cetak Kartu Peserta</span>
            </Button>
          </Link>
        </div>
      )}

      {student.status === 'Tidak Diterima' && (
        <div className="bg-red-950 border-y border-red-800 p-5 sm:p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-red-900 text-red-200 text-xs font-bold uppercase tracking-wider">
              <XCircle className="h-3.5 w-3.5" />
              <span>Belum Memenuhi Kuota</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Mohon maaf, Anda belum diterima di Pilihan 1 maupun Pilihan 2 pada periode ini.
            </h3>
            <p className="text-xs text-red-200 leading-relaxed max-w-2xl">
              Seluruh kuota penerimaan pada Program Keahlian {ch1Major?.name} {hasChoice2 ? `dan ${ch2Major?.name}` : ''} telah terpenuhi oleh pendaftar dengan akumulasi skor lebih tinggi. Terima kasih atas partisipasi dan antusiasme Anda. Tetap semangat dalam menggapai cita-cita!
            </p>
          </div>
        </div>
      )}

      <CardContent className="p-6 sm:p-8 space-y-6">
        {/* SCORING HEADLINE STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/60">
            <div className="flex items-center justify-between text-teal-700 dark:text-teal-400 text-xs font-semibold">
              <span>Rata-rata Rapor (70%)</span>
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="text-3xl font-extrabold text-teal-900 dark:text-teal-100 mt-2 font-mono">
              {formatScore(student.average_report_score)}
            </div>
            <div className="text-[11px] text-teal-700 dark:text-teal-400 mt-1">Bobot 70% semester 1-5</div>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60">
            <div className="flex items-center justify-between text-purple-700 dark:text-purple-400 text-xs font-semibold">
              <span>Poin Prestasi (30%)</span>
              <Award className="h-4 w-4" />
            </div>
            <div className="text-3xl font-extrabold text-purple-900 dark:text-purple-100 mt-2 font-mono">
              {formatScore(student.achievement_score)}
            </div>
            <div className="text-[11px] text-purple-600 dark:text-purple-400 mt-1">Bobot 30% kejuaraan</div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60">
            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
              <span>Total Skor Akhir</span>
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-900 dark:text-emerald-100 mt-2 font-mono">
              {formatScore(student.total_score)}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">Skor gabungan ranking</div>
          </div>
        </div>

        {/* COLLAPSIBLE CARD KECIL: TRANSPARANSI SKOR & RANKING DI KEDUA PILIHAN */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/60 dark:bg-slate-900/40">
          <button
            type="button"
            onClick={() => setIsTransparansiOpen(!isTransparansiOpen)}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-100/80 dark:hover:bg-slate-900/80 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold text-xs">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Transparansi Posisi & Peringkat Kuota (Pilihan 1 & 2)
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Rincian perankingan skor Anda terhadap kuota daya tampung masing-masing jurusan
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 font-semibold">
              <span>{isTransparansiOpen ? 'Sembunyikan' : 'Tampilkan Detail'}</span>
              {isTransparansiOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </button>

          {isTransparansiOpen && (
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* MINI CARD PILIHAN 1 */}
                <div className={`p-4 rounded-xl border space-y-3 ${
                  ch1Status === 'accepted'
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 font-mono">
                        PILIHAN 1
                      </span>
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {ch1Major?.name || 'Pilihan Utama'}
                      </span>
                    </div>
                    {ch1Major && (
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {ch1Major.code}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Daya Tampung Kuota:</span>
                      <strong className="text-slate-900 dark:text-white">{ch1Quota} kursi</strong>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Posisi Peringkat:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {ch1Rank ? (
                          <>#{ch1Rank} <span className="text-slate-400 font-normal">dari {ch1Quota} kuota</span></>
                        ) : (
                          <span className="text-slate-400 font-normal">—</span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Status Pilihan 1:</span>
                    {ch1Status === 'accepted' ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold gap-1">
                        <Check className="h-3 w-3 inline" />
                        <span>Masuk Kuota Pilihan 1</span>
                      </Badge>
                    ) : ch1Status === 'rejected' ? (
                      <Badge className="bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 text-[10px] font-bold gap-1">
                        <X className="h-3 w-3 inline" />
                        <span>Tergeser (Melebihi Kuota)</span>
                      </Badge>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 text-[10px]">
                        Dalam Proses
                      </Badge>
                    )}
                  </div>
                </div>

                {/* MINI CARD PILIHAN 2 */}
                <div className={`p-4 rounded-xl border space-y-3 ${
                  ch2Status === 'accepted'
                    ? 'bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/50'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-mono">
                        PILIHAN 2
                      </span>
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {ch2Major?.name || 'Tidak Memilih'}
                      </span>
                    </div>
                    {ch2Major && (
                      <Badge variant="outline" className="font-mono text-[10px] dark:border-slate-700 dark:text-slate-300">
                        {ch2Major.code}
                      </Badge>
                    )}
                  </div>

                  {!hasChoice2 ? (
                    <div className="py-3 text-center text-xs text-slate-400 dark:text-slate-500 italic">
                      — Siswa tidak memilih jurusan alternatif
                    </div>
                  ) : ch1Status === 'accepted' ? (
                    <div className="py-3 text-center text-xs text-slate-500 dark:text-slate-400 italic">
                      — Tidak diproses karena telah diterima di Pilihan 1
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <span>Total Kuota Jurusan:</span>
                          <strong className="text-slate-900 dark:text-white">{ch2Quota} kursi</strong>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <span>Peringkat Limpahan:</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {ch2Rank ? `#${ch2Rank}` : '—'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">Status Pilihan 2:</span>
                        {ch2Status === 'accepted' ? (
                          <Badge className="bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] font-bold gap-1">
                            <Check className="h-3 w-3 inline" />
                            <span>Masuk Sisa Kuota Pilihan 2</span>
                          </Badge>
                        ) : ch2Status === 'rejected' ? (
                          <Badge className="bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 text-[10px] font-bold gap-1">
                            <X className="h-3 w-3 inline" />
                            <span>Tidak Masuk Sisa Kuota</span>
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 text-[10px]">
                            Dalam Proses
                          </Badge>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Catatan Panitia */}
        {student.notes && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs text-amber-900 dark:text-amber-200">
            <strong className="block font-bold mb-1">Catatan Panitia SPMB:</strong>
            <p className="leading-relaxed">{student.notes}</p>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="pt-2 print:hidden flex flex-col sm:flex-row gap-3">
          <Link to={`/kartu-peserta/${student.registration_number}`} className="flex-1">
            <Button
              className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold h-11 gap-2 shadow-xs rounded-xl cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Kartu Peserta Resmi (PDF & QR)</span>
            </Button>
          </Link>
          <Button
            type="button"
            variant="outline"
            onClick={handleCopyLink}
            className={`text-xs font-semibold h-11 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl px-4 gap-2 transition-colors cursor-pointer ${
              copied ? 'text-emerald-600 dark:text-emerald-400 border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' : ''
            }`}
            title="Salin tautan hasil pengecekan status ini"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Tautan Disalin!</span>
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                <span>Salin Tautan</span>
              </>
            )}
          </Button>
          {onResetSearch && (
            <Button
              variant="outline"
              onClick={onResetSearch}
              className="text-xs font-semibold h-11 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl px-5 cursor-pointer"
            >
              Cek Nomor Lain
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
