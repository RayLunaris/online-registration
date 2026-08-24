import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { 
  StudentCompleteDetail, 
  Major, 
  StudentStatus 
} from '@/types/spmb';
import { adminService } from './adminService';

export interface RankedCandidate {
  student: StudentCompleteDetail;
  rank: number;
  score: number;
  reportScoreAvg: number;
  achievementPoints: number;
  allocatedMajor: Major;
  choiceOrder: number;
  status: StudentStatus;
}

export interface MajorSelectionGroup {
  major: Major;
  quota: number;
  totalApplicants: number;
  acceptedCount: number;
  reserveCount: number;
  rejectedCount: number;
  candidates: RankedCandidate[];
}

export const selectionService = {
  /**
   * Run automated scoring & quota ranking simulation
   */
  async runSelectionSimulation(): Promise<{
    groups: MajorSelectionGroup[];
    allCandidates: RankedCandidate[];
  }> {
    const [allStudents, allMajors] = await Promise.all([
      adminService.getAllStudents(),
      adminService.getAllMajors(),
    ]);

    const activeMajors = allMajors.filter((m) => m.is_active);
    const groups: Record<string, MajorSelectionGroup> = {};

    activeMajors.forEach((m) => {
      groups[m.id] = {
        major: m,
        quota: m.quota,
        totalApplicants: 0,
        acceptedCount: 0,
        reserveCount: 0,
        rejectedCount: 0,
        candidates: [],
      };
    });

    // 1. Calculate and standardize scores for all students
    const evaluatedStudents = allStudents.map((student) => {
      const avgReport = Number(student.average_report_score || 0);
      const achPoints = Number(student.achievement_score || 0);
      const totalScore = (avgReport * 0.70) + (achPoints * 0.30);

      const ch1Id = student.major_choices?.find((c) => c.choice_order === 1)?.major_id;
      const ch2Id = student.major_choices?.find((c) => c.choice_order === 2)?.major_id;

      return {
        student,
        avgReport,
        achPoints,
        totalScore,
        ch1Id,
        ch2Id,
      };
    });

    const allRankedResults: RankedCandidate[] = [];

    // 2. Process Round 1: Allocation by Choice 1
    activeMajors.forEach((major) => {
      const applicants = evaluatedStudents
        .filter((s) => s.ch1Id === major.id)
        .sort((a, b) => b.totalScore - a.totalScore);

      const group = groups[major.id];
      group.totalApplicants = applicants.length;

      applicants.forEach((app, idx) => {
        const rank = idx + 1;
        let status: StudentStatus = 'Tidak Diterima';

        if (rank <= major.quota) {
          status = 'Diterima';
          group.acceptedCount++;
        } else if (rank <= major.quota + Math.max(5, Math.floor(major.quota * 0.1))) {
          status = 'Cadangan';
          group.reserveCount++;
        } else {
          status = 'Tidak Diterima';
          group.rejectedCount++;
        }

        const candidate: RankedCandidate = {
          student: app.student,
          rank,
          score: app.totalScore,
          reportScoreAvg: app.avgReport,
          achievementPoints: app.achPoints,
          allocatedMajor: major,
          choiceOrder: 1,
          status,
        };

        group.candidates.push(candidate);
        allRankedResults.push(candidate);
      });
    });

    return {
      groups: Object.values(groups),
      allCandidates: allRankedResults,
    };
  },

  /**
   * Publish official selection results to database
   */
  async publishSelectionResults(
    candidates: RankedCandidate[]
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: true };
    }

    try {
      const now = new Date().toISOString();

      // Update students table status & insert/upsert selection_results
      for (const item of candidates) {
        // 1. Update students table
        await supabase
          .from('students')
          .update({
            status: item.status,
            total_score: item.score,
            updated_at: now,
          })
          .eq('id', item.student.id);

        // 2. Upsert selection_results table
        await supabase
          .from('selection_results')
          .upsert(
            {
              student_id: item.student.id,
              major_id: item.allocatedMajor.id,
              score: item.score,
              rank: item.rank,
              status: item.status as any,
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
