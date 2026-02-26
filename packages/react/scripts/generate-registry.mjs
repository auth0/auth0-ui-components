#!/usr/bin/env node

/**
 * Registry Generator Script
 *
 * Automatically generates registry.json by:
 * 1. Scanning block components in src/components/auth0/ (entry points)
 * 2. Recursively analyzing imports to collect all file dependencies
 * 3. Extracting npm package dependencies from import statements
 * 4. Adding @auth0/universal-components-core with the version from the core package
 * 5. Generating the registry.json structure
 *
 * Usage:
 *   node scripts/generate-registry.mjs              # Generate registry.json
 *   node scripts/generate-registry.mjs --interactive # Prompt for metadata input
 *   node scripts/generate-registry.mjs --dry-run     # Preview without writing
 *   node scripts/generate-registry.mjs --help        # Show help
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PACKAGES_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(PACKAGES_DIR, 'src');
const COMPONENTS_AUTH0_DIR = path.join(SRC_DIR, 'components', 'auth0');
const OUTPUT_FILE = path.join(PACKAGES_DIR, 'registry.json');
const PACKAGE_JSON = path.join(PACKAGES_DIR, 'package.json');
const CORE_PACKAGE_JSON = path.resolve(PACKAGES_DIR, '../core/package.json');

// Parse CLI arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isInteractive = args.includes('--interactive') || args.includes('-i');
const showHelp = args.includes('--help') || args.includes('-h');

if (showHelp) {
  console.log(`
Registry Generator for Auth0 UI Components

Usage:
  node scripts/generate-registry.mjs [options]

Options:
  --interactive, -i  Prompt for custom metadata for each component
  --dry-run          Show what would be generated without writing to file
  --help, -h         Show this help message

Examples:
  node scripts/generate-registry.mjs              Generate registry.json with auto-detected metadata
  node scripts/generate-registry.mjs -i           Interactive mode - prompt for custom metadata
  node scripts/generate-registry.mjs --dry-run    Preview output without writing
`);
  process.exit(0);
}

// Create readline interface for interactive mode
let rl = null;
if (isInteractive) {
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function promptForMetadata(autoDetected, blockName) {
  if (!isInteractive) {
    return autoDetected;
  }

  console.log(`\n   Auto-detected metadata:`);
  console.log(`      Name: ${blockName}`);
  console.log(`      Title: ${autoDetected.title}`);
  console.log(`      Description: ${autoDetected.description || '(none)'}`);

  const customize = await prompt('\n   Customize metadata? (y/N): ');

  if (customize.toLowerCase() !== 'y' && customize.toLowerCase() !== 'yes') {
    return autoDetected;
  }

  const customTitle = await prompt(`   Title [${autoDetected.title}]: `);
  const customDescription = await prompt(
    `   Description [${autoDetected.description || ''}]: `,
  );

  return {
    title: customTitle || autoDetected.title,
    description: customDescription || autoDetected.description,
  };
}

// Module-level caches to avoid re-reading files on every call inside loops
let _npmDependenciesCache = null;
let _corePackageVersionCache = null;
let _packageJsonCache = null;

/**
 * Read and cache the raw package.json object.
 */
function getPackageJson() {
  if (_packageJsonCache) return _packageJsonCache;
  try {
    _packageJsonCache = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf-8'));
  } catch (error) {
    console.error(`Failed to read or parse package.json: ${error.message}`);
    process.exit(1);
  }
  return _packageJsonCache;
}

/**
 * Read package.json to get all declared dependencies.
 * Result is cached after the first call.
 */
function getNpmDependencies() {
  if (_npmDependenciesCache) return _npmDependenciesCache;
  const pkg = getPackageJson();
  _npmDependenciesCache = {
    ...pkg.dependencies,
    ...pkg.peerDependencies,
    ...pkg.devDependencies,
  };
  return _npmDependenciesCache;
}

/**
 * Get the core package version from packages/core/package.json.
 * Result is cached after the first call.
 */
function getCorePackageVersion() {
  if (_corePackageVersionCache) return _corePackageVersionCache;
  if (!fs.existsSync(CORE_PACKAGE_JSON)) {
    console.warn(
      '   Warning: Could not find core package.json, using "workspace:*"',
    );
    return 'workspace:*';
  }
  let corePkg;
  try {
    corePkg = JSON.parse(fs.readFileSync(CORE_PACKAGE_JSON, 'utf-8'));
  } catch (error) {
    console.error(`Failed to read or parse core package.json: ${error.message}`);
    process.exit(1);
  }
  _corePackageVersionCache = corePkg.version;
  return _corePackageVersionCache;
}

/**
 * Extract all import paths from a file
 */
function extractImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const imports = new Set();

  // ES6 imports: import ... from '...'
  const importRegex =
    /import\s+(?:(?:(?:[\w*\s{},]*)\s+from\s+)?['"]([^'"]+)['"])/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.add(match[1]);
  }

  // Dynamic imports: import('...')
  const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = dynamicImportRegex.exec(content)) !== null) {
    imports.add(match[1]);
  }

  // Require: require('...')
  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = requireRegex.exec(content)) !== null) {
    imports.add(match[1]);
  }

  return Array.from(imports);
}

/**
 * Resolve an import path to an actual file path.
 * Handles:
 *   - @/ alias (maps to src/)
 *   - Relative imports (./foo, ../bar)
 *   - Extension resolution (.tsx, .ts, .jsx, .js, /index.tsx, /index.ts)
 */
function resolveImportPath(importPath, fromFile) {
  let basePath;

  if (importPath.startsWith('@/')) {
    // Resolve @/ alias to src/
    basePath = path.resolve(SRC_DIR, importPath.slice(2));
  } else if (importPath.startsWith('.')) {
    // Relative import
    const fromDir = path.dirname(fromFile);
    basePath = path.resolve(fromDir, importPath);
  } else {
    // External package - not a local file
    return null;
  }

  // Try adding common extensions
  const extensions = [
    '',
    '.tsx',
    '.ts',
    '.jsx',
    '.js',
    '/index.tsx',
    '/index.ts',
  ];

  for (const ext of extensions) {
    const testPath = basePath + ext;
    if (fs.existsSync(testPath) && fs.statSync(testPath).isFile()) {
      return testPath;
    }
  }

  return null;
}

/**
 * Recursively collect all local file dependencies starting from a file
 */
function collectFileDependencies(
  filePath,
  visited = new Set(),
  allFiles = new Set(),
) {
  if (visited.has(filePath) || !filePath || !fs.existsSync(filePath)) {
    return allFiles;
  }

  visited.add(filePath);

  // Only include files from src directory, skip tests
  if (filePath.startsWith(SRC_DIR) && !filePath.includes('__tests__')) {
    allFiles.add(filePath);
  }

  const imports = extractImports(filePath);

  for (const importPath of imports) {
    const resolved = resolveImportPath(importPath, filePath);
    if (resolved) {
      collectFileDependencies(resolved, visited, allFiles);
    }
  }

  return allFiles;
}

/**
 * Recursively extract npm package dependencies from a file and all its local imports
 */
function extractNpmDependencies(filePath, visited = new Set()) {
  if (visited.has(filePath) || !filePath || !fs.existsSync(filePath)) {
    return new Set();
  }

  visited.add(filePath);
  const npmDeps = new Set();
  const imports = extractImports(filePath);
  const availableDeps = getNpmDependencies();

  for (const importPath of imports) {
    if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
      // External package
      let pkgName = importPath;
      if (importPath.startsWith('@')) {
        // Scoped package: @scope/package/subpath -> @scope/package
        const parts = importPath.split('/');
        pkgName = `${parts[0]}/${parts[1]}`;
      } else {
        // Regular package: package/subpath -> package
        pkgName = importPath.split('/')[0];
      }

      if (availableDeps[pkgName]) {
        npmDeps.add(pkgName);
      }
    } else {
      // Recurse into local imports
      const resolved = resolveImportPath(importPath, filePath);
      if (resolved && resolved.startsWith(SRC_DIR)) {
        const nestedDeps = extractNpmDependencies(resolved, visited);
        nestedDeps.forEach((dep) => npmDeps.add(dep));
      }
    }
  }

  return npmDeps;
}

/**
 * Get relative path from packages/react directory (for registry "path" field)
 */
function getRelativePath(filePath) {
  return path.relative(PACKAGES_DIR, filePath);
}

/**
 * Determine registry file type based on path within src/.
 *
 * All files use registry:component so they resolve against the consumer's
 * components alias — keeping the entire project under one root directory.
 * Block entry points use registry:block.
 */
function getFileType(_filePath, isBlockEntry = false) {
  if (isBlockEntry) {
    return 'registry:block';
  }

  return 'registry:component';
}

/**
 * Get the target install path for a file.
 *
 * Keeps the full path relative to src/ so shadcn installs files into the
 * same folder structure in the consumer's project:
 *
 *     src/components/auth0/shared/header.tsx  -> components/auth0/shared/header.tsx
 *     src/components/ui/button.tsx            -> components/ui/button.tsx
 *     src/hooks/shared/use-theme.ts           -> hooks/shared/use-theme.ts
 *     src/providers/spa-provider.tsx           -> providers/spa-provider.tsx
 *     src/types/auth-types.ts                 -> types/auth-types.ts
 *     src/lib/utils.ts                        -> lib/utils.ts
 *     src/hoc/with-services.tsx               -> hoc/with-services.tsx
 *     src/styles/globals.css                  -> styles/globals.css
 */
function getTargetPath(filePath) {
  // Keep the full path relative to src/ — shadcn resolves targets against
  // the consumer's @/ alias root (src/), so components/auth0/... installs
  // to src/components/auth0/... in the consumer project.
  return path.relative(SRC_DIR, filePath);
}

/**
 * Find all block entry point files.
 * Block entry points are the top-level .tsx files directly inside
 * src/components/auth0/my-account/ and src/components/auth0/my-organization/
 * (not files inside shared/ or __tests__/)
 */
function findBlockFiles() {
  const blocks = [];

  if (!fs.existsSync(COMPONENTS_AUTH0_DIR)) {
    console.error(`Block components directory not found: ${COMPONENTS_AUTH0_DIR}`);
    process.exit(1);
  }

  // Only scan named section directories (my-account, my-organization), skip shared/
  const sections = fs
    .readdirSync(COMPONENTS_AUTH0_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== 'shared');

  for (const section of sections) {
    const sectionPath = path.join(COMPONENTS_AUTH0_DIR, section.name);
    const entries = fs.readdirSync(sectionPath, { withFileTypes: true });

    for (const entry of entries) {
      if (
        entry.isFile() &&
        entry.name.endsWith('.tsx') &&
        !entry.name.endsWith('.test.tsx')
      ) {
        blocks.push(path.join(sectionPath, entry.name));
      }
    }
  }

  return blocks;
}

/**
 * Extract title and description from JSDoc comments or filename
 */
function extractBlockMetadata(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');

  let title = '';
  let description = '';

  // Try to extract JSDoc comments
  const jsdocMatch = content.match(/\/\*\*\s*\n((?:[^*]|\*(?!\/))*)\*\//);

  if (jsdocMatch) {
    const jsdocContent = jsdocMatch[1];
    const lines = jsdocContent
      .split('\n')
      .map((line) => line.replace(/^\s*\*\s?/, '').trim())
      .filter(Boolean);

    if (lines.length > 0) {
      title = lines[0];
    }

    const descLines = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].startsWith('@') || lines[i].startsWith('-')) break;
      if (lines[i]) descLines.push(lines[i]);
    }
    if (descLines.length > 0) {
      description = descLines.join(' ');
    }
  }

  // Extract component name for fallback
  const componentMatch = content.match(
    /(?:export\s+)?(?:function|const)\s+(\w+)/,
  );
  let componentName = '';
  if (componentMatch) {
    componentName = componentMatch[1].replace(/Component$/, '');
  }

  // Fallback: generate title from filename
  if (!title) {
    const basename = path.basename(filePath, path.extname(filePath));
    title = basename
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Fallback: generate description from component name
  if (!description && componentName) {
    description = `A block component for ${componentName.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}.`;
  }

  return { title, description };
}

/**
 * Sort files in logical order: block entry > components > hooks > providers > types > lib > assets > hoc > styles
 */
function sortFilesByCategory(files) {
  const order = [
    'components/auth0/',
    'components/ui/',
    'hooks/',
    'providers/',
    'types/',
    'lib/',
    'assets/',
    'hoc/',
    'styles/',
  ];

  return files.sort((a, b) => {
    const relA = path.relative(SRC_DIR, a);
    const relB = path.relative(SRC_DIR, b);

    const orderA = order.findIndex((prefix) => relA.startsWith(prefix));
    const orderB = order.findIndex((prefix) => relB.startsWith(prefix));

    const idxA = orderA === -1 ? order.length : orderA;
    const idxB = orderB === -1 ? order.length : orderB;

    if (idxA !== idxB) return idxA - idxB;
    return relA.localeCompare(relB);
  });
}

/**
 * Recursively collect all files under a directory, excluding __tests__ folders.
 */
function collectFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '__tests__') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Infrastructure files that are always included for every block
 * (providers, HOC, styles, common type files)
 */
function getInfrastructureFiles() {
  return [
    ...collectFiles(path.join(SRC_DIR, 'providers')),
    ...collectFiles(path.join(SRC_DIR, 'hoc')),
    ...collectFiles(path.join(SRC_DIR, 'styles')),
    // Only top-level type files (exclude block-specific subdirectories and index files)
    ...fs.readdirSync(path.join(SRC_DIR, 'types'), { withFileTypes: true })
      .filter((entry) => entry.isFile() && !entry.name.startsWith('index'))
      .map((entry) => path.join(SRC_DIR, 'types', entry.name)),
  ];
}

/**
 * Generate a single registry item for a block component
 */
async function generateBlockItem(blockFilePath) {
  // Derive block name from path: my-account/user-mfa-management, my-organization/domain-table, etc.
  const section = path.basename(path.dirname(blockFilePath)); // my-account or my-organization
  const filename = path.basename(blockFilePath, path.extname(blockFilePath));
  const blockName = `${section}/${filename}`;

  // Extract metadata
  const autoMetadata = extractBlockMetadata(blockFilePath);
  const { title, description } = await promptForMetadata(
    autoMetadata,
    blockName,
  );

  // Collect all file dependencies from the block entry point
  const visited = new Set();
  const allFiles = new Set();
  collectFileDependencies(blockFilePath, visited, allFiles);

  // Add infrastructure files and collect their transitive dependencies
  const infraFiles = getInfrastructureFiles();
  for (const file of infraFiles) {
    collectFileDependencies(file, visited, allFiles);
  }

  // Sort files in logical order
  const blockEntryPath = blockFilePath;
  const sortedFiles = sortFilesByCategory(Array.from(allFiles));

  // Move the block entry point to the front
  const blockIdx = sortedFiles.indexOf(blockEntryPath);
  if (blockIdx > 0) {
    sortedFiles.splice(blockIdx, 1);
    sortedFiles.unshift(blockEntryPath);
  }

  // Generate file entries for registry
  const files = sortedFiles.map((filePath) => ({
    path: getRelativePath(filePath),
    type: getFileType(filePath, filePath === blockEntryPath),
    target: getTargetPath(filePath),
  }));

  // Extract npm dependencies from all collected files
  const npmDeps = new Set();
  for (const file of allFiles) {
    const fileDeps = extractNpmDependencies(file, new Set());
    fileDeps.forEach((dep) => npmDeps.add(dep));
  }

  // Always include @auth0/universal-components-core with pinned version
  const coreVersion = getCorePackageVersion();
  // Remove bare core package name if it was picked up from imports
  npmDeps.delete('@auth0/universal-components-core');

  // Filter out peer dependencies (users already have these), build tools, and internal packages
  // Re-use the cached package.json — no redundant file read needed here.
  const peerDeps = new Set(Object.keys(getPackageJson().peerDependencies || {}));
  // Keep react-hook-form as it needs to be installed when adding the component
  peerDeps.delete('react-hook-form');

  const buildTools = new Set([
    'tailwindcss',
    '@tailwindcss/cli',
    'typescript',
    'tsup',
    'vite',
    'vitest',
    'shadcn',
  ]);

  const dependencies = Array.from(npmDeps)
    .filter((dep) => !peerDeps.has(dep) && !buildTools.has(dep))
    .sort();

  // Add @auth0/universal-components-core with version at the front
  dependencies.unshift(`@auth0/universal-components-core@${coreVersion}`);

  return {
    name: blockName,
    type: 'registry:block',
    title,
    description,
    dependencies,
    files,
    meta: {
      coreVersion,
    },
  };
}

/**
 * Main function
 */
async function generateRegistry() {
  console.log('Scanning for block components...');
  const blockFiles = findBlockFiles();
  console.log(`Found ${blockFiles.length} block(s):\n`);
  blockFiles.forEach((f) =>
    console.log(`  - ${path.relative(PACKAGES_DIR, f)}`),
  );

  if (isInteractive) {
    console.log(
      '\nInteractive mode: you can customize metadata for each component\n',
    );
  }

  const items = [];

  for (const blockFile of blockFiles) {
    const relPath = path.relative(PACKAGES_DIR, blockFile);
    console.log(`\nProcessing: ${relPath}`);
    try {
      const item = await generateBlockItem(blockFile);
      items.push(item);
      console.log(`  Files: ${item.files.length}`);
      console.log(`  Dependencies: ${item.dependencies.length}`);
      console.log(`  Core version: ${item.meta.coreVersion}`);
    } catch (error) {
      console.error(`  Error processing ${relPath}:`, error.message);
    }
  }

  if (rl) rl.close();

  const registry = {
    $schema: 'https://ui.shadcn.com/schema/registry.json',
    name: 'auth0-universal-components',
    homepage: 'https://github.com/auth0/universal-components-web',
    items,
  };

  if (isDryRun) {
    console.log('\n--- Dry run: preview ---');
    console.log(JSON.stringify(registry, null, 2));
    console.log(`\nRegistry would have ${items.length} items`);
  } else {
    console.log(
      `\nWriting registry to ${path.relative(PACKAGES_DIR, OUTPUT_FILE)}...`,
    );
    fs.writeFileSync(
      OUTPUT_FILE,
      JSON.stringify(registry, null, 2) + '\n',
      'utf-8',
    );
    console.log('Registry generated successfully!');
    console.log(`  Total items: ${items.length}`);
    console.log(
      `  Total unique files: ${new Set(items.flatMap((i) => i.files.map((f) => f.path))).size}`,
    );
  }
}

(async () => {
  try {
    await generateRegistry();
  } catch (error) {
    console.error('Error generating registry:', error);
    process.exit(1);
  }
})();
