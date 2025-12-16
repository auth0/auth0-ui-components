import { getComponentStyles, FACTOR_TYPE_RECOVERY_CODE } from '@auth0/universal-components-core';
import * as React from 'react';

import { useOtpConfirmation } from '../../../hooks/my-account/mfa/use-otp-confirmation';
import { useTheme } from '../../../hooks/use-theme';
import { useTranslator } from '../../../hooks/use-translator';
import { cn } from '../../../lib/utils';
import type { ShowRecoveryCodeProps } from '../../../types/my-account/mfa/mfa-types';
import { Button } from '../../ui/button';
import { CopyableTextField } from '../../ui/copyable-text-field';
import { Spinner } from '../../ui/spinner';

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
