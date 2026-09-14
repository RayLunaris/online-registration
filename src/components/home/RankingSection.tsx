import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  ArrowRight, 
  Search, 
  CheckCircle2, 
  Award, 
  ExternalLink,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { MajorTabs } from '@/components/public/leaderboard/MajorTabs';
import { cn } from '@/lib/utils';

export const RankingSection: React.FC = () => {
  const {
    majors,
    selectedMajorId,
    setSelectedMajorId,
    selectedMajor,
    allEntries,
    currentMajorEntries,
    isLoading,
  } = useLeaderboard();

  const [searchQuery, setSearchQuery] = useState('');

  // Map counts per major for tab badges
  const entriesCountByMajor = useMemo(() => {
    const counts: Record<string, number> = {};
    allEntries.forEach((entry) => {
      counts[entry.major_id] = (counts[entry.major_id] || 0) + 1;
    });
    return counts;
  }, [allEntries]);

  // Filter entries in selected major based on quick search
  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) {
      return currentMajorEntries.slice(0, 8); // Top 8 preview
    }
    const q = searchQuery.toLowerCase().trim();
    return currentMajorEntries.filter(
      (e) =>
        e.registration_number.toLowerCase().includes(q) ||
        (e.masked_name && e.masked_name.toLowerCase().includes(q))
    ).slice(0, 10);
  }, [currentMajorEntries, searchQuery]);

  const quota = selectedMajor?.quota || 108;
  const passingGradeCutoff = currentMajorEntries.length >= quota 
    ? currentMajorEntries[quota - 1]?.total_score 
    : (currentMajorEntries.length > 0 ? currentMajorEntries[currentMajorEntries.length - 1]?.total_score : null);

  return (
    <section id="ranking" className="py-14 sm:py-20 bg-white dark:bg-slate-900 border-b border-slate-200/70 dark:border-slate-800/70 scroll-mt-16 relative transition-colors">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* 1. SECTION HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 border border-teal-200/70 dark:border-teal-800/60 mb-3">
              <Trophy className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <span>Transparansi Nilai & Kelulusan</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Peringkat Sementara (Live Ranking)
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Posisi seleksi real-time berbasis akumulasi bobot 70% nilai rata-rata rapor dan 30% skor sertifikat prestasi resmi.
            </p>
          </div>

          {/* Quick Stat Highlights */}
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-left">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Passing Grade
              </span>
              <span className="text-base font-bold font-mono text-teal-700 dark:text-teal-400">
                {passingGradeCutoff ? Number(passingGradeCutoff).toFixed(2) : '-'}
              </span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-left">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Pendaftar
              </span>
              <span className="text-base font-bold font-mono text-slate-800 dark:text-slate-200">
                {currentMajorEntries.length} / {quota}
              </span>
            </div>
            <Link to="/peringkat">
              <Button size="sm" variant="outline" className="h-10 text-xs font-semibold gap-1.5 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/50">
                <span>Peringkat Lengkap</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* 2. MAJOR SELECTION TABS */}
        <div className="mb-4">
          <MajorTabs
            majors={majors}
            selectedMajorId={selectedMajorId}
            onSelectMajor={setSelectedMajorId}
            entriesCountByMajor={entriesCountByMajor}
          />
        </div>

        {/* 3. SEARCH & QUICK FILTER */}
        <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-950/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari no. pendaftaran / nama..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 w-full sm:w-auto justify-end">
            <Info className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span>Menampilkan posisi teratas {selectedMajor?.name ? `(${selectedMajor.code})` : ''}</span>
          </div>
        </div>

        {/* 4. PREVIEW RANKING TABLE */}
        <div className="w-full bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
          {isLoading ? (
            <div className="p-8 text-center space-y-2">
              <div className="h-6 w-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <span className="text-xs text-slate-500 dark:text-slate-400">Memuat data peringkat sementara...</span>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Award className="h-8 w-8 text-slate-400 mx-auto" />
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {searchQuery ? 'Tidak ada pendaftar yang cocok dengan pencarian.' : 'Belum ada pendaftar terverifikasi pada jurusan ini.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3 text-center w-16">Peringkat</th>
                    <th className="px-4 py-3">No. Pendaftaran</th>
                    <th className="px-4 py-3">Nama (Tersamar)</th>
                    <th className="px-4 py-3 text-right">Skor Akhir</th>
                    <th className="px-4 py-3 text-center">Status Kelulusan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredEntries.map((entry) => {
                    const isWithinQuota = entry.is_within_quota;
                    const isTop3 = entry.rank_in_major <= 3;

                    return (
                      <tr key={entry.registration_number} className="hover:bg-teal-50/40 dark:hover:bg-slate-900/60 transition-colors">
                        {/* Rank Badge */}
                        <td className="px-4 py-3 text-center">
                          {isTop3 ? (
                            <span className={cn(
                              "inline-flex items-center justify-center h-6 w-6 rounded-full font-bold font-mono text-xs text-white shadow-xs",
                              entry.rank_in_major === 1 && "bg-amber-500",
                              entry.rank_in_major === 2 && "bg-slate-400",
                              entry.rank_in_major === 3 && "bg-amber-700"
                            )}>
                              {entry.rank_in_major}
                            </span>
                          ) : (
                            <span className="font-mono font-semibold text-slate-600 dark:text-slate-400">
                              #{entry.rank_in_major}
                            </span>
                          )}
                        </td>

                        {/* No Daftar */}
                        <td className="px-4 py-3 font-mono font-semibold text-teal-800 dark:text-teal-400">
                          {entry.registration_number}
                        </td>

                        {/* Nama */}
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-200">
                          {entry.masked_name}
                        </td>

                        {/* Total */}
                        <td className="px-4 py-3 text-right font-mono font-bold text-teal-700 dark:text-teal-400 text-sm">
                          {Number(entry.total_score).toFixed(2)}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 text-center">
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold",
                            isWithinQuota 
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/80" 
                              : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/80"
                          )}>
                            {isWithinQuota ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                <span>Lolos Kuota</span>
                              </>
                            ) : (
                              <span>Cadangan</span>
                            )}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer Banner */}
          <div className="p-4 bg-slate-50/60 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              *Peringkat diperbarui otomatis secara real-time berdasarkan hasil verifikasi nilai rapor dan prestasi.
            </span>
            <Link to="/peringkat">
              <Button size="sm" className="h-8 px-4 bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-semibold text-xs gap-1.5 shadow-xs">
                <span>Lihat Seluruh Peringkat ({allEntries.length} Peserta)</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};
