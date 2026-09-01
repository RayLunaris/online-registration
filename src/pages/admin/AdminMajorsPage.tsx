import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Code, 
  Network, 
  Palette, 
  Calculator, 
  RefreshCw,
  X,
  GraduationCap,
  Users,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { adminService } from '@/services/adminService';
import { Major } from '@/types/spmb';

export const AdminMajorsPage: React.FC = () => {
  const [majors, setMajors] = useState<Major[]>([]);
  const [majorCounts, setMajorCounts] = useState<Record<string, number>>({});
  const [totalApplicants, setTotalApplicants] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Form State for Add / Edit
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMajor, setEditingMajor] = useState<Partial<Major> | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Delete State
  const [majorToDelete, setMajorToDelete] = useState<Major | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadMajors = async () => {
    setLoading(true);
    try {
      const [majorsData, statsData] = await Promise.all([
        adminService.getAllMajors(),
        adminService.getDashboardStats(),
      ]);
      setMajors(majorsData);

      const countsMap: Record<string, number> = {};
      statsData.majorStats.forEach((ms) => {
        countsMap[ms.id] = ms.count;
      });
      setMajorCounts(countsMap);
      setTotalApplicants(statsData.totalStudents);
    } catch (err) {
      console.error('Error loading majors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMajors();
  }, []);

  const handleOpenAdd = () => {
    setEditingMajor({
      code: '',
      name: '',
      description: '',
      quota: 108,
      is_active: true,
      icon: 'Code',
    });
    setErrorMsg('');
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (major: Major) => {
    setEditingMajor({ ...major });
    setErrorMsg('');
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMajor?.code || !editingMajor?.name) {
      setErrorMsg('Kode dan Nama Jurusan wajib diisi.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      const res = await adminService.saveMajor(editingMajor);
      if (res.success) {
        setIsDialogOpen(false);
        setEditingMajor(null);
        loadMajors();
      } else {
        setErrorMsg(res.error || 'Gagal menyimpan data jurusan.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!majorToDelete) return;
    setDeleting(true);
    try {
      const res = await adminService.deleteMajor(majorToDelete.id);
      if (res.success) {
        setMajorToDelete(null);
        loadMajors();
      } else {
        alert(res.error || 'Gagal menghapus jurusan.');
      }
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan.');
    } finally {
      setDeleting(false);
    }
  };

  const getMajorTheme = (code: string, iconName: string | null) => {
    const c = code.toUpperCase();
    if (c.includes('AKL') || iconName === 'Calculator') {
      return {
        icon: <Calculator className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
        progressBg: 'bg-emerald-500',
        cardGlow: 'hover:border-emerald-300 dark:hover:border-emerald-700',
        iconBox: 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800',
      };
    }
    if (c.includes('DKV') || iconName === 'Palette') {
      return {
        icon: <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
        badgeBg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800',
        progressBg: 'bg-purple-500',
        cardGlow: 'hover:border-purple-300 dark:hover:border-purple-700',
        iconBox: 'bg-purple-50 dark:bg-purple-950/80 border-purple-200 dark:border-purple-800',
      };
    }
    if (c.includes('TKJ') || iconName === 'Network') {
      return {
        icon: <Network className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
        progressBg: 'bg-blue-500',
        cardGlow: 'hover:border-blue-300 dark:hover:border-blue-700',
        iconBox: 'bg-blue-50 dark:bg-blue-950/80 border-blue-200 dark:border-blue-800',
      };
    }
    return {
      icon: <Code className="h-5 w-5 text-teal-600 dark:text-teal-400" />,
      badgeBg: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-400 dark:border-teal-800',
      progressBg: 'bg-teal-500',
      cardGlow: 'hover:border-teal-300 dark:hover:border-teal-700',
      iconBox: 'bg-teal-50 dark:bg-teal-950/80 border-teal-200 dark:border-teal-800',
    };
  };

  const totalCapacity = majors.reduce((sum, m) => sum + (m.quota || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Master Jurusan & Kuota
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Kelola program keahlian, batas kuota pendaftar, dan status aktif.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={loadMajors}
            className="text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 gap-1.5 shadow-2xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          <Button
            size="sm"
            onClick={handleOpenAdd}
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs gap-1.5 font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Jurusan</span>
          </Button>
        </div>
      </div>

      {/* TOP SUMMARY ROW: 3 METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Program */}
        <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs">
          <CardHeader className="p-5 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Program</span>
              <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-400 border border-teal-100 dark:border-teal-900/50">
                <GraduationCap className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {majors.length} <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Jurusan</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {majors.filter((m) => m.is_active).length} program keahlian aktif
            </span>
          </CardContent>
        </Card>

        {/* Total Kapasitas */}
        <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs">
          <CardHeader className="p-5 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Kapasitas</span>
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-900/50">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400 mt-1 font-mono">
              {totalCapacity} <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Kursi</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Daya tampung keseluruhan SPMB 2026
            </span>
          </CardContent>
        </Card>

        {/* Pendaftar Memilih */}
        <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs">
          <CardHeader className="p-5 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pendaftar Memilih</span>
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-1 font-mono">
              {totalApplicants} <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Berkas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Peminat terdaftar di pilihan 1
            </span>
          </CardContent>
        </Card>
      </div>

      {/* MAJORS GRID */}
      {loading ? (
        <div className="py-16 text-center space-y-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent mx-auto" />
          <p className="text-xs text-slate-500">Memuat data jurusan...</p>
        </div>
      ) : majors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {majors.map((major) => {
            const theme = getMajorTheme(major.code, major.icon);
            const count = majorCounts[major.id] || 0;
            const quota = major.quota || 100;
            const pct = quota > 0 ? Math.round((count / quota) * 100) : 0;
            const barWidth = Math.min(100, pct);

            return (
              <Card 
                key={major.id} 
                className={`bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs flex flex-col justify-between transition-all duration-200 ${theme.cardGlow}`}
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-xl border ${theme.iconBox}`}>
                      {theme.icon}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge className={`${theme.badgeBg} font-mono text-xs font-bold`}>
                        {major.code}
                      </Badge>
                      {major.is_active ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800 text-[10px]">
                          Aktif
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 text-[10px]">
                          Nonaktif
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                    {major.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {major.description || 'Tidak ada deskripsi.'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-3">
                  {/* Realtime Quota Progress Bar */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        {count} / {quota} Kursi
                      </span>
                      <span className={`font-mono font-bold ${pct >= 100 ? 'text-amber-600 dark:text-amber-400' : 'text-teal-600 dark:text-teal-400'}`}>
                        ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          pct >= 100 ? 'bg-amber-500' : theme.progressBg
                        }`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEdit(major)}
                      className="flex-1 text-xs bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 gap-1.5 h-8 shadow-2xs font-medium"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setMajorToDelete(major)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/40 text-xs h-8 px-2.5 font-medium"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center text-xs text-slate-500 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          Belum ada program keahlian yang terdaftar.
        </div>
      )}

      {/* ADD / EDIT DIALOG */}
      {isDialogOpen && editingMajor && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="relative z-50 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 text-slate-900 dark:text-slate-100 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {editingMajor.id ? 'Edit Data Jurusan' : 'Tambah Jurusan Baru'}
                </h3>
                <button onClick={() => setIsDialogOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/70 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-3 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="major_code" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">Kode Jurusan *</label>
                    <Input
                      id="major_code"
                      name="code"
                      placeholder="Contoh: RPL"
                      value={editingMajor.code || ''}
                      onChange={(e) => setEditingMajor({ ...editingMajor, code: e.target.value.toUpperCase() })}
                      className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white uppercase font-mono font-bold"
                      required
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label htmlFor="major_name" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">Nama Lengkap Jurusan *</label>
                    <Input
                      id="major_name"
                      name="name"
                      placeholder="Contoh: Rekayasa Perangkat Lunak"
                      value={editingMajor.name || ''}
                      onChange={(e) => setEditingMajor({ ...editingMajor, name: e.target.value })}
                      className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="major_quota" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">Batas Kuota Penerimaan</label>
                    <Input
                      id="major_quota"
                      name="quota"
                      type="number"
                      min={0}
                      value={editingMajor.quota || 100}
                      onChange={(e) => setEditingMajor({ ...editingMajor, quota: Number(e.target.value) })}
                      className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="major_icon" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">Ikon Kejuruan</label>
                    <select
                      id="major_icon"
                      name="icon"
                      value={editingMajor.icon || 'Code'}
                      onChange={(e) => setEditingMajor({ ...editingMajor, icon: e.target.value })}
                      className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-white"
                    >
                      <option value="Code">Code (Software/RPL)</option>
                      <option value="Network">Network (Jaringan/TKJ)</option>
                      <option value="Palette">Palette (Desain/DKV)</option>
                      <option value="Calculator">Calculator (Akuntansi/AKL)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="major_description" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">Deskripsi Program Keahlian</label>
                  <textarea
                    id="major_description"
                    name="description"
                    rows={3}
                    placeholder="Ringkasan kompetensi keahlian dan materi yang dipelajari"
                    value={editingMajor.description || ''}
                    onChange={(e) => setEditingMajor({ ...editingMajor, description: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={editingMajor.is_active ?? true}
                    onChange={(e) => setEditingMajor({ ...editingMajor, is_active: e.target.checked })}
                    className="rounded bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="is_active" className="text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                    Jurusan Aktif (Dapat dipilih calon siswa di formulir pendaftaran)
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs"
                  >
                    {saving ? 'Menyimpan...' : 'Simpan Jurusan'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Dialog>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {majorToDelete && (
        <Dialog open={Boolean(majorToDelete)} onOpenChange={(open) => !open && setMajorToDelete(null)}>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="relative z-50 w-full max-w-md rounded-2xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-slate-950 p-6 text-slate-900 dark:text-slate-100 shadow-2xl space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Hapus Jurusan?</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Anda yakin ingin menghapus jurusan <strong>{majorToDelete.name} ({majorToDelete.code})</strong>?
              </p>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setMajorToDelete(null)}
                  className="text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs"
                >
                  Batal
                </Button>
                <Button
                  size="sm"
                  disabled={deleting}
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs"
                >
                  {deleting ? 'Menghapus...' : 'Hapus Jurusan'}
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
