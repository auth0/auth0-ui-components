import * as React from 'react';
import {
  type MFAType,
  type EnrollMfaResponse,
  FACTOR_TYPE_EMAIL,
  FACTOR_TYPE_SMS,
  FACTOR_TYPE_TOPT,
  FACTOR_TYPE_PUSH_NOTIFICATION,
} from '@auth0-web-ui-components/core';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { ContactInputForm } from './contact-input-form';
import { QRCodeEnrollmentForm } from './qr-code-enrollment-form';

import {
  ENTER_QR,
  ENTER_OTP,
  ENTER_CONTACT,
  ENROLL,
  CONFIRM,
  QR_PHASE_INSTALLATION,
} from '@/lib/mfa-constants';

import { useTranslator } from '@/hooks';
import AppleLogo from '@/lib/svgs/apple-logo';
import GoogleLogo from '@/lib/svgs/google-logo';

type UserMFASetupFormProps = {
  open: boolean;
  onClose: () => void;
  factorType: MFAType;
  enrollMfa: (factor: MFAType, options: Record<string, string>) => Promise<EnrollMfaResponse>;
  confirmEnrollment: (
    factor: MFAType,
    options: { oobCode?: string; userOtpCode?: string },
  ) => Promise<unknown | null>;
  onSuccess: () => void;
  onError: (error: Error, stage: typeof ENROLL | typeof CONFIRM) => void;
  schemaValidation?: { email?: RegExp; phone?: RegExp };
};

type EnrollmentPhase =
  | typeof ENTER_CONTACT
  | typeof ENTER_OTP
  | typeof ENTER_QR
  | typeof QR_PHASE_INSTALLATION
  | null;

export function UserMFASetupForm({
  open,
  onClose,
  factorType,
  enrollMfa,
  confirmEnrollment,
  onSuccess,
  onError,
  schemaValidation,
}: UserMFASetupFormProps) {
  const { t } = useTranslator('mfa');

  // Initialize phase as null, meaning no UI shown by default
  const [phase, setPhase] = React.useState<EnrollmentPhase>(null);

  React.useEffect(() => {
    if (!open) {
      setPhase(null);
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const phaseMap: Partial<Record<MFAType, EnrollmentPhase>> = {
      [FACTOR_TYPE_EMAIL]: ENTER_CONTACT,
      [FACTOR_TYPE_SMS]: ENTER_CONTACT,
      [FACTOR_TYPE_PUSH_NOTIFICATION]: QR_PHASE_INSTALLATION,
      [FACTOR_TYPE_TOPT]: ENTER_QR,
    };

    setPhase(phaseMap[factorType] ?? null);
  }, [open, factorType]);

  const renderInstallationPhase = () => (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex flex-col items-center justify-center flex-1 space-y-10">
        <p className="text-center text-(length:--font-size-paragraph) font-normal">
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
              <span className="text-sm text-center">{t('app-store')}</span>
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
              <span className=" text-(length:--font-size-paragraph) text-center">
                {t('google-play')}
              </span>
            </Card>
          </a>
        </div>
        <div className="flex flex-col gap-3 w-full">
          <Button type="button" className="text-sm" size="lg" onClick={() => setPhase(ENTER_QR)}>
            {t('continue')}
          </Button>
          <Button type="button" className="text-sm" variant="ghost" size="lg" onClick={onClose}>
            {t('cancel')}
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
            schemaValidation={schemaValidation}
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
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open && Boolean(phase)} onOpenChange={onClose}>
      <DialogContent aria-describedby="mfa-setup-form" className="w-[400px] h-[548px]">
        <DialogHeader>
          <DialogTitle className="text-left font-medium text-(length:--font-size-title)">
            {t('enrollment_form.enroll_title')}
          </DialogTitle>
          <Separator className="my-2" />
        </DialogHeader>
        {renderForm()}
      </DialogContent>
    </Dialog>
  );
}
