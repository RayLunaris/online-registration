import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Send, 
  FileSpreadsheet,
  Search,
  Sparkles,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog } from '@/components/ui/dialog';
import { 
  selectionService, 
  MajorSelectionGroup, 
  RankedCandidate,
  SelectionSummary
} from '@/services/selectionService';
import { adminService } from '@/services/adminService';
import { exportRecapReportToExcel } from '@/lib/exportUtils';
import { StudentStatus } from '@/types/spmb';
import { formatScore } from '@/lib/utils';

export const SelectionPanel: React.FC = () => {
  const [groups, setGroups] = useState<MajorSelectionGroup[]>([]);
  const [allCandidates, setAllCandidates] = useState<RankedCandidate[]>([]);
  const [summary, setSummary] = useState<SelectionSummary>({
    totalProcessed: 0,
    totalAcceptedChoice1: 0,
    totalAcceptedChoice2: 0,
    totalRejected: 0,
  });
  const [selectedMajorId, setSelectedMajorId] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [runningProcess, setRunningProcess] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'accepted_ch1' | 'accepted_ch2' | 'rejected'>('all');

  // Dialog Publish Confirmation
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const loadAndRunSimulation = async () => {
    setRunningProcess(true);
    setPublishSuccess(false);
    try {
      const res = await selectionService.runSelectionSimulation();
      setGroups(res.groups);
      setAllCandidates(res.allCandidates);
      setSummary(res.summary);
    } catch (err) {
      console.error('Error running 2-stage selection simulation:', err);
    } finally {
      setRunningProcess(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAndRunSimulation();
  }, []);

  const handleExecuteBackendProcess = async () => {
    setRunningProcess(true);
    try {
      const res = await selectionService.executeTwoStageSelection();
      if (res.success && res.summary) {
        setSummary(res.summary);
      }
      // Refresh current simulation view
      await loadAndRunSimulation();
    } catch (err) {
      console.error('Error executing 2-stage selection process:', err);
    } finally {
      setRunningProcess(false);
    }
  };

  const handleStatusOverride = async (candidateIndex: number, newStatus: StudentStatus) => {
    const updated = [...allCandidates];
    const targetCandidate = updated[candidateIndex];
    if (!targetCandidate) return;

    targetCandidate.status = newStatus;
    setAllCandidates(updated);

    // Recalculate summary & groups
    let accCh1 = 0;
    let accCh2 = 0;
    let rej = 0;

    updated.forEach((c) => {
      if (c.status === 'Diterima') {
        if (c.choiceOrder === 2) accCh2++;
        else accCh1++;
      } else if (c.status === 'Tidak Diterima') {
        rej++;
      }
    });

    setSummary({
      ...summary,
      totalAcceptedChoice1: accCh1,
      totalAcceptedChoice2: accCh2,
      totalRejected: rej,
    });

    try {
      await adminService.updateStudentStatus(targetCandidate.student.id, newStatus);
    } catch (e) {
      console.error('Error saving status override:', e);
    }
  };

  const handlePublishResults = async () => {
    setPublishing(true);
    try {
      const res = await selectionService.publishSelectionResults(allCandidates);
      if (res.success) {
        setPublishSuccess(true);
        setIsConfirmOpen(false);
      } else {
        alert(res.error || 'Gagal mempublikasikan hasil seleksi.');
      }
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setPublishing(false);
    }
  };

  const handleExportRecap = () => {
    const majors = groups.map((g) => g.major);
    const students = allCandidates.map((c) => c.student);
    exportRecapReportToExcel(majors, students);
  };

  const activeGroup = selectedMajorId === 'all' ? null : groups.find((g) => g.major.id === selectedMajorId);

  // Filter candidates according to selected major, statusFilter, and search
  const baseCandidates = selectedMajorId === 'all'
    ? allCandidates
    : (activeGroup?.candidates || []);

  const displayedCandidates = baseCandidates.filter((cand) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      cand.student.full_name.toLowerCase().includes(q) ||
      cand.student.registration_number.toLowerCase().includes(q) ||
      cand.student.source_school_name.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (statusFilter === 'accepted_ch1') return cand.status === 'Diterima' && cand.choiceOrder === 1;
    if (statusFilter === 'accepted_ch2') return cand.status === 'Diterima' && (cand.choiceOrder === 2 || cand.choice2Status === 'accepted');
    if (statusFilter === 'rejected') return cand.status === 'Tidak Diterima';

    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header & Main Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Seleksi & Scoring
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Perankingan otomatis bertingkat: <strong>Tahap 1 (Pilihan 1)</strong> &rarr; <strong>Tahap 2 (Pilihan 2 Sisa Kuota)</strong> berbasis 70% Rapor + 30% Prestasi.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={runningProcess}
            onClick={handleExecuteBackendProcess}
            className="text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-slate-800 gap-1.5 shadow-2xs font-semibold h-8"
          >
            <Sparkles className={`h-3.5 w-3.5 text-teal-600 dark:text-teal-400 ${runningProcess ? 'animate-spin' : ''}`} />
            <span>Jalankan Seleksi</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportRecap}
            className="text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 gap-1.5 font-semibold shadow-2xs h-8"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Ekspor Excel</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsConfirmOpen(true)}
            disabled={allCandidates.length === 0}
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs gap-1.5 font-semibold shadow-xs h-8"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Publikasikan Hasil</span>
          </Button>
        </div>
      </div>

      {/* Publish Success Alert */}
      {publishSuccess && (
        <Alert className="bg-emerald-50 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 py-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <AlertTitle className="font-bold text-xs">Hasil Seleksi Resmi Telah Dipublikasikan!</AlertTitle>
          <AlertDescription className="text-xs">
            Seluruh status kelulusan telah disimpan dan dapat dilihat oleh calon siswa di portal publik.
          </AlertDescription>
        </Alert>
      )}

      {/* LAYER 1: MAJOR TABS */}
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setSelectedMajorId('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
            selectedMajorId === 'all'
              ? 'bg-teal-600 text-white border-teal-600 shadow-xs font-semibold'
              : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Semua ({allCandidates.length})</span>
        </button>

        {groups.map((grp) => {
          const isSelected = selectedMajorId === grp.major.id;
          return (
            <button
              key={grp.major.id}
              type="button"
              onClick={() => setSelectedMajorId(grp.major.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs font-semibold'
                  : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <span>{grp.major.code}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                isSelected ? 'bg-teal-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {grp.acceptedCount}/{grp.quota}
              </span>
            </button>
          );
        })}
      </div>

      {/* CANDIDATES TABLE CARD */}
      <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs">
        {/* Header: Title, Subtitle Stats, and Layer 2 Filter Controls */}
        <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
              {activeGroup ? `${activeGroup.major.code} — ${activeGroup.major.name}` : 'Semua Pendaftar'}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-2">
              {activeGroup ? (
                <>
                  <span>Kuota: {activeGroup.quota}</span>
                  <span>·</span>
                  <span>Pendaftar: {activeGroup.totalApplicants}</span>
                  <span>·</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    Teralokasi: {activeGroup.acceptedCount} ({activeGroup.acceptedCh1Count} Pil 1, {activeGroup.acceptedCh2Count} Pil 2)
                  </span>
                  <span>·</span>
                  <span className="text-red-500">Tidak Lolos: {activeGroup.rejectedCount}</span>
                </>
              ) : (
                <>
                  <span>Total: {allCandidates.length} pendaftar</span>
                  <span>·</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Lolos Pil 1: {summary.totalAcceptedChoice1}</span>
                  <span>·</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Lolos Pil 2: {summary.totalAcceptedChoice2}</span>
                  <span>·</span>
                  <span className="text-red-500">Tidak Lolos: {summary.totalRejected}</span>
                </>
              )}
            </CardDescription>
          </div>

          {/* LAYER 2: Single Search Box + Single Status Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-52">
              <label htmlFor="selection-candidate-search" className="sr-only">Cari nama atau nomor registrasi</label>
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <Input
                id="selection-candidate-search"
                name="candidateSearch"
                placeholder="Cari nama / no. reg..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Cari nama calon siswa"
                className="pl-8 h-7 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>

            <label htmlFor="selection-status-filter" className="sr-only">Filter status kelulusan</label>
            <select
              id="selection-status-filter"
              name="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              aria-label="Filter status kelulusan"
              className="h-7 px-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-700 dark:text-slate-300 font-medium focus:outline-hidden"
            >
              <option value="all">Semua Status</option>
              <option value="accepted_ch1">Lolos Pilihan 1</option>
              <option value="accepted_ch2">Lolos Pilihan 2</option>
              <option value="rejected">Tidak Lolos</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center space-y-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-500 border-t-transparent mx-auto" />
              <p className="text-xs text-slate-500">Menjalankan simulasi kalkulasi seleksi...</p>
            </div>
          ) : displayedCandidates.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-10">#</th>
                    <th className="py-2.5 px-3">No. Reg & Nama</th>
                    <th className="py-2.5 px-3">Pilihan 1 (Tahap 1)</th>
                    <th className="py-2.5 px-3">Pilihan 2 (Tahap 2)</th>
                    <th className="py-2.5 px-3 text-right">Rapor (70%)</th>
                    <th className="py-2.5 px-3 text-right">Prestasi (30%)</th>
                    <th className="py-2.5 px-3 text-right">Total Skor</th>
                    <th className="py-2.5 px-3">Override</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {displayedCandidates.map((cand, index) => {
                    const candidateGlobalIndex = allCandidates.findIndex(
                      (c) => c.student.id === cand.student.id
                    );

                    return (
                      <tr
                        key={cand.student.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors"
                      >
                        {/* No. Urut */}
                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-xs">
                          {index + 1}
                        </td>

                        {/* No. Reg & Nama */}
                        <td className="py-2.5 px-3">
                          <span className="font-mono text-slate-500 dark:text-slate-400 block text-[11px]">
                            {cand.student.registration_number}
                          </span>
                          <div className="font-medium text-slate-900 dark:text-white truncate max-w-[160px]">
                            {cand.student.full_name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                            {cand.student.source_school_name}
                          </div>
                        </td>

                        {/* PILIHAN 1 (2 Baris Teks Sederhana) */}
                        <td className="py-2.5 px-3">
                          <div 
                            className="text-xs text-slate-800 dark:text-slate-200 font-normal truncate max-w-[130px]" 
                            title={cand.choice1Major.name}
                          >
                            {cand.choice1Major.code} — {cand.choice1Major.name}
                          </div>
                          <div className="text-xs mt-0.5">
                            {cand.choice1Status === 'accepted' ? (
                              <span className="text-emerald-600 dark:text-emerald-400">
                                Rank #{cand.choice1Rank} · Lolos
                              </span>
                            ) : (
                              <span className="text-red-500 dark:text-red-400">
                                Rank #{cand.choice1Rank} · Tidak lolos
                              </span>
                            )}
                          </div>
                        </td>

                        {/* PILIHAN 2 (2 Baris Teks Sederhana) */}
                        <td className="py-2.5 px-3">
                          {cand.choice2Major ? (
                            <>
                              <div 
                                className="text-xs text-slate-800 dark:text-slate-200 font-normal truncate max-w-[130px]" 
                                title={cand.choice2Major.name}
                              >
                                {cand.choice2Major.code} — {cand.choice2Major.name}
                              </div>
                              <div className="text-xs mt-0.5">
                                {cand.choice1Status === 'accepted' ? (
                                  <span className="text-slate-400 dark:text-slate-500">
                                    Rank #{cand.choice2Rank || '-'} · Pil 1 lolos
                                  </span>
                                ) : cand.choice2Status === 'accepted' ? (
                                  <span className="text-emerald-600 dark:text-emerald-400">
                                    Rank #{cand.choice2Rank} · Lolos (Pil 2)
                                  </span>
                                ) : (
                                  <span className="text-red-500 dark:text-red-400">
                                    Rank #{cand.choice2Rank || '-'} · Tidak lolos
                                  </span>
                                )}
                              </div>
                            </>
                          ) : (
                            <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
                          )}
                        </td>

                        {/* SKOR (Rapor, Prestasi, Total Skor Rata Kanan Netral) */}
                        <td className="py-2.5 px-3 text-right font-mono text-xs text-slate-700 dark:text-slate-300">
                          {formatScore(cand.reportScoreAvg)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-xs text-slate-700 dark:text-slate-300">
                          {formatScore(cand.achievementPoints)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-xs font-bold text-slate-900 dark:text-white">
                          {formatScore(cand.score)}
                        </td>

                        {/* STATUS OVERRIDE */}
                        <td className="py-2.5 px-3">
                          <label htmlFor={`candidate-status-${cand.student.id || candidateGlobalIndex}`} className="sr-only">
                            {`Ubah status untuk ${cand.student.full_name}`}
                          </label>
                          <select
                            id={`candidate-status-${cand.student.id || candidateGlobalIndex}`}
                            name={`candidate_status_${cand.student.id || candidateGlobalIndex}`}
                            value={cand.status}
                            onChange={(e) =>
                              handleStatusOverride(candidateGlobalIndex, e.target.value as StudentStatus)
                            }
                            aria-label={`Ubah status untuk ${cand.student.full_name}`}
                            className="h-6 px-1.5 text-[11px] rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium focus:outline-hidden cursor-pointer"
                          >
                            <option value="Diterima">Diterima</option>
                            <option value="Tidak Diterima">Tidak Diterima</option>
                            <option value="Terverifikasi">Terverifikasi</option>
                            <option value="Menunggu Verifikasi">Menunggu</option>
                          </select>
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <Link
                            to={`/kartu-peserta/${cand.student.registration_number}`}
                            target="_blank"
                            className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium"
                          >
                            PDF
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 space-y-2">
              <p>Tidak ada data pendaftar yang cocok dengan filter.</p>
              {(statusFilter !== 'all' || searchQuery) && (
                <div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setStatusFilter('all');
                      setSearchQuery('');
                    }}
                    className="text-xs h-7 px-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    Reset Filter
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* CONFIRMATION PUBLISH DIALOG */}
      {isConfirmOpen && (
        <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="relative z-50 w-full max-w-md rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-950 p-6 text-slate-900 dark:text-slate-100 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
                  <Send className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Publikasikan Hasil Seleksi 2 Tahap?</h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Status kelulusan akan langsung aktif</span>
                </div>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between">
                  <span>Diterima di Pilihan 1:</span>
                  <strong className="text-emerald-600">{summary.totalAcceptedChoice1} siswa</strong>
                </div>
                <div className="flex justify-between">
                  <span>Diterima di Pilihan 2 (Limpahan):</span>
                  <strong className="text-indigo-600">{summary.totalAcceptedChoice2} siswa</strong>
                </div>
                <div className="flex justify-between">
                  <span>Tidak Diterima di Keduanya:</span>
                  <strong className="text-red-500">{summary.totalRejected} siswa</strong>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsConfirmOpen(false)}
                  className="text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs"
                >
                  Batal
                </Button>
                <Button
                  size="sm"
                  disabled={publishing}
                  onClick={handlePublishResults}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
                >
                  {publishing ? 'Memproses...' : 'Ya, Publikasikan Sekarang'}
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
