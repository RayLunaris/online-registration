import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Calendar, 
  ArrowRight, 
  ArrowLeft,
  BookOpen, 
  Sparkles,
  FileText
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { announcementService } from '@/services/announcementService';
import { Announcement } from '@/types/spmb';
import { formatDate } from '@/lib/utils';

const CATEGORIES = ['Semua', 'Pengumuman', 'Panduan', 'Berita'];

export const AnnouncementListPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const data = await announcementService.getAllAnnouncements(
          selectedCategory,
          searchQuery
        );
        setAnnouncements(data);
      } catch (err) {
        console.error('Failed to load announcements', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl space-y-8">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-teal-700 gap-1.5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5 text-teal-600" />
            <span>Pusat Informasi & Pengumuman</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Berita & Pengumuman SPMB
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm">
            Dapatkan informasi terkini seputar jadwal pendaftaran, petunjuk teknis, dan hasil seleksi.
          </p>
        </div>

        {/* Filter & Search Controls */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                size="sm"
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className={`text-xs h-9 ${
                  selectedCategory === category
                    ? 'bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <label htmlFor="announcement-search-input" className="sr-only">Cari judul pengumuman</label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              id="announcement-search-input"
              name="searchQuery"
              type="text"
              placeholder="Cari judul pengumuman..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Cari judul pengumuman"
              className="pl-9 h-9 text-xs bg-slate-50 border-slate-200 focus:bg-white font-sans"
            />
          </div>
        </div>

        {/* Announcements Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-xl bg-white border border-slate-200 animate-pulse p-4 space-y-4">
                <div className="h-44 bg-slate-200 rounded-lg" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-full" />
              </div>
            ))}
          </div>
        ) : announcements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden border-slate-200 hover:shadow-md transition-all duration-200 flex flex-col justify-between group bg-white"
              >
                <div>
                  {item.thumbnail_url ? (
                    <div className="h-48 w-full overflow-hidden bg-slate-100 relative">
                      <img
                        src={item.thumbnail_url}
                        alt={item.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <Badge className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] uppercase font-bold tracking-wider">
                        {item.category}
                      </Badge>
                    </div>
                  ) : (
                    <div className="h-36 w-full bg-gradient-to-br from-teal-50 to-slate-100 flex items-center justify-center text-teal-600">
                      <FileText className="h-10 w-10 opacity-40" />
                    </div>
                  )}

                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-mono">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{formatDate(item.published_at)}</span>
                    </div>

                    <CardTitle className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-2">
                      <Link to={`/pengumuman/${item.slug}`}>
                        {item.title}
                      </Link>
                    </CardTitle>

                    <CardDescription className="text-xs text-slate-600 line-clamp-3 mt-2 leading-relaxed">
                      {item.content}
                    </CardDescription>
                  </CardHeader>
                </div>

                <CardContent className="p-5 pt-0">
                  <Link
                    to={`/pengumuman/${item.slug}`}
                    className="inline-flex items-center text-xs font-semibold text-teal-700 hover:text-teal-800 gap-1 pt-3 border-t border-slate-100 w-full"
                  >
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8 space-y-4">
            <div className="h-16 w-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <BookOpen className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Tidak ada pengumuman ditemukan</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tidak ada berita atau pengumuman yang sesuai dengan filter atau kata kunci "{searchQuery}".
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory('Semua');
                setSearchQuery('');
              }}
              className="text-xs"
            >
              Reset Filter
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
