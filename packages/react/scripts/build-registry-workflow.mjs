#!/usr/bin/env node

/**
 * Registry Build Workflow Script
 *
 * Orchestrates the full registry build pipeline:
 * 1. Reads the core package version to determine the major version
 * 2. Generates registry.json via generate-registry.mjs
 * 3. Validates registry.json via validate-registry.mjs
 * 4. Runs shadcn build to produce versioned output in docs-site/public/r/v{major}/{version}
 * 5. Rewrites @/ alias imports to relative paths so output works without alias config
 * 6. Updates docs-site/public/r/versions.json to point latest/current to the new version
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PACKAGES_DIR = path.resolve(__dirname, '..');
const CORE_PACKAGE_JSON = path.resolve(PACKAGES_DIR, '../core/package.json');
const DOCS_SITE_PUBLIC_R = path.resolve(
  PACKAGES_DIR,
  '../../docs-site/public/r',
);

const MAX_VERSIONS_PER_MAJOR = 5;

const SEMVER_REGEX = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
const CORE_PACKAGE_NAME = '@auth0/universal-components-core';

function getCoreVersion() {
  if (!fs.existsSync(CORE_PACKAGE_JSON)) {
    console.error(`Core package.json not found at ${CORE_PACKAGE_JSON}`);
    process.exit(1);
  }
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(CORE_PACKAGE_JSON, 'utf-8'));
  } catch (error) {
    console.error(`Failed to read or parse core package.json: ${error.message}`);
    process.exit(1);
  }
  const version = pkg.version;
  if (!SEMVER_REGEX.test(version)) {
    console.error(`Invalid semver version "${version}" in core package.json`);
    process.exit(1);
  }
  const major = version.split('.')[0];
  console.log(`Core package version: ${version} (Major: ${major})`);

  // Verify the version is published on npm before proceeding
  console.log(`Verifying ${CORE_PACKAGE_NAME}@${version} is published on npm...`);
  try {
    execSync(`npm view ${CORE_PACKAGE_NAME}@${version} version`, { stdio: 'pipe' });
    console.log(`Confirmed: ${CORE_PACKAGE_NAME}@${version} is available on npm.`);
  } catch {
    console.error(`Version ${version} of ${CORE_PACKAGE_NAME} is not published on npm. Aborting.`);
    process.exit(1);
  }

  return { version, major };
}

function runCommand(command) {
  try {
    console.log(`> ${command}`);
    execSync(command, { stdio: 'inherit', cwd: PACKAGES_DIR });
  } catch (error) {
    console.error(`Command failed: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

/**
 * Flatten the latest versioned component JSONs to the root r/ directory
 * for official shadcn registry compliance (flat structure, no subdirectories).
 *
 * For each component JSON in the versioned build output:
 *   - Strips the category prefix from the "name" field
 *     (e.g. "my-account/user-mfa-management" → "user-mfa-management")
 *   - Writes the modified JSON to docs-site/public/r/{component-name}.json
 *
 * Also regenerates docs-site/public/r/index.json with the flat names so that
 * the shadcn CLI registry index is spec-compliant.
 */
function flattenRegistryToRoot(versionedDir, rootRDir, sourceRegistryPath) {
  // Recursively collect all .json files, skipping registry.json
  function collectComponentJsonFiles(dir, results = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        collectComponentJsonFiles(fullPath, results);
      } else if (
        entry.isFile() &&
        entry.name.endsWith('.json') &&
        entry.name !== 'registry.json'
      ) {
        results.push(fullPath);
      }
    }
    return results;
  }

  const componentFiles = collectComponentJsonFiles(versionedDir);
  let copied = 0;

  for (const sourcePath of componentFiles) {
    let content;
    try {
      content = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'));
    } catch (error) {
      console.error(`Failed to parse component JSON ${sourcePath}: ${error.message}`);
      process.exit(1);
    }
    const originalName = content.name || '';

    // Strip category prefix: "my-account/user-mfa-management" → "user-mfa-management"
    const flatName = path.posix.basename(originalName);
    content.name = flatName;

    const destPath = path.join(rootRDir, `${flatName}.json`);
    fs.writeFileSync(destPath, JSON.stringify(content, null, 2) + '\n', 'utf-8');
    console.log(`  ${originalName} → ${flatName}.json`);
    copied++;
  }

  console.log(`Flattened ${copied} component(s) to ${rootRDir}`);

  // Regenerate index.json with flat names sourced from the generated registry.json
  const indexJsonPath = path.join(rootRDir, 'index.json');
  const indexData = {
    name: 'auth0-ui-components',
    homepage: 'https://github.com/auth0/auth0-ui-components',
    items: [],
  };

  if (fs.existsSync(sourceRegistryPath)) {
    let sourceRegistry;
    try {
      sourceRegistry = JSON.parse(fs.readFileSync(sourceRegistryPath, 'utf-8'));
    } catch (error) {
      console.error(`Failed to parse source registry.json: ${error.message}`);
      process.exit(1);
    }
    indexData.name = sourceRegistry.name || indexData.name;
    indexData.homepage = sourceRegistry.homepage || indexData.homepage;
    indexData.items = (sourceRegistry.items || []).map((item) => ({
      name: path.posix.basename(item.name),
      type: item.type,
      title: item.title,
      description: item.description,
    }));
  }

  fs.writeFileSync(indexJsonPath, JSON.stringify(indexData, null, 2) + '\n', 'utf-8');
  console.log(`Updated index.json with ${indexData.items.length} flat item(s)`);
}

async function main() {
  console.log('Starting Registry Build Workflow...\n');

  // 1. Get core version
  const { version, major } = getCoreVersion();
  const versionedOutputDir = path.join(DOCS_SITE_PUBLIC_R, `v${major}`, version);

  // 2. Generate registry
  console.log('\n--- Step 1: Generate registry ---');
  runCommand('node scripts/generate-registry.mjs');

  // 3. Validate registry
  console.log('\n--- Step 2: Validate registry ---');
  runCommand('node scripts/validate-registry.mjs');

  // 4. Build registry with shadcn
  console.log(`\n--- Step 3: Build registry to ${versionedOutputDir} ---`);

  // Ensure output directory exists
  if (!fs.existsSync(versionedOutputDir)) {
    console.log(`Creating directory: ${versionedOutputDir}`);
    fs.mkdirSync(versionedOutputDir, { recursive: true });
  }

  // Pre-create subdirectories based on registry items (shadcn requires these to exist)
  const registryPath = path.join(PACKAGES_DIR, 'registry.json');
  if (fs.existsSync(registryPath)) {
    let registry;
    try {
      registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
    } catch (error) {
      console.error(`Failed to parse registry.json: ${error.message}`);
      process.exit(1);
    }
    const subdirs = new Set();
    registry.items.forEach((item) => {
      const dirname = path.dirname(item.name);
      if (dirname && dirname !== '.') {
        subdirs.add(dirname);
      }
    });

    subdirs.forEach((subdir) => {
      const subdirPath = path.join(versionedOutputDir, subdir);
      if (!fs.existsSync(subdirPath)) {
        console.log(`Creating subdirectory: ${subdir}`);
        fs.mkdirSync(subdirPath, { recursive: true });
      }
    });
  }

  // Run shadcn build
  runCommand(`pnpm exec shadcn build -o "${versionedOutputDir}"`);

  // 5. Skip @/ alias rewriting — consumers are expected to have the @/ → src/ alias configured
  console.log('\n--- Step 4: Skipping @/ alias rewriting (kept as-is) ---');

  // 6. Flatten latest component JSONs to root r/ for official shadcn registry compliance
  console.log('\n--- Step 5: Flatten latest components to root r/ ---');
  flattenRegistryToRoot(versionedOutputDir, DOCS_SITE_PUBLIC_R, registryPath);

  // 7. Update versions.json
  console.log('\n--- Step 6: Update versions.json ---');
  const versionsJsonPath = path.join(DOCS_SITE_PUBLIC_R, 'versions.json');
  let versionsData = {};
  if (fs.existsSync(versionsJsonPath)) {
    try {
      versionsData = JSON.parse(fs.readFileSync(versionsJsonPath, 'utf-8'));
    } catch (error) {
      console.error(`Failed to parse versions.json: ${error.message}`);
      process.exit(1);
    }
  }

  const status = version.includes('beta') ? 'beta' : 'stable';

  versionsData.name = 'auth0-ui-components';
  versionsData.current = version;
  versionsData.latest = version;
  versionsData.beta = status === 'beta' ? version : (versionsData.beta || null);
  versionsData.stable = status === 'stable' ? version : (versionsData.stable || null);

  if (!versionsData.majorVersions) versionsData.majorVersions = {};
  versionsData.majorVersions[`v${major}`] = {
    latest: version,
    stable: status === 'stable' ? version : (versionsData.majorVersions[`v${major}`]?.stable || null),
    beta: status === 'beta' ? version : (versionsData.majorVersions[`v${major}`]?.beta || null),
  };

  if (!versionsData.versions) versionsData.versions = {};
  versionsData.versions[version] = { status, major };

  // Prune to keep only the last MAX_VERSIONS_PER_MAJOR versions per major and clean up old directories
  const byMajor = {};
  for (const [v, info] of Object.entries(versionsData.versions)) {
    const key = `v${info.major}`;
    if (!byMajor[key]) byMajor[key] = [];
    byMajor[key].push([v, info]);
  }
  for (const [majorKey, entries] of Object.entries(byMajor)) {
    if (entries.length > MAX_VERSIONS_PER_MAJOR) {
      const toRemove = entries.slice(0, entries.length - MAX_VERSIONS_PER_MAJOR);
      for (const [oldVersion, oldInfo] of toRemove) {
        delete versionsData.versions[oldVersion];
        const oldVersionDir = path.join(DOCS_SITE_PUBLIC_R, `v${oldInfo.major}`, oldVersion);
        if (fs.existsSync(oldVersionDir)) {
          fs.rmSync(oldVersionDir, { recursive: true });
          console.log(`Cleaned up old version directory: v${oldInfo.major}/${oldVersion}`);
        }
      }
      console.log(`Pruned ${toRemove.length} old ${majorKey} version(s), keeping last ${MAX_VERSIONS_PER_MAJOR}`);
    }
  }

  fs.writeFileSync(versionsJsonPath, JSON.stringify(versionsData, null, 2) + '\n', 'utf-8');
  console.log(`Updated versions.json: latest=${version}`);

  console.log('\nRegistry workflow completed successfully!');
  console.log(`Output: ${versionedOutputDir}`);
}

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
