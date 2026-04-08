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
  email: z.string().email().optional(),
  name: z.string().optional(),
  picture: z.string().url().optional(),
  roles: z.array(z.string()).optional(),
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

/**
 * Schema for removing a member.
 * @internal
 */
export const removeMemberSchema = z.object({
  user_id: z.string(),
});

export type Member = z.infer<typeof memberSchema>;
export type MemberListResponse = z.infer<typeof memberListResponseSchema>;
export type RemoveMemberInput = z.infer<typeof removeMemberSchema>;
