# MFA Schema Refactoring

## Overview

This refactoring moved MFA contact validation schemas from the React component layer to the Core package, creating reusable and well-tested validation schemas.

## Changes Made

### 1. Core Package (`packages/core/`)

#### New Directory Structure

```
src/schemas/
├── index.ts
└── mfa/
    ├── index.ts
    ├── email-schema.ts
    ├── sms-schema.ts
    └── contact-schemas.test.ts
```

#### New Schema Files

**`email-schema.ts`**

- `createEmailContactSchema(errorMessage?: string)` - Factory function for email validation
- `EmailContactSchema` - Default email schema
- `EmailContactForm` - TypeScript type for email contact data

**`sms-schema.ts`**

- `createSmsContactSchema(errorMessage?: string)` - Factory function for SMS validation
- `SmsContactSchema` - Default SMS schema
- `SmsContactForm` - TypeScript type for SMS contact data
- Phone regex validation: `/^\+?[0-9\s\-()]{8,}$/`

**`contact-schemas.test.ts`**

- Comprehensive test suite covering both email and SMS validation
- Tests for valid/invalid inputs and custom error messages

#### Dependencies Added

- Added `zod` package to core dependencies for schema validation

### 2. React Package (`packages/react/`)

#### Updated Files

**`src/components/mfa/contact-input-form.tsx`**

- Removed inline schema definitions and phone regex
- Imports schema creators from `@auth0-web-ui-components/core`
- Uses `createEmailContactSchema()` and `createSmsContactSchema()` with dynamic error messages
- Maintains same functionality with cleaner, more maintainable code

## Benefits

1. **Separation of Concerns**: Validation logic moved to core package
2. **Reusability**: Schemas can be used across different components and packages
3. **Testability**: Comprehensive test coverage for validation logic
4. **Maintainability**: Centralized schema definitions
5. **Type Safety**: Strong TypeScript types for form data
6. **Internationalization**: Support for custom error messages
7. **Consistency**: Standardized validation rules across the application

## Usage Example

```typescript
import { createEmailContactSchema, createSmsContactSchema } from '@auth0-web-ui-components/core';

// With custom error messages
const emailSchema = createEmailContactSchema('Please enter a valid email');
const smsSchema = createSmsContactSchema('Please enter a valid phone number');

// Validate data
const result = emailSchema.parse({ contact: 'user@example.com' });
```

## Testing

All schemas are thoroughly tested with the new test suite in `contact-schemas.test.ts`.

Run tests with:

```bash
cd packages/core
pnpm test contact-schemas.test.ts
```
