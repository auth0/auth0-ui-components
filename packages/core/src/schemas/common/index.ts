import { z } from 'zod';

export interface StringValidationOptions {
  required?: boolean;
  regex?: RegExp;
  minLength?: number;
  maxLength?: number;
  errorMessage?: string;
}

export interface LogoValidationOptions {
  required?: boolean;
  regex?: RegExp;
  errorMessage?: string;
}

export interface BooleanFieldOptions {
  required?: boolean;
  errorMessage?: string;
}

export interface FieldOptions {
  required?: boolean;
  regex?: RegExp;
  errorMessage?: string;
  minLength?: number;
  maxLength?: number;
}

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

export const createBooleanSchema = (options: BooleanFieldOptions = {}) => {
  const schema = z.boolean({
    errorMap: () => ({ message: options.errorMessage || 'Invalid boolean value' }),
  });

  return options.required === false ? schema.optional() : schema;
};

export const COMMON_FIELD_CONFIGS = {
  domain: {
    defaultError: 'Please enter a valid domain',
    regex: undefined as RegExp | undefined,
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
    regex: /^https?:\/\/.+/,
  },
  callback_url: {
    defaultError: 'Please enter a valid URL',
    regex: /^https?:\/\/.+/,
  },
  url: {
    defaultError: 'Please enter a valid URL',
    regex: /^https?:\/\/.+/,
  },
  certificate: {
    defaultError: 'Please enter a valid certificate',
    regex: undefined as RegExp | undefined,
  },
  algorithm: {
    defaultError: 'Please enter a valid algorithm',
    regex: undefined as RegExp | undefined,
  },
  metadata: {
    defaultError: 'Please enter valid metadata',
    regex: undefined as RegExp | undefined,
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
