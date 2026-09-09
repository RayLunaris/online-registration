import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { schoolService } from '@/services/schoolService';

export interface RegistrationStatusResult {
  isOpen: boolean;
  loading: boolean;
  status: 'open' | 'closed';
  closeDate: string | null;
  isClosedByDate: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useRegistrationStatus(): RegistrationStatusResult {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<'open' | 'closed'>('open');
  const [closeDate, setCloseDate] = useState<string | null>(null);
  const [isClosedByDate, setIsClosedByDate] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      let rpcResult: boolean | null = null;

      // 1. Coba panggil RPC get_registration_status() dari Supabase jika terhubung
      if (isSupabaseConfigured()) {
        try {
          const { data, error: rpcError } = await supabase.rpc('get_registration_status');
          if (!rpcError && typeof data === 'boolean') {
            rpcResult = data;
          }
        } catch (rpcErr) {
          console.warn('RPC get_registration_status error, falling back to school profile:', rpcErr);
        }
      }

      // 2. Ambil profil sekolah untuk metadata status & tanggal tutup otomatis
      const school = await schoolService.getSchoolProfile();
      const currentManualStatus: 'open' | 'closed' = (school.registration_status as 'open' | 'closed') || 'open';
      const scheduledCloseDate = school.registration_close_date || null;

      setStatus(currentManualStatus);
      setCloseDate(scheduledCloseDate);

      // Cek apakah tanggal otomatis sudah lewat
      let dateExpired = false;
      if (scheduledCloseDate) {
        const closeTimestamp = new Date(scheduledCloseDate).getTime();
        if (!isNaN(closeTimestamp) && Date.now() > closeTimestamp) {
          dateExpired = true;
        }
      }

      // Hitung status efektif
      let effectiveIsOpen = true;
      if (currentManualStatus === 'closed') {
        effectiveIsOpen = false;
        setIsClosedByDate(false);
      } else if (dateExpired) {
        effectiveIsOpen = false;
        setIsClosedByDate(true);
      } else {
        effectiveIsOpen = true;
        setIsClosedByDate(false);
      }

      // Jika RPC mengembalikan nilai boolean terpercaya, prioritaskan hasil RPC
      if (rpcResult !== null) {
        setIsOpen(rpcResult);
      } else {
        setIsOpen(effectiveIsOpen);
      }

      setError(null);
    } catch (err: any) {
      console.error('Error fetching registration status:', err);
      setError(err?.message || 'Gagal memuat status pendaftaran');
      // Default to true agar pendaftar tidak terblokir jika terjadi kegagalan jaringan sementara
      setIsOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    const handleUpdate = () => {
      fetchStatus();
    };

    window.addEventListener('school_settings_updated', handleUpdate);
    return () => {
      window.removeEventListener('school_settings_updated', handleUpdate);
    };
  }, [fetchStatus]);

  return {
    isOpen,
    loading,
    status,
    closeDate,
    isClosedByDate,
    error,
    refetch: fetchStatus,
  };
}
