#!/usr/bin/env node

/**
 * Registry Validator Script
 *
 * Validates registry.json to ensure:
 * - Correct top-level structure ($schema, name, homepage, items)
 * - Each item has required fields (name, type, title, description, files, dependencies)
 * - All referenced file paths exist on disk
 * - Core version is present in item metadata
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PACKAGES_DIR = path.resolve(__dirname, '..');
const REGISTRY_FILE = path.join(PACKAGES_DIR, 'registry.json');

function validateRegistry() {
  console.log('Validating registry.json...\n');

  if (!fs.existsSync(REGISTRY_FILE)) {
    console.error('registry.json not found!');
    console.log('Run: pnpm registry:generate');
    process.exit(1);
  }

  let registry;
  try {
    registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf-8'));
  } catch (error) {
    console.error('Failed to parse registry.json:', error.message);
    process.exit(1);
  }

  const errors = [];
  const warnings = [];

  // Top-level fields
  if (!registry.$schema) errors.push('Missing $schema field');
  if (!registry.name) errors.push('Missing name field');
  if (!registry.homepage) errors.push('Missing homepage field');
  if (!Array.isArray(registry.items))
    errors.push('Missing or invalid items array');

  // Validate each item
  if (Array.isArray(registry.items)) {
    registry.items.forEach((item, index) => {
      const prefix = `Item ${index} (${item.name || 'unnamed'})`;

      if (!item.name) errors.push(`${prefix}: Missing name`);
      if (!item.type) errors.push(`${prefix}: Missing type`);
      if (!item.title) warnings.push(`${prefix}: Missing title`);
      if (!item.description) warnings.push(`${prefix}: Missing description`);
      if (!Array.isArray(item.files))
        errors.push(`${prefix}: Missing files array`);
      if (!Array.isArray(item.dependencies))
        errors.push(`${prefix}: Missing dependencies array`);

      // Check core version in metadata
      if (!item.meta?.coreVersion) {
        warnings.push(`${prefix}: Missing meta.coreVersion`);
      }

      // Check that @auth0/universal-components-core is in dependencies
      if (
        Array.isArray(item.dependencies) &&
        !item.dependencies.some((d) =>
          d.startsWith('@auth0/universal-components-core'),
        )
      ) {
        warnings.push(
          `${prefix}: Missing @auth0/universal-components-core in dependencies`,
        );
      }

      // Validate files exist on disk
      if (Array.isArray(item.files)) {
        item.files.forEach((file, fileIndex) => {
          if (!file.path)
            errors.push(`${prefix} file ${fileIndex}: Missing path`);
          if (!file.type)
            errors.push(`${prefix} file ${fileIndex}: Missing type`);

          if (file.path) {
            const filePath = path.join(PACKAGES_DIR, file.path);
            if (!fs.existsSync(filePath)) {
              errors.push(
                `${prefix} file ${fileIndex}: File not found: ${file.path}`,
              );
            }
          }
        });
      }
    });
  }

  // Results
  console.log('Validation Results:');
  console.log(`  Total items: ${registry.items?.length || 0}`);

  if (errors.length > 0) {
    console.log(`\nErrors (${errors.length}):`);
    errors.forEach((error) => console.log(`  - ${error}`));
  }

  if (warnings.length > 0) {
    console.log(`\nWarnings (${warnings.length}):`);
    warnings.forEach((warning) => console.log(`  - ${warning}`));
  }

  if (errors.length === 0) {
    console.log('\nRegistry is valid!');
    if (warnings.length > 0) {
      console.log('  (Some warnings to review)');
    }
  } else {
    console.log('\nRegistry validation failed!');
    process.exit(1);
  }
}

try {
  validateRegistry();
} catch (error) {
  console.error('Validation error:', error);
  process.exit(1);
}
