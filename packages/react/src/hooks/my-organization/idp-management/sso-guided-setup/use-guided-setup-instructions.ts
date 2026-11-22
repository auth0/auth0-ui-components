/**
 * Instructions for a guided setup, keyed by the current language.
 * @module use-guided-setup-instructions
 * @internal
 */

import {
  getInstructionsCompanyName,
  getInstructionsLocale,
  type IdpStrategy,
  type InstructionsKind,
} from '@auth0/universal-components-core';

import { useIdpInstructionsService } from '@/hooks/my-organization/shared/services/use-idp-instructions-service';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { UseGuidedSetupInstructionsResult } from '@/types/my-organization/idp-management/sso-guided-setup/sso-guided-setup-types';

/**
 * Instructions for a strategy, shared through the query cache.
 * @param kind - `creation` or `provisioning`.
 * @param strategy - IdP strategy.
 * @param enabled - Extra gate.
 * @returns The query result, `baseUrl`, and the `{{companyName}}` value.
 */
export function useGuidedSetupInstructions<TKind extends InstructionsKind>(
  kind: TKind,
  strategy: IdpStrategy | undefined,
  enabled = true,
): UseGuidedSetupInstructionsResult<TKind> {
  const { t, currentLanguage } = useTranslator('idp_management.sso_guided_setup');
  const result = useIdpInstructionsService({
    kind,
    strategy,
    locale: getInstructionsLocale(currentLanguage),
    enabled,
  });

  return {
    ...result,
    baseUrl: result.instructions?.base_url,
    companyName: getInstructionsCompanyName(result.instructions) || t('company_fallback'),
  };
}
