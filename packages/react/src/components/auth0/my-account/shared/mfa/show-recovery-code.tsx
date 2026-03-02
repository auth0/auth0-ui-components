/**
 * Recovery code display component.
 * @module show-recovery-code
 * @internal
 */

import { getComponentStyles, FACTOR_TYPE_RECOVERY_CODE } from '@auth0/universal-components-core';
import * as React from 'react';

import { CopyableTextField } from '@/components/auth0/shared/copyable-text-field';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useOtpConfirmation } from '@/hooks/my-account/use-otp-confirmation';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type { ShowRecoveryCodeProps } from '@/types/my-account/mfa/mfa-types';

/**
 *
 * @param props - Component props.
 * @param props.factorType - The MFA factor type
 * @param props.confirmEnrollment - Function to confirm MFA enrollment
 * @param props.onError - Callback fired when an error occurs
 * @param props.onSuccess - Callback fired on successful operation
 * @param props.onClose - Callback fired when the component should close
 * @param props.userOtp - User-entered OTP code
 * @param props.recoveryCode - Recovery code for MFA
 * @param props.authSession - Authentication session data
 * @param props.authenticationMethodId - ID of the authentication method
 * @param props.onBack - Callback fired when back navigation is triggered
 * @param props.styling - Custom styling configuration with variables and classes
 * @param props.loading - Whether the component is in a loading state
 * @param props.customMessages - Custom translation messages to override defaults
 * @returns JSX element
 */
export function ShowRecoveryCode({
  factorType,
  confirmEnrollment,
  onError,
  onSuccess,
  onClose,
  userOtp,
  recoveryCode,
  authSession,
  authenticationMethodId,
  onBack,
  styling = {
    variables: {
      common: {},
      light: {},
      dark: {},
    },
    classes: {},
  },
  loading = false,
  customMessages = {},
}: ShowRecoveryCodeProps) {
  const { t } = useTranslator('mfa', customMessages);
  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const isRecoveryCode = factorType === FACTOR_TYPE_RECOVERY_CODE;

  const { onSubmitOtp, loading: confirming } = useOtpConfirmation({
    factorType: factorType,
    authSession,
    authenticationMethodId,
    confirmEnrollment: confirmEnrollment!,
    onError: onError!,
    onSuccess,
    onClose: onClose!,
  });

  const handleSubmit = React.useCallback(async () => {
    if (isRecoveryCode) {
      await confirmEnrollment(factorType, authSession, authenticationMethodId, {});

      onSuccess();
    } else if (userOtp) {
      await onSubmitOtp({ userOtp });
    }
  }, [
    isRecoveryCode,
    onSubmitOtp,
    userOtp,
    onSuccess,
    authSession,
    factorType,
    confirmEnrollment,
    authenticationMethodId,
  ]);

  const buttonText = confirming ? t('enrollment_form.show_otp.verifying') : t('submit');

  return (
    <div style={currentStyles.variables} className="w-full max-w-sm mx-auto text-center">
      {loading || confirming ? (
        <div className="flex items-center justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <p className={cn('font-normal block text-sm text-center mb-4 text-primary')}>
              {t('enrollment_form.recovery_code_description')}
            </p>
            {recoveryCode && <CopyableTextField value={recoveryCode} />}
          </div>

          <div className="flex flex-row justify-end gap-3 mt-6 mb-6">
            <Button
              type="button"
              className="text-sm"
              variant="outline"
              size="default"
              onClick={onBack}
              aria-label={t('back')}
            >
              {t('back')}
            </Button>

            <Button
              type="button"
              className="text-sm"
              size="default"
              disabled={!isRecoveryCode && loading}
              onClick={handleSubmit}
              aria-label={buttonText}
            >
              {buttonText}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
