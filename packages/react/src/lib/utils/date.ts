/**
 * Date formatting utilities.
 * @module date
 * @internal
 */

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

/**
 * @param value - ISO date string or Date object to format
 * @returns Localised date string, or empty string if invalid
 */
export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, DATE_FORMAT_OPTIONS);
}
