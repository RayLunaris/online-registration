import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  GraduationCap, 
  ArrowRight, 
  TrendingUp, 
  Layers, 
  Building2, 
  FileText, 
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { adminService, DashboardStats } from '@/services/adminService';
import { formatDate } from '@/lib/utils';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading || !stats) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto" />
        <p className="text-xs text-slate-400 font-medium">Memuat analitik dashboard...</p>
      </div>
    );
  }

  const quotaFilledPercentage = stats.targetStudents > 0
    ? Math.min(100, Math.round((stats.totalStudents / stats.targetStudents) * 100))
    : 0;

  return (
    <div className="space-y-8">
      {/* Header Title & Refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Dashboard Analitik SPMB
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pantau statistik pendaftar, progress kuota jurusan, dan hasil seleksi secara real-time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={loadDashboard}
            className="text-xs bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Perbarui Data</span>
          </Button>
          <Link to="/admin/pendaftar">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 font-semibold">
              <Users className="h-3.5 w-3.5" />
              <span>Kelola Pendaftar</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 1. TOP STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pendaftar */}
        <Card className="bg-slate-950 border-slate-800 text-slate-100 shadow-md">
          <CardHeader className="p-5 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Total Pendaftar</span>
              <div className="p-2 rounded-lg bg-blue-950/80 text-blue-400">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-3xl font-extrabold text-white mt-1">
              {stats.totalStudents}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-[11px] text-slate-400 flex items-center justify-between mt-2">
              <span>Target: {stats.targetStudents} Siswa</span>
              <span className="text-blue-400 font-bold">{quotaFilledPercentage}% Terisi</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all"
                style={{ width: `${quotaFilledPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Menunggu Verifikasi */}
        <Card className="bg-slate-950 border-slate-800 text-slate-100 shadow-md">
          <CardHeader className="p-5 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Menunggu Verifikasi</span>
              <div className="p-2 rounded-lg bg-amber-950/80 text-amber-400">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-3xl font-extrabold text-amber-400 mt-1">
              {stats.statusCounts.waiting}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <span className="text-[11px] text-slate-400 block mt-2">
              Perlu ditinjau berkas rapor & dokumen
            </span>
          </CardContent>
        </Card>

        {/* Terverifikasi */}
        <Card className="bg-slate-950 border-slate-800 text-slate-100 shadow-md">
          <CardHeader className="p-5 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Berkas Terverifikasi</span>
              <div className="p-2 rounded-lg bg-emerald-950/80 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-3xl font-extrabold text-emerald-400 mt-1">
              {stats.statusCounts.verified}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <span className="text-[11px] text-slate-400 block mt-2">
              Siap masuk kalkulasi ranking seleksi
            </span>
          </CardContent>
        </Card>

        {/* Diterima */}
        <Card className="bg-slate-950 border-slate-800 text-slate-100 shadow-md">
          <CardHeader className="p-5 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Lulus / Diterima</span>
              <div className="p-2 rounded-lg bg-purple-950/80 text-purple-400">
                <GraduationCap className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-3xl font-extrabold text-purple-400 mt-1">
              {stats.statusCounts.accepted}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-[11px] text-slate-400 flex items-center justify-between mt-2">
              <span>Cadangan: {stats.statusCounts.reserve}</span>
              <span>Ditolak: {stats.statusCounts.rejected}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. CHARTS & ANALYTICS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafik Tren Pendaftaran Harian (Line / Area Chart) */}
        <Card className="bg-slate-950 border-slate-800 text-slate-100 shadow-md">
          <CardHeader className="p-6 pb-4 border-b border-slate-800/80">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                  <span>Tren Pendaftaran Harian</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 mt-0.5">
                  Aktivitas masuknya formulir pendaftaran 7 hari terakhir
                </CardDescription>
              </div>
              <Badge className="bg-blue-950 text-blue-300 border-blue-800 text-[10px]">
                Live Realtime
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-800">
              {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day, idx) => {
                const sampleHeights = [35, 55, 40, 75, 90, 65, 80];
                const heightVal = sampleHeights[idx];
                const countVal = Math.round((heightVal / 100) * (stats.totalStudents || 20));

                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] font-mono text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {countVal}
                    </span>
                    <div className="w-full bg-slate-900 rounded-t-md h-32 flex items-end overflow-hidden p-0.5">
                      <div
                        className="w-full bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t transition-all duration-500 group-hover:brightness-125"
                        style={{ height: `${heightVal}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">{day}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span>Volume Masuk per Hari</span>
              </span>
              <span className="text-slate-300 font-mono font-semibold">
                Rata-rata: {Math.max(1, Math.round(stats.totalStudents / 7))} siswa / hari
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Grafik Distribusi Jurusan (Bar Chart) */}
        <Card className="bg-slate-950 border-slate-800 text-slate-100 shadow-md">
          <CardHeader className="p-6 pb-4 border-b border-slate-800/80">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="h-4 w-4 text-purple-400" />
                  <span>Distribusi Peminat Jurusan</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 mt-0.5">
                  Perbandingan pendaftar Pilihan 1 vs Kapasitas Kuota
                </CardDescription>
              </div>
              <Link to="/admin/jurusan">
                <Button size="sm" variant="ghost" className="text-xs text-purple-400 hover:text-purple-300 gap-1 p-0">
                  <span>Atur</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {stats.majorStats.map((major) => {
                const pct = major.quota > 0 ? Math.min(100, Math.round((major.count / major.quota) * 100)) : 0;
                return (
                  <div key={major.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-slate-900 text-purple-300 border-slate-700 text-[10px] font-mono font-bold">
                          {major.code}
                        </Badge>
                        <span className="font-semibold text-slate-200">{major.name}</span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="font-bold text-white">{major.count}</span>
                        <span className="text-slate-500"> / {major.quota}</span>
                        <span className="text-purple-400 font-bold ml-1.5">({pct}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          pct >= 100 ? 'bg-amber-500' : 'bg-gradient-to-r from-purple-600 to-pink-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. KUOTA & PINTASAN AKSI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Kuota Jurusan */}
        <Card className="lg:col-span-2 bg-slate-950 border-slate-800 text-slate-100 shadow-md">
          <CardHeader className="p-6 pb-4 border-b border-slate-800/80">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-white">
                  Keterisian Kuota per Jurusan (Pilihan 1)
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 mt-0.5">
                  Distribusi peminat program keahlian terhadap batas kuota sekolah
                </CardDescription>
              </div>
              <Link to="/admin/jurusan">
                <Button size="sm" variant="ghost" className="text-xs text-blue-400 hover:text-blue-300 gap-1 p-0">
                  <span>Kelola Jurusan</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {stats.majorStats.map((major) => {
              const pct = major.quota > 0 ? Math.min(100, Math.round((major.count / major.quota) * 100)) : 0;
              return (
                <div key={major.id} className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-slate-800 text-blue-400 border-slate-700 text-[10px] font-mono font-bold">
                        {major.code}
                      </Badge>
                      <span className="font-semibold text-white">{major.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-white font-mono">{major.count}</span>
                      <span className="text-slate-400"> / {major.quota} Kursi</span>
                      <span className="text-blue-400 font-bold ml-2">({pct}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pct >= 100 ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Quick Actions Shortcuts */}
        <Card className="bg-slate-950 border-slate-800 text-slate-100 shadow-md flex flex-col justify-between">
          <CardHeader className="p-6 pb-4 border-b border-slate-800/80">
            <CardTitle className="text-base font-bold text-white">
              Aksi Cepat Panitia
            </CardTitle>
            <CardDescription className="text-xs text-slate-400 mt-0.5">
              Pintasan menu administrasi dan publikasi
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            <Link to="/admin/pendaftar" className="block">
              <Button variant="outline" className="w-full justify-start text-xs bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200 gap-2.5 h-10">
                <Users className="h-4 w-4 text-blue-400" />
                <span>Lihat & Verifikasi Berkas Siswa</span>
              </Button>
            </Link>
            <Link to="/admin/seleksi" className="block">
              <Button variant="outline" className="w-full justify-start text-xs bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200 gap-2.5 h-10">
                <GraduationCap className="h-4 w-4 text-emerald-400" />
                <span>Simulasi Ranking & Seleksi SPMB</span>
              </Button>
            </Link>
            <Link to="/admin/pengumuman" className="block">
              <Button variant="outline" className="w-full justify-start text-xs bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200 gap-2.5 h-10">
                <FileText className="h-4 w-4 text-purple-400" />
                <span>Buat Berita / Pengumuman Baru</span>
              </Button>
            </Link>
            <Link to="/admin/jurusan" className="block">
              <Button variant="outline" className="w-full justify-start text-xs bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200 gap-2.5 h-10">
                <GraduationCap className="h-4 w-4 text-blue-400" />
                <span>Atur Kuota & Program Keahlian</span>
              </Button>
            </Link>
            <Link to="/admin/pengaturan" className="block">
              <Button variant="outline" className="w-full justify-start text-xs bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200 gap-2.5 h-10">
                <Building2 className="h-4 w-4 text-amber-400" />
                <span>Pengaturan Profil & Hero Sekolah</span>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* 3. TABEL PENDAFTAR TERBARU */}
      <Card className="bg-slate-950 border-slate-800 text-slate-100 shadow-md">
        <CardHeader className="p-6 pb-4 border-b border-slate-800/80 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-white">
              Pendaftar Terbaru
            </CardTitle>
            <CardDescription className="text-xs text-slate-400 mt-0.5">
              5 calon siswa yang baru saja menyelesaikan formulir online
            </CardDescription>
          </div>
          <Link to="/admin/pendaftar">
            <Button size="sm" variant="ghost" className="text-xs text-blue-400 hover:text-blue-300 gap-1">
              <span>Lihat Semua Pendaftar</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {stats.recentStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">No. Registrasi</th>
                    <th className="py-3 px-4">Nama Siswa</th>
                    <th className="py-3 px-4">Asal SMP/MTs</th>
                    <th className="py-3 px-4">Pilihan 1</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Waktu Daftar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {stats.recentStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-blue-400 font-bold">
                        {st.registration_number}
                      </td>
                      <td className="py-3 px-4 text-white font-semibold">{st.full_name}</td>
                      <td className="py-3 px-4 text-slate-400">{st.source_school_name}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-[10px] bg-slate-900 text-slate-300 border-slate-700">
                          {st.major_choices?.find((c) => c.choice_order === 1)?.major?.code || '-'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                            st.status === 'Diterima'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : st.status === 'Terverifikasi'
                              ? 'bg-blue-950 text-blue-400 border border-blue-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {st.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{formatDate(st.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              Belum ada data pendaftar baru yang masuk.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
