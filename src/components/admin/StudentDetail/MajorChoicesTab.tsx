import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRightLeft, 
  HelpCircle, 
  Sparkles,
  Info,
  Layers
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StudentCompleteDetail, Major } from '@/types/spmb';
import { DEFAULT_MAJORS } from '@/services/schoolService';

interface Props {
  student: StudentCompleteDetail;
  majors?: Major[];
}

export const MajorChoicesTab: React.FC<Props> = ({ student, majors = [] }) => {
  const activeMajorsList = majors.length > 0 ? majors : DEFAULT_MAJORS;
  const majorMap = new Map<string, Major>(activeMajorsList.map((m) => [m.id, m]));

  const ch1Choice = student.major_choices?.find((c) => c.choice_order === 1);
  const ch2Choice = student.major_choices?.find((c) => c.choice_order === 2);

  const ch1Major = ch1Choice?.major || (ch1Choice?.major_id ? majorMap.get(ch1Choice.major_id) : undefined);
  const ch2Major = ch2Choice?.major || (ch2Choice?.major_id ? majorMap.get(ch2Choice.major_id) : undefined);

  const selRes = student.selection_results;

  // 1. Resolve Choice 1 evaluation
  const ch1Quota = ch1Major?.quota || 72;
  const ch1Rank = selRes?.choice1_rank || selRes?.rank || 1;
  let ch1Status: 'accepted' | 'rejected' | 'pending' = selRes?.choice1_status || 'pending';

  if (!selRes?.choice1_status) {
    if (student.status === 'Diterima') {
      if (selRes?.final_accepted_from_priority === 2) {
        ch1Status = 'rejected';
      } else {
        ch1Status = 'accepted';
      }
    } else if (student.status === 'Tidak Diterima') {
      ch1Status = 'rejected';
    }
  }

  // 2. Resolve Choice 2 evaluation
  const hasChoice2 = Boolean(ch2Major);
  const ch2Quota = ch2Major?.quota || 36;
  const ch2Rank = selRes?.choice2_rank || null;
  let ch2Status: 'accepted' | 'rejected' | 'not_applicable' | 'pending' = selRes?.choice2_status || (hasChoice2 ? 'pending' : 'not_applicable');

  if (!selRes?.choice2_status && hasChoice2) {
    if (ch1Status === 'accepted') {
      ch2Status = 'not_applicable';
    } else if (student.status === 'Diterima' && selRes?.final_accepted_from_priority === 2) {
      ch2Status = 'accepted';
    } else if (student.status === 'Tidak Diterima') {
      ch2Status = 'rejected';
    }
  }

  // 3. Resolve Final Decision
  let finalStatusLabel = 'Belum Diproses';
  let finalMajorName = '';
  let finalReason = 'Proses seleksi dan perankingan kuota belum dipublikasikan oleh panitia.';
  let isFromChoice2 = false;

  if (student.status === 'Diterima') {
    if (selRes?.final_accepted_from_priority === 2 || ch2Status === 'accepted') {
      isFromChoice2 = true;
      finalMajorName = ch2Major?.name || 'Pilihan 2';
      finalStatusLabel = `Diterima di ${finalMajorName} (Pilihan 2)`;
      finalReason = `Siswa tidak masuk kuota pada Pilihan 1 (${ch1Major?.name || 'Pilihan 1'}), namun memenuhi batas sisa kuota pada Pilihan 2 (${ch2Major?.name || 'Pilihan 2'}).`;
    } else {
      finalMajorName = ch1Major?.name || 'Pilihan 1';
      finalStatusLabel = `Diterima di ${finalMajorName} (Pilihan 1)`;
      finalReason = `Siswa dinyatakan lulus dan diterima pada Program Keahlian Pilihan 1 (Utama) karena total skor masuk dalam batas kuota awal.`;
    }
  } else if (student.status === 'Tidak Diterima') {
    finalStatusLabel = 'Tidak Diterima';
    finalReason = hasChoice2
      ? `Total skor siswa belum memenuhi batas kuota penerimaan pada Pilihan 1 (${ch1Major?.name}) maupun Pilihan 2 (${ch2Major?.name}).`
      : `Total skor siswa belum memenuhi batas kuota penerimaan pada Pilihan 1 (${ch1Major?.name}).`;
  }

  return (
    <div className="space-y-6">
      {/* 2 CARDS BERDAMPINGAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CARD PILIHAN 1 */}
        <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Pilihan 1 (Prioritas Utama)
              </h4>
            </div>
            {ch1Major && (
              <Badge className="bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-400 dark:border-teal-800 font-mono text-xs">
                {ch1Major.code}
              </Badge>
            )}
          </div>

          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500 block">Program Keahlian:</span>
            <span className="font-bold text-slate-900 dark:text-white text-base">
              {ch1Major?.name || 'Belum Memilih'}
            </span>
          </div>

          {/* Rank vs Quota Info */}
          <div className="space-y-2 bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Posisi Perankingan:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                #{ch1Rank} <span className="text-slate-400 font-normal">dari kuota {ch1Quota} kursi</span>
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-1">
              <Progress 
                value={Math.min(ch1Rank, ch1Quota)} 
                max={ch1Quota} 
                className="h-2.5 bg-slate-200 dark:bg-slate-800"
                indicatorClassName={ch1Rank <= ch1Quota ? 'bg-emerald-500' : 'bg-red-500'}
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Rank #1</span>
                <span>Batas Kuota #{ch1Quota}</span>
              </div>
            </div>
          </div>

          {/* Badge Status Besar */}
          <div className="pt-1 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Status Pilihan 1:</span>
            {ch1Status === 'accepted' ? (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 text-xs px-3 py-1 font-bold gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Diterima</span>
              </Badge>
            ) : ch1Status === 'rejected' ? (
              <Badge className="bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800 text-xs px-3 py-1 font-bold gap-1">
                <XCircle className="h-3.5 w-3.5" />
                <span>Tidak Masuk Kuota</span>
              </Badge>
            ) : (
              <Badge className="bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 text-xs px-3 py-1 font-medium gap-1">
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Belum Diproses</span>
              </Badge>
            )}
          </div>
        </div>

        {/* CARD PILIHAN 2 */}
        <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Pilihan 2 (Alternatif Limpahan)
              </h4>
            </div>
            {ch2Major && (
              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-400 dark:border-indigo-800 font-mono text-xs">
                {ch2Major.code}
              </Badge>
            )}
          </div>

          {!hasChoice2 ? (
            <div className="py-10 text-center space-y-2 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <Layers className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Siswa tidak memilih jurusan alternatif
              </p>
              <span className="text-[10px] text-slate-400">Hanya mendaftar pada 1 program keahlian</span>
            </div>
          ) : ch1Status === 'accepted' ? (
            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-400 dark:text-slate-500 block">Program Keahlian:</span>
                <span className="font-bold text-slate-900 dark:text-white text-base">
                  {ch2Major?.name}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-center space-y-1.5">
                <Info className="h-5 w-5 text-teal-600 dark:text-teal-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Tidak diproses karena diterima di Pilihan 1
                </p>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed block">
                  Siswa telah berhasil memenuhi kuota pada prioritas utama ({ch1Major?.name}), sehingga kuota pilihan kedua tidak digunakan.
                </span>
              </div>

              <div className="pt-1 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Status Pilihan 2:</span>
                <Badge className="bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 text-xs px-2.5 py-0.5">
                  — Tidak Digunakan
                </Badge>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-400 dark:text-slate-500 block">Program Keahlian:</span>
                <span className="font-bold text-slate-900 dark:text-white text-base">
                  {ch2Major?.name}
                </span>
              </div>

              {/* Rank vs Quota Info Tahap 2 */}
              <div className="space-y-2 bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Evaluasi Tahap 2:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    #{ch2Rank || 1} <span className="text-slate-400 font-normal">dari total kuota {ch2Quota}</span>
                  </span>
                </div>

                <Progress 
                  value={Math.min(ch2Rank || 1, ch2Quota)} 
                  max={ch2Quota} 
                  className="h-2.5 bg-slate-200 dark:bg-slate-800"
                  indicatorClassName={ch2Status === 'accepted' ? 'bg-indigo-500' : 'bg-red-500'}
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Peringkat Limpahan #{ch2Rank || 1}</span>
                  <span>Kapasitas #{ch2Quota}</span>
                </div>
              </div>

              {/* Badge Status Besar Pilihan 2 */}
              <div className="pt-1 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Status Pilihan 2:</span>
                {ch2Status === 'accepted' ? (
                  <Badge className="bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800 text-xs px-3 py-1 font-bold gap-1">
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                    <span>Diterima (Pilihan 2)</span>
                  </Badge>
                ) : ch2Status === 'rejected' ? (
                  <Badge className="bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800 text-xs px-3 py-1 font-bold gap-1">
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Tidak Masuk Kuota</span>
                  </Badge>
                ) : (
                  <Badge className="bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 text-xs px-3 py-1 font-medium gap-1">
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span>Belum Diproses</span>
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RINGKASAN HASIL AKHIR */}
      <div className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        student.status === 'Diterima'
          ? isFromChoice2
            ? 'bg-indigo-900 border-indigo-700 text-white'
            : 'bg-emerald-900 border-emerald-700 text-white'
          : student.status === 'Tidak Diterima'
          ? 'bg-red-950 border-red-800 text-white'
          : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
              student.status === 'Diterima' 
                ? isFromChoice2 ? 'bg-indigo-800 text-indigo-200' : 'bg-emerald-800 text-emerald-200'
                : student.status === 'Tidak Diterima' ? 'bg-red-900 text-red-200' : 'bg-slate-200 text-slate-700'
            }`}>
              Hasil Keputusan Seleksi Akhir
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-black">
            {finalStatusLabel}
          </h3>

          <p className={`text-xs leading-relaxed max-w-2xl ${
            student.status === 'Diterima' ? 'text-emerald-100' : student.status === 'Tidak Diterima' ? 'text-red-200' : 'text-slate-500'
          }`}>
            {finalReason}
          </p>
        </div>

        {student.status === 'Diterima' && (
          <div className="shrink-0 flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
