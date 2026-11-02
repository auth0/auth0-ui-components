/**
 * SSO provisioning SCIM token create schema for form validation.
 * @module sso-provisioning-token-create-schema
 * @internal
 */

import { SCIM_TOKEN_MIN_LIFETIME_SECONDS } from '@core/services/my-organization/idp-management/sso-provisioning/sso-provisioning-constants';
import { z } from 'zod';

import type {
  ProvisioningCreateTokenFormRules,
  ProvisioningCreateTokenSchema,
} from './sso-provisioning-token-create-schema-types';

/**
 * Creates the zod schema for the create-token form.
 * @param rules - Form rules
 * @param messages - Translated error messages
 * @returns Zod schema for the create-token form
 * @internal
 */
export const createProvisioningCreateTokenSchema = (
  rules: ProvisioningCreateTokenFormRules,
  messages: ProvisioningCreateTokenSchema,
) =>
  z
    .object({
      noExpiration: z.boolean(),
      tokenLifetime: z.string().trim(),
      scopes: z.array(z.string()).min(1, messages.scopesRequired),
    })
    .superRefine((values, ctx) => {
      if (values.noExpiration) return;

      const addError = (message: string) =>
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['tokenLifetime'], message });

      if (values.tokenLifetime === '') {
        addError(messages.required);
        return;
      }
      if (!/^\d+$/.test(values.tokenLifetime)) {
        addError(messages.integer);
        return;
      }

      const lifetime = Number(values.tokenLifetime);
      if (lifetime < SCIM_TOKEN_MIN_LIFETIME_SECONDS) {
        addError(messages.min);
        return;
      }
      if (rules.maxAllowedExpiry !== null && lifetime > rules.maxAllowedExpiry) {
        addError(messages.max);
      }
    });

/**
 * Type definitions
 */
export type ProvisioningCreateTokenFormValues = z.infer<
  ReturnType<typeof createProvisioningCreateTokenSchema>
>;
