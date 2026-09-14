import React, { useState } from 'react';
import { 
  Eye, 
  Trash2, 
  Info,
  ArrowRightLeft,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StudentCompleteDetail, Major } from '@/types/spmb';
import { DEFAULT_MAJORS } from '@/services/schoolService';
import { formatScore } from '@/lib/utils';
import { resolveChoiceStatuses } from '@/lib/resolveChoiceStatuses';

interface Props {
  students: StudentCompleteDetail[];
  majors?: Major[];
  onOpenDetail: (student: StudentCompleteDetail) => void;
  onDeleteStudent: (student: StudentCompleteDetail) => void;
}

export const StudentTable: React.FC<Props> = ({
  students,
  majors = [],
  onOpenDetail,
  onDeleteStudent,
}) => {
  const [viewMode, setViewMode] = useState<'auto' | 'cards' | 'table'>('auto');
  const activeMajorsList = majors.length > 0 ? majors : DEFAULT_MAJORS;
  const majorMap = new Map<string, Major>(activeMajorsList.map((m) => [m.id, m]));

  const getChoiceStatusBadge = (
    status: 'accepted' | 'rejected' | 'not_applicable' | 'pending'
  ) => {
    switch (status) {
      case 'accepted':
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 text-[9px] px-1.5 py-0 font-bold whitespace-nowrap">
            Diterima
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800 text-[9px] px-1.5 py-0 font-bold whitespace-nowrap">
            Tidak Masuk Kuota
          </Badge>
        );
      case 'not_applicable':
        return (
          <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-900 dark:text-slate-500 text-[9px] px-1.5 py-0 font-normal">
            —
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 text-[9px] px-1.5 py-0 font-normal whitespace-nowrap">
            Belum Diproses
          </Badge>
        );
    }
  };

  const resolveStudentStatuses = (student: StudentCompleteDetail) =>
    resolveChoiceStatuses(student, majorMap);

  const renderFinalBadge = (isAcceptedCh1: boolean, isAcceptedCh2: boolean, student: StudentCompleteDetail, ch1Major?: Major, ch2Major?: Major) => {
    if (isAcceptedCh1) {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 text-xs px-2.5 py-1 font-bold whitespace-nowrap">
          Diterima di {ch1Major?.code || 'Pil. 1'}
        </Badge>
      );
    }
    if (isAcceptedCh2) {
      return (
        <div className="space-y-1">
          <Badge className="bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800 text-xs px-2.5 py-1 font-bold whitespace-nowrap flex items-center gap-1">
            <ArrowRightLeft className="h-3 w-3" />
            <span>Diterima di {ch2Major?.code || 'Pil. 2'}</span>
          </Badge>
          <div 
            className="flex items-center gap-1 text-[10px] text-indigo-700 dark:text-indigo-300 font-normal leading-tight"
            title={`Tidak masuk kuota Pilihan 1 (${ch1Major?.name || 'Pil 1'}), tergeser ke Pilihan 2`}
          >
            <Info className="h-3 w-3 shrink-0" />
            <span className="truncate max-w-[180px]">
              Tergeser ke Pil 2 ({ch2Major?.code})
            </span>
          </div>
        </div>
      );
    }
    if (student.status === 'Tidak Diterima') {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800 text-xs px-2.5 py-1 font-bold whitespace-nowrap">
          Tidak Diterima
        </Badge>
      );
    }
    return (
      <Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800 text-[10px] px-2 py-0.5 whitespace-nowrap">
        {student.status || 'Belum Diproses'}
      </Badge>
    );
  };

  const showCards = viewMode === 'cards' || (viewMode === 'auto');
  const showTable = viewMode === 'table' || (viewMode === 'auto');

  return (
    <div>
      {/* View Switcher Toolbar on Mobile/Tablet */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Total: <strong className="text-slate-800 dark:text-slate-200">{students.length}</strong> Siswa
        </span>
        <div className="flex items-center gap-1 bg-white dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold transition-colors min-h-[32px] cursor-pointer ${
              viewMode === 'cards' || (viewMode === 'auto' && typeof window !== 'undefined' && window.innerWidth < 768)
                ? 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Tampilan Kartu (Mobile Friendly)"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span className="text-[11px]">Kartu</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold transition-colors min-h-[32px] cursor-pointer ${
              viewMode === 'table' || (viewMode === 'auto' && typeof window !== 'undefined' && window.innerWidth >= 768)
                ? 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Tampilan Tabel Lengkap"
          >
            <TableIcon className="h-3.5 w-3.5" />
            <span className="text-[11px]">Tabel</span>
          </button>
        </div>
      </div>

      {/* 1. MOBILE TOUCH CARDS VIEW (active on <md or when explicitly toggled) */}
      <div className={`${showCards ? (viewMode === 'cards' ? 'block' : 'block md:hidden') : 'hidden'} p-3 space-y-3`}>
        {students.map((student) => {
          const {
            ch1Major,
            ch2Major,
            ch1Status,
            ch2Status,
            isAcceptedChoice1,
            isAcceptedChoice2,
          } = resolveStudentStatuses(student);
          const selRes = student.selection_results;

          return (
            <div
              key={student.id}
              className={`p-4 rounded-xl border bg-white dark:bg-slate-950 shadow-xs space-y-3 transition-all ${
                isAcceptedChoice2
                  ? 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/10'
                  : isAcceptedChoice1
                  ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/10'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Card Header: Reg Number & Final Badge */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                <span className="font-mono font-bold text-xs text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-1 rounded border border-teal-100 dark:border-teal-900">
                  {student.registration_number}
                </span>
                <div>
                  {renderFinalBadge(isAcceptedChoice1, isAcceptedChoice2, student, ch1Major, ch2Major)}
                </div>
              </div>

              {/* Student Name & School */}
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                  {student.full_name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {student.source_school_name || 'Asal Sekolah -'}
                </p>
              </div>

              {/* Choices in 2-Column Responsive Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                {/* Pilihan 1 */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Pilihan 1</span>
                    <Badge className="bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 text-[9px] font-mono px-1 py-0">
                      Rank #{selRes?.choice1_rank || selRes?.rank || 1}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge className="bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 text-[10px] font-mono">
                      {ch1Major?.code || '-'}
                    </Badge>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                      {ch1Major?.name || '-'}
                    </span>
                  </div>
                  <div>{getChoiceStatusBadge(ch1Status)}</div>
                </div>

                {/* Pilihan 2 */}
                <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800 pt-2 sm:pt-0 sm:pl-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Pilihan 2</span>
                    {selRes?.choice2_rank ? (
                      <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 text-[9px] font-mono px-1 py-0">
                        Rank #{selRes.choice2_rank}
                      </Badge>
                    ) : null}
                  </div>
                  {ch2Major ? (
                    <>
                      <div className="flex items-center gap-1.5">
                        <Badge className="bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 text-[10px] font-mono">
                          {ch2Major.code}
                        </Badge>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">
                          {ch2Major.name}
                        </span>
                      </div>
                      <div>{getChoiceStatusBadge(ch2Status)}</div>
                    </>
                  ) : (
                    <div className="text-slate-400 text-[11px] italic py-0.5">Tidak memilih</div>
                  )}
                </div>
              </div>

              {/* Total Score */}
              <div className="flex items-center justify-between px-1 pt-0.5">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Skor:</span>
                <span className="font-mono font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                  {formatScore(student.total_score)}
                </span>
              </div>

              {/* Action Buttons (Touch friendly with min-h-[44px]) */}
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onOpenDetail(student)}
                  className="col-span-3 min-h-[44px] h-11 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs gap-2 rounded-xl active:scale-98 transition-transform shadow-xs cursor-pointer"
                >
                  <Eye className="h-4 w-4" />
                  <span>Lihat & Verifikasi</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onDeleteStudent(student)}
                  aria-label={`Hapus data ${student.full_name}`}
                  className="col-span-1 min-h-[44px] h-11 border-red-200 dark:border-red-900/60 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 rounded-xl active:scale-98 transition-transform flex items-center justify-center cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. FULL DATA TABLE (active on >=md or when explicitly toggled) */}
      <div className={`${showTable ? (viewMode === 'table' ? 'block' : 'hidden md:block') : 'hidden'} overflow-x-auto`}>
        <table className="w-full text-xs text-left text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="py-3 px-4">No Pendaftaran</th>
              <th className="py-3 px-4">Nama</th>
              <th className="py-3 px-4">Pilihan 1</th>
              <th className="py-3 px-4">Pilihan 2</th>
              <th className="py-3 px-4">Hasil Akhir</th>
              <th className="py-3 px-4 text-center">Total Skor</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {students.map((student) => {
              const {
                ch1Major,
                ch2Major,
                ch1Status,
                ch2Status,
                isAcceptedChoice1,
                isAcceptedChoice2,
              } = resolveStudentStatuses(student);
              const selRes = student.selection_results;

              return (
                <tr 
                  key={student.id} 
                  className={`hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors ${
                    isAcceptedChoice2 ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : isAcceptedChoice1 ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : ''
                  }`}
                >
                  {/* No Pendaftaran */}
                  <td className="py-3 px-4 font-mono font-bold text-teal-600 dark:text-teal-400 whitespace-nowrap">
                    {student.registration_number}
                  </td>

                  {/* Nama & Info */}
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 dark:text-white block truncate max-w-[170px]">
                      {student.full_name}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate max-w-[170px]">
                      {student.source_school_name}
                    </span>
                  </td>

                  {/* Pilihan 1 (jurusan + rank + badge status) */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <Badge className="bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 text-[10px] font-mono">
                          {ch1Major?.code || '-'}
                        </Badge>
                        <span className="text-[11px] text-slate-700 dark:text-slate-300 truncate max-w-[110px]">
                          {ch1Major?.name || '-'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge className="bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 text-[9px] font-mono px-1 py-0">
                          Rank #{selRes?.choice1_rank || selRes?.rank || 1}
                        </Badge>
                        {getChoiceStatusBadge(ch1Status)}
                      </div>
                    </div>
                  </td>

                  {/* Pilihan 2 (jurusan + rank + badge status) */}
                  <td className="py-3 px-4">
                    {ch2Major ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <Badge className="bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 text-[10px] font-mono">
                            {ch2Major.code}
                          </Badge>
                          <span className="text-[11px] text-slate-600 dark:text-slate-400 truncate max-w-[110px]">
                            {ch2Major.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {selRes?.choice2_rank ? (
                            <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 text-[9px] font-mono px-1 py-0">
                              Rank #{selRes.choice2_rank}
                            </Badge>
                          ) : null}
                          {getChoiceStatusBadge(ch2Status)}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 italic">
                        {getChoiceStatusBadge('not_applicable')}
                      </div>
                    )}
                  </td>

                  {/* Hasil Akhir */}
                  <td className="py-3 px-4">
                    {renderFinalBadge(isAcceptedChoice1, isAcceptedChoice2, student, ch1Major, ch2Major)}
                  </td>

                  {/* Total Skor */}
                  <td className="py-3 px-4 text-center font-mono font-bold text-slate-900 dark:text-white text-xs">
                    {formatScore(student.total_score)}
                  </td>

                  {/* Aksi */}
                  <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                    <Button
                      size="sm"
                      onClick={() => onOpenDetail(student)}
                      className="min-h-[36px] h-9 px-3 bg-teal-600 hover:bg-teal-700 text-white text-[11px] gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Detail</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteStudent(student)}
                      className="min-h-[36px] h-9 px-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/40 text-[11px] cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
