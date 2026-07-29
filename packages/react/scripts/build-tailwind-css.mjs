#!/usr/bin/env node

/**
 * Builds dist/tailwind.css for consumers running their own Tailwind v4 build.
 *
 * Prepends @auth0/universal-components-core's font-sizes.css (resolved via
 * the package export, not a hardcoded relative path) to src/styles/tailwind.css
 * before invoking the Tailwind CLI. A real `@import` of that file here would
 * cause the CLI to strip its @utility rules and the @source directive from
 * the output — verified empirically — so the content is merged as plain text
 * ahead of time instead.
 */

import { execFileSync } from 'child_process';
import fs from 'fs';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(PACKAGE_DIR, 'dist');

const require = createRequire(import.meta.url);
const fontSizesPath = require.resolve('@auth0/universal-components-core/styles/font-sizes.css');
const tailwindEntryPath = path.join(PACKAGE_DIR, 'src/styles/tailwind.css');

const fontSizes = fs.readFileSync(fontSizesPath, 'utf8');
if (!fontSizes.includes('@utility')) {
  throw new Error(`Expected @utility rules in ${fontSizesPath}, got empty or unexpected content.`);
}

const tailwindEntry = fs.readFileSync(tailwindEntryPath, 'utf8');

const mergedPath = path.join(DIST_DIR, 'tailwind.src.css');
const tmpPath = path.join(DIST_DIR, 'tailwind.tmp.css');
const outPath = path.join(DIST_DIR, 'tailwind.css');

const tailwindBin = path.join(PACKAGE_DIR, 'node_modules/.bin/tailwindcss');
const postcssBin = path.join(PACKAGE_DIR, 'node_modules/.bin/postcss');

fs.mkdirSync(DIST_DIR, { recursive: true });
fs.writeFileSync(mergedPath, `${fontSizes}\n${tailwindEntry}`);

try {
  execFileSync(tailwindBin, ['-i', mergedPath, '-o', tmpPath], {
    cwd: PACKAGE_DIR,
    stdio: 'inherit',
  });
  execFileSync(postcssBin, [tmpPath, '-o', outPath, '--no-map'], {
    cwd: PACKAGE_DIR,
    stdio: 'inherit',
  });
} finally {
  fs.rmSync(mergedPath, { force: true });
  fs.rmSync(tmpPath, { force: true });
}
