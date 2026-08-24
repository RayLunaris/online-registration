import React, { useEffect, useState } from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { FeatureCardsSection } from '@/components/home/FeatureCardsSection';
import { AboutSection } from '@/components/home/AboutSection';
import { FeatureBand } from '@/components/home/FeatureBand';
import { MajorsSection } from '@/components/home/MajorsSection';
import { ScoringSimulatorSection } from '@/components/home/ScoringSimulatorSection';
import { RegistrationStepsSection } from '@/components/home/RegistrationStepsSection';
import { AdmissionScheduleSection } from '@/components/home/AdmissionScheduleSection';
import { AdmissionRequirementsSection } from '@/components/home/AdmissionRequirementsSection';
import { AnnouncementsSection } from '@/components/home/AnnouncementsSection';
import { FinalCtaBanner } from '@/components/home/FinalCtaBanner';
import { FAQSection } from '@/components/common/FAQSection';
import { schoolService } from '@/services/schoolService';
import { announcementService } from '@/services/announcementService';
import { School, Major, Announcement } from '@/types/spmb';

export const HomePage: React.FC = () => {
  const [school, setSchool] = useState<School | null>(null);
  const [majors, setMajors] = useState<Major[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [schoolData, majorsData, announcementsData] = await Promise.all([
          schoolService.getSchoolProfile(),
          schoolService.getMajors(),
          announcementService.getPublishedAnnouncements(3),
        ]);
        setSchool(schoolData);
        setMajors(majorsData);
        setAnnouncements(announcementsData);
      } catch (err) {
        console.error('Failed to load home page data:', err);
      }
    };
    loadData();
  }, []);

  const totalQuota = majors.reduce((acc, m) => acc + (m.quota || 0), 0) || (school?.target_students || 400);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAF9] text-slate-900 font-sans selection:bg-[#CCFBF1] selection:text-[#0D9488]">
      
      {/* 1. TOP NOTICE STRIP */}
      <div className="bg-[#111827] text-slate-300 border-b border-slate-800 text-xs py-2 px-4">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-block h-2 w-2 rounded-full bg-[#0D9488] animate-pulse" />
            <span className="text-white font-semibold">Penerimaan Peserta Didik Baru (SPMB) T.A. 2026/2027</span>
            <span className="text-slate-600 hidden md:inline">|</span>
            <span className="text-slate-400 hidden md:inline">{school?.name || 'SMK Negeri 1 Digital Teknologi'}</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
            <span>NPSN: <strong className="text-slate-200">{school?.npsn || '20109988'}</strong></span>
            <span>Akreditasi: <strong className="text-[#0D9488]">A (Unggul)</strong></span>
            <span className="text-emerald-400 font-semibold">100% Bebas Biaya</span>
          </div>
        </div>
      </div>

      {/* 2. HERO SECTION */}
      <HeroSection 
        school={school} 
        majorsCount={majors.length || 4} 
        totalQuota={totalQuota} 
      />

      {/* 3. CORE FEATURES SECTION */}
      <FeatureCardsSection />

      {/* 4. ABOUT SCHOOL SECTION */}
      <AboutSection 
        school={school} 
        majorsCount={majors.length || 4} 
        totalQuota={totalQuota} 
      />

      {/* 5. CONTRAST FEATURE BAND (TICKER) */}
      <FeatureBand />

      {/* 6. MAJORS PROGRAM BENTO SECTION */}
      <MajorsSection majors={majors} />

      {/* 7. SCORING & SIMULATOR SECTION */}
      <ScoringSimulatorSection />

      {/* 8. ADMISSION STEPS SECTION */}
      <RegistrationStepsSection />

      {/* 9. SCHEDULE & CALENDAR SECTION */}
      <AdmissionScheduleSection />

      {/* 10. REQUIREMENTS SECTION */}
      <AdmissionRequirementsSection />

      {/* 11. ANNOUNCEMENTS SECTION */}
      <AnnouncementsSection announcements={announcements} />

      {/* 12. FAQ SECTION */}
      <FAQSection />

      {/* 13. FINAL CONVERSION CTA BANNER */}
      <FinalCtaBanner />

    </div>
  );
};
