import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'id' | 'en';

interface Translations {
  [key: string]: {
    id: string;
    en: string;
  };
}

export const translations: Translations = {
  // Navbar
  'nav.home': { id: 'Beranda', en: 'Home' },
  'nav.register': { id: 'Daftar Sekarang', en: 'Register Now' },
  'nav.checkStatus': { id: 'Cek Status', en: 'Check Status' },
  'nav.announcements': { id: 'Pengumuman', en: 'Announcements' },
  'nav.adminPortal': { id: 'Portal Admin', en: 'Admin Portal' },

  // Hero Section
  'hero.badge': { id: 'Penerimaan Peserta Didik Baru 2026/2027', en: 'New Student Admissions 2026/2027' },
  'hero.title': { id: 'Wujudkan Masa Depan Vokasi Unggul & Siap Kerja Global', en: 'Build Your Vocational Future & Global Career Readiness' },
  'hero.desc': { 
    id: 'Pendaftaran online resmi SMK Negeri 1 Digital Teknologi. Dapatkan pendidikan kejuruan berkualitas berstandar industri internasional.', 
    en: 'Official online admission for SMK Negeri 1 Digital Technology. Receive high-quality vocational education with global industry standards.' 
  },
  'hero.btnRegister': { id: 'Daftar SPMB Online', en: 'Apply SPMB Online' },
  'hero.btnCheck': { id: 'Cek Status Pendaftaran', en: 'Check Status' },
  'hero.statQuota': { id: 'Total Kuota Siswa', en: 'Total Student Quota' },
  'hero.statMajors': { id: 'Program Keahlian', en: 'Vocational Majors' },
  'hero.statPartners': { id: 'Mitra Industri', en: 'Industry Partners' },

  // Sections
  'sec.majorsTitle': { id: 'Program Keahlian Unggulan', en: 'Featured Vocational Majors' },
  'sec.majorsDesc': { id: 'Pilih jurusan keahlian sesuai dengan minat dan bakat Anda', en: 'Choose your preferred major matching your passion and talent' },
  'sec.flowTitle': { id: 'Alur Pendaftaran SPMB', en: 'Admissions Process Flow' },
  'sec.flowDesc': { id: '4 langkah mudah pendaftaran siswa baru secara daring', en: '4 simple steps for new student online registration' },
  'sec.reqTitle': { id: 'Syarat & Ketentuan Pendaftaran', en: 'Admission Requirements' },
  'sec.faqTitle': { id: 'Pertanyaan yang Sering Diajukan (FAQ)', en: 'Frequently Asked Questions (FAQ)' },
  'sec.newsTitle': { id: 'Berita & Pengumuman Terbaru', en: 'Latest News & Announcements' },

  // Status Check
  'status.title': { id: 'Cek Status Pendaftaran', en: 'Check Admission Status' },
  'status.desc': { id: 'Masukkan nomor registrasi pendaftaran (contoh: REG-2026-00001)', en: 'Enter your registration number (e.g., REG-2026-00001)' },
  'status.btnSearch': { id: 'Cari Data Pendaftaran', en: 'Search Admission' },
  'status.cardTitle': { id: 'Status Kelulusan & Seleksi', en: 'Selection & Acceptance Status' },

  // Footer
  'footer.about': { id: 'Sekolah Menengah Kejuruan Pusat Keunggulan berfokus pada teknologi digital dan industri 4.0.', en: 'Center of Excellence Vocational School focused on digital technology and industry 4.0.' },
  'footer.quickLinks': { id: 'Tautan Cepat', en: 'Quick Links' },
  'footer.contact': { id: 'Kontak Sekretariat', en: 'Admissions Office' },
  'footer.rights': { id: 'Hak Cipta Dilindungi.', en: 'All Rights Reserved.' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('spmb_lang');
    return (saved === 'en' || saved === 'id') ? saved : 'id';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('spmb_lang', lang);
  };

  const t = (key: string): string => {
    const item = translations[key];
    if (!item) return key;
    return item[language] || item.id;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
