#!/usr/bin/env node

/**
 * Registry Generator Script
 * 
 * This script automatically generates the registry.json file by:
 * 1. Scanning all block components in src/blocks
 * 2. Analyzing imports to determine dependencies (components, hooks, providers, etc.)
 * 3. Extracting npm package dependencies from imports
 * 4. Generating the registry.json structure
 * 
 * Usage:
 *   node generate-registry.mjs              # Generate registry.json
 *   node generate-registry.mjs --interactive # Prompt for metadata input
 *   node generate-registry.mjs --dry-run    # Show what would be generated without writing
 *   node generate-registry.mjs --help       # Show help
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PACKAGES_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(PACKAGES_DIR, 'src');
const BLOCKS_DIR = path.join(SRC_DIR, 'blocks');
const OUTPUT_FILE = path.join(PACKAGES_DIR, 'registry.json');
const PACKAGE_JSON = path.join(PACKAGES_DIR, 'package.json');

// Parse CLI arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isInteractive = args.includes('--interactive') || args.includes('-i');
const showHelp = args.includes('--help') || args.includes('-h');

if (showHelp) {
    console.log(`
Registry Generator for Auth0 UI Components

Usage:
  node generate-registry.mjs [options]

Options:
  --interactive, -i  Prompt for custom metadata for each component
  --dry-run          Show what would be generated without writing to file
  --help, -h         Show this help message

Examples:
  node generate-registry.mjs              Generate registry.json with auto-detected metadata
  node generate-registry.mjs -i           Interactive mode - prompt for custom metadata
  node generate-registry.mjs --dry-run    Preview output without writing
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

/**
 * Prompt user for input
 */
function prompt(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

/**
 * Ask user if they want to customize metadata
 */
async function promptForMetadata(autoDetected, blockName) {
    if (!isInteractive) {
        return autoDetected;
    }

    console.log(`\n   📝 Auto-detected metadata:`);
    console.log(`      Name: ${blockName}`);
    console.log(`      Title: ${autoDetected.title}`);
    console.log(`      Description: ${autoDetected.description || '(none)'}`);

    const customize = await prompt('\n   Customize metadata? (y/N): ');

    if (customize.toLowerCase() !== 'y' && customize.toLowerCase() !== 'yes') {
        return autoDetected;
    }

    const customTitle = await prompt(`   Title [${autoDetected.title}]: `);
    const customDescription = await prompt(`   Description [${autoDetected.description || ''}]: `);

    return {
        title: customTitle || autoDetected.title,
        description: customDescription || autoDetected.description,
    };
}

// Type mappings
const TYPE_PATTERNS = {
    'components': 'registry:component',
    'hooks': 'registry:hook',
    'providers': 'registry:file',
    'types': 'registry:file',
    'lib': 'registry:file',
    'hoc': 'registry:file',
    'assets': 'registry:file',
    'styles': 'registry:file',
};

// Read package.json to get dependencies
function getNpmDependencies() {
    const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf-8'));
    return {
        ...pkg.dependencies,
        ...pkg.peerDependencies,
        ...pkg.devDependencies,
    };
}

/**
 * Extract imports from a file
 */
function extractImports(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const imports = new Set();

    // Match ES6 imports: import ... from '...'
    const importRegex = /import\s+(?:(?:(?:[\w*\s{},]*)\s+from\s+)?['"]([^'"]+)['"])/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
        imports.add(match[1]);
    }
    
    // Match dynamic imports: import('...')
    const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    while ((match = dynamicImportRegex.exec(content)) !== null) {
        imports.add(match[1]);
    }
    
    // Match require statements: require('...')
    const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    while ((match = requireRegex.exec(content)) !== null) {
        imports.add(match[1]);
    }

    return Array.from(imports);
}

/**
 * Resolve relative import to actual file path
 */
function resolveImportPath(importPath, fromFile) {
    if (!importPath.startsWith('.')) {
        return null; // External package
    }

    const fromDir = path.dirname(fromFile);
    let resolved = path.resolve(fromDir, importPath);

    // Try adding common extensions
    const extensions = ['.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts'];

    for (const ext of extensions) {
        const testPath = resolved + ext;
        if (fs.existsSync(testPath)) {
            return testPath;
        }
    }

    if (fs.existsSync(resolved)) {
        return resolved;
    }

    return null;
}

/**
 * Recursively collect all file dependencies
 */
function collectFileDependencies(filePath, visited = new Set(), allFiles = new Set()) {
    if (visited.has(filePath) || !filePath || !fs.existsSync(filePath)) {
        return allFiles;
    }

    visited.add(filePath);

    // Only include files from src directory
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
 * Extract npm package dependencies from imports
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
        // Check if it's an external package (not starting with . or /)
        if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
            // Extract package name (handle scoped packages)
            let pkgName = importPath;
            if (importPath.startsWith('@')) {
                // Scoped package: @scope/package
                const parts = importPath.split('/');
                pkgName = `${parts[0]}/${parts[1]}`;
            } else {
                // Regular package: package or package/subpath
                pkgName = importPath.split('/')[0];
            }

            // Only add if it's in our dependencies
            if (availableDeps[pkgName]) {
                npmDeps.add(pkgName);
            }
        } else {
            // Recurse into local imports
            const resolved = resolveImportPath(importPath, filePath);
            if (resolved && resolved.startsWith(SRC_DIR)) {
                const nestedDeps = extractNpmDependencies(resolved, visited);
                nestedDeps.forEach(dep => npmDeps.add(dep));
            }
        }
    }

    return npmDeps;
}

/**
 * Get relative path from src directory
 */
function getRelativePath(filePath) {
    return path.relative(PACKAGES_DIR, filePath);
}

/**
 * Get target path for registry
 */
function getTargetPath(filePath) {
    const relativePath = path.relative(SRC_DIR, filePath);
    return `auth0-ui-components/${relativePath}`;
}

/**
 * Determine file type based on path
 */
function getFileType(filePath) {
    const relativePath = path.relative(SRC_DIR, filePath);

    if (relativePath.startsWith('blocks/')) {
        return 'registry:block';
    }

    for (const [pattern, type] of Object.entries(TYPE_PATTERNS)) {
        if (relativePath.startsWith(pattern + '/')) {
            return type;
        }
    }

    return 'registry:file';
}

/**
 * Find all block files
 */
function findBlockFiles() {
    const blocks = [];

    function scanDirectory(dir) {
        if (!fs.existsSync(dir)) return;

        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                // Skip test directories
                if (entry.name === '__tests__') continue;
                scanDirectory(fullPath);
            } else if (entry.isFile() && /\.tsx$/.test(entry.name) && !entry.name.endsWith('.test.tsx')) {
                // Only include .tsx files (not .ts) to get actual components
                blocks.push(fullPath);
            }
        }
    }

    scanDirectory(BLOCKS_DIR);
    return blocks;
}

/**
 * Extract metadata from block file
 */
function extractBlockMetadata(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');

    let title = '';
    let description = '';

    // Try to extract JSDoc comments
    const jsdocMatch = content.match(/\/\*\*\s*\n((?:[^*]|\*(?!\/))*)\*\//);

    if (jsdocMatch) {
        const jsdocContent = jsdocMatch[1];
        const lines = jsdocContent.split('\n').map(line => line.replace(/^\s*\*\s?/, '').trim()).filter(Boolean);

        // First non-empty line is usually the title/summary
        if (lines.length > 0) {
            title = lines[0];
        }

        // Following lines before @ tags are the description
        const descLines = [];
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].startsWith('@') || lines[i].startsWith('-')) break;
            if (lines[i]) descLines.push(lines[i]);
        }
        if (descLines.length > 0) {
            description = descLines.join(' ');
        }
    }

    // Extract component name for additional context
    const componentMatch = content.match(/(?:export\s+)?(?:function|const)\s+(\w+)/);
    let componentName = '';
    if (componentMatch) {
        componentName = componentMatch[1].replace(/Component$/, '');
    }

    // Fallback: use filename to generate title
    if (!title) {
        const basename = path.basename(filePath, path.extname(filePath));
        title = basename
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    // If no description, create a generic one based on the component name
    if (!description && componentName) {
        description = `A block component for ${componentName.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}.`;
    }

    return { title, description };
}

/**
 * Generate registry item for a block
 */
async function generateBlockItem(blockFilePath) {
    const relativePath = path.relative(BLOCKS_DIR, blockFilePath);
    const pathParts = relativePath.split(path.sep);

    // Generate block name from path - simplified to match manual naming
    // e.g., my-account/mfa/user-mfa-management.tsx -> my-account/user-mfa-management
    // Remove the intermediate folder (mfa, domain-management, etc.) to keep names cleaner
    let blockName;
    if (pathParts.length > 2) {
        // Has intermediate folders: my-account/mfa/file.tsx -> my-account/file
        blockName = `${pathParts[0]}/${path.basename(blockFilePath, path.extname(blockFilePath))}`;
    } else {
        // Direct: my-account/file.tsx -> my-account/file
        blockName = pathParts.slice(0, -1).concat([path.basename(blockFilePath, path.extname(blockFilePath))]).join('/');
    }

    // Extract metadata
    const autoMetadata = extractBlockMetadata(blockFilePath);

    // Prompt for custom metadata if in interactive mode
    const { title, description } = await promptForMetadata(autoMetadata, blockName);

    // Collect all file dependencies
    const visited = new Set();
    const allFiles = new Set();
    collectFileDependencies(blockFilePath, visited, allFiles);
    
    // Also add common infrastructure files that are always needed
    const infrastructureFiles = [
        // Providers
        path.join(SRC_DIR, 'providers/proxy-provider.tsx'),
        path.join(SRC_DIR, 'providers/scope-manager-provider.tsx'),
        path.join(SRC_DIR, 'providers/spa-provider.tsx'),
        path.join(SRC_DIR, 'providers/theme-provider.tsx'),
        // HOC
        path.join(SRC_DIR, 'hoc/with-services.tsx'),
        // Styles
        path.join(SRC_DIR, 'styles/globals.css'),
        path.join(SRC_DIR, 'styles/font-sizes.css'),
        path.join(SRC_DIR, 'styles/dark.css'),
        path.join(SRC_DIR, 'styles/light.css'),
        path.join(SRC_DIR, 'styles/themes/default.css'),
        path.join(SRC_DIR, 'styles/themes/minimal.css'),
        path.join(SRC_DIR, 'styles/themes/rounded.css'),
        // Common index files that export from subdirectories
        path.join(SRC_DIR, 'hooks/index.ts'),
        path.join(SRC_DIR, 'types/auth-types.ts'),
        path.join(SRC_DIR, 'types/i18n-types.ts'),
    ];
    
    // Add index files for any directories we're using
    const usedDirs = new Set();
    allFiles.forEach(file => {
        const relativePath = path.relative(SRC_DIR, file);
        const parts = relativePath.split(path.sep);
        // For paths like hooks/my-account/mfa/use-mfa.ts
        // Add hooks/my-account/mfa/index.ts, hooks/my-account/index.ts
        for (let i = 1; i < parts.length; i++) {
            const dirPath = parts.slice(0, i).join(path.sep);
            usedDirs.add(dirPath);
        }
    });
    
    // Add index files for all used directories
    usedDirs.forEach(dir => {
        const indexTs = path.join(SRC_DIR, dir, 'index.ts');
        const indexTsx = path.join(SRC_DIR, dir, 'index.tsx');
        if (fs.existsSync(indexTs)) {
            infrastructureFiles.push(indexTs);
        }
        if (fs.existsSync(indexTsx)) {
            infrastructureFiles.push(indexTsx);
        }
    });
    
    // Add infrastructure files if they exist and collect their dependencies
    infrastructureFiles.forEach(file => {
        if (fs.existsSync(file)) {
            collectFileDependencies(file, visited, allFiles);
        }
    });
    
    const sortedFiles = Array.from(allFiles).sort();

    // Sort files in a logical order: block, components, hooks, providers, types, lib, assets, hoc, styles
    const fileOrder = ['blocks/', 'components/', 'hooks/', 'providers/', 'types/', 'lib/', 'assets/', 'hoc/', 'styles/'];
    const orderedFiles = sortedFiles.sort((a, b) => {
        const relA = path.relative(SRC_DIR, a);
        const relB = path.relative(SRC_DIR, b);

        const orderA = fileOrder.findIndex(prefix => relA.startsWith(prefix));
        const orderB = fileOrder.findIndex(prefix => relB.startsWith(prefix));

        if (orderA !== orderB) {
            return orderA - orderB;
        }
        return relA.localeCompare(relB);
    });

    // Generate file entries
    const files = orderedFiles.map(filePath => ({
        path: getRelativePath(filePath),
        type: getFileType(filePath),
        target: getTargetPath(filePath),
    }));

    // Extract npm dependencies from the block file and all infrastructure files
    const npmDeps = extractNpmDependencies(blockFilePath);
    
    // Also extract dependencies from all infrastructure files (providers, styles, hoc)
    for (const file of allFiles) {
        const fileDeps = extractNpmDependencies(file, new Set());
        fileDeps.forEach(dep => npmDeps.add(dep));
    }
    
    // If using sonner package, also include the UI wrapper (add to files)
    if (npmDeps.has('sonner')) {
        const sonnerComponent = path.join(SRC_DIR, 'components/ui/sonner.tsx');
        if (fs.existsSync(sonnerComponent) && !files.some(f => f.path === getRelativePath(sonnerComponent))) {
            files.push({
                path: getRelativePath(sonnerComponent),
                type: getFileType(sonnerComponent),
                target: getTargetPath(sonnerComponent),
            });
            // Also add to allFiles for dependency extraction
            collectFileDependencies(sonnerComponent, new Set(), allFiles);
        }
    }
    
    // If using certain hooks, ensure their initialization hooks are included
    if (files.some(f => f.path.includes('use-core-client.ts'))) {
        const initHook = path.join(SRC_DIR, 'hooks/use-core-client-initialization.ts');
        if (fs.existsSync(initHook) && !files.some(f => f.path === getRelativePath(initHook))) {
            files.push({
                path: getRelativePath(initHook),
                type: getFileType(initHook),
                target: getTargetPath(initHook),
            });
        }
    }
    
    // Filter out peer dependencies (users already have these)
    // and build tools/dev-only packages
    const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf-8'));
    const peerDeps = new Set(Object.keys(pkg.peerDependencies || {}));
    // Allow react-hook-form to be included causing it to be installed when adding the component
    if (peerDeps.has('react-hook-form')) {
        peerDeps.delete('react-hook-form');
    }

    const buildTools = new Set(['tailwindcss', '@tailwindcss/cli', 'typescript', 'tsup', 'vite', 'vitest']);
    const excludedPackages = new Set(['@auth0/universal-components-core']);
    
    const dependencies = Array.from(npmDeps)
        .filter(dep => !peerDeps.has(dep) && !buildTools.has(dep) && !excludedPackages.has(dep))
        .sort();

    return {
        name: blockName,
        type: 'registry:block',
        title,
        description,
        files,
        dependencies,
    };
}

/**
 * Main function to generate registry
 */
async function generateRegistry() {
    console.log('🔍 Scanning for blocks...');
    const blockFiles = findBlockFiles();
    console.log(`✅ Found ${blockFiles.length} block(s)`);

    if (isInteractive) {
        console.log('\n💡 Interactive mode enabled - you can customize metadata for each component\n');
    }

    const items = [];

    for (const blockFile of blockFiles) {
        console.log(`📦 Processing: ${path.relative(PACKAGES_DIR, blockFile)}`);
        try {
            const item = await generateBlockItem(blockFile);
            items.push(item);
            console.log(`   ├─ Files: ${item.files.length}`);
            console.log(`   └─ Dependencies: ${item.dependencies.length}`);
        } catch (error) {
            console.error(`   ❌ Error processing ${blockFile}:`, error.message);
        }
    }

    // Close readline interface if it was created
    if (rl) {
        rl.close();
    }

    // Create registry structure
    const registry = {
        $schema: 'https://ui.shadcn.com/schema/registry.json',
        name: 'auth0-ui-components',
        homepage: 'https://github.com/auth0/auth0-ui-components',
        items,
    };

    if (isDryRun) {
        console.log('\n📋 Dry run mode - showing first item:');
        console.log(JSON.stringify(items[0], null, 2));
        console.log(`\n... and ${items.length - 1} more items`);
        console.log(`\n✅ Registry would have ${items.length} items`);
    } else {
        // Write to file
        console.log(`\n📝 Writing registry to ${path.relative(PACKAGES_DIR, OUTPUT_FILE)}...`);
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(registry, null, 2) + '\n', 'utf-8');
        console.log('✅ Registry generated successfully!');
        console.log(`   Total items: ${items.length}`);
    }
}

// Run the generator
(async () => {
    try {
        await generateRegistry();
    } catch (error) {
        console.error('❌ Error generating registry:', error);
        process.exit(1);
    }
})();
