/**
 * Display label of an enrolled MFA authenticator.
 * @module factor-label
 * @internal
 */

import {
  FACTOR_TYPE_PUSH_NOTIFICATION,
  FACTOR_TYPE_RECOVERY_CODE,
  FACTOR_TYPE_TOTP,
  type EnhancedTranslationFunction,
  type MFAType,
} from '@auth0/universal-components-core';

const FACTOR_TITLE_KEY_TYPES = new Set([FACTOR_TYPE_TOTP, FACTOR_TYPE_PUSH_NOTIFICATION]);

/**
 * Label shown for one enrolled authenticator: the factor title for authenticator apps
 * and push, a fixed label for the recovery code, otherwise the phone number or email.
 * @param factor - The enrolled authenticator.
 * @param factor.id - Authenticator id, used when it has no name.
 * @param factor.name - Authenticator name, such as a phone number or email.
 * @param factorType - The MFA factor type.
 * @param t - Translator for the `user_mfa_management` namespace.
 * @returns The label.
 * @internal
 */
export function getAuthenticatorLabel(
  factor: { id: string; name?: string },
  factorType: MFAType,
  t: EnhancedTranslationFunction,
): string {
  if (factorType === FACTOR_TYPE_RECOVERY_CODE) return t('factors.recovery-code.item_label');
  if (FACTOR_TITLE_KEY_TYPES.has(factorType)) return t(`factors.${factorType}.title`);
  return factor.name || factor.id;
}
