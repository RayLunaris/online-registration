import React, { useMemo } from 'react';
import { PublicLeaderboardEntry, Major } from '@/types/spmb';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LeaderboardTableProps {
  entries: PublicLeaderboardEntry[];
  major?: Major;
  isLoading?: boolean;
  highlightedReg?: string | null;
  currentPage: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  entries,
  major,
  isLoading = false,
  highlightedReg = null,
  currentPage,
  onPageChange,
  pageSize = 30,
}) => {
  // Calculate pagination
  const totalPages = Math.ceil(entries.length / pageSize) || 1;
  const validPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedEntries = useMemo(() => {
    const startIndex = (validPage - 1) * pageSize;
    return entries.slice(startIndex, startIndex + pageSize);
  }, [entries, validPage, pageSize]);

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="px-5 py-3.5 flex items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-4 w-8 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
              <div className="flex items-center gap-6">
                <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty State
  if (entries.length === 0) {
    return (
      <div className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center space-y-3 shadow-2xs">
        <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 mx-auto flex items-center justify-center">
          <Award className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Belum Ada Data Peringkat
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Hasil seleksi untuk kompetensi keahlian ini belum diproses atau belum ada pendaftar terverifikasi.
          </p>
        </div>
      </div>
    );
  }

  const startRecord = (validPage - 1) * pageSize + 1;
  const endRecord = Math.min(validPage * pageSize, entries.length);

  return (
    <div className="space-y-4">
      {/* Table Container */}
      <div className="w-full bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
        
        {/* Table Top Header Info */}
        <div className="px-5 py-3.5 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {major?.name || 'Semua Peringkat'}
            </span>
            {major?.quota && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                · Kuota: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{major.quota}</strong> kursi
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Total diproses: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{entries.length}</strong> siswa
          </div>
        </div>

        {/* Minimalist Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/20 text-slate-500 dark:text-slate-400 font-medium">
                <th scope="col" className="py-3 px-4 sm:px-6 w-20 font-semibold">
                  Peringkat
                </th>
                <th scope="col" className="py-3 px-4 sm:px-6 font-semibold">
                  Nama (tersamar)
                </th>
                <th scope="col" className="py-3 px-4 sm:px-6 text-right w-28 sm:w-36 font-semibold">
                  Skor
                </th>
                <th scope="col" className="py-3 px-4 sm:px-6 text-right sm:text-left w-32 sm:w-40 font-semibold">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {paginatedEntries.map((entry) => {
                const isHighlighted = highlightedReg?.toUpperCase() === entry.registration_number.toUpperCase();
                const isWithinQuota = entry.is_within_quota;

                return (
                  <tr
                    key={entry.registration_number}
                    id={`leaderboard-row-${entry.registration_number}`}
                    data-registration-number={entry.registration_number}
                    className={cn(
                      'transition-colors duration-500',
                      isHighlighted
                        ? 'bg-amber-100/90 dark:bg-amber-950/70 ring-1 ring-amber-400/80'
                        : 'hover:bg-slate-50/60 dark:hover:bg-slate-900/40'
                    )}
                  >
                    {/* 1. Peringkat */}
                    <td className="py-3 px-4 sm:px-6 font-mono text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">
                      <span className={cn(
                        'inline-flex items-center justify-center min-w-[24px] text-xs',
                        entry.rank_in_major <= 3 
                          ? 'text-teal-700 dark:text-teal-400 font-bold' 
                          : 'text-slate-600 dark:text-slate-400'
                      )}>
                        #{entry.rank_in_major}
                      </span>
                    </td>

                    {/* 2. Nama (tersamar) */}
                    <td className="py-3 px-4 sm:px-6 font-medium text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="truncate">{entry.masked_name}</span>
                        {isHighlighted && (
                          <span className="text-[10px] bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 px-1.5 py-0.5 rounded font-mono font-bold">
                            Pilihan Anda
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 3. Skor */}
                    <td className="py-3 px-4 sm:px-6 text-right font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                      {Number(entry.total_score).toFixed(2)}
                    </td>

                    {/* 4. Status (Dalam Kuota / Di Luar Kuota) */}
                    <td className="py-3 px-4 sm:px-6 text-right sm:text-left whitespace-nowrap">
                      {isWithinQuota ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span>Dalam kuota</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                          <span>Di luar kuota</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Section (if entries > 30) */}
        {entries.length > pageSize && (
          <div className="px-5 py-3 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
              Menampilkan <strong>{startRecord}</strong> - <strong>{endRecord}</strong> dari <strong>{entries.length}</strong> siswa
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(1)}
                disabled={validPage === 1}
                className="h-8 w-8 p-0 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                title="Halaman Pertama"
              >
                <ChevronsLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(validPage - 1)}
                disabled={validPage === 1}
                className="h-8 px-2 text-xs text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 gap-1"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sebelumnya</span>
              </Button>

              <span className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono">
                {validPage} / {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(validPage + 1)}
                disabled={validPage === totalPages}
                className="h-8 px-2 text-xs text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 gap-1"
              >
                <span className="hidden sm:inline">Berikutnya</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(totalPages)}
                disabled={validPage === totalPages}
                className="h-8 w-8 p-0 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                title="Halaman Terakhir"
              >
                <ChevronsRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
