/**
 * Member validation schemas.
 * @module member-schema
 * @internal
 */

import { z } from 'zod';

/**
 * Schema for organization member data.
 * @internal
 */
export const memberSchema = z.object({
  user_id: z.string(),
  roles: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    )
    .optional(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  nickname: z.string().optional(),
  updated_at: z.string().optional(),
  created_at: z.string().optional(),
  last_login: z.string().optional(),
});

/**
 * Schema for member list response.
 * @internal
 */
export const memberListResponseSchema = z.object({
  members: z.array(memberSchema),
  total: z.number().optional(),
  start: z.number().optional(),
  limit: z.number().optional(),
});

export type Member = z.infer<typeof memberSchema>;
export type MemberListResponse = z.infer<typeof memberListResponseSchema>;
