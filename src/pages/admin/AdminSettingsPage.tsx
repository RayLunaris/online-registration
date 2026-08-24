import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Sparkles 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { adminService } from '@/services/adminService';
import { School } from '@/types/spmb';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Partial<School>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await adminService.getSchoolSettings();
      setSettings(data);
    } catch (err) {
      console.error('Error loading school settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await adminService.updateSchoolSettings(settings);
      if (res.success) {
        setSuccessMsg('Pengaturan profil sekolah dan konfigurasi SPMB berhasil diperbarui!');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(res.error || 'Gagal menyimpan pengaturan sekolah.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center space-y-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mx-auto" />
        <p className="text-xs text-slate-500">Memuat pengaturan sekolah...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Pengaturan & Konfigurasi Sekolah
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Atur identitas resmi sekolah, tahun pelajaran aktif, kontak sekretariat, dan teks landing page.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={loadSettings}
          className="text-xs bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Reset</span>
        </Button>
      </div>

      {successMsg && (
        <Alert className="bg-emerald-950/80 border-emerald-800 text-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <AlertTitle>Berhasil Disimpan</AlertTitle>
          <AlertDescription className="text-xs">{successMsg}</AlertDescription>
        </Alert>
      )}

      {errorMsg && (
        <Alert variant="destructive" className="bg-red-950/80 border-red-800 text-red-200">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertTitle>Gagal Menyimpan</AlertTitle>
          <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* SETTINGS FORM */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Identitas Resmi Sekolah */}
        <Card className="bg-slate-950 border-slate-800 text-slate-100 shadow-md">
          <CardHeader className="p-5 pb-3 border-b border-slate-800/80">
            <CardTitle className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-400" />
              Identitas Resmi Sekolah
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Data ini akan dicetak pada Kartu Pendaftaran PDF dan header web
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-slate-300 font-semibold">Nama Resmi Sekolah *</label>
                <Input
                  value={settings.name || ''}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  className="bg-slate-900 border-slate-800 text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">NPSN Sekolah *</label>
                <Input
                  value={settings.npsn || ''}
                  onChange={(e) => setSettings({ ...settings, npsn: e.target.value })}
                  className="bg-slate-900 border-slate-800 text-white font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Tahun Pelajaran SPMB Aktif *</label>
                <Input
                  value={settings.academic_year || '2026/2027'}
                  onChange={(e) => setSettings({ ...settings, academic_year: e.target.value })}
                  className="bg-slate-900 border-slate-800 text-white font-mono"
                  placeholder="2026/2027"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Target Total Kuota Siswa Baru</label>
                <Input
                  type="number"
                  value={settings.target_students || 400}
                  onChange={(e) => setSettings({ ...settings, target_students: Number(e.target.value) })}
                  className="bg-slate-900 border-slate-800 text-white font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Alamat Lengkap Sekolah *</label>
              <textarea
                rows={2}
                value={settings.address || ''}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-md text-white text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">No. Telepon / Hotline Panitia</label>
                <Input
                  value={settings.phone || ''}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="bg-slate-900 border-slate-800 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Alamat Email Resmi Sekolah</label>
                <Input
                  type="email"
                  value={settings.email || ''}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="bg-slate-900 border-slate-800 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Hero & Tampilan Publik Landing Page */}
        <Card className="bg-slate-950 border-slate-800 text-slate-100 shadow-md">
          <CardHeader className="p-5 pb-3 border-b border-slate-800/80">
            <CardTitle className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              Teks & Banner Landing Page Publik
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Kustomisasi slogan dan narasi promosi yang tampil di halaman beranda
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Tagline Utama Hero Banner</label>
              <Input
                value={settings.hero_tagline || ''}
                onChange={(e) => setSettings({ ...settings, hero_tagline: e.target.value })}
                className="bg-slate-900 border-slate-800 text-white"
                placeholder="Membangun Generasi Vokasi Berkarakter, Cerdas, dan Siap Kerja Global"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Deskripsi Singkat Hero</label>
              <textarea
                rows={2}
                value={settings.hero_description || ''}
                onChange={(e) => setSettings({ ...settings, hero_description: e.target.value })}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-md text-white text-xs"
                placeholder="Penerimaan Peserta Didik Baru (PPDB/SPMB) Tahun Pelajaran 2026/2027 telah dibuka secara daring."
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-8 h-10 gap-2 shadow-md shadow-blue-600/30"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Menyimpan Perubahan...' : 'Simpan Seluruh Pengaturan'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
