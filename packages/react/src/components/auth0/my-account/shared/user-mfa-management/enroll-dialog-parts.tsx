/**
 * Parts of the `UserMFAManagement` enroll dialog.
 *
 * The dialog is driven by the model: `Root` mounts it, or the host renders `EnrollDialog`
 * and arranges the parts. Each enrollment phase is one part that reads the model.
 * @module enroll-dialog-parts
 * @internal
 */

import {
  FACTOR_TYPE_EMAIL,
  FACTOR_TYPE_PHONE,
  FACTOR_TYPE_RECOVERY_CODE,
  type MFAType,
} from '@auth0/universal-components-core';
import * as React from 'react';

import { ContactInputForm } from './factor-enrollment/contact-input-form';
import { QRCodeEnrollmentForm } from './factor-enrollment/qr-code-enrollment-form';
import { ShowRecoveryCode } from './factor-enrollment/show-recovery-code';
import { EnrollDialogProvider, useEnrollDialogContext, useMFAContext } from './mfa-context';

import AppleLogo from '@/assets/icons/apple-logo';
import GoogleLogo from '@/assets/icons/google-logo';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
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
} from '@/types/my-account/user-mfa-management/factor-enrollment-types';
import type {
  UserMFAManagementChildrenProps,
  UserMFAManagementEnrollPhaseProps,
  UserMFAManagementPartProps,
} from '@/types/my-account/user-mfa-management/user-mfa-management-types';

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

/**
 * Enrollment dialog, driven by the model. `Root` mounts it, so it works however the parts
 * are arranged. To compose it, set `Root`'s `mountDialogs` to `false` and render it
 * yourself. It holds the step of the current phase, which the title and the phase parts
 * share. Children replace the default content.
 * @param props - {@link UserMFAManagementChildrenProps}
 * @returns Dialog element or null while no factor is being enrolled.
 */
export function EnrollDialog({ children }: UserMFAManagementChildrenProps) {
  const { model } = useMFAContext('EnrollDialog');
  const [qrPhase, setQrPhase] = React.useState<QRPhase>(QR_PHASE_SCAN);
  const [contactPhase, setContactPhase] = React.useState<ContactPhase>(ENTER_CONTACT);
  const { isEnrollDialogOpen, enrollmentPhase, enrollFactor, handleCloseEnrollDialog } = model;

  React.useEffect(() => {
    if (!isEnrollDialogOpen) return;
    setQrPhase(QR_PHASE_SCAN);
    setContactPhase(ENTER_CONTACT);
  }, [isEnrollDialogOpen, enrollmentPhase]);

  const value = React.useMemo(
    () => ({ qrPhase, setQrPhase, contactPhase, setContactPhase }),
    [qrPhase, contactPhase],
  );

  if (!enrollFactor) return null;

  return (
    <EnrollDialogProvider value={value}>
      <Dialog
        open={isEnrollDialogOpen && Boolean(enrollmentPhase)}
        onOpenChange={(open) => {
          if (!open) void handleCloseEnrollDialog();
        }}
      >
        {children ?? <EnrollDialogContent />}
      </Dialog>
    </EnrollDialogProvider>
  );
}

/**
 * Panel of the enroll dialog. Defaults to header, separator and the current phase.
 * @param props - {@link UserMFAManagementPartProps}
 * @returns Dialog content element.
 */
export function EnrollDialogContent({ children, className }: UserMFAManagementPartProps) {
  const { variables, classes } = useMFAContext('EnrollDialogContent');

  return (
    <DialogContent
      style={variables}
      className={cn(
        'w-[600px] min-h-44 max-h-[90vh] gap-4',
        classes['EnrollFactorModal-dialogContent'],
        className,
      )}
    >
      {children ?? (
        <>
          <EnrollDialogHeader />
          <EnrollDialogSeparator />
          <EnrollPhase />
        </>
      )}
    </DialogContent>
  );
}

/**
 * Header of the enroll dialog. Defaults to the title and its screen reader description.
 * @param props - {@link UserMFAManagementPartProps}
 * @returns Dialog header element.
 */
export function EnrollDialogHeader({ children, className }: UserMFAManagementPartProps) {
  useMFAContext('EnrollDialogHeader');

  return (
    <DialogHeader className={className}>
      {children ?? (
        <>
          <EnrollDialogTitle />
          <EnrollDialogDescription />
        </>
      )}
    </DialogHeader>
  );
}

/**
 * Title of the enroll dialog. It follows the factor and the step of the enrollment.
 * Children replace the translated text.
 * @param props - {@link UserMFAManagementPartProps}
 * @returns Dialog title element.
 */
export function EnrollDialogTitle({ children, className }: UserMFAManagementPartProps) {
  const { model, customMessages } = useMFAContext('EnrollDialogTitle');
  const { qrPhase, contactPhase } = useEnrollDialogContext('EnrollDialogTitle');
  const { t } = useTranslator('user_mfa_management', customMessages);

  return (
    <DialogTitle className={cn('text-left font-medium text-title', className)}>
      {children ?? t(getEnrollTitleKey(model.enrollFactor, qrPhase, contactPhase))}
    </DialogTitle>
  );
}

/**
 * Description of the enroll dialog for assistive technology. It repeats the title and is
 * hidden visually. Children replace the text.
 * @param props - {@link UserMFAManagementPartProps}
 * @returns Dialog description element.
 */
export function EnrollDialogDescription({ children, className }: UserMFAManagementPartProps) {
  const { model, customMessages } = useMFAContext('EnrollDialogDescription');
  const { qrPhase, contactPhase } = useEnrollDialogContext('EnrollDialogDescription');
  const { t } = useTranslator('user_mfa_management', customMessages);

  return (
    <DialogDescription className={cn('sr-only', className)}>
      {children ?? t(getEnrollTitleKey(model.enrollFactor, qrPhase, contactPhase))}
    </DialogDescription>
  );
}

/**
 * Line between the header and the phase.
 * @param props - Class name.
 * @param props.className - Class name.
 * @returns Separator element.
 */
export function EnrollDialogSeparator({ className }: { className?: string }) {
  useMFAContext('EnrollDialogSeparator');
  return <Separator className={className} />;
}

/**
 * The current enrollment phase. Defaults to the part for that phase: `EnrollInstallation`,
 * `EnrollContact`, `EnrollQr` or `EnrollRecovery`. Pass a function to choose what to
 * render per phase, for example to replace one phase and keep the rest.
 * @param props - {@link UserMFAManagementEnrollPhaseProps}
 * @returns The phase element or null while no phase is active.
 */
export function EnrollPhase({ children }: UserMFAManagementEnrollPhaseProps) {
  const { model } = useMFAContext('EnrollPhase');
  const phase = model.enrollmentPhase;
  if (!phase) return null;
  if (children) return <>{children(phase)}</>;

  switch (phase) {
    case QR_PHASE_INSTALLATION:
      return <EnrollInstallation />;
    case ENTER_CONTACT:
      return <EnrollContact />;
    case ENTER_QR:
      return <EnrollQr />;
    case SHOW_RECOVERY_CODE:
      return <EnrollRecovery />;
    default:
      return null;
  }
}

/**
 * Phase that sends the user to install the Guardian app, with the store links. Used when
 * enrolling push notifications.
 * @returns Installation phase element.
 */
export function EnrollInstallation() {
  const { model, customMessages, variables } = useMFAContext('EnrollInstallation');
  const { t } = useTranslator('user_mfa_management', customMessages);

  return (
    <div style={variables} className="w-full">
      <div className="flex flex-col items-stretch flex-1 space-y-10">
        <p className="text-center text-primary text-paragraph font-normal">
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
              <span className="text-paragraph text-center">{t('enrollment.push.app_store')}</span>
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
              <span className="text-paragraph text-center">{t('enrollment.push.google_play')}</span>
            </Card>
          </a>
        </div>
        <DialogFooter>
          <Button
            type="button"
            className="text-sm"
            variant="outline"
            size="default"
            onClick={() => void model.handleCloseEnrollDialog()}
            aria-label={t('actions.cancel_button_label')}
          >
            {t('actions.cancel_button_label')}
          </Button>
          <Button
            type="button"
            className="text-sm"
            size="default"
            onClick={() => void model.handleEnterQRPhase()}
            aria-label={t('actions.continue_button_label')}
          >
            {t('actions.continue_button_label')}
          </Button>
        </DialogFooter>
      </div>
    </div>
  );
}

/**
 * Phase that collects the phone number or email, then the one-time code sent to it.
 * @returns Contact phase element or null while no factor is being enrolled.
 */
export function EnrollContact() {
  const { model, customMessages, styling, schema } = useMFAContext('EnrollContact');
  const { contactPhase, setContactPhase } = useEnrollDialogContext('EnrollContact');
  if (!model.enrollFactor) return null;

  return (
    <ContactInputForm
      factorType={model.enrollFactor}
      contact={model.contact}
      phase={contactPhase}
      isEnrolling={model.isEnrolling}
      isConfirming={model.isConfirming}
      onSubmitContact={model.handleSendCode}
      onResendCode={model.handleResendCode}
      onConfirmOtp={model.handleConfirmOtp}
      onClose={model.handleCloseEnrollDialog}
      onPhaseChange={setContactPhase}
      schema={schema}
      styling={styling}
      customMessages={customMessages}
    />
  );
}

/**
 * Phase that shows the QR code to scan, then asks for the one-time code. Used when
 * enrolling an authenticator app or push notifications.
 * @returns QR phase element or null while no factor is being enrolled.
 */
export function EnrollQr() {
  const { model, customMessages, styling } = useMFAContext('EnrollQr');
  const { qrPhase, setQrPhase } = useEnrollDialogContext('EnrollQr');
  if (!model.enrollFactor) return null;

  return (
    <QRCodeEnrollmentForm
      factorType={model.enrollFactor}
      otpData={model.otpData}
      isEnrolling={model.isEnrolling}
      isConfirming={model.isConfirming}
      phase={qrPhase}
      onContinueQRScan={model.handleConfirmPush}
      onConfirmOtp={model.handleConfirmOtp}
      onClose={model.handleCloseEnrollDialog}
      onPhaseChange={setQrPhase}
      styling={styling}
      customMessages={customMessages}
    />
  );
}

/**
 * Phase that shows the recovery code and asks the user to confirm they saved it.
 * @returns Recovery phase element.
 */
export function EnrollRecovery() {
  const { model, customMessages, styling } = useMFAContext('EnrollRecovery');

  return (
    <ShowRecoveryCode
      recoveryCode={model.recoveryCode}
      isLoading={model.isEnrolling || model.isConfirming}
      onConfirmRecoveryCode={model.handleConfirmRecoveryCode}
      onClose={model.handleCloseEnrollDialog}
      styling={styling}
      customMessages={customMessages}
    />
  );
}
