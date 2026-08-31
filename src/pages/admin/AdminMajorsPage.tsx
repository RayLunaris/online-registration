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
  X 
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
      const data = await adminService.getAllMajors();
      setMajors(data);
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

  const getMajorIcon = (iconName: string | null) => {
    switch (iconName) {
      case 'Code': return <Code className="h-5 w-5 text-teal-400" />;
      case 'Network': return <Network className="h-5 w-5 text-indigo-400" />;
      case 'Palette': return <Palette className="h-5 w-5 text-purple-400" />;
      case 'Calculator': return <Calculator className="h-5 w-5 text-emerald-400" />;
      default: return <Code className="h-5 w-5 text-teal-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Master Jurusan / Kompetensi Keahlian
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Kelola daftar program keahlian, batas kuota pendaftar, dan status aktif.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={loadMajors}
            className="text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 gap-1.5 shadow-2xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
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

      {/* MAJORS GRID */}
      {loading ? (
        <div className="py-16 text-center space-y-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent mx-auto" />
          <p className="text-xs text-slate-500">Memuat data jurusan...</p>
        </div>
      ) : majors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {majors.map((major) => (
            <Card key={major.id} className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs flex flex-col justify-between">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    {getMajorIcon(major.icon)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge className="bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-400 dark:border-teal-800 font-mono text-xs font-bold">
                      {major.code}
                    </Badge>
                    {major.is_active ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800 text-[10px]">Aktif</Badge>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 text-[10px]">Nonaktif</Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  {major.name}
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mt-1.5 leading-relaxed">
                  {major.description || 'Tidak ada deskripsi.'}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 pt-0">
                <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
                  <span>Kuota Siswa:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{major.quota} Kursi</span>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenEdit(major)}
                    className="flex-1 text-xs bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 gap-1 h-8 shadow-2xs"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Edit</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setMajorToDelete(major)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/40 text-xs h-8 px-2"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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
