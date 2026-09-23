import path from 'path';

/**
 * Resolves segments against base and returns the absolute path only if it stays
 * within base. Returns null if the resolved path would escape the base directory.
 */
export function resolveWithinBase(base: string, ...segments: string[]): string | null {
  const resolved = path.resolve(base, ...segments);
  if (!resolved.startsWith(base + path.sep) && resolved !== base) {
    return null;
  }
  return resolved;
}
