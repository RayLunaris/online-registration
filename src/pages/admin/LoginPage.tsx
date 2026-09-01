import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { isSupabaseConfigured } from '@/lib/supabase';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const configured = isSupabaseConfigured();

  const from = (location.state as any)?.from?.pathname || '/admin';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

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
            <img src="/images/logo-icon.png" alt="Logo SPMB" className="h-full w-full object-contain" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">SPMB Admin</h1>
            <p className="text-xs text-teal-600 dark:text-teal-400 font-mono font-medium">SMK Negeri 1 Digital Teknologi</p>
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
              <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60 text-xs text-teal-800 dark:text-teal-300">
                💡 <strong>Mode Demo:</strong> Anda dapat memasukkan sembarang email & password untuk masuk ke mode simulasi admin.
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
    </div>
  );
};
