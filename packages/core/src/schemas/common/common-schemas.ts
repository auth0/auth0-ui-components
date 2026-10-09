/**
 * Common schema utilities.
 * @module common-schemas
 * @internal
 */

import { z } from 'zod';

/**
 * Options for string field validation.
 * @internal
 */
export interface StringValidationOptions {
  required?: boolean;
  regex?: RegExp;
  minLength?: number;
  maxLength?: number;
  errorMessage?: string;
}

/**
 * Options for logo URL validation.
 * @internal
 */
export interface LogoValidationOptions {
  required?: boolean;
  regex?: RegExp;
  errorMessage?: string;
}

/**
 * Options for domain validation.
 * @internal
 */
export interface DomainValidationOptions {
  required?: boolean;
  regex?: RegExp;
  errorMessage?: string;
}

/**
 * Options for boolean field validation.
 * @internal
 */
export interface BooleanFieldOptions {
  required?: boolean;
  errorMessage?: string;
}

/**
 * Options for enum field validation.
 * @internal
 */
export interface EnumValidationOptions {
  required?: boolean;
  errorMessage?: string;
}

/**
 * Generic field validation options.
 * @internal
 */
export interface FieldOptions {
  required?: boolean;
  regex?: RegExp;
  errorMessage?: string;
  minLength?: number;
  maxLength?: number;
}

/**
 * Creates a Zod string schema with configurable validation options.
 * @internal
 *
 * @param options - Validation options for the string schema
 * @returns Configured Zod string schema
 */
export const createStringSchema = (options: StringValidationOptions = {}) => {
  const { required = true, regex, minLength, maxLength, errorMessage } = options;

  // Start with base schema
  let schema = z.string();

  // Add validations for required fields
  if (required) {
    const requiredLength = minLength && minLength > 0 ? minLength : 1;
    schema = schema.min(
      requiredLength,
      errorMessage || `Minimum ${requiredLength} characters required`,
    );

    if (maxLength) {
      schema = schema.max(maxLength, `Maximum ${maxLength} characters allowed`);
    }

    if (regex) {
      schema = schema.regex(regex, errorMessage || 'Invalid format');
    }

    return schema;
  }

  // Handle optional fields
  return z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;

        if (minLength && val.length < minLength) return false;
        if (maxLength && val.length > maxLength) return false;
        if (regex && !regex.test(val)) return false;

        return true;
      },
      {
        message: errorMessage || 'Invalid format',
      },
    );
};

export const createLogoSchema = (options: LogoValidationOptions = {}) => {
  const { required = false, regex, errorMessage } = options;

  const message = errorMessage || 'Please enter a valid HTTP';

  // Custom regex validation
  if (regex) {
    return required
      ? z.string().min(1, message).regex(regex, message)
      : z
          .string()
          .optional()
          .refine((val) => !val || regex.test(val), { message });
  }

  // Default URL validation
  const urlValidator = (val: string) => {
    const isValidUrl = z.string().url().safeParse(val).success;
    const isHttpProtocol = val.startsWith('http://') || val.startsWith('https://');
    return isValidUrl && isHttpProtocol;
  };

  return required
    ? z.string().min(1, message).refine(urlValidator, { message })
    : z
        .string()
        .optional()
        .refine((val) => !val || urlValidator(val), { message });
};

/**
 * Regex pattern for validating domain URLs in a flexible way
 * Accepts:
 * - Domain names: example.com, sub.example.com
 * - With protocol: https://example.com, http://example.com
 * - With port: example.com:8080
 * - With path: example.com/path
 * - Localhost and IPs: localhost, 192.168.1.1
 */
export const DOMAIN_REGEX =
  /^(?:https?:\/\/)?(?:[\w-]+\.)*[\w-]+(?:\.\w{2,})?(?::\d{1,5})?(?:\/[\w\-./?%&=]*)?$/i;

/** Bare hostname: dot-separated labels, no scheme, port, path, query or trailing slash. */
export const BARE_DOMAIN_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)+$/i;

// Trims whitespace and strips a leading http(s):// so a bare hostname can be validated.
export const stripDomainProtocol = (value: string): string =>
  value.trim().replace(/^https?:\/\//i, '');

/** Requires an http(s) protocol and a 2+ character host, rejecting e.g. https://x. */
export const HTTP_URL_REGEX = /^https?:\/\/[^\s/$.?#]\S+$/i;

/** Requires PEM BEGIN/END CERTIFICATE markers on their own lines with non-empty content between. */
export const PEM_CERTIFICATE_REGEX =
  /^\s*-----BEGIN CERTIFICATE-----[ \t]*\r?\n[\s\S]*\S[\s\S]*\r?\n[ \t]*-----END CERTIFICATE-----\s*$/;

/** Matches inline XML content (leading `<`) or an http(s) URL. */
export const XML_OR_URL_REGEX = /^\s*(?:<|https?:\/\/)/i;

export const createDomainSchema = (options: DomainValidationOptions = {}) => {
  const { required = true, regex, errorMessage } = options;

  const message =
    errorMessage || 'Please enter a valid domain (e.g., example.com or https://example.com)';

  // Custom regex validation
  if (regex) {
    return required
      ? z.string().min(1, message).regex(regex, message)
      : z
          .string()
          .optional()
          .refine((val) => !val || regex.test(val), { message });
  }

  // Default domain validation
  return required
    ? z.string().min(1, message).regex(DOMAIN_REGEX, message)
    : z
        .string()
        .optional()
        .refine((val) => !val || DOMAIN_REGEX.test(val), { message });
};

export const createBooleanSchema = (options: BooleanFieldOptions = {}) => {
  const schema = z.boolean({
    errorMap: () => ({ message: options.errorMessage || 'Invalid boolean value' }),
  });

  return options.required === false ? schema.optional() : schema;
};

/**
 * Creates a Zod enum schema restricted to a fixed set of allowed values.
 * The default error message lists the allowed values to guide the user.
 * @internal
 *
 * @param values - The allowed values for the enum
 * @param options - Validation options for the enum schema
 * @returns Configured Zod enum schema
 */
export const createEnumSchema = <const T extends readonly [string, ...string[]]>(
  values: T,
  options: EnumValidationOptions = {},
) => {
  const { required = true, errorMessage } = options;
  const message = errorMessage || `Please select a valid option (${values.join(', ')})`;
  const schema = z.enum(values, { errorMap: () => ({ message }) });

  return required ? schema : schema.optional();
};

export const COMMON_FIELD_CONFIGS = {
  domain: {
    defaultError: 'Please enter a valid domain (e.g., company.okta.com)',
    regex: BARE_DOMAIN_REGEX as RegExp | undefined,
  },
  client_id: {
    defaultError: 'Please enter a valid client ID',
    regex: undefined as RegExp | undefined,
  },
  client_secret: {
    defaultError: 'Please enter a valid client secret',
    regex: undefined as RegExp | undefined,
  },
  icon_url: {
    defaultError: 'Please enter a valid URL',
    regex: HTTP_URL_REGEX,
  },
  callback_url: {
    defaultError: 'Please enter a valid URL',
    regex: HTTP_URL_REGEX,
  },
  url: {
    defaultError: 'Please enter a valid URL',
    regex: HTTP_URL_REGEX,
  },
  certificate: {
    defaultError: 'Please enter a valid certificate in PEM format',
    regex: PEM_CERTIFICATE_REGEX,
  },
  algorithm: {
    defaultError: 'Please enter a valid algorithm',
    regex: undefined as RegExp | undefined,
  },
  metadata: {
    defaultError: 'Please enter valid XML metadata or a metadata URL',
    regex: XML_OR_URL_REGEX,
  },
  userIdAttribute: {
    defaultError: 'Please enter a valid user ID attribute',
    regex: /^[a-zA-Z_][a-zA-Z0-9_]*$/ as RegExp | undefined,
  },
} as const;

export type FieldConfig = (typeof COMMON_FIELD_CONFIGS)[keyof typeof COMMON_FIELD_CONFIGS];

export const createFieldSchema = (
  fieldConfig: FieldConfig,
  options: FieldOptions = {},
  customError?: string,
) =>
  createStringSchema({
    required: options.required ?? false,
    regex: options.regex ?? fieldConfig.regex ?? undefined,
    errorMessage: options.errorMessage ?? customError ?? fieldConfig.defaultError,
    minLength: options.minLength,
    maxLength: options.maxLength,
  });

/**
 * Creates a domain field schema that strips a leading protocol and whitespace
 * before validating a bare hostname via the field config's regex. The normalized
 * value is what the schema outputs, so forms submit the cleaned hostname.
 * @internal
 *
 * @param fieldConfig - The common field config supplying the regex and default error
 * @param options - Field validation options (only required, regex and errorMessage apply; minLength/maxLength are not used)
 * @param customError - Fallback error message when options.errorMessage is absent
 * @returns Zod schema that normalizes then validates a bare domain
 */
export const createDomainFieldSchema = (
  fieldConfig: FieldConfig,
  options: FieldOptions = {},
  customError?: string,
) => {
  const required = options.required ?? false;
  const regex = options.regex ?? fieldConfig.regex;
  const message = options.errorMessage ?? customError ?? fieldConfig.defaultError;
  const matchesDomain = (val: string) => !regex || regex.test(val);

  if (required) {
    return z
      .string()
      .min(1, message)
      .transform(stripDomainProtocol)
      .refine(matchesDomain, { message });
  }

  return z
    .string()
    .optional()
    .transform((val) => (val ? stripDomainProtocol(val) : val))
    .refine((val) => !val || matchesDomain(val), { message });
};
