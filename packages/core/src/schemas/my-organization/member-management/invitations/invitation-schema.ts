/**
 * Invitation validation schemas.
 * @module invitation-schema
 * @internal
 */

import { z } from 'zod';

/**
 * Schema for organization invitation data.
 * @internal
 */
export const invitationSchema = z.object({
  id: z.string(),
  invitee: z.object({
    email: z.string().email(),
  }),
  inviter: z.object({
    name: z.string().optional(),
  }),
  roles: z.array(z.string()).optional(),
  created_at: z.string().optional(),
  expires_at: z.string().optional(),
});

/**
 * Schema for invitation list response.
 * @internal
 */
export const invitationListResponseSchema = z.object({
  invitations: z.array(invitationSchema),
  total: z.number().optional(),
  start: z.number().optional(),
  limit: z.number().optional(),
});

/**
 * Schema for creating invitation(s). Supports bulk invite via invitees array.
 * @internal
 */
export const createInvitationSchema = z.object({
  invitees: z.array(
    z.object({
      email: z.string().email(),
      roles: z.array(z.string()).optional(),
    }),
  ),
});

/**
 * Schema for revoking an invitation.
 * @internal
 */
export const revokeInvitationSchema = z.object({
  invitation_id: z.string(),
});

export type Invitation = z.infer<typeof invitationSchema>;
export type InvitationListResponse = z.infer<typeof invitationListResponseSchema>;
export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
export type RevokeInvitationInput = z.infer<typeof revokeInvitationSchema>;
