import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { 
  StudentCompleteDetail, 
  Major, 
  StudentStatus 
} from '@/types/spmb';
import { adminService } from './adminService';
import { mockStudentStore } from './studentService';

export interface SelectionSummary {
  totalProcessed: number;
  totalAcceptedChoice1: number;
  totalAcceptedChoice2: number;
  totalRejected: number;
  publishedAt?: string;
}

export interface RankedCandidate {
  student: StudentCompleteDetail;
  rank: number;
  score: number;
  reportScoreAvg: number;
  achievementPoints: number;
  
  // Choice 1 Evaluation
  choice1Major: Major;
  choice1Rank: number;
  choice1Status: 'accepted' | 'rejected' | 'pending';

  // Choice 2 Evaluation
  choice2Major: Major | null;
  choice2Rank: number | null; // Peringkat di antara seluruh siswa yang memilih jurusan ini sebagai Pilihan 2
  choice2Stage2Rank: number | null; // Peringkat aktif pada tahap seleksi limpahan kuota
  choice2Status: 'accepted' | 'rejected' | 'not_applicable' | 'pending';

  // Final Decision
  finalAcceptedMajor: Major | null;
  finalAcceptedFromPriority: number | null; // 1, 2, or null
  status: StudentStatus; // 'Diterima' | 'Tidak Diterima' | 'Menunggu Verifikasi' | 'Terverifikasi'

  // Backward compatibility helpers
  allocatedMajor: Major;
  choiceOrder: number;
  isChoice2Allocation: boolean;
}

export interface MajorSelectionGroup {
  major: Major;
  quota: number;
  remainingQuota: number;
  totalApplicants: number;
  choice1ApplicantsCount: number;
  choice2ApplicantsCount: number;
  acceptedCount: number;
  acceptedCh1Count: number;
  acceptedCh2Count: number;
  rejectedCount: number;
  candidates: RankedCandidate[];
  choice1Candidates: RankedCandidate[];
  choice2Candidates: RankedCandidate[];
}

export const selectionService = {
  /**
   * Run 2-Stage Multi-Choice Scoring Simulation
   * Tahap 1: Evaluasi Pilihan 1 (Rank <= Quota => Accepted)
   * Tahap 2: Evaluasi Pilihan 2 bagi siswa yang rejected di Pil 1 terhadap sisa kuota (Quota - Accepted Tahap 1)
   */
  async runSelectionSimulation(): Promise<{
    groups: MajorSelectionGroup[];
    allCandidates: RankedCandidate[];
    summary: SelectionSummary;
  }> {
    const [allStudents, allMajors] = await Promise.all([
      adminService.getAllStudents(),
      adminService.getAllMajors(),
    ]);

    const activeMajors = allMajors.filter((m) => m.is_active);
    const majorMap = new Map<string, Major>(activeMajors.map((m) => [m.id, m]));

    // 1. Hitung total_score (Rapor 70% + Prestasi 30%) untuk semua siswa
    const evaluatedPool = allStudents
      .filter((s) => s.status !== 'Draft')
      .map((student) => {
        const avgReport = Number(student.average_report_score || 0);
        const achPoints = Number(student.achievement_score || 0);
        const totalScore = Number(((avgReport * 0.70) + (achPoints * 0.30)).toFixed(2));

        const ch1Choice = student.major_choices?.find((c) => c.choice_order === 1);
        const ch2Choice = student.major_choices?.find((c) => c.choice_order === 2);

        const ch1Major = (ch1Choice?.major_id ? majorMap.get(ch1Choice.major_id) : undefined) ||
                         (ch1Choice?.major as Major | undefined) ||
                         activeMajors[0];

        const ch2Major = ch2Choice?.major_id 
          ? (majorMap.get(ch2Choice.major_id) || (ch2Choice.major as Major) || null) 
          : (ch2Choice?.major || null);

        return {
          student,
          avgReport,
          achPoints,
          totalScore,
          ch1Major,
          ch2Major,
          choice1Rank: 0,
          choice1Status: 'pending' as 'accepted' | 'rejected' | 'pending',
          choice2Rank: null as number | null,
          choice2Stage2Rank: null as number | null,
          choice2Status: (ch2Major ? 'pending' : 'not_applicable') as 'accepted' | 'rejected' | 'not_applicable' | 'pending',
          finalAcceptedMajor: null as Major | null,
          finalAcceptedFromPriority: null as number | null,
          finalStatus: student.status || 'Menunggu Verifikasi' as StudentStatus,
        };
      });

    // 2. TAHAP 1: Per jurusan, ranking siswa yang memilihnya sebagai PILIHAN 1 (Score DESC)
    const ch1AcceptedCounts = new Map<string, number>();
    activeMajors.forEach((m) => ch1AcceptedCounts.set(m.id, 0));

    activeMajors.forEach((major) => {
      const applicants = evaluatedPool.filter((item) => item.ch1Major.id === major.id);
      applicants.sort((a, b) => {
        if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
        if (b.avgReport !== a.avgReport) return b.avgReport - a.avgReport;
        if (b.achPoints !== a.achPoints) return b.achPoints - a.achPoints;
        return new Date(a.student.created_at).getTime() - new Date(b.student.created_at).getTime();
      });

      let acceptedCount = 0;
      applicants.forEach((app, idx) => {
        const rank = idx + 1;
        app.choice1Rank = rank;
        if (rank <= major.quota) {
          app.choice1Status = 'accepted';
          app.choice2Status = 'not_applicable';
          app.finalAcceptedMajor = major;
          app.finalAcceptedFromPriority = 1;
          acceptedCount++;
        } else {
          app.choice1Status = 'rejected';
        }
      });
      ch1AcceptedCounts.set(major.id, acceptedCount);
    });

    // 3. TAHAP 2: Ranking seluruh pemilih Pilihan 2 dan alokasi sisa kuota
    activeMajors.forEach((major) => {
      const acceptedFromCh1 = ch1AcceptedCounts.get(major.id) || 0;
      const sisaKuota = Math.max(0, major.quota - acceptedFromCh1);

      // A. Berikan peringkat Pilihan 2 kepada SELURUH siswa yang memilih jurusan ini sebagai Pilihan 2
      const allChoice2Applicants = evaluatedPool.filter(
        (item) => item.ch2Major && item.ch2Major.id === major.id
      );

      allChoice2Applicants.sort((a, b) => {
        if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
        if (b.avgReport !== a.avgReport) return b.avgReport - a.avgReport;
        if (b.achPoints !== a.achPoints) return b.achPoints - a.achPoints;
        return new Date(a.student.created_at).getTime() - new Date(b.student.created_at).getTime();
      });

      allChoice2Applicants.forEach((app, idx) => {
        app.choice2Rank = idx + 1;
      });

      // B. Siswa yang qualify untuk alokasi sisa kuota (choice1_status = 'rejected')
      const stage2Candidates = allChoice2Applicants.filter(
        (item) => item.choice1Status === 'rejected'
      );

      stage2Candidates.forEach((app, idx) => {
        const stage2Rank = idx + 1;
        app.choice2Stage2Rank = stage2Rank;
        if (sisaKuota > 0 && stage2Rank <= sisaKuota) {
          app.choice2Status = 'accepted';
          app.finalAcceptedMajor = major;
          app.finalAcceptedFromPriority = 2;
        } else {
          app.choice2Status = 'rejected';
        }
      });
    });

    // 4. Tentukan final status & ringkasan agregat
    let totalAcceptedCh1 = 0;
    let totalAcceptedCh2 = 0;
    let totalRejected = 0;

    const allRankedResults: RankedCandidate[] = evaluatedPool.map((item) => {
      const isAcceptedCh1 = item.choice1Status === 'accepted';
      const isAcceptedCh2 = item.choice2Status === 'accepted';

      let status: StudentStatus = 'Tidak Diterima';
      if (isAcceptedCh1 || isAcceptedCh2) {
        status = 'Diterima';
      }

      if (isAcceptedCh1) totalAcceptedCh1++;
      else if (isAcceptedCh2) totalAcceptedCh2++;
      else totalRejected++;

      const allocatedMajor = item.finalAcceptedMajor || item.ch1Major;
      const choiceOrder = item.finalAcceptedFromPriority || 1;

      return {
        student: item.student,
        rank: isAcceptedCh2 ? (item.choice2Rank || 1) : item.choice1Rank,
        score: item.totalScore,
        reportScoreAvg: item.avgReport,
        achievementPoints: item.achPoints,
        choice1Major: item.ch1Major,
        choice1Rank: item.choice1Rank,
        choice1Status: item.choice1Status,
        choice2Major: item.ch2Major,
        choice2Rank: item.choice2Rank,
        choice2Stage2Rank: item.choice2Stage2Rank,
        choice2Status: item.choice2Status,
        finalAcceptedMajor: item.finalAcceptedMajor,
        finalAcceptedFromPriority: item.finalAcceptedFromPriority,
        status,
        allocatedMajor,
        choiceOrder,
        isChoice2Allocation: item.finalAcceptedFromPriority === 2,
      };
    });

    // 5. Susun kelompok per jurusan untuk tab tampilan
    const groups: Record<string, MajorSelectionGroup> = {};
    activeMajors.forEach((m) => {
      const acceptedFromCh1 = ch1AcceptedCounts.get(m.id) || 0;
      const remainingQuota = Math.max(0, m.quota - acceptedFromCh1);

      groups[m.id] = {
        major: m,
        quota: m.quota,
        remainingQuota,
        totalApplicants: 0,
        choice1ApplicantsCount: 0,
        choice2ApplicantsCount: 0,
        acceptedCount: 0,
        acceptedCh1Count: 0,
        acceptedCh2Count: 0,
        rejectedCount: 0,
        candidates: [],
        choice1Candidates: [],
        choice2Candidates: [],
      };
    });

    allRankedResults.forEach((cand) => {
      // 1. Masukkan siswa ke grup jurusan Pilihan 1
      if (groups[cand.choice1Major.id]) {
        const grp = groups[cand.choice1Major.id];
        grp.candidates.push(cand);
        grp.choice1Candidates.push(cand);
        grp.totalApplicants++;
        grp.choice1ApplicantsCount++;
        if (cand.status === 'Diterima' && cand.finalAcceptedMajor?.id === cand.choice1Major.id) {
          grp.acceptedCount++;
          grp.acceptedCh1Count++;
        } else if (cand.status === 'Tidak Diterima') {
          grp.rejectedCount++;
        }
      }

      // 2. Masukkan siswa ke grup jurusan Pilihan 2 (jika memilih jurusan kedua yang berbeda)
      if (cand.choice2Major && groups[cand.choice2Major.id] && cand.choice2Major.id !== cand.choice1Major.id) {
        const grp = groups[cand.choice2Major.id];
        grp.candidates.push(cand);
        grp.choice2Candidates.push(cand);
        grp.totalApplicants++;
        grp.choice2ApplicantsCount++;
        if (cand.status === 'Diterima' && cand.finalAcceptedMajor?.id === cand.choice2Major.id) {
          grp.acceptedCount++;
          grp.acceptedCh2Count++;
        }
      }
    });

    // Urutkan kandidat dalam masing-masing grup
    Object.values(groups).forEach((grp) => {
      // Urutkan kandidat umum: Yang diterima di jurusan ini di atas, lalu skor DESC
      grp.candidates.sort((a, b) => {
        const aAcceptedHere = a.status === 'Diterima' && a.finalAcceptedMajor?.id === grp.major.id;
        const bAcceptedHere = b.status === 'Diterima' && b.finalAcceptedMajor?.id === grp.major.id;
        if (aAcceptedHere && !bAcceptedHere) return -1;
        if (!aAcceptedHere && bAcceptedHere) return 1;
        if (b.score !== a.score) return b.score - a.score;
        return a.choice1Rank - b.choice1Rank;
      });

      // Urutkan pemilih Pilihan 1 berdasarkan peringkat Pilihan 1
      grp.choice1Candidates.sort((a, b) => a.choice1Rank - b.choice1Rank);

      // Urutkan pemilih Pilihan 2 berdasarkan peringkat Pilihan 2
      grp.choice2Candidates.sort((a, b) => (a.choice2Rank || 999) - (b.choice2Rank || 999));
    });

    const summary: SelectionSummary = {
      totalProcessed: evaluatedPool.length,
      totalAcceptedChoice1: totalAcceptedCh1,
      totalAcceptedChoice2: totalAcceptedCh2,
      totalRejected,
    };

    return {
      groups: Object.values(groups),
      allCandidates: allRankedResults,
      summary,
    };
  },

  /**
   * Execute 2-stage Selection Process via Backend RPC or Local Fallback
   */
  async executeTwoStageSelection(): Promise<{
    success: boolean;
    summary?: SelectionSummary;
    error?: string;
  }> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.rpc('run_selection_process');
        if (error) throw error;
        
        return {
          success: true,
          summary: {
            totalProcessed: data.total_processed,
            totalAcceptedChoice1: data.total_accepted_choice_1,
            totalAcceptedChoice2: data.total_accepted_choice_2,
            totalRejected: data.total_rejected,
            publishedAt: data.published_at,
          },
        };
      } catch (err: any) {
        console.error('Error executing PostgreSQL RPC run_selection_process:', err);
        // Fallback to local simulation and save
      }
    }

    // Local / Offline Execution fallback
    try {
      const sim = await this.runSelectionSimulation();
      await this.publishSelectionResults(sim.allCandidates);
      return {
        success: true,
        summary: sim.summary,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Gagal menjalankan proses seleksi.',
      };
    }
  },

  /**
   * Publish official selection results to database
   */
  async publishSelectionResults(
    candidates: RankedCandidate[]
  ): Promise<{ success: boolean; error?: string }> {
    const now = new Date().toISOString();

    if (!isSupabaseConfigured()) {
      candidates.forEach((item) => {
        const idx = mockStudentStore.findIndex((s) => s.id === item.student.id);
        if (idx !== -1) {
          mockStudentStore[idx].status = item.status;
          mockStudentStore[idx].total_score = item.score;
          mockStudentStore[idx].updated_at = now;
          
          mockStudentStore[idx].selection_results = {
            id: `sel-${item.student.id}`,
            student_id: item.student.id,
            major_id: item.finalAcceptedMajor?.id || null,
            choice1_major_id: item.choice1Major.id,
            choice1_rank: item.choice1Rank,
            choice1_status: item.choice1Status,
            choice2_major_id: item.choice2Major?.id || null,
            choice2_rank: item.choice2Rank,
            choice2_status: item.choice2Status,
            final_accepted_major_id: item.finalAcceptedMajor?.id || null,
            final_accepted_from_priority: item.finalAcceptedFromPriority,
            score: item.score,
            rank: item.rank,
            status: item.status as any,
            published_at: now,
            notes: item.finalAcceptedFromPriority === 1
              ? `Lolos Seleksi Pilihan 1 (${item.choice1Major.name})`
              : item.finalAcceptedFromPriority === 2
              ? `Lolos Seleksi Pilihan 2 (${item.choice2Major?.name})`
              : 'Belum memenuhi batas kuota penerimaan pada kedua pilihan',
            created_at: now,
            updated_at: now,
          };
        }
      });
      return { success: true };
    }

    try {
      // Update students table status & upsert selection_results with full 2-stage details
      for (const item of candidates) {
        await supabase
          .from('students')
          .update({
            status: item.status,
            total_score: item.score,
            updated_at: now,
          })
          .eq('id', item.student.id);

        const notes = item.finalAcceptedFromPriority === 1
          ? `Lolos Seleksi Pilihan 1 (${item.choice1Major.name})`
          : item.finalAcceptedFromPriority === 2
          ? `Lolos Seleksi Pilihan 2 (${item.choice2Major?.name})`
          : 'Belum memenuhi batas kuota penerimaan pada kedua pilihan';

        await supabase
          .from('selection_results')
          .upsert(
            {
              student_id: item.student.id,
              major_id: item.finalAcceptedMajor?.id || null,
              choice1_major_id: item.choice1Major.id,
              choice1_rank: item.choice1Rank,
              choice1_status: item.choice1Status,
              choice2_major_id: item.choice2Major?.id || null,
              choice2_rank: item.choice2Rank,
              choice2_status: item.choice2Status,
              final_accepted_major_id: item.finalAcceptedMajor?.id || null,
              final_accepted_from_priority: item.finalAcceptedFromPriority,
              score: item.score,
              rank: item.rank,
              status: item.status as any,
              notes,
              published_at: now,
              updated_at: now,
            },
            { onConflict: 'student_id' }
          );
      }

      return { success: true };
    } catch (err: any) {
      console.error('Error publishing selection results:', err);
      return { success: false, error: err.message || 'Gagal mempublikasikan hasil seleksi.' };
    }
  },
};

