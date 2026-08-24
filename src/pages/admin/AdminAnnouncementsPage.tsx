import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  RefreshCw, 
  X 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { adminService } from '@/services/adminService';
import { Announcement } from '@/types/spmb';
import { formatDate } from '@/lib/utils';

export const AdminAnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Partial<Announcement> | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Delete State
  const [itemToDelete, setItemToDelete] = useState<Announcement | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error('Error loading announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleOpenAdd = () => {
    setEditingAnnouncement({
      title: '',
      slug: '',
      category: 'Pengumuman',
      status: 'Published',
      thumbnail_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80',
      content: '',
    });
    setErrorMsg('');
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (ann: Announcement) => {
    setEditingAnnouncement({ ...ann });
    setErrorMsg('');
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnouncement?.title || !editingAnnouncement?.content) {
      setErrorMsg('Judul dan konten pengumuman wajib diisi.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      const res = await adminService.saveAnnouncement(editingAnnouncement);
      if (res.success) {
        setIsDialogOpen(false);
        setEditingAnnouncement(null);
        loadAnnouncements();
      } else {
        setErrorMsg(res.error || 'Gagal menyimpan pengumuman.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      const res = await adminService.deleteAnnouncement(itemToDelete.id);
      if (res.success) {
        setItemToDelete(null);
        loadAnnouncements();
      } else {
        alert(res.error || 'Gagal menghapus pengumuman.');
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Manajemen Berita & Pengumuman
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Publikasikan jadwal SPMB, petunjuk teknis, panduan berkas, dan berita sekolah terbaru.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={loadAnnouncements}
            className="text-xs bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
          <Button
            size="sm"
            onClick={handleOpenAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>Buat Pengumuman</span>
          </Button>
        </div>
      </div>

      {/* ANNOUNCEMENTS TABLE */}
      <Card className="bg-slate-950 border-slate-800 text-slate-100 shadow-md">
        <CardHeader className="p-4 sm:p-5 border-b border-slate-800/80">
          <CardTitle className="text-sm sm:text-base font-bold text-white">
            Daftar Berita & Pengumuman ({announcements.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center space-y-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mx-auto" />
              <p className="text-xs text-slate-500">Memuat data pengumuman...</p>
            </div>
          ) : announcements.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Judul Artikel / Pengumuman</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Tanggal Rilis</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {announcements.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3 px-4 max-w-sm">
                        <span className="font-bold text-white block truncate">{item.title}</span>
                        <span className="text-[10px] font-mono text-slate-500 truncate block">
                          /pengumuman/{item.slug}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-[10px] bg-slate-900 border-slate-700 text-slate-300">
                          {item.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {item.status === 'Published' ? (
                          <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px]">
                            Published
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-800 text-slate-400 text-[10px]">Draft</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{formatDate(item.published_at)}</td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <Link to={`/pengumuman/${item.slug}`} target="_blank">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-blue-400 hover:text-blue-300 hover:bg-blue-950/40"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenEdit(item)}
                          className="h-8 px-2 text-slate-300 hover:text-white hover:bg-slate-800"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setItemToDelete(item)}
                          className="h-8 px-2 text-red-400 hover:text-red-300 hover:bg-red-950/40"
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
            <div className="p-12 text-center text-xs text-slate-500">
              Belum ada pengumuman yang dibuat.
            </div>
          )}
        </CardContent>
      </Card>

      {/* ADD / EDIT DIALOG */}
      {isDialogOpen && editingAnnouncement && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm overflow-y-auto">
            <div className="relative z-50 w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 p-6 sm:p-8 text-slate-100 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-white text-base">
                  {editingAnnouncement.id ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
                </h3>
                <button onClick={() => setIsDialogOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-red-950/70 border border-red-800 text-xs text-red-300">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Judul Pengumuman / Berita *</label>
                  <Input
                    placeholder="Contoh: Jadwal Pelaksanaan Seleksi Wawancara SPMB 2026"
                    value={editingAnnouncement.title || ''}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })}
                    className="bg-slate-900 border-slate-800 text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Kategori</label>
                    <select
                      value={editingAnnouncement.category || 'Pengumuman'}
                      onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, category: e.target.value as any })}
                      className="w-full h-10 px-3 text-xs bg-slate-900 border border-slate-800 rounded-md text-white"
                    >
                      <option value="Pengumuman">Pengumuman</option>
                      <option value="Panduan">Panduan</option>
                      <option value="Berita">Berita</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Status Publikasi</label>
                    <select
                      value={editingAnnouncement.status || 'Published'}
                      onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, status: e.target.value as any })}
                      className="w-full h-10 px-3 text-xs bg-slate-900 border border-slate-800 rounded-md text-white"
                    >
                      <option value="Published">Published (Tayang di Web)</option>
                      <option value="Draft">Draft (Disimpan Saja)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Custom Slug URL</label>
                    <Input
                      placeholder="jadwal-seleksi-2026"
                      value={editingAnnouncement.slug || ''}
                      onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, slug: e.target.value })}
                      className="bg-slate-900 border-slate-800 text-white font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">URL Thumbnail Gambar (Opsional)</label>
                  <Input
                    placeholder="https://images.unsplash.com/..."
                    value={editingAnnouncement.thumbnail_url || ''}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, thumbnail_url: e.target.value })}
                    className="bg-slate-900 border-slate-800 text-white text-[11px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Isi Lengkap Konten Pengumuman *</label>
                  <textarea
                    rows={6}
                    placeholder="Tuliskan isi pengumuman atau petunjuk teknis secara lengkap di sini..."
                    value={editingAnnouncement.content || ''}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, content: e.target.value })}
                    className="w-full p-3 bg-slate-900 border border-slate-800 rounded-md text-white text-xs leading-relaxed"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="text-xs bg-slate-900 border-slate-800 text-slate-300"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                  >
                    {saving ? 'Menyimpan...' : 'Simpan Pengumuman'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Dialog>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {itemToDelete && (
        <Dialog open={Boolean(itemToDelete)} onOpenChange={(open) => !open && setItemToDelete(null)}>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <div className="relative z-50 w-full max-w-md rounded-2xl border border-red-900/50 bg-slate-950 p-6 text-slate-100 shadow-2xl space-y-4">
              <h3 className="font-bold text-white text-base">Hapus Pengumuman?</h3>
              <p className="text-xs text-slate-300">
                Anda yakin ingin menghapus artikel <strong>{itemToDelete.title}</strong>?
              </p>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setItemToDelete(null)}
                  className="text-xs bg-slate-900 border-slate-800 text-slate-300"
                >
                  Batal
                </Button>
                <Button
                  size="sm"
                  disabled={deleting}
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
                >
                  {deleting ? 'Menghapus...' : 'Hapus Pengumuman'}
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
