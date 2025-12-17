import { z } from 'zod';

/**
 * Regular expression for phone number validation
 * Accepts international format with optional + prefix, spaces, hyphens, and parentheses
 * Upper limit of 25 characters to prevent ReDoS (Regular Expression Denial of Service) vulnerability
 */
const phoneRegex = /^\+?[0-9\s\-()]{8,25}$/;

/**
 * Creates a schema for SMS-based MFA contact validation with custom error message and optional custom regex
 * @param errorMessage - Custom error message for invalid phone number
 * @param customRegex - Optional custom regex for phone number validation
 * @returns Zod schema for phone number validation
 */
export const createSmsContactSchema = (errorMessage?: string, customRegex?: RegExp) =>
  z.object({
    contact: z.string().regex(customRegex || phoneRegex, {
      message: errorMessage || 'Please enter a valid phone number',
    }),
  });

/**
 * Default schema for SMS-based MFA contact validation
 */
export const SmsContactSchema = createSmsContactSchema();

/**
 * Type for SMS contact form data
 */
export type SmsContactForm = z.infer<typeof SmsContactSchema>;
