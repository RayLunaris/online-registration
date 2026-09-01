import React from 'react';
import { 
  Eye, 
  Trash2, 
  Info,
  ArrowRightLeft
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StudentCompleteDetail, Major } from '@/types/spmb';
import { DEFAULT_MAJORS } from '@/services/schoolService';
import { formatScore } from '@/lib/utils';

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

  return (
    <div className="overflow-x-auto">
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
            const ch1Choice = student.major_choices?.find((c) => c.choice_order === 1);
            const ch2Choice = student.major_choices?.find((c) => c.choice_order === 2);

            const ch1Major = ch1Choice?.major || (ch1Choice?.major_id ? majorMap.get(ch1Choice.major_id) : undefined);
            const ch2Major = ch2Choice?.major || (ch2Choice?.major_id ? majorMap.get(ch2Choice.major_id) : undefined);

            const selRes = student.selection_results;

            // Resolve Choice 1 Status
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

            // Resolve Choice 2 Status
            let ch2Status: 'accepted' | 'rejected' | 'not_applicable' | 'pending' = 'not_applicable';
            if (ch2Major) {
              ch2Status = selRes?.choice2_status || 'pending';
              if (!selRes?.choice2_status) {
                if (ch1Status === 'accepted') {
                  ch2Status = 'not_applicable';
                } else if (student.status === 'Diterima' && selRes?.final_accepted_from_priority === 2) {
                  ch2Status = 'accepted';
                } else if (student.status === 'Tidak Diterima') {
                  ch2Status = 'rejected';
                }
              }
            }

            // Resolve Final Result Badge
            const isAcceptedCh1 = student.status === 'Diterima' && (selRes?.final_accepted_from_priority === 1 || (!selRes?.final_accepted_from_priority && ch1Status === 'accepted'));
            const isAcceptedCh2 = student.status === 'Diterima' && (selRes?.final_accepted_from_priority === 2 || ch2Status === 'accepted');

            return (
              <tr 
                key={student.id} 
                className={`hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors ${
                  isAcceptedCh2 ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : isAcceptedCh1 ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : ''
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

                {/* Hasil Akhir (Badge Besar) */}
                <td className="py-3 px-4">
                  {isAcceptedCh1 ? (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 text-xs px-2.5 py-1 font-bold whitespace-nowrap">
                      Diterima di {ch1Major?.code || 'Pil. 1'}
                    </Badge>
                  ) : isAcceptedCh2 ? (
                    <div className="space-y-1">
                      <Badge className="bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800 text-xs px-2.5 py-1 font-bold whitespace-nowrap flex items-center gap-1">
                        <ArrowRightLeft className="h-3 w-3" />
                        <span>Diterima di {ch2Major?.code || 'Pil. 2'} (Pilihan 2)</span>
                      </Badge>
                      <div 
                        className="flex items-center gap-1 text-[10px] text-indigo-700 dark:text-indigo-300 font-normal leading-tight"
                        title={`Tidak masuk kuota Pilihan 1 (${ch1Major?.name || 'Pil 1'}), tergeser ke Pilihan 2`}
                      >
                        <Info className="h-3 w-3 shrink-0" />
                        <span className="truncate max-w-[180px]">
                          Tergeser dari Pil 1 ({ch1Major?.code}) ke Pil 2
                        </span>
                      </div>
                    </div>
                  ) : student.status === 'Tidak Diterima' ? (
                    <Badge className="bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800 text-xs px-2.5 py-1 font-bold whitespace-nowrap">
                      Tidak Diterima
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800 text-[10px] px-2 py-0.5 whitespace-nowrap">
                      {student.status || 'Belum Diproses'}
                    </Badge>
                  )}
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
                    className="h-8 px-2.5 bg-teal-600 hover:bg-teal-700 text-white text-[11px] gap-1 shadow-xs"
                  >
                    <Eye className="h-3 w-3" />
                    <span>Detail</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteStudent(student)}
                    className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/40 text-[11px]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
