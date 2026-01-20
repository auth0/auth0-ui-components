#!/usr/bin/env node

/**
 * Registry Build Workflow Script
 * 
 * This script automates the registry creation, validation, and build process.
 * 1. Determines the Core package major version.
 * 2. Generates the registry.json file.
 * 3. Validates the registry.json file.
 * 4. Builds the registry using shadcn and outputs to the versioned folder.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PACKAGES_DIR = path.resolve(__dirname, '..');
const PACKAGE_JSON = path.resolve(PACKAGES_DIR, 'package.json');
const DOCS_SITE_PUBLIC_R = path.resolve(PACKAGES_DIR, '../../docs-site/public/r');

function getMajorVersion() {
    if (!fs.existsSync(PACKAGE_JSON)) {
        console.error(`❌ package.json not found at ${PACKAGE_JSON}`);
        process.exit(1);
    }
    const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf-8'));
    const version = pkg.version;
    const major = version.split('.')[0];
    console.log(`ℹ️ Package version: ${version} (Major: ${major})`);
    return major;
}

function runCommand(command) {
    try {
        console.log(`> ${command}`);
        execSync(command, { stdio: 'inherit', cwd: PACKAGES_DIR });
    } catch (error) {
        console.error(`❌ Command failed: ${command}`);
        console.error(error.message);
        process.exit(1);
    }
}

async function main() {
    console.log('🚀 Starting Registry Build Workflow...');

    // 1. Get Core Version
    const majorVersion = getMajorVersion();
    const versionedOutputDir = path.join(DOCS_SITE_PUBLIC_R, `v${majorVersion}`);

    // 2. Generate Registry
    console.log('\n📝 Generating registry...');
    runCommand('node scripts/generate-registry.mjs');

    // 3. Validate Registry
    console.log('\n🔍 Validating registry...');
    runCommand('node scripts/validate-registry.mjs');

    // 4. Build Registry
    console.log(`\n🏗️ Building registry to ${versionedOutputDir}...`);

    // Ensure output directory exists
    if (!fs.existsSync(versionedOutputDir)) {
        console.log(`   Creating directory: ${versionedOutputDir}`);
        fs.mkdirSync(versionedOutputDir, { recursive: true });
    }

    // Pre-create subdirectories based on registry items
    const registryPath = path.join(PACKAGES_DIR, 'registry.json');
    if (fs.existsSync(registryPath)) {
        const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
        const subdirs = new Set();
        registry.items.forEach(item => {
            const dirname = path.dirname(item.name);
            if (dirname && dirname !== '.') {
                subdirs.add(dirname);
            }
        });

        subdirs.forEach(subdir => {
            const subdirPath = path.join(versionedOutputDir, subdir);
            if (!fs.existsSync(subdirPath)) {
                console.log(`   Creating subdirectory: ${subdir}`);
                fs.mkdirSync(subdirPath, { recursive: true });
            }
        });
    }

    // Run shadcn build
    // We use pnpm exec to ensure we use the local shadcn binary
    runCommand(`pnpm exec shadcn build -o "${versionedOutputDir}"`);

    console.log('\n✅ Registry workflow completed successfully!');
}

main().catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
});
