import { describe, it, expect } from 'vitest';

import { formatRelativeTime } from '../common-utils';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Fixed reference "now" so cases stay deterministic. */
const NOW = new Date('2026-06-30T12:00:00Z').getTime();

/** Builds a `from` timestamp that is `elapsedMs` in the past relative to NOW. */
const ago = (elapsedMs: number): number => NOW - elapsedMs;

describe('common-utils', () => {
  describe('formatRelativeTime', () => {
    describe('seconds', () => {
      it('formats a sub-minute elapsed time in seconds', () => {
        expect(formatRelativeTime(ago(30 * SECOND), NOW)).toBe('30 sec ago');
      });

      it('formats zero elapsed time as 0 sec', () => {
        expect(formatRelativeTime(NOW, NOW)).toBe('0 sec ago');
      });

      it('formats 59 seconds as seconds', () => {
        expect(formatRelativeTime(ago(59 * SECOND), NOW)).toBe('59 sec ago');
      });
    });

    describe('minutes', () => {
      it('keeps the seconds when a minute has elapsed', () => {
        expect(formatRelativeTime(ago(MINUTE + 30 * SECOND), NOW)).toBe('1 min 30 sec ago');
      });

      it('omits the seconds on an exact minute boundary', () => {
        expect(formatRelativeTime(ago(2 * MINUTE), NOW)).toBe('2 min ago');
      });

      it('does not round up before a full minute passes', () => {
        // 90s must read as "1 min 30 sec", never "2 min".
        expect(formatRelativeTime(ago(90 * SECOND), NOW)).toBe('1 min 30 sec ago');
      });

      it('formats 59 minutes as minutes', () => {
        expect(formatRelativeTime(ago(59 * MINUTE), NOW)).toBe('59 min ago');
      });
    });

    describe('hours', () => {
      it('keeps the minutes when an hour has elapsed', () => {
        expect(formatRelativeTime(ago(2 * HOUR + 5 * MINUTE), NOW)).toBe('2 hr 5 min ago');
      });

      it('omits the minutes on an exact hour boundary', () => {
        expect(formatRelativeTime(ago(3 * HOUR), NOW)).toBe('3 hr ago');
      });

      it('formats 23 hours as hours', () => {
        expect(formatRelativeTime(ago(23 * HOUR), NOW)).toBe('23 hr ago');
      });
    });

    describe('days', () => {
      it('keeps the hours when a day has elapsed', () => {
        expect(formatRelativeTime(ago(2 * DAY + 3 * HOUR), NOW)).toBe('2 day 3 hr ago');
      });

      it('omits the hours on an exact day boundary', () => {
        expect(formatRelativeTime(ago(5 * DAY), NOW)).toBe('5 day ago');
      });
    });

    describe('future timestamps', () => {
      it('uses a "from now" suffix when the reference is in the future', () => {
        expect(formatRelativeTime(NOW + 45 * SECOND, NOW)).toBe('45 sec from now');
      });

      it('formats compound future durations', () => {
        expect(formatRelativeTime(NOW + MINUTE + 30 * SECOND, NOW)).toBe('1 min 30 sec from now');
      });
    });
  });
});
