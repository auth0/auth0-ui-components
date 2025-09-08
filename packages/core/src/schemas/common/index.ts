import { z } from 'zod';

interface StringValidationOptions {
  required?: boolean;
  regex?: RegExp;
  minLength?: number;
  maxLength?: number;
  errorMessage?: string;
}

interface LogoValidationOptions {
  required?: boolean;
  regex?: RegExp;
  errorMessage?: string;
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
