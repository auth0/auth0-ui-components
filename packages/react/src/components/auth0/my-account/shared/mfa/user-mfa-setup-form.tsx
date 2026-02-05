import {
  type MFAType,
  FACTOR_TYPE_EMAIL,
  FACTOR_TYPE_PHONE,
  FACTOR_TYPE_TOTP,
  FACTOR_TYPE_PUSH_NOTIFICATION,
  FACTOR_TYPE_RECOVERY_CODE,
  getComponentStyles,
} from '@auth0/universal-components-core';
import * as React from 'react';

import { ContactInputForm } from './contact-input-form';
import { QRCodeEnrollmentForm } from './qr-code-enrollment-form';
import { ShowRecoveryCode } from './show-recovery-code';

import AppleLogo from '@/assets/icons/apple-logo';
import GoogleLogo from '@/assets/icons/google-logo';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useRecoveryCodeGeneration } from '@/hooks/my-account/mfa/use-recovery-code';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { ENTER_OTP } from '@/lib/constants/my-account/mfa/mfa-constants';
import {
  ENTER_QR,
  ENTER_CONTACT,
  QR_PHASE_INSTALLATION,
  SHOW_RECOVERY_CODE,
} from '@/lib/constants/my-account/mfa/mfa-constants';
import { cn } from '@/lib/utils';
import type { UserMFASetupFormProps } from '@/types/my-account/mfa/mfa-types';

type EnrollmentPhase =
  | typeof ENTER_CONTACT
  | typeof ENTER_OTP
  | typeof ENTER_QR
  | typeof QR_PHASE_INSTALLATION
  | typeof SHOW_RECOVERY_CODE
  | null;

export function UserMFASetupForm({
  open,
  onClose,
  factorType,
  enrollMfa,
  confirmEnrollment,
  onSuccess,
  onError,
  schema,
  styling = {
    variables: {
      common: {},
      light: {},
      dark: {},
    },
    classes: {},
  },
  customMessages = {},
}: UserMFASetupFormProps) {
  const { t } = useTranslator('mfa', customMessages);
  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  // Initialize phase as null, meaning no UI shown by default
  const [phase, setPhase] = React.useState<EnrollmentPhase>(null);
  const { fetchRecoveryCode, loading, recoveryCodeData, resetRecoveryCodeData } =
    useRecoveryCodeGeneration({
      factorType,
      enrollMfa,
      onError,
      onClose,
    });

  React.useEffect(() => {
    if (!open) {
      setPhase(null);
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const phaseMap: Partial<Record<MFAType, EnrollmentPhase>> = {
      [FACTOR_TYPE_EMAIL]: ENTER_CONTACT,
      [FACTOR_TYPE_PHONE]: ENTER_CONTACT,
      [FACTOR_TYPE_PUSH_NOTIFICATION]: QR_PHASE_INSTALLATION,
      [FACTOR_TYPE_TOTP]: ENTER_QR,
      [FACTOR_TYPE_RECOVERY_CODE]: SHOW_RECOVERY_CODE,
    };

    setPhase(phaseMap[factorType] ?? null);
  }, [open, factorType]);

  React.useEffect(() => {
    if (phase === SHOW_RECOVERY_CODE) {
      fetchRecoveryCode();
    }
  }, [phase]);

  const renderInstallationPhase = () => (
    <div style={currentStyles?.variables} className="w-full max-w-sm mx-auto">
      <div className="flex flex-col items-center justify-center flex-1 space-y-10">
        <p
          className={cn(
            'text-center text-primary text-sm text-(length:--font-size-paragraph) font-normal',
          )}
        >
          {t('enrollment_form.show_otp.install_guardian_description')}
        </p>
        <div className="flex gap-4 w-full">
          <a
            href="https://apps.apple.com/us/app/auth0-guardian/id1093447833"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Card className="flex flex-col items-center gap-1 min-w-24 p-6 h-full">
              <AppleLogo className="w-8 h-8" />
              <span className={cn('text-sm text-(length:--font-size-paragraph) text-center')}>
                {t('app-store')}
              </span>
            </Card>
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=com.auth0.guardian"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Card className="flex flex-col items-center gap-1 min-w-24 p-6 h-full">
              <GoogleLogo className="w-8 h-8" />
              <span className={cn('text-sm text-(length:--font-size-paragraph) text-center')}>
                {t('google-play')}
              </span>
            </Card>
          </a>
        </div>
        <div className="flex flex-row justify-end gap-3 w-full mt-6 mb-6">
          <Button
            type="button"
            className="text-sm"
            variant="outline"
            size="default"
            onClick={onClose}
          >
            {t('cancel')}
          </Button>
          <Button
            type="button"
            className="text-sm"
            size="default"
            onClick={() => setPhase(ENTER_QR)}
          >
            {t('continue')}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderForm = () => {
    switch (phase) {
      case QR_PHASE_INSTALLATION:
        return renderInstallationPhase();
      case ENTER_CONTACT:
        return (
          <ContactInputForm
            factorType={factorType}
            enrollMfa={enrollMfa}
            confirmEnrollment={confirmEnrollment}
            onError={onError}
            onSuccess={onSuccess}
            onClose={onClose}
            schema={schema}
            styling={styling}
            customMessages={customMessages}
          />
        );
      case ENTER_QR:
        return (
          <QRCodeEnrollmentForm
            factorType={factorType}
            enrollMfa={enrollMfa}
            confirmEnrollment={confirmEnrollment}
            onError={onError}
            onSuccess={onSuccess}
            onClose={onClose}
            styling={styling}
            customMessages={customMessages}
          />
        );
      case SHOW_RECOVERY_CODE:
        return (
          <ShowRecoveryCode
            recoveryCode={recoveryCodeData.recoveryCode}
            authSession={recoveryCodeData.authSession}
            authenticationMethodId={recoveryCodeData.authenticationMethodId}
            confirmEnrollment={confirmEnrollment}
            onSuccess={() => {
              onSuccess();
              resetRecoveryCodeData();
            }}
            onBack={() => {
              resetRecoveryCodeData();
              onClose();
            }}
            styling={styling}
            factorType={factorType}
            loading={loading}
            customMessages={customMessages}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open && Boolean(phase)} onOpenChange={onClose}>
      <DialogContent
        style={currentStyles.variables}
        aria-describedby="mfa-setup-form"
        className={cn(
          'w-[400px] max-h-[90vh]',
          currentStyles.classes?.['UserMFASetupForm-dialogContent'],
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-left font-medium text-xl text-(length:--font-size-title)">
            {t('enrollment_form.enroll_title')}
          </DialogTitle>
          <Separator className="my-2" />
        </DialogHeader>
        {renderForm()}
      </DialogContent>
    </Dialog>
  );
}
