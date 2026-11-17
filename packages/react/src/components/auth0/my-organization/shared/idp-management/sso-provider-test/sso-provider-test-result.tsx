/**
 * Result of an SSO provider test: the returned user profile or an error.
 * @module sso-provider-test-result
 * @internal
 */

import { MessageSquare } from 'lucide-react';
import * as React from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { CodeBlock } from '@/components/ui/code-block';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type { SsoProviderTestResultProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-test-types';

/**
 * Renders a terminal test state. Identity provider data is rendered as text only.
 * @param props - Component props.
 * @param props.state - Terminal test state.
 * @param props.user - User profile returned on success.
 * @param props.errorReason - Why the test failed.
 * @param props.errorMessage - Identity provider error message.
 * @param props.copyable - Shows a copy button above the user profile.
 * @param props.actions - Extra actions rendered below the result.
 * @param props.customMessages - Custom translation messages to override defaults.
 * @param props.styling - Styling configuration.
 * @returns JSX element
 */
export function SsoProviderTestResult({
  state,
  user,
  errorReason,
  errorMessage,
  copyable = false,
  actions,
  customMessages = {},
  styling,
}: SsoProviderTestResultProps) {
  const { t } = useTranslator('idp_management.test_sso_provider.result', customMessages);
  const { t: tCommon } = useTranslator('common', customMessages.common);
  const profileJson = React.useMemo(() => JSON.stringify(user ?? {}, null, 2), [user]);

  const renderError = () => {
    if (state === 'timeout') return `${t('timeout_error')} ${t('try_again_text')}`;
    if (errorReason === 'forbidden') return tCommon('error.forbidden');
    if (errorReason === 'expired') return `${t('expired_error')} ${t('try_again_text')}`;
    return `${errorMessage ?? ''} ${t('try_again_text')}`.trim();
  };

  return (
    <div className={cn('space-y-4', styling?.classes?.['SsoProviderTest-result'])}>
      {state === 'success' ? (
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="text-subtitle text-left font-semibold">{t('success_title')}</h4>
            <p className="text-muted-foreground text-paragraph text-left">
              {t('success_description')}
            </p>
          </div>
          <CodeBlock
            value={profileJson}
            language="json"
            copyLabel={copyable ? t('copy_button_label') : undefined}
            copiedLabel={tCommon('copied')}
          />
        </div>
      ) : (
        <Alert variant="destructive">
          <MessageSquare className="h-4 w-4" />
          <AlertDescription className="text-destructive-foreground">
            {renderError()}
          </AlertDescription>
        </Alert>
      )}
      {actions && <div className="flex justify-end gap-2">{actions}</div>}
    </div>
  );
}
