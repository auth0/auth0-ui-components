import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const catalog: Record<
  string,
  unknown
> = require('../../packages/core/src/i18n/translations/en-US.json');

function template(key: string): string {
  const value = key.split('.').reduce<unknown>((node, segment) => {
    if (typeof node !== 'object' || node === null) return undefined;
    return (node as Record<string, unknown>)[segment];
  }, catalog);

  if (typeof value !== 'string') {
    throw new TypeError(`Translation key not found or not a string: ${key}`);
  }

  return value;
}

// Resolves a dotted key against the en-US catalog and interpolates params — specs use this instead of hardcoding copy.
export function t(key: string, params: Record<string, string> = {}): string {
  return template(key).replace(/\$\{(\w+)\}/g, (_match, name: string) => params[name] ?? '');
}
