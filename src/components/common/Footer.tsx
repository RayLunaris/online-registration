import React from 'react';
import { GraduationCap, MapPin, Phone, Mail, Award, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: School Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg leading-none">SMK Digital</h3>
                <span className="text-xs text-blue-400">NPSN: 20109988</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Mewujudkan generasi vokasi berdaya saing global, terampil, dan siap diserap oleh industri teknologi modern.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 rounded-lg p-2.5">
              <Award className="h-4 w-4 shrink-0" />
              <span>Terakreditasi A (Unggul) BAN-S/M</span>
            </div>
          </div>

          {/* Col 2: Program Keahlian */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Jurusan Unggulan</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-blue-400" />
                <span>Rekayasa Perangkat Lunak (RPL)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-blue-400" />
                <span>Teknik Komputer & Jaringan (TKJ)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-blue-400" />
                <span>Desain Komunikasi Visual (DKV)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-blue-400" />
                <span>Akuntansi & Keuangan Lembaga (AKL)</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Navigasi Cepat */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Tautan Penting</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/daftar" className="hover:text-white transition-colors">
                  Formulir Pendaftaran Online
                </Link>
              </li>
              <li>
                <Link to="/cek-status" className="hover:text-white transition-colors">
                  Cek Status Seleksi Siswa
                </Link>
              </li>
              <li>
                <a href="#syarat" className="hover:text-white transition-colors">
                  Persyaratan & Dokumen
                </a>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-white transition-colors">
                  Portal Login Panitia / Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Kontak & Alamat */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Sekretariat SPMB</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Jl. Teknologi Informasi No. 45, Kebayoran Baru, Jakarta Selatan</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-blue-400 shrink-0" />
                <span>(021) 7890-1234 / 0812-3456-7890</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-blue-400 shrink-0" />
                <span>spmb@smkn1digital.sch.id</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Sistem Penerimaan Murid Baru (SPMB). Hak Cipta Dilindungi.</p>
          <p className="flex items-center gap-1">
            Built with React, Supabase, Tailwind CSS & shadcn/ui.
          </p>
        </div>
      </div>
    </footer>
  );
};
