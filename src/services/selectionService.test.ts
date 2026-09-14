import { describe, it, expect, vi, beforeEach } from 'vitest';
import { selectionService } from './selectionService';
import { adminService } from './adminService';
import { Major, StudentCompleteDetail } from '@/types/spmb';

describe('selectionService 2-stage quota algorithm', () => {
  const majorA: Major = {
    id: 'major-a',
    code: 'RPL',
    name: 'Rekayasa Perangkat Lunak',
    description: 'Deskripsi RPL',
    quota: 1, // Only 1 quota
    is_active: true,
    icon: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };

  const majorB: Major = {
    id: 'major-b',
    code: 'TKJ',
    name: 'Teknik Komputer & Jaringan',
    description: 'Deskripsi TKJ',
    quota: 2, // 2 quota
    is_active: true,
    icon: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('correctly executes Stage 1 and Stage 2 overflow with quota clamping (Issue 8)', async () => {
    // Student 1: Choice 1 = Major A, Choice 2 = Major B, Score = 90
    // Student 2: Choice 1 = Major A, Choice 2 = Major B, Score = 80
    // Student 3: Choice 1 = Major B, Choice 2 = none,    Score = 70
    //
    // For Major A (Quota = 1):
    //   - Student 1 has score 90 -> Accepted in Choice 1
    //   - Student 2 has score 80 -> Rejected in Choice 1 -> Moves to Stage 2 for Major B
    //
    // For Major B (Quota = 2):
    //   - Stage 1: Student 3 has score 70 -> Accepted in Choice 1
    //   - Major B Stage 1 accepted = 1, remaining quota (sisaKuota) = 2 - 1 = 1
    //   - Stage 2: Student 2 (rejected from Major A) has score 80 -> Qualifies for Major B remaining quota -> Accepted in Choice 2!
    const mockStudents: StudentCompleteDetail[] = [
      {
        id: 's1',
        registration_number: 'REG-001',
        full_name: 'Siswa Satu',
        average_report_score: 90,
        achievement_score: 0,
        status: 'Terverifikasi',
        created_at: '2026-01-01T00:00:00Z',
        major_choices: [
          { id: 'mc-1', student_id: 's1', major_id: 'major-a', choice_order: 1, created_at: '2026-01-01T00:00:00Z', major: majorA },
          { id: 'mc-2', student_id: 's1', major_id: 'major-b', choice_order: 2, created_at: '2026-01-01T00:00:00Z', major: majorB },
        ],
      },
      {
        id: 's2',
        registration_number: 'REG-002',
        full_name: 'Siswa Dua',
        average_report_score: 80,
        achievement_score: 0,
        status: 'Terverifikasi',
        created_at: '2026-01-01T00:00:00Z',
        major_choices: [
          { id: 'mc-3', student_id: 's2', major_id: 'major-a', choice_order: 1, created_at: '2026-01-01T00:00:00Z', major: majorA },
          { id: 'mc-4', student_id: 's2', major_id: 'major-b', choice_order: 2, created_at: '2026-01-01T00:00:00Z', major: majorB },
        ],
      },
      {
        id: 's3',
        registration_number: 'REG-003',
        full_name: 'Siswa Tiga',
        average_report_score: 70,
        achievement_score: 0,
        status: 'Terverifikasi',
        created_at: '2026-01-01T00:00:00Z',
        major_choices: [
          { id: 'mc-5', student_id: 's3', major_id: 'major-b', choice_order: 1, created_at: '2026-01-01T00:00:00Z', major: majorB },
        ],
      },
    ] as unknown as StudentCompleteDetail[];

    vi.spyOn(adminService, 'getAllMajors').mockResolvedValue([majorA, majorB]);
    vi.spyOn(adminService, 'getAllStudents').mockResolvedValue(mockStudents);

    const result = await selectionService.runSelectionSimulation();

    // Verify Student 1 is accepted at Choice 1 (Major A)
    const s1Result = result.allCandidates.find((c) => c.student.id === 's1');
    expect(s1Result?.choice1Status).toBe('accepted');
    expect(s1Result?.finalAcceptedMajor?.id).toBe('major-a');
    expect(s1Result?.status).toBe('Diterima');
    expect(s1Result?.isChoice2Allocation).toBe(false);

    // Verify Student 2 is rejected at Choice 1 (Major A) and accepted at Choice 2 (Major B)
    const s2Result = result.allCandidates.find((c) => c.student.id === 's2');
    expect(s2Result?.choice1Status).toBe('rejected');
    expect(s2Result?.choice2Status).toBe('accepted');
    expect(s2Result?.finalAcceptedMajor?.id).toBe('major-b');
    expect(s2Result?.status).toBe('Diterima');
    expect(s2Result?.isChoice2Allocation).toBe(true);

    // Verify Student 3 is accepted at Choice 1 (Major B)
    const s3Result = result.allCandidates.find((c) => c.student.id === 's3');
    expect(s3Result?.choice1Status).toBe('accepted');
    expect(s3Result?.finalAcceptedMajor?.id).toBe('major-b');
    expect(s3Result?.status).toBe('Diterima');

    // Summary counts
    expect(result.summary.totalAcceptedChoice1).toBe(2);
    expect(result.summary.totalAcceptedChoice2).toBe(1);
    expect(result.summary.totalRejected).toBe(0);

    // Group verification: Major A remaining quota = 0, Major B remaining quota = 0
    const groupA = result.groups.find((g) => g.major.id === 'major-a');
    expect(groupA?.remainingQuota).toBe(0);
  });
});
