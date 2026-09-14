import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar, 
  ArrowLeft, 
  Share2, 
  Check, 
  BookOpen, 
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { announcementService } from '@/services/announcementService';
import { Announcement } from '@/types/spmb';
import { formatDate } from '@/lib/utils';

export const AnnouncementDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [relatedAnnouncements, setRelatedAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await announcementService.getAnnouncementBySlug(slug);
        setAnnouncement(data);
        if (data) {
          const related = await announcementService.getRelatedAnnouncements(data.slug, 3);
          setRelatedAnnouncements(related);
        }
      } catch (err) {
        console.error('Failed to load announcement detail', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-16 flex items-center justify-center transition-colors duration-200">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mx-auto" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Memuat artikel...</p>
        </div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-16 transition-colors duration-200">
        <div className="container mx-auto px-4 text-center max-w-md space-y-4">
          <div className="h-16 w-16 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <BookOpen className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Pengumuman Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Artikel atau pengumuman yang Anda cari mungkin telah dihapus atau URL tidak sesuai.
          </p>
          <Link to="/pengumuman">
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white gap-2 mt-2 cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Daftar Pengumuman
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-10 transition-colors duration-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-6 flex-wrap">
          <Link to="/" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
            Beranda
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <Link to="/pengumuman" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
            Pengumuman
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="text-slate-900 dark:text-white font-medium truncate max-w-[200px] sm:max-w-xs">
            {announcement.title}
          </span>
        </nav>

        {/* Main Article Card */}
        <article className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-12">
          {/* Cover Header Image */}
          {announcement.thumbnail_url && (
            <div className="h-64 sm:h-96 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
              <img
                src={announcement.thumbnail_url}
                alt={announcement.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 sm:p-10">
            {/* Meta Tags */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <Badge className="bg-teal-600 text-white text-xs font-semibold py-1 px-3">
                  {announcement.category}
                </Badge>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDate(announcement.published_at)}</span>
                </div>
              </div>

              {/* Share Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="text-xs h-8 gap-1.5 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Tautan Disalin!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5" />
                    <span>Bagikan</span>
                  </>
                )}
              </Button>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-6 leading-snug">
              {announcement.title}
            </h1>

            {/* Article Content */}
            <div className="mt-8 text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base space-y-4 whitespace-pre-line">
              {announcement.content}
            </div>

            {/* Helpful Box */}
            <div className="mt-10 p-5 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-teal-900 dark:text-teal-200">
                  Ada pertanyaan seputar pengumuman ini?
                </h4>
                <p className="text-xs text-teal-700 dark:text-teal-300 mt-0.5">
                  Hubungi sekretariat panitia SPMB melalui WhatsApp atau lihat panduan lengkap di beranda.
                </p>
              </div>
              <Link to="/#alur">
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs shrink-0 cursor-pointer">
                  Lihat Alur Pendaftaran
                </Button>
              </Link>
            </div>
          </div>
        </article>

        {/* Related Announcements */}
        {relatedAnnouncements.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Pengumuman Terkait Lainnya
              </h3>
              <Link
                to="/pengumuman"
                className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 inline-flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedAnnouncements.map((item) => (
                <Card
                  key={item.id}
                  className="overflow-hidden border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow bg-white dark:bg-slate-950 flex flex-col justify-between"
                >
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                      <Badge variant="outline" className="text-[10px] dark:border-slate-700 dark:text-slate-300">
                        {item.category}
                      </Badge>
                      <span>{formatDate(item.published_at)}</span>
                    </div>
                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                      <Link to={`/pengumuman/${item.slug}`} className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                        {item.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1.5">
                      {item.content}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
