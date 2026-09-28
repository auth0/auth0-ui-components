import type { EnhancedTranslationFunction } from '@auth0/universal-components-core';

/**
 * Formats a number using locale-aware digit grouping.
 * @param num - The number to format. Nullish and `NaN` values format as `0`.
 * @param locale - Locale identifier. Defaults to the browser language, or `en-US` outside the browser.
 * @returns The locale-formatted number.
 */
export function formatNumber(num: number | undefined | null, locale?: string): string {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }

  const resolvedLocale =
    locale ?? (typeof navigator !== 'undefined' ? navigator.language : 'en-US');
  return num.toLocaleString(resolvedLocale);
}

/**
 * Formats the elapsed time between two timestamps
 * @param fromTime - The from timestamp
 * @param t - Translator function
 * @returns A human readable relative time label.
 */
export function getRelativeTimeLabel(fromTime: number, t: EnhancedTranslationFunction): string {
  const never = t('time.never', undefined, 'Never');
  const justNow = t('time.just_now', undefined, 'Just now');

  if (!fromTime || Number.isNaN(fromTime)) {
    return never;
  }

  const diffInMs = Date.now() - fromTime;

  if (diffInMs < 60 * 1000) {
    return justNow;
  }

  const unitLabel = (
    count: number,
    singularKey: string,
    pluralKey: string,
    singularFallback: string,
    pluralFallback: string,
  ): string => {
    const unit =
      count === 1
        ? t(`time.${singularKey}`, undefined, singularFallback)
        : t(`time.${pluralKey}`, undefined, pluralFallback);
    return `${count} ${unit}`;
  };

  const join = (primary: string, secondary?: string): string => {
    const value = secondary ? `${primary} ${secondary}` : primary;
    return t('time.ago_template', { value }, '${value} ago');
  };

  const totalSeconds = Math.floor(diffInMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  if (totalMinutes < 60) {
    const seconds = totalSeconds % 60;
    return join(
      unitLabel(totalMinutes, 'minute', 'minutes', 'minute', 'minutes'),
      seconds > 0 ? unitLabel(seconds, 'second', 'seconds', 'sec', 'sec') : undefined,
    );
  }

  if (totalHours < 24) {
    const minutes = totalMinutes % 60;
    return join(
      unitLabel(totalHours, 'hour', 'hours', 'hour', 'hours'),
      minutes > 0 ? unitLabel(minutes, 'minute', 'minutes', 'minute', 'minutes') : undefined,
    );
  }

  if (totalDays < 7) {
    const hours = totalHours % 24;
    return join(
      unitLabel(totalDays, 'day', 'days', 'day', 'days'),
      hours > 0 ? unitLabel(hours, 'hour', 'hours', 'hour', 'hours') : undefined,
    );
  }

  const diffInWeeks = Math.floor(totalDays / 7);
  if (totalDays < 30) {
    return join(unitLabel(diffInWeeks, 'week', 'weeks', 'week', 'weeks'));
  }

  const diffInMonths = Math.floor(totalDays / 30);
  if (totalDays < 365) {
    return join(unitLabel(diffInMonths, 'month', 'months', 'month', 'months'));
  }

  const diffInYears = Math.floor(totalDays / 365);
  return join(unitLabel(diffInYears, 'year', 'years', 'year', 'years'));
}
