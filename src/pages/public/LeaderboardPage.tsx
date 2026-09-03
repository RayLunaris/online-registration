import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  RefreshCw, 
  Lock, 
  Search, 
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { MajorTabs } from '@/components/public/leaderboard/MajorTabs';
import { LeaderboardTable } from '@/components/public/leaderboard/LeaderboardTable';
import { SearchMyRank } from '@/components/public/leaderboard/SearchMyRank';

export const LeaderboardPage: React.FC = () => {
  const {
    isLeaderboardEnabled,
    majors,
    selectedMajorId,
    setSelectedMajorId,
    selectedMajor,
    allEntries,
    currentMajorEntries,
    isLoading,
    error,
    refetch,
    findStudent,
  } = useLeaderboard();

  const [currentPage, setCurrentPage] = useState(1);
  const [highlightedReg, setHighlightedReg] = useState<string | null>(null);
  const pageSize = 30;

  // Reset page when switching major tab
  const handleSelectMajor = (majorId: string) => {
    setSelectedMajorId(majorId);
    setCurrentPage(1);
    setHighlightedReg(null);
  };

  // Map counts per major for tab badges
  const entriesCountByMajor = useMemo(() => {
    const counts: Record<string, number> = {};
    allEntries.forEach((entry) => {
      counts[entry.major_id] = (counts[entry.major_id] || 0) + 1;
    });
    return counts;
  }, [allEntries]);

  // Handle auto-scroll and temporary highlight (yellow fade after 2s)
  const triggerHighlightAndScroll = (regNumber: string, targetPage?: number) => {
    if (targetPage && targetPage !== currentPage) {
      setCurrentPage(targetPage);
    }
    setHighlightedReg(regNumber);

    setTimeout(() => {
      const rowElem = document.getElementById(`leaderboard-row-${regNumber}`);
      if (rowElem) {
        rowElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 120);

    setTimeout(() => {
      setHighlightedReg((prev) => (prev === regNumber ? null : prev));
    }, 2500);
  };

  // Highlight in current major
  const handleHighlightInCurrentMajor = (regNumber: string) => {
    const index = currentMajorEntries.findIndex(
      (e) => e.registration_number.toUpperCase() === regNumber.toUpperCase()
    );
    const targetPage = index !== -1 ? Math.floor(index / pageSize) + 1 : 1;
    triggerHighlightAndScroll(regNumber, targetPage);
  };

  // Switch major and highlight
  const handleSwitchMajorAndHighlight = (majorId: string, regNumber: string) => {
    setSelectedMajorId(majorId);
    const entriesInTargetMajor = allEntries
      .filter((e) => e.major_id === majorId)
      .sort((a, b) => a.rank_in_major - b.rank_in_major || b.total_score - a.total_score);

    const index = entriesInTargetMajor.findIndex(
      (e) => e.registration_number.toUpperCase() === regNumber.toUpperCase()
    );
    const targetPage = index !== -1 ? Math.floor(index / pageSize) + 1 : 1;
    setCurrentPage(targetPage);

    setTimeout(() => {
      triggerHighlightAndScroll(regNumber, targetPage);
    }, 150);
  };

  // State: Leaderboard is disabled by admin
  if (!isLoading && !isLeaderboardEnabled) {
    return (
      <div className="min-h-[75vh] bg-slate-50 dark:bg-slate-900/50 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl text-center space-y-6">
          <div className="h-16 w-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center shadow-xs">
            <Lock className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Peringkat Belum Dipublikasikan
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg mx-auto">
              Hasil scoring dan peringkat sementara belum dibuka untuk publik oleh panitia SPMB. Silakan cek secara berkala atau periksa status individual pendaftaran Anda.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/cek-status" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold h-10 px-6 gap-2 shadow-xs">
                <Search className="h-4 w-4" />
                <span>Cek Status Mandiri</span>
              </Button>
            </Link>
            <Link to="/" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto text-xs h-10 px-6 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700">
                Kembali ke Beranda
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-900/30 py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl space-y-6 sm:space-y-8">
        
        {/* Breadcrumb / Back Link */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 gap-1.5 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>

          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
            className="h-8 px-3 text-xs text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 gap-1.5 bg-white dark:bg-slate-950 shadow-2xs"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Perbarui</span>
          </Button>
        </div>

        {/* Page Title & Subtitle */}
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Peringkat Sementara
            </h1>
            <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 border border-teal-200/80 dark:border-teal-800/80 px-2 py-0.5 rounded font-mono">
              Live SPMB
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Diperbarui otomatis setelah proses seleksi · nama disamarkan untuk privasi
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200">
            <AlertTitle>Gagal Memuat Data</AlertTitle>
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {/* Horizontal Tabs Per Major */}
        <MajorTabs
          majors={majors}
          selectedMajorId={selectedMajorId}
          onSelectMajor={handleSelectMajor}
          entriesCountByMajor={entriesCountByMajor}
        />

        {/* Leaderboard Table */}
        <LeaderboardTable
          entries={currentMajorEntries}
          major={selectedMajor}
          isLoading={isLoading}
          highlightedReg={highlightedReg}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
        />

        {/* Search My Rank Feature (Under Table) */}
        <SearchMyRank
          onSearch={findStudent}
          onSwitchMajorAndHighlight={handleSwitchMajorAndHighlight}
          onHighlightInCurrentMajor={handleHighlightInCurrentMajor}
        />

        {/* Privacy & Methodology Footer Note */}
        <div className="p-4 bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
          <Info className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300 block">
              Catatan Transparansi & Kebijakan Privasi
            </span>
            <p className="leading-relaxed">
              Peringkat sementara dihitung berdasarkan akumulasi Nilai Rapor (bobot 70%) dan Nilai Prestasi (bobot 30%). Posisi peringkat dapat berubah sewaktu-waktu hingga batas akhir penetapan hasil seleksi resmi. Nama siswa dipersingkat guna melindungi privasi calon peserta didik.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LeaderboardPage;
