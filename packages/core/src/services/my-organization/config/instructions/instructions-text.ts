/**
 * Text helpers for identity provider instruction content.
 * @module instructions-text
 * @internal
 */

/**
 * Matches `{{name}}` and `${name}` placeholders. The API uses `{{companyName}}`
 */
const PLACEHOLDER_PATTERN = /\{\{\s*([A-Za-z_]\w*)\s*\}\}|\$\{\s*([A-Za-z_]\w*)\s*\}/g;

/**
 * Removes the indentation shared by every non-blank line, plus leading and trailing blank lines.
 * @param text - Raw text.
 * @returns Dedented text.
 */
export function dedentText(text: string): string {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');

  while (lines.length && !lines[0]!.trim()) lines.shift();
  while (lines.length && !lines[lines.length - 1]!.trim()) lines.pop();

  const indents = lines
    .filter((line) => line.trim())
    .map((line) => line.match(/^[ \t]*/)![0].length);
  const common = indents.length ? Math.min(...indents) : 0;

  return common ? lines.map((line) => line.slice(common)).join('\n') : lines.join('\n');
}

/**
 * Replaces `{{name}}` / `${name}` placeholders with values. Placeholders without a value are left unchanged.
 * @param text - Text containing placeholders.
 * @param values - Placeholder values by name.
 * @returns Text with placeholders replaced.
 */
export function substitutePlaceholders(
  text: string,
  values: Record<string, string | undefined>,
): string {
  return text.replace(PLACEHOLDER_PATTERN, (match, curly?: string, dollar?: string) => {
    const value = values[(curly ?? dollar)!];
    return value === undefined ? match : value;
  });
}

const SCHEME_PATTERN = /^[a-z][a-z\d+.-]*:/i;

/**
 * Resolves an instruction asset path against the payload `base_url`.
 * @param baseUrl - Payload `base_url`.
 * @param path - Asset path from the instruction content.
 * @returns The absolute URL, or `undefined` when it cannot be used safely.
 */
export function resolveAssetUrl(baseUrl: string | undefined, path: string): string | undefined {
  const trimmed = path.trim();
  if (!trimmed || trimmed.startsWith('//')) return undefined;

  if (SCHEME_PATTERN.test(trimmed)) {
    return toHttpsUrl(trimmed);
  }

  if (!baseUrl || !toHttpsUrl(baseUrl)) return undefined;

  const base = baseUrl.replace(/\/+$/, '');
  const relative = trimmed.replace(/^(\.\/)+/, '').replace(/^\/+/, '');
  return toHttpsUrl(`${base}/${relative}`);
}

/**
 * Parses a URL and keeps it only when it uses `https:`.
 * @param value - Candidate URL.
 * @returns The normalised URL, or `undefined`.
 */
function toHttpsUrl(value: string): string | undefined {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Whether a link points outside the current page (absolute `http:`/`https:` URL).
 * @param href - Link target.
 * @returns `true` for absolute web URLs.
 */
export function isExternalUrl(href: string | undefined): boolean {
  return !!href && /^https?:\/\//i.test(href.trim());
}
