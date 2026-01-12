#!/usr/bin/env node

/**
 * Registry Validator Script
 * 
 * This script validates the registry.json file to ensure it has the correct structure
 * and all required fields.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PACKAGES_DIR = path.resolve(__dirname, '..');
const REGISTRY_FILE = path.join(PACKAGES_DIR, 'registry.json');

/**
 * Validate registry structure
 */
function validateRegistry() {
    console.log('🔍 Validating registry.json...');

    if (!fs.existsSync(REGISTRY_FILE)) {
        console.error('❌ registry.json not found!');
        console.log('   Run: pnpm registry:generate');
        process.exit(1);
    }

    let registry;
    try {
        registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf-8'));
    } catch (error) {
        console.error('❌ Failed to parse registry.json:', error.message);
        process.exit(1);
    }

    const errors = [];
    const warnings = [];

    // Check required top-level fields
    if (!registry.$schema) errors.push('Missing $schema field');
    if (!registry.name) errors.push('Missing name field');
    if (!registry.homepage) errors.push('Missing homepage field');
    if (!Array.isArray(registry.items)) errors.push('Missing or invalid items array');

    // Validate each item
    if (Array.isArray(registry.items)) {
        registry.items.forEach((item, index) => {
            const prefix = `Item ${index} (${item.name || 'unnamed'})`;

            if (!item.name) errors.push(`${prefix}: Missing name`);
            if (!item.type) errors.push(`${prefix}: Missing type`);
            if (!item.title) warnings.push(`${prefix}: Missing title`);
            if (!item.description) warnings.push(`${prefix}: Missing description`);
            if (!Array.isArray(item.files)) errors.push(`${prefix}: Missing files array`);
            if (!Array.isArray(item.dependencies)) errors.push(`${prefix}: Missing dependencies array`);

            // Validate files
            if (Array.isArray(item.files)) {
                item.files.forEach((file, fileIndex) => {
                    if (!file.path) errors.push(`${prefix} file ${fileIndex}: Missing path`);
                    if (!file.type) errors.push(`${prefix} file ${fileIndex}: Missing type`);
                    if (!file.target) errors.push(`${prefix} file ${fileIndex}: Missing target`);

                    // Check if file exists
                    if (file.path) {
                        const filePath = path.join(PACKAGES_DIR, file.path);
                        if (!fs.existsSync(filePath)) {
                            errors.push(`${prefix} file ${fileIndex}: File not found: ${file.path}`);
                        }
                    }
                });
            }
        });
    }

    // Print results
    console.log(`\n📊 Validation Results:`);
    console.log(`   Total items: ${registry.items?.length || 0}`);

    if (errors.length > 0) {
        console.log(`\n❌ Errors (${errors.length}):`);
        errors.forEach(error => console.log(`   - ${error}`));
    }

    if (warnings.length > 0) {
        console.log(`\n⚠️  Warnings (${warnings.length}):`);
        warnings.forEach(warning => console.log(`   - ${warning}`));
    }

    if (errors.length === 0) {
        console.log('\n✅ Registry is valid!');
        if (warnings.length > 0) {
            console.log('   (Some warnings to address)');
        }
    } else {
        console.log('\n❌ Registry validation failed!');
        process.exit(1);
    }
}

// Run validation
try {
    validateRegistry();
} catch (error) {
    console.error('❌ Validation error:', error);
    process.exit(1);
}
