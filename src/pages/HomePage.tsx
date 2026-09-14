import React, { useEffect, useState } from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { FeatureCardsSection } from '@/components/home/FeatureCardsSection';
import { AboutSection } from '@/components/home/AboutSection';
import { FeatureBand } from '@/components/home/FeatureBand';
import { MajorsSection } from '@/components/home/MajorsSection';
import { ScoringSimulatorSection } from '@/components/home/ScoringSimulatorSection';
import { RankingSection } from '@/components/home/RankingSection';
import { RegistrationStepsSection } from '@/components/home/RegistrationStepsSection';
import { AdmissionScheduleSection } from '@/components/home/AdmissionScheduleSection';
import { AdmissionRequirementsSection } from '@/components/home/AdmissionRequirementsSection';
import { AnnouncementsSection } from '@/components/home/AnnouncementsSection';
import { FinalCtaBanner } from '@/components/home/FinalCtaBanner';
import { FAQSection } from '@/components/common/FAQSection';
import { schoolService } from '@/services/schoolService';
import { announcementService } from '@/services/announcementService';
import { Major, Announcement } from '@/types/spmb';
import { useSchool } from '@/context/SchoolContext';

export const HomePage: React.FC = () => {
  const { school } = useSchool();
  const [majors, setMajors] = useState<Major[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [majorsData, announcementsData] = await Promise.all([
          schoolService.getMajors(),
          announcementService.getPublishedAnnouncements(3),
        ]);
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
    <div className="flex flex-col min-h-screen bg-[#FAFAF9] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-[#CCFBF1] selection:text-[#0D9488] transition-colors">
      {/* 1. HERO SECTION */}
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

      {/* 8. LIVE RANKING PREVIEW SECTION */}
      <RankingSection />

      {/* 9. ADMISSION STEPS SECTION */}
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
