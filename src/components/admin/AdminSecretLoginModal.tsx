import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ShieldCheck, ExternalLink, ArrowRight } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { ADMIN_AUTH_CONFIG } from '@/config/authConfig';
import { isSupabaseConfigured } from '@/lib/supabase';

interface AdminSecretLoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdminSecretLoginModal: React.FC<AdminSecretLoginModalProps> = ({
  open,
  onOpenChange,
}) => {
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
      setErrorMsg(error.message || 'Login gagal. Periksa kembali kredensial admin Anda.');
    } else {
      onOpenChange(false);
      navigate('/admin');
    }
  };

  const handleGoToFullPage = () => {
    onOpenChange(false);
    navigate(ADMIN_AUTH_CONFIG.getLoginPath());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="text-slate-900">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-teal-600" />
            <span>Portal Akses Internal</span>
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Masuk Panitia SPMB
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Portal ini hanya diperuntukkan bagi panitia dan administrator sekolah.
          </DialogDescription>
        </DialogHeader>

        {!configured && (
          <div className="mb-4 p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-800">
            💡 <strong>Mode Demo:</strong> Masukkan sembarang email & password untuk masuk mode simulasi.
          </div>
        )}

        {errorMsg && (
          <Alert variant="destructive" className="mb-4 py-2 bg-red-50 border-red-200 text-red-800">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-xs font-semibold">Gagal Masuk</AlertTitle>
            <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleLogin} className="space-y-3.5">
          <div className="space-y-1">
            <label htmlFor="admin-secret-email" className="text-xs font-semibold text-slate-700 cursor-pointer">Email Panitia</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="admin-secret-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="panitia@smkn1digital.sch.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 text-xs h-9"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="admin-secret-password" className="text-xs font-semibold text-slate-700 cursor-pointer">Kata Sandi</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="admin-secret-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 text-xs h-9"
                required
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold h-9 rounded-lg gap-1.5"
            >
              <span>{loading ? 'Memverifikasi Sesi...' : 'Masuk ke Dashboard'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>

            <button
              type="button"
              onClick={handleGoToFullPage}
              className="inline-flex items-center justify-center gap-1.5 text-[11px] text-slate-500 hover:text-teal-700 font-medium py-1 transition-colors"
            >
              <span>Buka Halaman Login Penuh</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
};
