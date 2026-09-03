import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Send, 
  Award, 
  CheckCircle2, 
  ArrowUpRight, 
  Sun, 
  Moon, 
  Globe, 
  Clock, 
  Sparkles, 
  ShieldCheck,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  MessageCircle,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { schoolService, DEFAULT_SCHOOL, DEFAULT_MAJORS } from '@/services/schoolService';
import { School, Major } from '@/types/spmb';

export const Footer: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  
  const [school, setSchool] = useState<School>(DEFAULT_SCHOOL);
  const [majors, setMajors] = useState<Major[]>(DEFAULT_MAJORS);
  const [emailInput, setEmailInput] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const [schoolData, majorsData] = await Promise.all([
          schoolService.getSchoolProfile(),
          schoolService.getMajors(),
        ]);
        if (schoolData) setSchool(schoolData);
        if (majorsData && majorsData.length > 0) setMajors(majorsData.filter(m => m.is_active));
      } catch (err) {
        console.error('Error fetching footer data:', err);
      }
    };
    fetchFooterData();
  }, []);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) return;
    setIsSubscribed(true);
    setEmailInput('');
    setTimeout(() => setIsSubscribed(false), 5000);
  };

  const isDarkMode = theme === 'dark';

  return (
    <footer className="relative border-t border-slate-800 bg-[#0B0F19] text-slate-300 transition-colors duration-300 overflow-hidden font-sans">
      
      {/* Ambient Radial Blur Glows (Inspired by 21st.dev / Spectrum UI Footer) */}
      <div className="pointer-events-none absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-10 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl" />

      <div className="relative mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-12">
        
        {/* TOP GRID SECTION: 4 Columns */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          
          {/* COL 1: Newsletter / Subscribe for Admissions Updates */}
          <div className="space-y-4 relative">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-md p-1 overflow-hidden border border-slate-700/60 shrink-0">
                <img 
                  src="/images/logo-icon.png" 
                  alt="Logo Sekolah" 
                  className="h-full w-full object-contain" 
                />
              </div>
              <div>
                <h3 className="text-white font-extrabold text-base leading-tight tracking-tight">
                  {school.name || 'SMK Negeri 1 Digital'}
                </h3>
                <span className="text-[11px] text-teal-400 font-bold font-mono">
                  NPSN: {school.npsn || '20109988'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'id'
                ? 'Dapatkan notifikasi jadwal gelombang pendaftaran, syarat berkas, dan pengumuman hasil seleksi langsung ke email Anda.'
                : 'Get live updates on admission schedules, document requirements, and selection announcements directly to your inbox.'}
            </p>

            {/* Newsletter Subscription Box */}
            <form onSubmit={handleNewsletterSubmit} className="relative mt-3">
              <div className="relative flex items-center">
                <Input
                  type="email"
                  required
                  placeholder={language === 'id' ? 'Masukkan email Anda...' : 'Enter your email...'}
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="h-10 pr-12 text-xs bg-slate-900/90 border-slate-700/80 text-slate-100 placeholder:text-slate-500 rounded-lg focus-visible:ring-teal-500"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-1 h-8 w-8 rounded-md bg-teal-600 hover:bg-teal-500 text-white transition-transform hover:scale-105 shadow-xs"
                  title="Berlangganan Info"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span className="sr-only">Kirim</span>
                </Button>
              </div>
              {isSubscribed && (
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                  <Check className="h-3.5 w-3.5" />
                  <span>
                    {language === 'id' 
                      ? 'Terima kasih! Email Anda telah terdaftar untuk info SPMB.' 
                      : 'Thank you! You are now subscribed to admissions alerts.'}
                  </span>
                </div>
              )}
            </form>

            {/* Accreditation Badge */}
            <div className="pt-1">
              <div className="inline-flex items-center gap-2 text-[11px] text-teal-300 bg-teal-950/60 border border-teal-800/60 rounded-lg px-3 py-1.5">
                <Award className="h-4 w-4 shrink-0 text-amber-400" />
                <span className="font-semibold">Terakreditasi A (Unggul) BAN-S/M</span>
              </div>
            </div>
          </div>

          {/* COL 2: Program Keahlian (Majors) */}
          <div>
            <h4 className="text-white font-bold text-xs tracking-wider uppercase mb-4 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-teal-400" />
              <span>{language === 'id' ? 'Program Keahlian' : 'Major Programs'}</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              {majors.slice(0, 5).map((major) => (
                <li key={major.id}>
                  <Link
                    to="/#jurusan"
                    className="group flex items-center justify-between hover:text-teal-300 transition-colors py-0.5"
                  >
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-teal-500/80 group-hover:text-teal-400 shrink-0" />
                      <span className="group-hover:translate-x-0.5 transition-transform">{major.name}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 group-hover:text-teal-400 font-semibold">
                      {major.code}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COL 3: Layanan & Navigasi Cepat SPMB */}
          <div>
            <h4 className="text-white font-bold text-xs tracking-wider uppercase mb-4 flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
              <span>{language === 'id' ? 'Layanan & Pendaftaran' : 'Admissions & Services'}</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link 
                  to="/daftar" 
                  className="hover:text-teal-400 transition-colors inline-flex items-center gap-1.5 font-bold text-white group"
                >
                  <span className="text-teal-400">⚡</span>
                  <span>{language === 'id' ? 'Formulir Pendaftaran Online' : 'Online Application Form'}</span>
                  <ArrowUpRight className="h-3 w-3 text-teal-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </li>
              <li>
                <Link 
                  to="/cek-status" 
                  className="hover:text-teal-300 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>🔍</span>
                  <span>{language === 'id' ? 'Cek Status & Hasil Seleksi' : 'Check Admission Status'}</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/pengumuman" 
                  className="hover:text-teal-300 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>📢</span>
                  <span>{language === 'id' ? 'Berita & Pengumuman Resmi' : 'Official Announcements'}</span>
                </Link>
              </li>
              <li>
                <a 
                  href="/#alur" 
                  className="hover:text-teal-300 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>📋</span>
                  <span>{language === 'id' ? 'Jadwal & Alur Seleksi' : 'Admission Steps & Flow'}</span>
                </a>
              </li>
              <li>
                <a 
                  href="/#syarat" 
                  className="hover:text-teal-300 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>📁</span>
                  <span>{language === 'id' ? 'Persyaratan Dokumen' : 'Document Requirements'}</span>
                </a>
              </li>
              <li>
                <a 
                  href="/#simulator" 
                  className="hover:text-teal-300 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>🧮</span>
                  <span>{language === 'id' ? 'Simulator Skor Seleksi' : 'Scoring Engine Simulator'}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* COL 4: Kontak & Sekretariat */}
          <div>
            <h4 className="text-white font-bold text-xs tracking-wider uppercase mb-4 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-teal-400" />
              <span>{language === 'id' ? 'Sekretariat SPMB' : 'Admissions Office'}</span>
            </h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {school.address || 'Jl. Teknologi Informasi No. 45, Kebayoran Baru, Jakarta Selatan'}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-teal-400 shrink-0" />
                <span>{school.phone || '(021) 7890-1234'}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-teal-400 shrink-0" />
                <span>{school.email || 'spmb@smkn1digital.sch.id'}</span>
              </li>
              <li className="flex items-center gap-2.5 text-[11px] text-slate-400 font-mono">
                <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>Senin - Jumat: 08.00 - 15.00 WIB</span>
              </li>
            </ul>

            {/* Social Media Circular Buttons */}
            <div className="mt-5 pt-3 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-2">
                {language === 'id' ? 'Kanal Informasi Resmi' : 'Official Channels'}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="h-8 w-8 rounded-full bg-slate-900 hover:bg-teal-600 text-slate-400 hover:text-white border border-slate-800 hover:border-teal-500 flex items-center justify-center transition-all duration-200"
                  title="Instagram"
                >
                  <Instagram className="h-3.5 w-3.5" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="h-8 w-8 rounded-full bg-slate-900 hover:bg-red-600 text-slate-400 hover:text-white border border-slate-800 hover:border-red-500 flex items-center justify-center transition-all duration-200"
                  title="YouTube"
                >
                  <Youtube className="h-3.5 w-3.5" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="h-8 w-8 rounded-full bg-slate-900 hover:bg-blue-600 text-slate-400 hover:text-white border border-slate-800 hover:border-blue-500 flex items-center justify-center transition-all duration-200"
                  title="Facebook"
                >
                  <Facebook className="h-3.5 w-3.5" />
                </a>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noreferrer"
                  className="h-8 w-8 rounded-full bg-slate-900 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-600 flex items-center justify-center transition-all duration-200"
                  title="Twitter / X"
                >
                  <Twitter className="h-3.5 w-3.5" />
                </a>
                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noreferrer"
                  className="h-8 w-8 rounded-full bg-slate-900 hover:bg-emerald-600 text-slate-400 hover:text-white border border-slate-800 hover:border-emerald-500 flex items-center justify-center transition-all duration-200"
                  title="WhatsApp Helpdesk"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* SIGNATURE 21ST.DEV WATERMARK / GIANT BRAND TYPOGRAPHY */}
        <div className="w-full flex items-center justify-center mt-12 pt-6 border-t border-slate-800/60 overflow-hidden">
          <h2 className="text-center text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black bg-clip-text text-transparent bg-gradient-to-b from-slate-700/40 via-slate-800/20 to-slate-950 select-none tracking-tighter uppercase whitespace-nowrap">
            SPMB ONLINE {school.academic_year?.split('/')[0] || '2026'}
          </h2>
        </div>

        {/* BOTTOM METADATA & CONTROLS BAR */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <span>© {new Date().getFullYear()} {school.name || 'SMK Negeri 1 Digital Teknologi'}.</span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="text-slate-400">Tahun Ajaran {school.academic_year || '2026/2027'}</span>
          </div>

          {/* Action Pills: Theme Toggle & Language Switcher */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors text-[11px] font-medium"
              title="Ganti Tema"
            >
              {isDarkMode ? (
                <>
                  <Sun className="h-3.5 w-3.5 text-amber-400" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5 text-teal-400" />
                  <span>Dark</span>
                </>
              )}
            </button>

            {/* Language Toggle */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors text-[11px] font-mono font-bold"
              title="Ganti Bahasa / Switch Language"
            >
              <Globe className="h-3.5 w-3.5 text-teal-400" />
              <span>{language.toUpperCase()}</span>
            </button>

            {/* Admin Secret Portal Link */}
            <Link
              to="/admin/login"
              className="text-[11px] text-slate-400 hover:text-slate-400 transition-colors font-mono"
              title="Akses Portal Panitia"
            >
              •
            </Link>
          </div>

        </div>

      </div>
    </footer>
  );
};

