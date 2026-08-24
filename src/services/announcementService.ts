import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Announcement } from '@/types/spmb';

export const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    title: 'Jadwal dan Alur Pendaftaran SPMB Tahun Pelajaran 2026/2027',
    slug: 'jadwal-dan-alur-pendaftaran-spmb-2026-2027',
    content: 'Pendaftaran Penerimaan Murid Baru (SPMB) dibuka mulai tanggal 1 Mei 2026 hingga 30 Juni 2026 secara online. Seluruh calon siswa diwajibkan melengkapi biodata, nilai rapor semester 1-5, dan dokumen persyaratan.',
    category: 'Pengumuman',
    status: 'Published',
    thumbnail_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80',
    author_id: null,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a2',
    title: 'Petunjuk Teknis Upload Dokumen dan Sertifikat Prestasi',
    slug: 'petunjuk-teknis-upload-dokumen-prestasi',
    content: 'Pastikan foto 3x4 berlatar belakang merah/biru dengan format JPG/PNG maksimal 2MB. Sertifikat prestasi yang diakui adalah kejuaraan tingkat Kabupaten, Provinsi, Nasional, hingga Internasional.',
    category: 'Panduan',
    status: 'Published',
    thumbnail_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
    author_id: null,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a3',
    title: 'Kunjungan Industri & Kerjasama Perusahaan Mitra SMK Digital 2026',
    slug: 'kunjungan-industri-dan-kerjasama-mitra-2026',
    content: 'SMK Negeri 1 Digital Teknologi menjalin kerjasama strategis dengan lebih dari 30 perusahaan teknologi terkemuka untuk program magang dan rekrutmen kerja lulusan.',
    category: 'Berita',
    status: 'Published',
    thumbnail_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80',
    author_id: null,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const announcementService = {
  async getPublishedAnnouncements(limit = 6): Promise<Announcement[]> {
    if (!isSupabaseConfigured()) {
      return DEFAULT_ANNOUNCEMENTS.slice(0, limit);
    }
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('status', 'Published')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error || !data || data.length === 0) {
      return DEFAULT_ANNOUNCEMENTS.slice(0, limit);
    }
    return data as Announcement[];
  },

  async getAllAnnouncements(category?: string, searchQuery?: string): Promise<Announcement[]> {
    if (!isSupabaseConfigured()) {
      let filtered = DEFAULT_ANNOUNCEMENTS;
      if (category && category !== 'Semua') {
        filtered = filtered.filter(a => a.category.toLowerCase() === category.toLowerCase());
      }
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(a => a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q));
      }
      return filtered;
    }

    let query = supabase
      .from('announcements')
      .select('*')
      .eq('status', 'Published')
      .order('published_at', { ascending: false });

    if (category && category !== 'Semua') {
      query = query.eq('category', category as any);
    }

    if (searchQuery && searchQuery.trim()) {
      query = query.ilike('title', `%${searchQuery.trim()}%`);
    }

    const { data, error } = await query;
    if (error || !data) {
      let filtered = DEFAULT_ANNOUNCEMENTS;
      if (category && category !== 'Semua') {
        filtered = filtered.filter(a => a.category.toLowerCase() === category.toLowerCase());
      }
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(a => a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q));
      }
      return filtered;
    }
    return data as Announcement[];
  },

  async getAnnouncementBySlug(slug: string): Promise<Announcement | null> {
    if (!isSupabaseConfigured()) {
      return DEFAULT_ANNOUNCEMENTS.find((a) => a.slug === slug) || null;
    }
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_ANNOUNCEMENTS.find((a) => a.slug === slug) || null;
    }
    return data as Announcement;
  },

  async getRelatedAnnouncements(currentSlug: string, limit = 3): Promise<Announcement[]> {
    const all = await this.getPublishedAnnouncements(10);
    return all.filter(a => a.slug !== currentSlug).slice(0, limit);
  }
};

