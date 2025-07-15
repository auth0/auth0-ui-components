import { z } from 'zod';

/**
 * Creates a schema for email-based MFA contact validation with custom error message
 * @param errorMessage - Custom error message for invalid email
 * @returns Zod schema for email validation
 */
export const createEmailContactSchema = (errorMessage?: string) =>
  z.object({
    contact: z.string().email({ message: errorMessage || 'Please enter a valid email address' }),
  });

/**
 * Default schema for email-based MFA contact validation
 */
export const EmailContactSchema = createEmailContactSchema();

/**
 * Type for email contact form data
 */
export type EmailContactForm = z.infer<typeof EmailContactSchema>;
