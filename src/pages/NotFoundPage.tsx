import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-3xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shadow-sm">
            <FileQuestion className="h-12 w-12" />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold tracking-widest text-teal-600 uppercase">
            Error 404
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-sm text-slate-600 max-w-sm mx-auto">
            Halaman atau tautan yang Anda cari tidak tersedia, telah dipindahkan, atau alamat URL yang dimasukkan salah.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs h-10 px-5 rounded-xl gap-2 shadow-xs">
              <Home className="h-4 w-4" />
              <span>Kembali ke Beranda</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto text-xs font-semibold h-10 px-4 rounded-xl gap-2 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Halaman Sebelumnya</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
