import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { getRelativeTimeLabel } from '../helper-utils';

const mockT = ((_key: string, vars?: Record<string, unknown>, fallback?: string): string => {
  const template = fallback ?? '';
  if (!vars) return template;
  return template.replace(/\$\{(\w+)\}/g, (_, name) => String(vars[name] ?? ''));
}) as unknown as Parameters<typeof getRelativeTimeLabel>[1];

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

const NOW = new Date('2026-05-18T12:00:00.000Z').getTime();
const ago = (elapsedMs: number): number => NOW - elapsedMs;

describe('helper-utils', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getRelativeTimeLabel', () => {
    beforeEach(() => {
      vi.spyOn(Date, 'now').mockReturnValue(NOW);
    });

    describe('missing or invalid input', () => {
      it('returns "Never" when the timestamp is 0 / falsy', () => {
        expect(getRelativeTimeLabel(0, mockT)).toBe('Never');
      });

      it('returns "Never" for NaN', () => {
        expect(getRelativeTimeLabel(Number.NaN, mockT)).toBe('Never');
      });
    });

    describe('just now', () => {
      it('returns "Just now" when under a minute has elapsed', () => {
        expect(getRelativeTimeLabel(ago(30 * SECOND), mockT)).toBe('Just now');
      });

      it('returns "Just now" at 59 seconds', () => {
        expect(getRelativeTimeLabel(ago(59 * SECOND), mockT)).toBe('Just now');
      });
    });

    describe('minutes', () => {
      it('uses the singular unit at exactly one minute', () => {
        expect(getRelativeTimeLabel(ago(MINUTE), mockT)).toBe('1 minute ago');
      });

      it('uses the plural unit for multiple minutes', () => {
        expect(getRelativeTimeLabel(ago(45 * MINUTE), mockT)).toBe('45 minutes ago');
      });

      it('formats 59 whole minutes as minutes', () => {
        expect(getRelativeTimeLabel(ago(59 * MINUTE), mockT)).toBe('59 minutes ago');
      });

      it('appends trailing seconds as a second unit', () => {
        expect(getRelativeTimeLabel(ago(5 * MINUTE + 30 * SECOND), mockT)).toBe(
          '5 minutes 30 sec ago',
        );
      });

      it('omits seconds when the minute is exact', () => {
        expect(getRelativeTimeLabel(ago(5 * MINUTE), mockT)).toBe('5 minutes ago');
      });
    });

    describe('hours', () => {
      it('uses the singular unit at exactly one hour', () => {
        expect(getRelativeTimeLabel(ago(HOUR), mockT)).toBe('1 hour ago');
      });

      it('uses the plural unit for multiple hours', () => {
        expect(getRelativeTimeLabel(ago(3 * HOUR), mockT)).toBe('3 hours ago');
      });

      it('formats 23 whole hours as hours', () => {
        expect(getRelativeTimeLabel(ago(23 * HOUR), mockT)).toBe('23 hours ago');
      });

      it('appends trailing minutes as a second unit', () => {
        expect(getRelativeTimeLabel(ago(2 * HOUR + 15 * MINUTE), mockT)).toBe(
          '2 hours 15 minutes ago',
        );
      });

      it('ignores seconds once the elapsed time reaches hours', () => {
        expect(getRelativeTimeLabel(ago(HOUR + 30 * SECOND), mockT)).toBe('1 hour ago');
      });
    });

    describe('days', () => {
      it('uses the singular unit at exactly one day', () => {
        expect(getRelativeTimeLabel(ago(DAY), mockT)).toBe('1 day ago');
      });

      it('uses the plural unit for multiple days', () => {
        expect(getRelativeTimeLabel(ago(2 * DAY), mockT)).toBe('2 days ago');
      });

      it('formats 6 whole days as days', () => {
        expect(getRelativeTimeLabel(ago(6 * DAY), mockT)).toBe('6 days ago');
      });

      it('appends trailing hours as a second unit', () => {
        expect(getRelativeTimeLabel(ago(3 * DAY + 4 * HOUR), mockT)).toBe('3 days 4 hours ago');
      });
    });

    describe('weeks', () => {
      it('uses the singular unit at exactly one week', () => {
        expect(getRelativeTimeLabel(ago(WEEK), mockT)).toBe('1 week ago');
      });

      it('uses the plural unit for multiple weeks', () => {
        expect(getRelativeTimeLabel(ago(2 * WEEK), mockT)).toBe('2 weeks ago');
      });
    });

    describe('months', () => {
      it('uses the singular unit at roughly one month (30 days)', () => {
        expect(getRelativeTimeLabel(ago(30 * DAY), mockT)).toBe('1 month ago');
      });

      it('uses the plural unit for multiple months', () => {
        expect(getRelativeTimeLabel(ago(90 * DAY), mockT)).toBe('3 months ago');
      });
    });

    describe('years', () => {
      it('uses the singular unit at roughly one year (365 days)', () => {
        expect(getRelativeTimeLabel(ago(365 * DAY), mockT)).toBe('1 year ago');
      });

      it('uses the plural unit for multiple years', () => {
        expect(getRelativeTimeLabel(ago(730 * DAY), mockT)).toBe('2 years ago');
      });
    });

    it('reads unit labels from the translator rather than the fallback', () => {
      const translate = ((
        key: string,
        _vars?: Record<string, unknown>,
        fallback?: string,
      ): string => {
        const overrides: Record<string, string> = {
          'time.ago': 'il y a',
          'time.hours': 'heures',
        };
        return overrides[key] ?? fallback ?? '';
      }) as unknown as typeof mockT;

      expect(getRelativeTimeLabel(ago(3 * HOUR), translate)).toBe('3 heures il y a');
    });
  });
});
