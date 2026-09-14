import { describe, it, expect } from 'vitest';
import {
  computeRegistrationStatus,
  isDateExpiredUtil,
} from './registrationStatus';

describe('registrationStatus', () => {
  describe('isDateExpiredUtil', () => {
    it('returns false for null or empty string', () => {
      expect(isDateExpiredUtil(null)).toBe(false);
      expect(isDateExpiredUtil(undefined)).toBe(false);
      expect(isDateExpiredUtil('')).toBe(false);
    });

    it('returns true for past dates', () => {
      const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();
      expect(isDateExpiredUtil(pastDate)).toBe(true);
    });

    it('returns false for future dates', () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
      expect(isDateExpiredUtil(futureDate)).toBe(false);
    });
  });

  describe('computeRegistrationStatus', () => {
    it('returns open when manual status is open and no close date set', () => {
      const status = computeRegistrationStatus({
        registration_status: 'open',
        registration_close_date: null,
      });

      expect(status.isOpen).toBe(true);
      expect(status.status).toBe('open');
      expect(status.isClosedByDate).toBe(false);
    });

    it('returns closed immediately when manual status is closed', () => {
      const futureDate = new Date(Date.now() + 1000000).toISOString();
      const status = computeRegistrationStatus({
        registration_status: 'closed',
        registration_close_date: futureDate,
      });

      expect(status.isOpen).toBe(false);
      expect(status.status).toBe('closed');
      expect(status.isClosedByDate).toBe(false);
    });

    it('returns closed with isClosedByDate=true when scheduled date has passed', () => {
      const pastDate = new Date(Date.now() - 1000000).toISOString();
      const status = computeRegistrationStatus({
        registration_status: 'open',
        registration_close_date: pastDate,
      });

      expect(status.isOpen).toBe(false);
      expect(status.isClosedByDate).toBe(true);
      expect(status.isDateExpired).toBe(true);
    });

    it('respects authoritative rpcIsOpen override', () => {
      const status = computeRegistrationStatus(
        {
          registration_status: 'open',
          registration_close_date: null,
        },
        false // RPC says closed
      );

      expect(status.isOpen).toBe(false);
    });
  });
});
