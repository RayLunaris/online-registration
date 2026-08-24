import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Lock, Mail, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
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
  
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const configured = isSupabaseConfigured();

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
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-4">
          <Link to="/" className="inline-flex items-center text-xs font-medium text-slate-400 hover:text-white gap-1.5 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Halaman Utama
          </Link>
        </div>

        <div className="flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-500/20">
            <GraduationCap className="h-7 w-7" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-black tracking-tight text-white">SPMB Admin</h1>
            <p className="text-xs text-teal-400 font-mono">SMK Negeri 1 Digital Teknologi</p>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="border-slate-800 bg-slate-950 text-slate-100 shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              <span>Portal Akses Terbatas</span>
            </div>
            <CardTitle className="text-xl font-bold text-white">
              Masuk Panitia & Admin
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Gunakan akun terdaftar di Supabase Auth untuk mengelola data SPMB.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {!configured && (
              <div className="p-3 rounded-lg bg-teal-950/60 border border-teal-800/60 text-xs text-teal-300">
                💡 <strong>Mode Demo:</strong> Anda dapat memasukkan sembarang email & password untuk masuk ke mode simulasi admin.
              </div>
            )}

            {errorMsg && (
              <Alert variant="destructive" className="bg-red-950/80 border-red-800 text-red-200">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertTitle>Gagal Masuk</AlertTitle>
                <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Email Admin</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    type="email"
                    placeholder="admin@smkn1digital.sch.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 bg-slate-900 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">Kata Sandi</label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 bg-slate-900 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-teal-500"
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
