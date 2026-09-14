import { describe, it, expect } from 'vitest';
import {
  personalDataSchema,
  majorChoiceSchema,
  reportScoresSchema,
  reportScoreItemSchema,
  agreementSchema,
} from './registrationSchema';

describe('registrationSchema validation', () => {
  describe('personalDataSchema', () => {
    const validPersonalData = {
      full_name: 'Budi Santoso',
      birth_place: 'Jakarta',
      birth_date: '2008-05-15',
      gender: 'Laki-laki',
      religion: 'Islam',
      address: 'Jl. Merdeka No. 10 Jakarta Selatan',
      phone: '081234567890',
      email: 'budi@example.com',
      source_school_name: 'SMP Negeri 1 Jakarta',
      graduation_year: 2024,
    };

    it('validates correct personal data', () => {
      const result = personalDataSchema.safeParse(validPersonalData);
      expect(result.success).toBe(true);
    });

    it('rejects short name', () => {
      const result = personalDataSchema.safeParse({ ...validPersonalData, full_name: 'Al' });
      expect(result.success).toBe(false);
    });

    it('rejects invalid email', () => {
      const result = personalDataSchema.safeParse({ ...validPersonalData, email: 'not-an-email' });
      expect(result.success).toBe(false);
    });

    it('accepts valid 10-digit NISN or empty string', () => {
      expect(personalDataSchema.safeParse({ ...validPersonalData, nisn: '1234567890' }).success).toBe(true);
      expect(personalDataSchema.safeParse({ ...validPersonalData, nisn: '' }).success).toBe(true);
      expect(personalDataSchema.safeParse({ ...validPersonalData, nisn: '12345' }).success).toBe(false);
    });

    it('accepts valid 16-digit NIK or empty string', () => {
      expect(personalDataSchema.safeParse({ ...validPersonalData, nik: '1234567890123456' }).success).toBe(true);
      expect(personalDataSchema.safeParse({ ...validPersonalData, nik: '' }).success).toBe(true);
      expect(personalDataSchema.safeParse({ ...validPersonalData, nik: '123' }).success).toBe(false);
    });
  });

  describe('majorChoiceSchema', () => {
    it('accepts single choice without alternative', () => {
      const result = majorChoiceSchema.safeParse({
        choice_1_major_id: 'major-1',
      });
      expect(result.success).toBe(true);
    });

    it('accepts distinct first and second choices', () => {
      const result = majorChoiceSchema.safeParse({
        choice_1_major_id: 'major-1',
        choice_2_major_id: 'major-2',
      });
      expect(result.success).toBe(true);
    });

    it('rejects identical first and second choices', () => {
      const result = majorChoiceSchema.safeParse({
        choice_1_major_id: 'major-1',
        choice_2_major_id: 'major-1',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('tidak boleh sama');
      }
    });
  });

  describe('reportScoresSchema (Issue 7 fix verification)', () => {
    const createScores = (count: number) => {
      return Array.from({ length: count }, (_, idx) => ({
        semester: (Math.floor(idx / 5) % 5) + 1,
        subject: `Mapel ${idx % 5}`,
        score: 85,
      }));
    };

    it('accepts exactly 25 score items', () => {
      const scores = createScores(25);
      const result = reportScoresSchema.safeParse({ report_scores: scores });
      expect(result.success).toBe(true);
    });

    it('rejects fewer than 25 items (e.g. 24 items)', () => {
      const scores = createScores(24);
      const result = reportScoresSchema.safeParse({ report_scores: scores });
      expect(result.success).toBe(false);
    });

    it('rejects more than 25 items (e.g. 26 items)', () => {
      const scores = createScores(26);
      const result = reportScoresSchema.safeParse({ report_scores: scores });
      expect(result.success).toBe(false);
    });

    it('rejects score outside 0-100 range', () => {
      expect(reportScoreItemSchema.safeParse({ semester: 1, subject: 'Matematika', score: -5 }).success).toBe(false);
      expect(reportScoreItemSchema.safeParse({ semester: 1, subject: 'Matematika', score: 105 }).success).toBe(false);
      expect(reportScoreItemSchema.safeParse({ semester: 1, subject: 'Matematika', score: 100 }).success).toBe(true);
      expect(reportScoreItemSchema.safeParse({ semester: 1, subject: 'Matematika', score: 0 }).success).toBe(true);
    });
  });

  describe('agreementSchema', () => {
    it('requires agreement to be true', () => {
      expect(agreementSchema.safeParse({ agreement: true }).success).toBe(true);
      expect(agreementSchema.safeParse({ agreement: false }).success).toBe(false);
    });
  });
});
