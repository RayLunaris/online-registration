import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { schoolService } from '@/services/schoolService';
import { Major, PublicLeaderboardEntry } from '@/types/spmb';
import { mockStudentStore } from '@/services/studentService';
import { useSchool } from '@/context/SchoolContext';

/**
 * Utility to mask names on client-side:
 * "Ahmad Fauzi Rahman" -> "Ahmad F."
 * "Siti Nurhaliza" -> "Siti N."
 * "Budi" -> "Budi"
 */
export function maskName(fullName: string): string {
  const trimmed = (fullName || '').trim();
  if (!trimmed) return '';
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0]} ${parts[1].charAt(0).toUpperCase()}.`;
  }
  return parts[0];
}

export function useLeaderboard() {
  const { school } = useSchool();
  const [majors, setMajors] = useState<Major[]>([]);
  const [selectedMajorId, setSelectedMajorId] = useState<string>('');
  const [allEntries, setAllEntries] = useState<PublicLeaderboardEntry[]>([]);
  const isLeaderboardEnabled = school ? school.show_public_leaderboard !== false : true;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Ambil Daftar Jurusan Aktif
      const fetchedMajors = await schoolService.getMajors();
      const activeMajors = fetchedMajors.filter(m => m.is_active);
      setMajors(activeMajors);

      if (activeMajors.length > 0) {
        setSelectedMajorId(prev => (prev && activeMajors.some(m => m.id === prev) ? prev : activeMajors[0].id));
      }

      // 3. Ambil Data Real dari Database PostgreSQL (Supabase)
      if (isSupabaseConfigured()) {
        const { data, error: dbError } = await supabase
          .from('public_leaderboard')
          .select('*')
          .order('rank_in_major', { ascending: true });

        if (!dbError && data) {
          // Data real dari VIEW public_leaderboard
          setAllEntries(data as PublicLeaderboardEntry[]);
        } else {
          // Fallback: Query tabel students & major_choices langsung secara real
          console.warn('Query public_leaderboard mengembalikan error/belum dibuat, membaca langsung tabel real students:', dbError);
          
          const { data: studentsData, error: stError } = await supabase
            .from('students')
            .select(`
              id,
              registration_number,
              full_name,
              total_score,
              average_report_score,
              achievement_score,
              status,
              created_at,
              major_choices (
                major_id,
                choice_order
              ),
              selection_results (
                final_accepted_major_id,
                choice1_major_id,
                major_id,
                score,
                rank,
                status
              )
            `)
            .neq('status', 'Draft')
            .order('total_score', { ascending: false });

          if (stError || !studentsData) {
            setAllEntries([]);
          } else {
            // Susun peringkat real per jurusan
            const realEntries: PublicLeaderboardEntry[] = [];

            activeMajors.forEach((major) => {
              const majorQuota = major.quota || 100;
              const studentsInMajor = studentsData.filter((s: any) => {
                const selRes = Array.isArray(s.selection_results) ? s.selection_results[0] : s.selection_results;
                const assignedMajorId = selRes?.final_accepted_major_id || selRes?.choice1_major_id || selRes?.major_id;
                if (assignedMajorId) {
                  return assignedMajorId === major.id;
                }
                const ch1 = s.major_choices?.find((c: any) => c.choice_order === 1);
                return ch1?.major_id === major.id;
              });

              // Urutkan skor DESC
              studentsInMajor.sort((a: any, b: any) => {
                const scoreA = Number(a.total_score || 0);
                const scoreB = Number(b.total_score || 0);
                if (scoreB !== scoreA) return scoreB - scoreA;
                return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
              });

              studentsInMajor.forEach((st: any, idx: number) => {
                const rank = idx + 1;
                realEntries.push({
                  registration_number: st.registration_number,
                  masked_name: maskName(st.full_name),
                  major_id: major.id,
                  major_name: major.name,
                  total_score: Number(st.total_score || 0),
                  rank_in_major: rank,
                  is_within_quota: rank <= majorQuota,
                });
              });
            });

            setAllEntries(realEntries);
          }
        }
      } else {
        // Mode offline (hanya gunakan data siswa yang ada di store, tanpa dummy generator)
        const realMockStudents = mockStudentStore.filter(s => s.status !== 'Draft');
        const offlineEntries: PublicLeaderboardEntry[] = [];

        activeMajors.forEach((major) => {
          const majorQuota = major.quota || 100;
          const matchingStudents = realMockStudents.filter(st => {
            const assignedMajorId = st.selection_results?.final_accepted_major_id || st.selection_results?.choice1_major_id;
            if (assignedMajorId) return assignedMajorId === major.id;
            const ch1 = st.major_choices?.find(c => c.choice_order === 1);
            return ch1?.major_id === major.id;
          });

          matchingStudents.sort((a, b) => Number(b.total_score || 0) - Number(a.total_score || 0));

          matchingStudents.forEach((st, idx) => {
            const rank = idx + 1;
            offlineEntries.push({
              registration_number: st.registration_number,
              masked_name: maskName(st.full_name),
              major_id: major.id,
              major_name: major.name,
              total_score: Number(st.total_score || 0),
              rank_in_major: rank,
              is_within_quota: rank <= majorQuota,
            });
          });
        });

        setAllEntries(offlineEntries);
      }
    } catch (err: any) {
      console.error('Failed to load leaderboard data:', err);
      setError(err.message || 'Gagal memuat data peringkat publik.');
      setAllEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter siswa untuk tab jurusan yang sedang aktif
  const currentMajorEntries = useMemo(() => {
    if (!selectedMajorId) return [];
    return allEntries
      .filter(entry => entry.major_id === selectedMajorId)
      .sort((a, b) => a.rank_in_major - b.rank_in_major || b.total_score - a.total_score);
  }, [allEntries, selectedMajorId]);

  // Jurusan yang sedang terpilih
  const selectedMajor = useMemo(() => {
    return majors.find(m => m.id === selectedMajorId);
  }, [majors, selectedMajorId]);

  // Pencarian posisi siswa (Cari Posisi Saya)
  const findStudent = useCallback((queryReg: string) => {
    const normalized = queryReg.trim().toUpperCase();
    if (!normalized) return { entry: undefined, isInCurrentMajor: false, targetMajor: undefined };

    const matchedEntry = allEntries.find(
      e => e.registration_number.toUpperCase() === normalized ||
           e.registration_number.toUpperCase().replace(/[^0-9]/g, '').endsWith(normalized.replace(/[^0-9]/g, ''))
    );

    if (!matchedEntry) {
      return { entry: undefined, isInCurrentMajor: false, targetMajor: undefined };
    }

    const isInCurrentMajor = matchedEntry.major_id === selectedMajorId;
    const targetMajor = majors.find(m => m.id === matchedEntry.major_id);

    return {
      entry: matchedEntry,
      isInCurrentMajor,
      targetMajor,
    };
  }, [allEntries, selectedMajorId, majors]);

  return {
    isLeaderboardEnabled,
    majors,
    selectedMajorId,
    setSelectedMajorId,
    selectedMajor,
    allEntries,
    currentMajorEntries,
    isLoading,
    error,
    refetch: fetchData,
    findStudent,
  };
}
