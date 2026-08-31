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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent mx-auto" />
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Memuat analitik dashboard...</p>
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Dashboard Analitik SPMB
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pantau statistik pendaftar, progress kuota jurusan, dan hasil seleksi secara real-time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={loadDashboard}
            className="text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 gap-1.5 shadow-2xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Perbarui Data</span>
          </Button>
          <Link to="/admin/pendaftar">
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs gap-1.5 font-semibold shadow-xs">
              <Users className="h-3.5 w-3.5" />
              <span>Kelola Pendaftar</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 1. TOP STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pendaftar */}
        <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs">
          <CardHeader className="p-5 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Pendaftar</span>
              <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-400">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {stats.totalStudents}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between mt-2">
              <span>Target: {stats.targetStudents} Siswa</span>
              <span className="text-teal-600 dark:text-teal-400 font-bold">{quotaFilledPercentage}% Terisi</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-teal-500 h-full rounded-full transition-all"
                style={{ width: `${quotaFilledPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Menunggu Verifikasi */}
        <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs">
          <CardHeader className="p-5 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Menunggu Verifikasi</span>
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
              {stats.statusCounts.waiting}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-2">
              Perlu ditinjau berkas rapor & dokumen
            </span>
          </CardContent>
        </Card>

        {/* Terverifikasi */}
        <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs">
          <CardHeader className="p-5 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Berkas Terverifikasi</span>
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.statusCounts.verified}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-2">
              Siap masuk kalkulasi ranking seleksi
            </span>
          </CardContent>
        </Card>

        {/* Diterima */}
        <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs">
          <CardHeader className="p-5 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Lulus / Diterima</span>
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400">
                <GraduationCap className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
              {stats.statusCounts.accepted}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between mt-2">
              <span>Cadangan: {stats.statusCounts.reserve}</span>
              <span>Ditolak: {stats.statusCounts.rejected}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. CHARTS & ANALYTICS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafik Tren Pendaftaran Harian (Line / Area Chart) */}
        <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs">
          <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span>Tren Pendaftaran Harian</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Aktivitas masuknya formulir pendaftaran 7 hari terakhir
                </CardDescription>
              </div>
              <Badge className="bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800 text-[10px]">
                Live Realtime
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-48 flex items-end justify-between gap-2 sm:gap-3 pt-6 pb-2 px-1 sm:px-2 border-b border-slate-100 dark:border-slate-800">
              {stats.dailyTrend && stats.dailyTrend.length > 0 ? (
                (() => {
                  const maxCount = Math.max(...stats.dailyTrend.map((d) => d.count), 1);
                  return stats.dailyTrend.map((item) => {
                    const heightPct = item.count === 0 ? 4 : Math.max(16, Math.round((item.count / maxCount) * 100));

                    return (
                      <div key={item.date} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                        {/* Tooltip on Hover */}
                        <div className="absolute -top-10 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 bg-slate-900 dark:bg-slate-800 text-white text-[10px] py-1 px-2.5 rounded-md shadow-lg whitespace-nowrap">
                          <span className="font-bold">{item.fullDayName}, {item.formattedDate}</span>: {item.count} siswa
                          <div className="w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45 mx-auto -mb-1 mt-0.5" />
                        </div>

                        {/* Real Count display above the bar */}
                        <span
                          className={`text-[11px] font-mono font-bold transition-all ${
                            item.count > 0
                              ? 'text-teal-600 dark:text-teal-400'
                              : 'text-slate-400 dark:text-slate-600'
                          }`}
                        >
                          {item.count}
                        </span>

                        {/* Bar visual */}
                        <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-t-md h-28 flex items-end overflow-hidden p-0.5">
                          <div
                            className={`w-full rounded-t transition-all duration-500 ${
                              item.count > 0
                                ? item.isToday
                                  ? 'bg-gradient-to-t from-teal-600 via-teal-500 to-emerald-400 shadow-xs brightness-105'
                                  : 'bg-gradient-to-t from-teal-600 to-teal-400 group-hover:brightness-110'
                                : 'bg-slate-200 dark:bg-slate-800/80'
                            }`}
                            style={{ height: `${heightPct}%` }}
                          />
                        </div>

                        {/* Day label and date */}
                        <div className="flex flex-col items-center">
                          <span
                            className={`text-[11px] font-semibold ${
                              item.isToday
                                ? 'text-teal-600 dark:text-teal-400 font-bold'
                                : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {item.dayName}
                          </span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">
                            {item.formattedDate}
                          </span>
                        </div>
                      </div>
                    );
                  });
                })()
              ) : (
                <div className="w-full py-8 text-center text-xs text-slate-400">
                  Tidak ada data pendaftaran harian.
                </div>
              )}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-3">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-teal-500" />
                <span>
                  Total 7 Hari: <strong className="text-slate-800 dark:text-slate-200 font-mono">{(stats.dailyTrend || []).reduce((sum, d) => sum + d.count, 0)}</strong> formulir masuk
                </span>
              </span>
              <span className="text-slate-700 dark:text-slate-300 font-mono font-semibold">
                Rata-rata: {((stats.dailyTrend || []).reduce((sum, d) => sum + d.count, 0) / 7).toFixed(1)} siswa / hari
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Grafik Distribusi Jurusan (Bar Chart) */}
        <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs">
          <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span>Distribusi Peminat Jurusan</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Perbandingan pendaftar terhadap kapasitas kuota
                </CardDescription>
              </div>
              <Link to="/admin/jurusan">
                <Button size="sm" variant="ghost" className="text-xs text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 gap-1 p-0">
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
                <div key={major.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-teal-300 dark:border-slate-700 text-[10px] font-mono font-bold">
                        {major.code}
                      </Badge>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{major.name}</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-slate-900 dark:text-white">{major.count}</span>
                      <span className="text-slate-400 dark:text-slate-500"> / {major.quota}</span>
                      <span className="text-teal-600 dark:text-teal-400 font-bold ml-1.5">({pct}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct >= 100 ? 'bg-amber-500' : 'bg-teal-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* 3. KUOTA & PINTASAN AKSI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Kuota Jurusan */}
        <Card className="lg:col-span-2 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs">
          <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Keterisian Kuota per Jurusan (Pilihan 1)
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Distribusi peminat program keahlian terhadap batas kuota sekolah
                </CardDescription>
              </div>
              <Link to="/admin/jurusan">
                <Button size="sm" variant="ghost" className="text-xs text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 gap-1 p-0">
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
                <div key={major.id} className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 border-slate-200 dark:border-slate-700 text-[10px] font-mono font-bold">
                        {major.code}
                      </Badge>
                      <span className="font-semibold text-slate-900 dark:text-white">{major.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{major.count}</span>
                      <span className="text-slate-500 dark:text-slate-400"> / {major.quota} Kursi</span>
                      <span className="text-teal-600 dark:text-teal-400 font-bold ml-2">({pct}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pct >= 100 ? 'bg-amber-500' : 'bg-teal-500'
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
        <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs flex flex-col justify-between">
          <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              Aksi Cepat Panitia
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pintasan menu administrasi dan publikasi
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            <Link to="/admin/pendaftar" className="block">
              <Button variant="outline" className="w-full justify-start text-xs bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 gap-2.5 h-10 shadow-2xs">
                <Users className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span>Lihat & Verifikasi Berkas Siswa</span>
              </Button>
            </Link>
            <Link to="/admin/seleksi" className="block">
              <Button variant="outline" className="w-full justify-start text-xs bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 gap-2.5 h-10 shadow-2xs">
                <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Simulasi Ranking & Seleksi SPMB</span>
              </Button>
            </Link>
            <Link to="/admin/pengumuman" className="block">
              <Button variant="outline" className="w-full justify-start text-xs bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 gap-2.5 h-10 shadow-2xs">
                <FileText className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span>Buat Berita / Pengumuman Baru</span>
              </Button>
            </Link>
            <Link to="/admin/jurusan" className="block">
              <Button variant="outline" className="w-full justify-start text-xs bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 gap-2.5 h-10 shadow-2xs">
                <GraduationCap className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span>Atur Kuota & Program Keahlian</span>
              </Button>
            </Link>
            <Link to="/admin/pengaturan" className="block">
              <Button variant="outline" className="w-full justify-start text-xs bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 gap-2.5 h-10 shadow-2xs">
                <Building2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>Pengaturan Profil & Hero Sekolah</span>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* 4. TABEL PENDAFTAR TERBARU */}
      <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs">
        <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              Pendaftar Terbaru
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              5 calon siswa yang baru saja menyelesaikan formulir online
            </CardDescription>
          </div>
          <Link to="/admin/pendaftar">
            <Button size="sm" variant="ghost" className="text-xs text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 gap-1">
              <span>Lihat Semua Pendaftar</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {stats.recentStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">No. Registrasi</th>
                    <th className="py-3 px-4">Nama Siswa</th>
                    <th className="py-3 px-4">Asal SMP/MTs</th>
                    <th className="py-3 px-4">Pilihan 1</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Waktu Daftar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {stats.recentStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-teal-600 dark:text-teal-400 font-bold">
                        {st.registration_number}
                      </td>
                      <td className="py-3 px-4 text-slate-900 dark:text-white font-semibold">{st.full_name}</td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{st.source_school_name}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700">
                          {st.major_choices?.find((c) => c.choice_order === 1)?.major?.code || '-'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                            st.status === 'Diterima'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
                              : st.status === 'Terverifikasi'
                              ? 'bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950 dark:text-teal-400 dark:border-teal-800'
                              : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800'
                          }`}
                        >
                          {st.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 dark:text-slate-500">{formatDate(st.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
              Belum ada data pendaftar baru yang masuk.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
