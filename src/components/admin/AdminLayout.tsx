import React, { useState } from 'react';
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
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, adminProfile, signOut } = useAuth();

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

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      {/* 1. SIDEBAR (DESKTOP) */}
      <aside className="hidden md:flex md:w-64 flex-col justify-between bg-slate-950 border-r border-slate-800 p-5 shrink-0">
        <div className="space-y-6">
          {/* Logo & Brand */}
          <Link to="/admin" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/30">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight block leading-tight">
                SPMB Panel
              </span>
              <span className="text-[11px] text-blue-400 font-medium block">
                SMK Negeri 1 Digital
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
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
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ItemIcon className={`h-4 w-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {active && <ChevronRight className="h-3.5 w-3.5 opacity-70" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: User info & Logout */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          {/* Public Link */}
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Lihat Web Publik</span>
            </div>
            <span className="text-[10px] text-slate-600">Tab Baru</span>
          </Link>

          {/* User Profile */}
          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-8 w-8 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">
                <UserIcon className="h-4 w-4" />
              </div>
              <div className="truncate">
                <span className="text-xs font-bold text-white block truncate">
                  {adminProfile?.full_name || user?.email?.split('@')[0] || 'Admin'}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
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
            className="w-full justify-start text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 gap-2 h-9"
          >
            <LogOut className="h-4 w-4" />
            <span>Keluar Sesi</span>
          </Button>
        </div>
      </aside>

      {/* 2. MOBILE HEADER & NAVIGATION */}
      <div className="md:hidden bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-bold text-white text-sm">SPMB Admin</span>
        </Link>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 p-4 space-y-3">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium ${
                  isActive(item.path) ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-900'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <Link to="/" className="text-xs text-blue-400">Web Publik</Link>
            <button onClick={handleLogout} className="text-xs text-red-400">Keluar</button>
          </div>
        </div>
      )}

      {/* 3. MAIN CONTENT CONTAINER */}
      <main className="flex-1 bg-slate-900 overflow-y-auto p-4 sm:p-8 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
