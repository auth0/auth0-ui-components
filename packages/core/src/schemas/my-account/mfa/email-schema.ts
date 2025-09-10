import { z } from 'zod';

/**
 * Creates a schema for email-based MFA contact validation with custom error message and optional custom regex
 * @param errorMessage - Custom error message for invalid email
 * @param customRegex - Optional custom regex for email validation
 * @returns Zod schema for email validation
 */
export const createEmailContactSchema = (errorMessage?: string, customRegex?: RegExp) =>
  z.object({
    contact: customRegex
      ? z
          .string()
          .regex(customRegex, { message: errorMessage || 'Please enter a valid email address' })
      : z.string().email({ message: errorMessage || 'Please enter a valid email address' }),
  });

/**
 * Default schema for email-based MFA contact validation
 */
export const EmailContactSchema = createEmailContactSchema();

/**
 * Type for email contact form data
 */
export type EmailContactForm = z.infer<typeof EmailContactSchema>;
