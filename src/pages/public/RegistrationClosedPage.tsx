import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Home, Search, HelpCircle, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { School } from '@/types/spmb';

interface RegistrationClosedPageProps {
  school: School | null;
}

export const RegistrationClosedPage: React.FC<RegistrationClosedPageProps> = ({ school }) => {
  const academicYear = school?.academic_year || '2026/2027';

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="w-full max-w-xl text-center">
        <Card className="border border-slate-200/90 shadow-sm bg-white overflow-hidden rounded-2xl">
          <div className="h-2 bg-gradient-to-r from-red-500 via-rose-500 to-amber-500" />
          
          <CardContent className="p-8 sm:p-10 space-y-6">
            {/* Big Lock Icon */}
            <div className="mx-auto w-20 h-20 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shadow-inner">
              <Lock className="h-10 w-10 text-red-600" />
            </div>

            {/* Title & Description */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-red-50 text-red-700 border border-red-200">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                <span>Penerimaan Ditutup</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Pendaftaran Telah Ditutup
              </h1>
              
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-md mx-auto">
                Pendaftaran SPMB {academicYear} sudah tidak menerima peserta baru saat ini. Terima kasih atas minat Anda.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link to="/" className="w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto h-11 px-6 border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl gap-2 shadow-2xs"
                >
                  <Home className="h-4 w-4" />
                  <span>Kembali ke Beranda</span>
                </Button>
              </Link>

              <Link to="/cek-status" className="w-full sm:w-auto">
                <Button 
                  className="w-full sm:w-auto h-11 px-6 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm rounded-xl gap-2 shadow-xs"
                >
                  <Search className="h-4 w-4" />
                  <span>Cek Status Pendaftaran</span>
                </Button>
              </Link>
            </div>

            {/* Contact Help Desk Info */}
            <div className="pt-6 border-t border-slate-100 text-xs text-slate-500 space-y-2">
              <p className="font-medium text-slate-700 flex items-center justify-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
                <span>Butuh bantuan atau informasi jadwal seleksi lanjutan?</span>
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500">
                {school?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3 text-teal-600" />
                    <span>{school.phone}</span>
                  </span>
                )}
                {school?.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3 text-teal-600" />
                    <span>{school.email}</span>
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
