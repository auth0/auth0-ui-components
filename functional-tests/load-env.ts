import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { config as loadEnv } from 'dotenv';

// Must be the first import in playwright.config.ts — ESM evaluates imports in
// declaration order, so this populates process.env before any other module reads it.
loadEnv({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '.env') });
