import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ArrowLeft, ShieldCheck, Info, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { DEFAULT_SCHOOL } from '@/services/schoolService';
import { useSchool } from '@/context/SchoolContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { school = DEFAULT_SCHOOL } = useSchool();
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { user, isAdmin, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const configured = isSupabaseConfigured();

  const from = (location.state as any)?.from?.pathname || '/admin';

  useEffect(() => {
    if (user && isAdmin) {
      navigate(from, { replace: true });
    }
  }, [user, isAdmin, navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Harap masukkan email dan password admin.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Login gagal. Periksa kembali email dan password.');
    } else {
      navigate(from, { replace: true });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetLoading(true);
    setResetMsg(null);

    if (!configured) {
      setTimeout(() => {
        setResetLoading(false);
        setResetMsg({
          type: 'success',
          text: `[Mode Demo] Tautan reset kata sandi simulasi berhasil dikirim ke ${resetEmail}.`,
        });
      }, 500);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/admin/login`,
      });
      setResetLoading(false);
      if (error) throw error;
      setResetMsg({
        type: 'success',
        text: `Tautan reset kata sandi telah dikirim ke ${resetEmail}. Silakan periksa inbox email Anda.`,
      });
    } catch (err: any) {
      setResetLoading(false);
      setResetMsg({
        type: 'error',
        text: err.message || 'Gagal mengirim email reset kata sandi.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/80 dark:bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-4">
          <Link to="/" className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white gap-1.5 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Halaman Utama
          </Link>
        </div>

        <div className="flex items-center justify-center gap-3.5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl shadow-slate-200/50 dark:shadow-black/40 p-1.5 overflow-hidden border border-slate-200 dark:border-slate-700/80">
            <img 
              src={school?.logo_url || "/images/logo-icon.png"} 
              alt="Logo SPMB" 
              className="h-full w-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/logo-icon.png';
              }}
            />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">SPMB Admin</h1>
            <p className="text-xs text-teal-600 dark:text-teal-400 font-mono font-medium">{school?.name || 'SMK Negeri 1 Digital Teknologi'}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 shadow-xl shadow-slate-200/60 dark:shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              <span>Portal Akses Terbatas</span>
            </div>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
              Masuk Panitia & Admin
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Gunakan akun terdaftar di Supabase Auth untuk mengelola data SPMB.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {!configured && (
              <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60 text-xs text-teal-800 dark:text-teal-300 flex items-start gap-2">
                <Info className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <span><strong>Mode Demo:</strong> Anda dapat memasukkan sembarang email & password untuk masuk ke mode simulasi admin.</span>
              </div>
            )}

            {errorMsg && (
              <Alert variant="destructive" className="bg-red-50 dark:bg-red-950/80 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertTitle>Gagal Masuk</AlertTitle>
                <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="admin-email" className="text-xs font-medium text-slate-700 dark:text-slate-300">Email Admin</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <Input
                    id="admin-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@smkn1digital.sch.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus-visible:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="admin-password" className="text-xs font-medium text-slate-700 dark:text-slate-300">Kata Sandi</label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email || '');
                      setResetMsg(null);
                      setShowResetModal(true);
                    }}
                    className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium"
                  >
                    Lupa kata sandi?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <Input
                    id="admin-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus-visible:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium h-10 shadow-md shadow-teal-600/20"
              >
                {loading ? 'Memproses Masuk...' : 'Masuk ke Dashboard'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Reset Password */}
      <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
        <DialogHeader>
          <DialogTitle>Reset Kata Sandi Admin</DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            Masukkan alamat email admin terdaftar. Tautan untuk menyetel ulang kata sandi akan dikirimkan ke email Anda.
          </DialogDescription>
        </DialogHeader>

        {resetMsg && (
          <Alert
            variant={resetMsg.type === 'error' ? 'destructive' : 'default'}
            className={`mb-4 text-xs ${
              resetMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
                : 'bg-red-50 text-red-900 dark:bg-red-950/80 dark:text-red-200 border-red-200 dark:border-red-800'
            }`}
          >
            {resetMsg.type === 'success' ? (
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
            )}
            <AlertTitle>{resetMsg.type === 'success' ? 'Email Terkirim' : 'Gagal'}</AlertTitle>
            <AlertDescription className="text-xs">{resetMsg.text}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="reset-email" className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Email Admin
            </label>
            <Input
              id="reset-email"
              type="email"
              required
              placeholder="admin@smkn1digital.sch.id"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowResetModal(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={resetLoading}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {resetLoading ? 'Mengirim...' : 'Kirim Tautan Reset'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
