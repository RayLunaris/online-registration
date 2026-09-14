import { describe, it, expect } from 'vitest';
import { resolveChoiceStatuses } from './resolveChoiceStatuses';
import { StudentCompleteDetail, Major } from '@/types/spmb';

describe('resolveChoiceStatuses', () => {
  const majorA: Major = {
    id: 'major-a',
    code: 'RPL',
    name: 'Rekayasa Perangkat Lunak',
    description: 'Deskripsi RPL',
    quota: 50,
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
    quota: 50,
    is_active: true,
    icon: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };

  const baseStudent: StudentCompleteDetail = {
    id: 'student-1',
    registration_number: 'REG-2026-001',
    full_name: 'Calon Siswa Teladan',
    status: 'Diterima',
    created_at: new Date().toISOString(),
    major_choices: [
      { id: 'mc-1', student_id: 'student-1', major_id: 'major-a', choice_order: 1, created_at: '2026-01-01T00:00:00Z', major: majorA },
      { id: 'mc-2', student_id: 'student-1', major_id: 'major-b', choice_order: 2, created_at: '2026-01-01T00:00:00Z', major: majorB },
    ],
  } as unknown as StudentCompleteDetail;

  it('resolves acceptance on choice 1 correctly when finalAcceptedMajor is choice 1', () => {
    const student: StudentCompleteDetail = {
      ...baseStudent,
      selection_results: {
        id: 'sr-1',
        student_id: 'student-1',
        major_id: 'major-a',
        choice1_major_id: 'major-a',
        final_accepted_major_id: 'major-a',
        choice1_status: 'accepted',
        choice2_status: 'not_applicable',
        rank: 1,
        choice1_rank: 1,
        score: 92,
        is_manual_override: false,
      } as any,
    };

    const resolved = resolveChoiceStatuses(student);
    expect(resolved.ch1Status).toBe('accepted');
    expect(resolved.ch2Status).toBe('not_applicable');
    expect(resolved.isAcceptedChoice1).toBe(true);
    expect(resolved.isAcceptedChoice2).toBe(false);
  });

  it('resolves acceptance on choice 2 (Stage 2 overflow) when rejected from choice 1', () => {
    const student: StudentCompleteDetail = {
      ...baseStudent,
      selection_results: {
        id: 'sr-2',
        student_id: 'student-1',
        major_id: 'major-b',
        choice1_major_id: 'major-a',
        final_accepted_major_id: 'major-b',
        choice1_status: 'rejected',
        choice2_status: 'accepted',
        rank: 2,
        choice1_rank: 60,
        choice2_rank: 2,
        score: 86,
        is_manual_override: false,
      } as any,
    };

    const resolved = resolveChoiceStatuses(student);
    expect(resolved.ch1Status).toBe('rejected');
    expect(resolved.ch2Status).toBe('accepted');
    expect(resolved.isAcceptedChoice1).toBe(false);
    expect(resolved.isAcceptedChoice2).toBe(true);
  });

  it('handles fallback when selection_results is not present (mock/draft mode)', () => {
    const acceptedStudent: StudentCompleteDetail = {
      ...baseStudent,
      status: 'Diterima',
      selection_results: undefined,
    };

    const resolved = resolveChoiceStatuses(acceptedStudent);
    expect(resolved.ch1Status).toBe('accepted');
    expect(resolved.isAcceptedChoice1).toBe(true);

    const rejectedStudent: StudentCompleteDetail = {
      ...baseStudent,
      status: 'Tidak Diterima',
      selection_results: undefined,
    };

    const resolvedRejected = resolveChoiceStatuses(rejectedStudent);
    expect(resolvedRejected.ch1Status).toBe('rejected');
    expect(resolvedRejected.ch2Status).toBe('rejected');
  });

  it('sets choice 2 status to not_applicable when student only registered single choice', () => {
    const singleChoiceStudent: StudentCompleteDetail = {
      ...baseStudent,
      major_choices: [
        { id: 'mc-1', student_id: 'student-1', major_id: 'major-a', choice_order: 1, created_at: '2026-01-01T00:00:00Z', major: majorA },
      ],
      selection_results: undefined,
      status: 'Diterima',
    };

    const resolved = resolveChoiceStatuses(singleChoiceStudent);
    expect(resolved.hasChoice2).toBe(false);
    expect(resolved.ch2Status).toBe('not_applicable');
  });
});
