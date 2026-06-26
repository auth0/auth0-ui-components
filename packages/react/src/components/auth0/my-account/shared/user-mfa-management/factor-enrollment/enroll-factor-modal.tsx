/**
 * MFA factor enrollment modal.
 * @module enroll-factor-modal
 * @internal
 */

import { getComponentStyles } from '@auth0/universal-components-core';
import {
  FACTOR_TYPE_EMAIL,
  FACTOR_TYPE_PHONE,
  FACTOR_TYPE_RECOVERY_CODE,
} from '@auth0/universal-components-core';
import type { MFAType } from '@auth0/universal-components-core';
import * as React from 'react';

import { ContactInputForm } from './contact-input-form';
import { QRCodeEnrollmentForm } from './qr-code-enrollment-form';
import { ShowRecoveryCode } from './show-recovery-code';

import AppleLogo from '@/assets/icons/apple-logo';
import GoogleLogo from '@/assets/icons/google-logo';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import {
  ENTER_QR,
  ENTER_CONTACT,
  ENTER_OTP,
  QR_PHASE_INSTALLATION,
  QR_PHASE_ENTER_OTP,
  QR_PHASE_SCAN,
  SHOW_RECOVERY_CODE,
  GUARDIAN_APP_STORE_URL,
  GUARDIAN_PLAY_STORE_URL,
} from '@/lib/constants/my-account/user-mfa-management/user-mfa-constants';
import { cn } from '@/lib/utils';
import type {
  ContactPhase,
  QRPhase,
  EnrollFactorModalProps,
} from '@/types/my-account/user-mfa-management/factor-enrollment-types';

const DEFAULT_STYLING: EnrollFactorModalProps['styling'] = {
  variables: { common: {}, light: {}, dark: {} },
  classes: {},
};

const ENROLL_TITLE_KEYS: Partial<Record<MFAType, string>> = {
  [FACTOR_TYPE_PHONE]: 'enrollment.phone.title',
  [FACTOR_TYPE_EMAIL]: 'enrollment.email.title',
  [FACTOR_TYPE_RECOVERY_CODE]: 'enrollment.recovery_code.title',
};

const VERIFY_TITLE_KEYS: Partial<Record<MFAType, string>> = {
  [FACTOR_TYPE_PHONE]: 'enrollment.verify.phone.title',
  [FACTOR_TYPE_EMAIL]: 'enrollment.verify.email.title',
};

/**
 * @param factorType - The MFA factor type being enrolled
 * @param qrPhase - Current QR enrollment phase
 * @param contactPhase - Current contact enrollment phase
 * @returns Translation key for the enrollment dialog title
 */
function getEnrollTitleKey(
  factorType: MFAType | null,
  qrPhase: QRPhase,
  contactPhase: ContactPhase,
): string {
  if (qrPhase === QR_PHASE_ENTER_OTP || contactPhase === ENTER_OTP) {
    return (factorType && VERIFY_TITLE_KEYS[factorType]) ?? 'enrollment.verify.totp.title';
  }
  return (factorType && ENROLL_TITLE_KEYS[factorType]) ?? 'enrollment.push.install_title';
}

/** Props for InstallationPhase component. */
interface InstallationPhaseProps {
  variables: React.CSSProperties | undefined;
  onClose: () => void;
  onStartQREnrollment: () => Promise<void>;
  t: (key: string) => string;
}

/**
 * @param props - Component props
 * @param props.variables - CSS custom properties to apply
 * @param props.onClose - Called when the user cancels
 * @param props.onStartQREnrollment - Called when the user continues to QR scan
 * @param props.t - Translation function
 * @returns Installation phase UI with app store links and continue button
 */
function InstallationPhase(props: InstallationPhaseProps) {
  const { variables, onClose, onStartQREnrollment, t } = props;
  return (
    <div style={variables} className="w-full">
      <div className="flex flex-col items-stretch flex-1 space-y-10">
        <p className="text-center text-primary text-sm text-(length:--font-size-paragraph) font-normal">
          {t('enrollment.push.install_description')}
        </p>
        <div className="flex gap-4 w-full">
          <a
            href={GUARDIAN_APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Card className="flex flex-col items-center gap-1 min-w-24 p-6 h-full">
              <AppleLogo className="w-8 h-8" />
              <span className="text-sm text-(length:--font-size-paragraph) text-center">
                {t('enrollment.push.app_store')}
              </span>
            </Card>
          </a>
          <a
            href={GUARDIAN_PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Card className="flex flex-col items-center gap-1 min-w-24 p-6 h-full">
              <GoogleLogo className="w-8 h-8" />
              <span className="text-sm text-(length:--font-size-paragraph) text-center">
                {t('enrollment.push.google_play')}
              </span>
            </Card>
          </a>
        </div>
        <DialogFooter>
          <Button
            type="button"
            className="text-sm"
            variant="outline"
            size="default"
            onClick={onClose}
          >
            {t('actions.cancel_button_label')}
          </Button>
          <Button type="button" className="text-sm" size="default" onClick={onStartQREnrollment}>
            {t('actions.continue_button_label')}
          </Button>
        </DialogFooter>
      </div>
    </div>
  );
}

/**
 * MFA enrollment dialog — renders the correct form for each enrollment phase.
 * @param props - Component props
 * @param props.open - Whether the dialog is open
 * @param props.onClose - Called when the dialog should close
 * @param props.factorType - The MFA factor type being enrolled
 * @param props.enrollmentPhase - Current enrollment phase
 * @param props.contact - Contact value (email or phone) for contact-based factors
 * @param props.otpData - QR barcode URI and manual input code for QR-based factors
 * @param props.recoveryCode - Recovery code for recovery-code factor
 * @param props.isEnrolling - Whether enrollment is in progress
 * @param props.isConfirming - Whether OTP confirmation is in progress
 * @param props.onSubmitContact - Called with contact options to initiate enrollment
 * @param props.onResendCode - Called to resend the verification code
 * @param props.onConfirmOtp - Called with the OTP code to complete enrollment
 * @param props.onContinueQRScan - Called when the user confirms the QR scan step
 * @param props.onConfirmRecoveryCode - Called when the user confirms the recovery code
 * @param props.onStartQREnrollment - Called to initiate the QR enrollment API call
 * @param props.schema - Validation schema overrides
 * @param props.styling - Custom styling configuration
 * @param props.customMessages - Custom translation message overrides
 * @returns MFA enrollment dialog element
 */
export function EnrollFactorModal(props: EnrollFactorModalProps) {
  const {
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
    onResendCode,
    onConfirmOtp,
    onContinueQRScan,
    onConfirmRecoveryCode,
    onStartQREnrollment,
    schema,
    styling = DEFAULT_STYLING,
    customMessages = {},
  } = props;
  const { t } = useTranslator('user_mfa_management', customMessages);
  const { isDarkMode } = useTheme();
  const [qrPhase, setQrPhase] = React.useState<QRPhase>(QR_PHASE_SCAN);
  const [contactPhase, setContactPhase] = React.useState<ContactPhase>(ENTER_CONTACT);

  React.useEffect(() => {
    if (!open) return;
    setQrPhase(QR_PHASE_SCAN);
    setContactPhase(ENTER_CONTACT);
  }, [open, enrollmentPhase]);

  const enrollTitle = t(getEnrollTitleKey(factorType, qrPhase, contactPhase));

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const renderPhase = () => {
    switch (enrollmentPhase) {
      case QR_PHASE_INSTALLATION:
        return (
          <InstallationPhase
            variables={currentStyles.variables}
            onClose={onClose}
            onStartQREnrollment={onStartQREnrollment}
            t={t}
          />
        );
      case ENTER_CONTACT:
        return (
          <ContactInputForm
            factorType={factorType}
            contact={contact}
            phase={contactPhase}
            isEnrolling={isEnrolling}
            isConfirming={isConfirming}
            onSubmitContact={onSubmitContact}
            onResendCode={onResendCode}
            onConfirmOtp={onConfirmOtp}
            onClose={onClose}
            onPhaseChange={setContactPhase}
            schema={schema}
            styling={styling}
            customMessages={customMessages}
          />
        );
      case ENTER_QR:
        return (
          <QRCodeEnrollmentForm
            factorType={factorType}
            otpData={otpData}
            isEnrolling={isEnrolling}
            isConfirming={isConfirming}
            phase={qrPhase}
            onContinueQRScan={onContinueQRScan}
            onConfirmOtp={onConfirmOtp}
            onClose={onClose}
            onPhaseChange={setQrPhase}
            styling={styling}
            customMessages={customMessages}
          />
        );
      case SHOW_RECOVERY_CODE:
        return (
          <ShowRecoveryCode
            recoveryCode={recoveryCode}
            isLoading={isEnrolling || isConfirming}
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
        className={cn(
          'w-[600px] max-h-[90vh] gap-4',
          currentStyles.classes?.['EnrollFactorModal-dialogContent'],
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-left font-medium text-xl text-(length:--font-size-title)">
            {enrollTitle}
          </DialogTitle>
          <DialogDescription className="sr-only">{enrollTitle}</DialogDescription>
        </DialogHeader>
        <Separator />
        {renderPhase()}
      </DialogContent>
    </Dialog>
  );
}
