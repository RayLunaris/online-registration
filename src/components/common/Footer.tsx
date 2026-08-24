import React from 'react';
import { GraduationCap, MapPin, Phone, Mail, Award, CheckCircle, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-[#111827] text-slate-300">
      <div className="container mx-auto px-4 py-14 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          
          {/* Col 1: School Identity & Accreditation */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0D9488] text-white shadow-sm">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-white font-extrabold text-base leading-tight">SMK Negeri 1 Digital</h3>
                <span className="text-xs text-[#0D9488] font-bold font-mono">NPSN: 20109988</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Pusat keunggulan pendidikan kejuruan teknologi yang berorientasi pada kesiapan kerja, sertifikasi profesi internasional, dan daya saing global.
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-teal-300 bg-teal-950/80 border border-teal-800/80 rounded-xl px-3.5 py-2">
              <Award className="h-4 w-4 shrink-0 text-[#FDBA74]" />
              <span className="font-bold">Terakreditasi A (Unggul) BAN-S/M</span>
            </div>
          </div>

          {/* Col 2: Program Keahlian */}
          <div>
            <h4 className="text-white font-bold text-xs tracking-wider uppercase mb-4">Jurusan Unggulan</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-[#0D9488] shrink-0" />
                <span>Rekayasa Perangkat Lunak (RPL)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-[#0D9488] shrink-0" />
                <span>Teknik Komputer & Jaringan (TKJ)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-[#0D9488] shrink-0" />
                <span>Desain Komunikasi Visual (DKV)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-[#0D9488] shrink-0" />
                <span>Akuntansi & Keuangan Lembaga (AKL)</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Navigasi Cepat & Pendaftaran */}
          <div>
            <h4 className="text-white font-bold text-xs tracking-wider uppercase mb-4">Pendaftaran & Layanan</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/daftar" className="hover:text-[#0D9488] transition-colors inline-flex items-center gap-1 font-semibold text-white">
                  <span>Formulir Pendaftaran Online</span>
                  <ArrowUpRight className="h-3 w-3 text-[#0D9488]" />
                </Link>
              </li>
              <li>
                <Link to="/cek-status" className="hover:text-[#0D9488] transition-colors inline-flex items-center gap-1">
                  <span>Cek Status Seleksi Siswa</span>
                </Link>
              </li>
              <li>
                <Link to="/pengumuman" className="hover:text-[#0D9488] transition-colors inline-flex items-center gap-1">
                  <span>Berita & Pengumuman Resmi</span>
                </Link>
              </li>
              <li>
                <a href="/#alur" className="hover:text-[#0D9488] transition-colors">
                  Jadwal & Alur Pendaftaran
                </a>
              </li>
              <li>
                <a href="/#syarat" className="hover:text-[#0D9488] transition-colors">
                  Persyaratan Dokumen
                </a>
              </li>
              <li className="pt-1">
                <Link to="/admin/login" className="hover:text-[#0D9488] transition-colors inline-flex items-center gap-1 text-slate-500">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Portal Panitia / Admin</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Informasi & Sekretariat */}
          <div>
            <h4 className="text-white font-bold text-xs tracking-wider uppercase mb-4">Sekretariat SPMB</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-[#0D9488] shrink-0 mt-0.5" />
                <span>Jl. Teknologi Informasi No. 45, Kebayoran Baru, Jakarta Selatan</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-[#0D9488] shrink-0" />
                <span>(021) 7890-1234 / 0812-3456-7890</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-[#0D9488] shrink-0" />
                <span>spmb@smkn1digital.sch.id</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SMK Negeri 1 Digital Teknologi. Hak Cipta Dilindungi.</p>
          <p className="flex items-center gap-1 font-mono">
            Sistem Penerimaan Murid Baru Terpadu (SPMB)
          </p>
        </div>
      </div>
    </footer>
  );
};
