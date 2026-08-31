import React, { useEffect, useState } from 'react';
import { 
  School as SchoolIcon, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  RefreshCw, 
  X 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { adminService } from '@/services/adminService';
import { SourceSchool } from '@/types/spmb';

export const AdminSourceSchoolsPage: React.FC = () => {
  const [schools, setSchools] = useState<SourceSchool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<Partial<SourceSchool> | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Delete State
  const [schoolToDelete, setSchoolToDelete] = useState<SourceSchool | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadSchools = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllSourceSchools();
      setSchools(data);
    } catch (err) {
      console.error('Error loading source schools:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchools();
  }, []);

  const filteredSchools = schools.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.npsn && s.npsn.includes(q)) ||
      s.city.toLowerCase().includes(q) ||
      s.province.toLowerCase().includes(q)
    );
  });

  const handleOpenAdd = () => {
    setEditingSchool({
      name: '',
      npsn: '',
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
    });
    setErrorMsg('');
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (school: SourceSchool) => {
    setEditingSchool({ ...school });
    setErrorMsg('');
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchool?.name) {
      setErrorMsg('Nama sekolah wajib diisi.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      const res = await adminService.saveSourceSchool(editingSchool);
      if (res.success) {
        setIsDialogOpen(false);
        setEditingSchool(null);
        loadSchools();
      } else {
        setErrorMsg(res.error || 'Gagal menyimpan data sekolah.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!schoolToDelete) return;
    setDeleting(true);
    try {
      const res = await adminService.deleteSourceSchool(schoolToDelete.id);
      if (res.success) {
        setSchoolToDelete(null);
        loadSchools();
      } else {
        alert(res.error || 'Gagal menghapus asal sekolah.');
      }
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Master Asal Sekolah (SMP / MTs)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Daftar referensi sekolah asal untuk mempercepat autocomplete pendaftaran siswa.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={loadSchools}
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
            <span>Tambah Sekolah</span>
          </Button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <label htmlFor="school-search-input" className="sr-only">Cari Nama SMP / NPSN / Kota</label>
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              id="school-search-input"
              name="schoolSearch"
              placeholder="Cari Nama SMP / NPSN / Kota..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Cari Nama SMP, NPSN, atau Kota"
              className="pl-9 h-9 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-teal-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* SCHOOLS TABLE */}
      <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs">
        <CardHeader className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80">
          <CardTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Data Sekolah Asal Terdaftar ({filteredSchools.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center space-y-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent mx-auto" />
              <p className="text-xs text-slate-500">Memuat data sekolah asal...</p>
            </div>
          ) : filteredSchools.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Nama Sekolah (SMP/MTs)</th>
                    <th className="py-3 px-4">NPSN</th>
                    <th className="py-3 px-4">Kota / Kabupaten</th>
                    <th className="py-3 px-4">Provinsi</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {filteredSchools.map((school) => (
                    <tr key={school.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <SchoolIcon className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        <span>{school.name}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">{school.npsn || '-'}</td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{school.city}</td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{school.province}</td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenEdit(school)}
                          className="h-8 px-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSchoolToDelete(school)}
                          className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400 dark:text-slate-500">
              Tidak ada data asal sekolah yang cocok.
            </div>
          )}
        </CardContent>
      </Card>

      {/* ADD / EDIT DIALOG */}
      {isDialogOpen && editingSchool && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="relative z-50 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 text-slate-900 dark:text-slate-100 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {editingSchool.id ? 'Edit Data Sekolah' : 'Tambah Sekolah Asal Baru'}
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
                <div className="space-y-1">
                  <label htmlFor="source_school_name" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">Nama Lengkap SMP/MTs *</label>
                  <Input
                    id="source_school_name"
                    name="name"
                    placeholder="Contoh: SMP Negeri 1 Jakarta"
                    value={editingSchool.name || ''}
                    onChange={(e) => setEditingSchool({ ...editingSchool, name: e.target.value })}
                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="source_school_npsn" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">NPSN (Nomor Pokok Sekolah)</label>
                  <Input
                    id="source_school_npsn"
                    name="npsn"
                    placeholder="Contoh: 20101001"
                    value={editingSchool.npsn || ''}
                    onChange={(e) => setEditingSchool({ ...editingSchool, npsn: e.target.value })}
                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="source_school_city" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">Kota / Kabupaten *</label>
                    <Input
                      id="source_school_city"
                      name="city"
                      placeholder="Jakarta Selatan"
                      value={editingSchool.city || ''}
                      onChange={(e) => setEditingSchool({ ...editingSchool, city: e.target.value })}
                      className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="source_school_province" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">Provinsi *</label>
                    <Input
                      id="source_school_province"
                      name="province"
                      placeholder="DKI Jakarta"
                      value={editingSchool.province || ''}
                      onChange={(e) => setEditingSchool({ ...editingSchool, province: e.target.value })}
                      className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                      required
                    />
                  </div>
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
                    {saving ? 'Menyimpan...' : 'Simpan Sekolah'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Dialog>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {schoolToDelete && (
        <Dialog open={Boolean(schoolToDelete)} onOpenChange={(open) => !open && setSchoolToDelete(null)}>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="relative z-50 w-full max-w-md rounded-2xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-slate-950 p-6 text-slate-900 dark:text-slate-100 shadow-2xl space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Hapus Sekolah Asal?</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Anda yakin ingin menghapus <strong>{schoolToDelete.name}</strong> dari daftar referensi asal sekolah?
              </p>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSchoolToDelete(null)}
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
                  {deleting ? 'Menghapus...' : 'Hapus Sekolah'}
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
