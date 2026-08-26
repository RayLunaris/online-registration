import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Newspaper, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Announcement } from '@/types/spmb';
import { formatDate } from '@/lib/utils';

interface AnnouncementsSectionProps {
  announcements: Announcement[];
}

export const AnnouncementsSection: React.FC<AnnouncementsSectionProps> = ({ announcements }) => {
  if (!announcements || announcements.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 bg-white border-b border-slate-200/70 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1440px] space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/70 text-[#0D9488] text-xs font-bold uppercase tracking-wider">
              <Newspaper className="h-3.5 w-3.5" />
              <span>Pusat Informasi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Pengumuman & Berita Terbaru
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Informasi terkini mengenai jadwal kegiatan, pedoman teknis pendaftaran, dan agenda akademik sekolah.
            </p>
          </div>

          <Link to="/pengumuman">
            <Button variant="outline" size="sm" className="h-10 px-5 text-xs font-bold border-slate-300 hover:border-[#0D9488] text-slate-700 hover:text-[#0D9488] rounded-full gap-1.5">
              <span>Lihat Semua Berita</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* 3-Card Insights Grid (EducateX Style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {announcements.map((item) => (
            <Link
              key={item.id}
              to={`/pengumuman/${item.slug}`}
              className="bg-[#FAFAF9] rounded-3xl p-6 sm:p-7 border border-slate-200/90 hover:border-[#0D9488] hover:bg-white transition-all duration-300 flex flex-col justify-between group space-y-5 shadow-xs hover:shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <Badge variant="outline" className="bg-white border-slate-300 text-[#0D9488] font-bold text-[11px] px-2.5 py-0.5 rounded-full">
                    {item.category}
                  </Badge>
                  <span className="text-slate-400 font-mono flex items-center gap-1 text-[11px]">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(item.published_at || item.created_at)}</span>
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0D9488] transition-colors line-clamp-2 leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-normal">
                  {item.content}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/80 flex items-center gap-1.5 text-xs font-bold text-[#0D9488] group-hover:translate-x-1 transition-transform">
                <span>Baca Selengkapnya</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};
