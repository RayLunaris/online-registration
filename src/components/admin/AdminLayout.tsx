import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  School as SchoolIcon, 
  Bell, 
  Settings, 
  LogOut, 
  ExternalLink, 
  Menu, 
  X, 
  User as UserIcon,
  ChevronRight,
  Award,
  Sun,
  Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, adminProfile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { name: 'Dashboard Analitik', path: '/admin', icon: LayoutDashboard },
    { name: 'Data Pendaftar', path: '/admin/pendaftar', icon: Users },
    { name: 'Seleksi & Scoring', path: '/admin/seleksi', icon: Award },
    { name: 'Master Jurusan', path: '/admin/jurusan', icon: GraduationCap },
    { name: 'Asal Sekolah', path: '/admin/sekolah-asal', icon: SchoolIcon },
    { name: 'Pengumuman & Berita', path: '/admin/pengumuman', icon: Bell },
    { name: 'Pengaturan Sekolah', path: '/admin/pengaturan', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  // Find active nav item for breadcrumb title
  const currentNav = navItems.find((item) => isActive(item.path)) || { name: 'Admin Panel' };

  // Close mobile drawer on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="h-screen w-full bg-slate-100/70 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex overflow-hidden">
      {/* 1. FIXED SIDEBAR (DESKTOP) */}
      <aside className="hidden md:flex md:w-64 md:h-screen flex-col justify-between bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shrink-0 select-none z-30 transition-colors duration-200">
        {/* Top Scrollable Navigation */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-5 space-y-6">
          {/* Logo & Brand */}
          <Link to="/admin" className="flex items-center gap-3 group shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-xs p-1 overflow-hidden border border-slate-200 dark:border-slate-700/60 shrink-0">
              <img src="/images/logo-icon.png" alt="Logo SPMB" className="h-full w-full object-contain" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight block leading-tight">
                SPMB Panel
              </span>
              <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium block">
                SMK Negeri 1 Digital
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Menu Utama
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.path);
                const ItemIcon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      active
                        ? 'bg-teal-600 text-white shadow-md shadow-teal-600/25'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ItemIcon className={`h-4 w-4 ${active ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span>{item.name}</span>
                    </div>
                    {active && <ChevronRight className="h-3.5 w-3.5 opacity-70" />}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Fixed Sidebar Footer: User info & Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0 space-y-2.5 bg-slate-50/70 dark:bg-slate-950/90">
          {/* Public Link */}
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900 transition-colors border border-slate-200 dark:border-slate-800/60"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <span>Lihat Web Publik</span>
            </div>
            <span className="text-[10px] text-slate-400">Tab Baru</span>
          </Link>

          {/* User Profile */}
          <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800/80 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-8 w-8 rounded-lg bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold text-xs shrink-0">
                <UserIcon className="h-4 w-4" />
              </div>
              <div className="truncate">
                <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                  {adminProfile?.full_name || user?.email?.split('@')[0] || 'Admin'}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                  {user?.email || 'admin@smkdigital.sch.id'}
                </span>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/40 gap-2 h-8.5"
          >
            <LogOut className="h-4 w-4" />
            <span>Keluar Sesi</span>
          </Button>
        </div>
      </aside>

      {/* 2. MAIN VIEWPORT (Top Header Navbar + Scrollable Content) */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Top Header Navbar */}
        <header className="h-16 shrink-0 bg-white/85 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between z-20 transition-colors duration-200">
          {/* Left: Mobile Drawer Trigger & Desktop Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:text-slate-400 dark:hover:text-white dark:bg-slate-900 dark:border-slate-800 transition-colors"
              aria-label="Buka Menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Mobile Brand Logo */}
            <div className="flex items-center gap-2 md:hidden">
              <div className="h-7 w-7 rounded-lg bg-white p-0.5 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center shrink-0">
                <img src="/images/logo-icon.png" alt="Logo SPMB" className="h-full w-full object-contain" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">SPMB Admin</span>
            </div>

            {/* Desktop Breadcrumb */}
            <div className="hidden md:flex items-center gap-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">SPMB Admin</span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="text-teal-600 dark:text-teal-400 font-semibold">{currentNav.name}</span>
            </div>
          </div>

          {/* Right: Status Pill, Theme Toggle, & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* System Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600 dark:bg-teal-500"></span>
              </span>
              <span>T.A 2026/2027</span>
            </div>

            {/* Theme Toggle Button (Light/Dark Mode) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-800 dark:text-slate-300 transition-all cursor-pointer shadow-2xs"
              title={theme === 'dark' ? 'Ganti ke Mode Terang (Default)' : 'Ganti ke Mode Gelap'}
              aria-label="Ganti Tema"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4 text-amber-400 animate-in spin-in-180 duration-200" />
                  <span className="hidden sm:inline text-[11px] font-semibold">Mode Terang</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-slate-700 animate-in spin-in-180 duration-200" />
                  <span className="hidden sm:inline text-[11px] font-semibold">Mode Gelap</span>
                </>
              )}
            </button>

            {/* Public Website Button */}
            <Link
              to="/"
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 dark:text-slate-300 dark:hover:text-white dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-800 transition-colors shadow-2xs"
            >
              <ExternalLink className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <span className="hidden sm:inline">Web Publik</span>
            </Link>
          </div>
        </header>

        {/* 3. INDEPENDENT SCROLLABLE CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-100/60 dark:bg-slate-900/90 transition-colors duration-200">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* 4. MOBILE DRAWER WITH BACKDROP OVERLAY */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-150">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Slide-over Drawer */}
          <div className="relative w-72 max-w-[80vw] bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between p-5 z-10 shadow-2xl h-full animate-in slide-in-from-left duration-200">
            {/* Drawer Header & Navigation */}
            <div className="space-y-6 flex-1 overflow-y-auto min-h-0">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-white p-0.5 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center shrink-0">
                    <img src="/images/logo-icon.png" alt="Logo SPMB" className="h-full w-full object-contain" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-sm block leading-tight">SPMB Panel</span>
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">SMK Negeri 1 Digital</span>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  aria-label="Tutup Menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const active = isActive(item.path);
                  const ItemIcon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        active
                          ? 'bg-teal-600 text-white shadow-md shadow-teal-600/25'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <ItemIcon className={`h-4 w-4 ${active ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                        <span>{item.name}</span>
                      </div>
                      {active && <ChevronRight className="h-3.5 w-3.5 opacity-70" />}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 shrink-0 space-y-2.5 bg-white dark:bg-slate-950">
              {/* Theme toggle inside mobile drawer */}
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
              >
                <div className="flex items-center gap-2">
                  {theme === 'dark' ? (
                    <Sun className="h-4 w-4 text-amber-400" />
                  ) : (
                    <Moon className="h-4 w-4 text-slate-700" />
                  )}
                  <span>Tema Tampilan</span>
                </div>
                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400">
                  {theme === 'dark' ? 'Gelap' : 'Terang'}
                </span>
              </button>

              <Link
                to="/"
                target="_blank"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800/60"
              >
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Lihat Web Publik</span>
                </div>
                <span className="text-[10px] text-slate-400">Tab Baru</span>
              </Link>

              <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="h-7 w-7 rounded-lg bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold text-xs shrink-0">
                    <UserIcon className="h-3.5 w-3.5" />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                      {adminProfile?.full_name || user?.email?.split('@')[0] || 'Admin'}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                      {user?.email || 'admin@smkdigital.sch.id'}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/40 gap-2 h-9"
              >
                <LogOut className="h-4 w-4" />
                <span>Keluar Sesi</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
