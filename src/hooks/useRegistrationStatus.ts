import { useState, useEffect, useCallback } from 'react';
import { schoolService } from '@/services/schoolService';
import { fetchRegistrationStatus, RegistrationStatusData } from '@/lib/registrationStatus';

export interface RegistrationStatusResult {
  isOpen: boolean;
  loading: boolean;
  status: 'open' | 'closed';
  closeDate: string | null;
  isClosedByDate: boolean;
  isDateExpired: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useRegistrationStatus(): RegistrationStatusResult {
  const [data, setData] = useState<RegistrationStatusData>({
    isOpen: false,
    status: 'closed',
    closeDate: null,
    isClosedByDate: false,
    isDateExpired: false,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const result = await fetchRegistrationStatus(() =>
        schoolService.getSchoolProfile(),
      );
      setData(result);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching registration status:', err);
      setError(err?.message || 'Gagal memuat status pendaftaran');
      // Fail-closed: keep previous state on error so isOpen doesn't flip
      // unexpectedly. Initial state is false, so the first failed fetch also
      // keeps registration closed.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    const handleUpdate = () => { fetchStatus(); };
    window.addEventListener('school_settings_updated', handleUpdate);
    return () => {
      window.removeEventListener('school_settings_updated', handleUpdate);
    };
  }, [fetchStatus]);

  return {
    ...data,
    loading,
    error,
    refetch: fetchStatus,
  };
}
