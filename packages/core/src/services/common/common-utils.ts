/**
 * Formats the elapsed time between two timestamps
 * @param from - Reference timestamp (ms).
 * @param now - Current timestamp (ms).
 * @returns A relative-time label.
 */
export const formatRelativeTime = (from: number, now: number): string => {
  const diffMs = now - from;
  const suffix = diffMs >= 0 ? 'ago' : 'from now';
  const totalSeconds = Math.floor(Math.abs(diffMs) / 1000);

  if (totalSeconds < 60) {
    return `${totalSeconds} sec ${suffix}`;
  }

  const totalMinutes = Math.floor(totalSeconds / 60);
  if (totalMinutes < 60) {
    const seconds = totalSeconds % 60;
    return seconds > 0
      ? `${totalMinutes} min ${seconds} sec ${suffix}`
      : `${totalMinutes} min ${suffix}`;
  }

  const totalHours = Math.floor(totalMinutes / 60);
  if (totalHours < 24) {
    const minutes = totalMinutes % 60;
    return minutes > 0 ? `${totalHours} hr ${minutes} min ${suffix}` : `${totalHours} hr ${suffix}`;
  }

  const totalDays = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return hours > 0 ? `${totalDays} day ${hours} hr ${suffix}` : `${totalDays} day ${suffix}`;
};
