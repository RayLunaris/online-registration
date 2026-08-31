import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  RefreshCw, 
  Send, 
  FileSpreadsheet,
  Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog } from '@/components/ui/dialog';
import { 
  selectionService, 
  MajorSelectionGroup, 
  RankedCandidate 
} from '@/services/selectionService';
import { exportRecapReportToExcel } from '@/lib/exportUtils';
import { StudentStatus } from '@/types/spmb';
import { formatScore } from '@/lib/utils';

export const AdminSelectionPage: React.FC = () => {
  const [groups, setGroups] = useState<MajorSelectionGroup[]>([]);
  const [allCandidates, setAllCandidates] = useState<RankedCandidate[]>([]);
  const [selectedMajorId, setSelectedMajorId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [runningSim, setRunningSim] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog Publish Confirmation
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const runSimulation = async () => {
    setRunningSim(true);
    setPublishSuccess(false);
    try {
      const res = await selectionService.runSelectionSimulation();
      setGroups(res.groups);
      setAllCandidates(res.allCandidates);
      if (res.groups.length > 0 && !selectedMajorId) {
        setSelectedMajorId(res.groups[0].major.id);
      }
    } catch (err) {
      console.error('Error running selection simulation:', err);
    } finally {
      setRunningSim(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, []);

  // Manual Status Override on Candidate
  const handleStatusOverride = (candidateIndex: number, newStatus: StudentStatus) => {
    const updated = [...allCandidates];
    updated[candidateIndex].status = newStatus;
    setAllCandidates(updated);

    // Also update in groups
    const grpUpdated = groups.map((grp) => ({
      ...grp,
      candidates: grp.candidates.map((c) =>
        c.student.id === updated[candidateIndex].student.id ? { ...c, status: newStatus } : c
      ),
    }));
    setGroups(grpUpdated);
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

  const activeGroup = groups.find((g) => g.major.id === selectedMajorId) || groups[0];

  const filteredCandidates = (activeGroup?.candidates || []).filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.student.full_name.toLowerCase().includes(q) ||
      c.student.registration_number.toLowerCase().includes(q) ||
      c.student.source_school_name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Scoring Engine & Seleksi Otomatis
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Perankingan otomatis berbasis pembobotan <strong>70% Rata-rata Rapor</strong> + <strong>30% Piagam Prestasi</strong> terhadap kuota jurusan.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={runningSim}
            onClick={runSimulation}
            className="text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 gap-1.5 shadow-2xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${runningSim ? 'animate-spin' : ''}`} />
            <span>Hitung Ulang Ranking</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportRecap}
            className="text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 gap-1.5 font-semibold shadow-2xs"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Ekspor Rekap Excel</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsConfirmOpen(true)}
            disabled={allCandidates.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 font-bold shadow-md shadow-emerald-600/20"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Publikasikan Hasil</span>
          </Button>
        </div>
      </div>

      {publishSuccess && (
        <Alert className="bg-emerald-50 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <AlertTitle className="font-bold">Hasil Seleksi Telah Dipublikasikan!</AlertTitle>
          <AlertDescription className="text-xs">
            Seluruh calon siswa sekarang dapat melihat status kelulusan resmi mereka melalui menu <strong>Cek Status Pendaftaran</strong> di website publik.
          </AlertDescription>
        </Alert>
      )}

      {/* JURUSAN SELECTION TABS & RECAP SUMMARY */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {groups.map((grp) => {
          const isSelected = selectedMajorId === grp.major.id;

          return (
            <div
              key={grp.major.id}
              onClick={() => setSelectedMajorId(grp.major.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all shadow-xs ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 border-teal-500 ring-2 ring-teal-500/20 text-slate-900 dark:text-white'
                  : 'bg-white/80 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Badge className="bg-teal-50 text-teal-700 border-teal-200 dark:bg-slate-800 dark:text-teal-400 dark:border-slate-700 text-[10px] font-mono font-bold">
                  {grp.major.code}
                </Badge>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Kuota: {grp.quota}</span>
              </div>
              <h4 className="font-bold text-xs truncate text-slate-900 dark:text-white">{grp.major.name}</h4>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">Pendaftar: <strong>{grp.totalApplicants}</strong></span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Lulus: {grp.acceptedCount}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* CANDIDATES RANKING TABLE */}
      {activeGroup && (
        <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs">
          <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-400 dark:border-teal-800 text-xs font-mono font-bold">
                  {activeGroup.major.code}
                </Badge>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Hasil Perankingan: {activeGroup.major.name}
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Kuota: {activeGroup.quota} Kursi | Pendaftar: {activeGroup.totalApplicants} | Diterima: {activeGroup.acceptedCount} | Cadangan: {activeGroup.reserveCount}
              </CardDescription>
            </div>

            {/* Live Filter Search */}
            <div className="relative w-full md:w-64">
              <label htmlFor="selection-candidate-search" className="sr-only">Cari nama calon siswa</label>
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <Input
                id="selection-candidate-search"
                name="candidateSearch"
                placeholder="Cari nama calon siswa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Cari nama calon siswa"
                className="pl-8 h-8 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="py-16 text-center space-y-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent mx-auto" />
                <p className="text-xs text-slate-500">Menjalankan simulasi kalkulasi skor...</p>
              </div>
            ) : filteredCandidates.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4 text-center w-14">Rank</th>
                      <th className="py-3 px-4">No. Registrasi</th>
                      <th className="py-3 px-4">Nama Siswa</th>
                      <th className="py-3 px-4">Asal SMP/MTs</th>
                      <th className="py-3 px-4 text-center">Rapor (70%)</th>
                      <th className="py-3 px-4 text-center">Prestasi (30%)</th>
                      <th className="py-3 px-4 text-center">Total Skor</th>
                      <th className="py-3 px-4">Status Hasil</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {filteredCandidates.map((cand) => {
                      const candidateGlobalIndex = allCandidates.findIndex(
                        (c) => c.student.id === cand.student.id
                      );

                      return (
                        <tr
                          key={cand.student.id}
                          className={`hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors ${
                            cand.status === 'Diterima' ? 'bg-emerald-50/40 dark:bg-emerald-950/10' : ''
                          }`}
                        >
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-flex items-center justify-center h-6 w-6 rounded-full font-bold text-xs font-mono ${
                                cand.rank === 1
                                  ? 'bg-amber-400 text-slate-900 shadow-xs'
                                  : cand.rank <= activeGroup.quota
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
                                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                              }`}
                            >
                              {cand.rank}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-teal-600 dark:text-teal-400">
                            {cand.student.registration_number}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                            {cand.student.full_name}
                          </td>
                          <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                            {cand.student.source_school_name}
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-slate-700 dark:text-slate-300">
                            {formatScore(cand.reportScoreAvg)}
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-purple-600 dark:text-purple-400">
                            {formatScore(cand.achievementPoints)}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-900 dark:text-white text-[13px]">
                            {formatScore(cand.score)}
                          </td>
                          <td className="py-3 px-4">
                            {/* Status Override Dropdown */}
                            <select
                              value={cand.status}
                              onChange={(e) =>
                                handleStatusOverride(candidateGlobalIndex, e.target.value as StudentStatus)
                              }
                              className={`h-7 px-2 text-[10px] font-semibold rounded border ${
                                cand.status === 'Diterima'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
                                  : cand.status === 'Cadangan'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800'
                                  : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800'
                              }`}
                            >
                              <option value="Diterima">Diterima</option>
                              <option value="Cadangan">Cadangan</option>
                              <option value="Tidak Diterima">Tidak Diterima</option>
                              <option value="Terverifikasi">Terverifikasi</option>
                              <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                            </select>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Link
                              to={`/kartu-peserta/${cand.student.registration_number}`}
                              target="_blank"
                              className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-medium"
                            >
                              Kartu PDF
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-slate-400 dark:text-slate-500">
                Belum ada pendaftar pada jurusan {activeGroup.major.name}.
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Publikasikan Hasil Seleksi?</h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Status kelulusan akan langsung aktif</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Tindakan ini akan mengupdate status seluruh calon siswa di database Supabase sesuai hasil perankingan kuota terkini (Total {allCandidates.length} pendaftar). Calon siswa dapat melihat status mereka secara langsung melalui halaman <strong>Cek Status</strong>.
              </p>

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
