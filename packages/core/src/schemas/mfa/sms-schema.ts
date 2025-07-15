import { z } from 'zod';

/**
 * Regular expression for phone number validation
 * Accepts international format with optional + prefix, spaces, hyphens, and parentheses
 */
const phoneRegex = /^\+?[0-9\s\-()]{8,}$/;

/**
 * Creates a schema for SMS-based MFA contact validation with custom error message
 * @param errorMessage - Custom error message for invalid phone number
 * @returns Zod schema for phone number validation
 */
export const createSmsContactSchema = (errorMessage?: string) =>
  z.object({
    contact: z
      .string()
      .regex(phoneRegex, { message: errorMessage || 'Please enter a valid phone number' }),
  });

/**
 * Default schema for SMS-based MFA contact validation
 */
export const SmsContactSchema = createSmsContactSchema();

/**
 * Type for SMS contact form data
 */
export type SmsContactForm = z.infer<typeof SmsContactSchema>;
