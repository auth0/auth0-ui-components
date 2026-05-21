/**
 * MFA setup form with factor selection.
 * @module user-mfa-setup-form
 * @internal
 */

import { getComponentStyles } from '@auth0/universal-components-core';
import * as React from 'react';

import AppleLogo from '@/assets/icons/apple-logo';
import GoogleLogo from '@/assets/icons/google-logo';
import { ContactInputForm } from '@/components/auth0/my-account/shared/mfa/contact-input-form';
import { QRCodeEnrollmentForm } from '@/components/auth0/my-account/shared/mfa/qr-code-enrollment-form';
import { ShowRecoveryCode } from '@/components/auth0/my-account/shared/mfa/show-recovery-code';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import {
  ENTER_QR,
  ENTER_CONTACT,
  QR_PHASE_INSTALLATION,
  SHOW_RECOVERY_CODE,
} from '@/lib/constants/my-account/mfa/mfa-constants';
import { cn } from '@/lib/utils';
import type { UserMFASetupFormProps } from '@/types/my-account/mfa/mfa-types';

/**
 *
 * @param props - Component props.
 * @param props.open - Whether the dialog is open
 * @param props.onClose - Callback fired when the dialog should close
 * @param props.factorType - The MFA factor type being enrolled
 * @param props.enrollmentPhase - Current enrollment phase from useUserMFA
 * @param props.contact - Current enrolled contact (email/phone) from hook state
 * @param props.otpData - QR code data from hook state
 * @param props.recoveryCode - Recovery code from hook state
 * @param props.isEnrolling - Whether enrollment mutation is pending
 * @param props.isConfirming - Whether confirmation mutation is pending
 * @param props.onSubmitContact - Called with contact options on submit
 * @param props.onConfirmOtp - Called with OTP code on verification
 * @param props.onContinueQR - Called when continuing past QR scan (push notification)
 * @param props.onConfirmRecoveryCode - Called when confirming recovery code
 * @param props.onAdvanceToQR - Called to move from installation to QR scan phase
 * @param props.styling - Custom styling configuration
 * @param props.customMessages - Custom translation messages
 * @returns JSX element
 */
export function UserMFASetupForm({
  open,
  onClose,
  factorType,
  enrollmentPhase,
  contact,
  otpData,
  recoveryCode,
  isEnrolling,
  isConfirming,
  onSubmitContact,
  onConfirmOtp,
  onContinueQR,
  onConfirmRecoveryCode,
  onAdvanceToQR,
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

  const renderInstallationPhase = () => (
    <div style={currentStyles.variables} className="w-full max-w-sm mx-auto">
      <div className="flex flex-col items-center justify-center flex-1 space-y-10">
        <p className="text-center text-primary text-sm text-(length:--font-size-paragraph) font-normal">
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
              <span className="text-sm text-(length:--font-size-paragraph) text-center">
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
              <span className="text-sm text-(length:--font-size-paragraph) text-center">
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
          <Button type="button" className="text-sm" size="default" onClick={onAdvanceToQR}>
            {t('continue')}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderForm = () => {
    switch (enrollmentPhase) {
      case QR_PHASE_INSTALLATION:
        return renderInstallationPhase();
      case ENTER_CONTACT:
        return (
          <ContactInputForm
            factorType={factorType}
            contact={contact}
            isEnrolling={isEnrolling}
            isConfirming={isConfirming}
            onSubmitContact={onSubmitContact}
            onConfirmOtp={onConfirmOtp}
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
            barcodeUri={otpData.barcodeUri}
            manualInputCode={otpData.manualInputCode}
            isEnrolling={isEnrolling}
            isConfirming={isConfirming}
            onContinueQR={onContinueQR}
            onConfirmOtp={onConfirmOtp}
            onClose={onClose}
            styling={styling}
            customMessages={customMessages}
          />
        );
      case SHOW_RECOVERY_CODE:
        return (
          <ShowRecoveryCode
            recoveryCode={recoveryCode}
            isEnrolling={isEnrolling}
            isConfirming={isConfirming}
            onConfirmRecoveryCode={onConfirmRecoveryCode}
            onClose={onClose}
            styling={styling}
            customMessages={customMessages}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open && Boolean(enrollmentPhase)} onOpenChange={onClose}>
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
