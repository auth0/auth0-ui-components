import {
  type MFAType,
  type EnrollmentFactor,
  type CreateAuthenticationMethodResponseContent,
  FACTOR_TYPE_EMAIL,
  FACTOR_TYPE_PHONE,
  FACTOR_TYPE_TOTP,
  FACTOR_TYPE_PUSH_NOTIFICATION,
  FACTOR_TYPE_RECOVERY_CODE,
} from '@auth0/universal-components-core';
import type { StepUpApiService } from '@auth0/universal-components-core';
import * as React from 'react';

import AppleLogo from '@/assets/icons/apple-logo';
import GoogleLogo from '@/assets/icons/google-logo';
import { StepUpContactInputForm } from '@/components/auth0/shared/mfa-step-up/step-up-contact-input-form';
import { StepUpQRCodeEnrollmentForm } from '@/components/auth0/shared/mfa-step-up/step-up-qr-code-enrollment-form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { List, ListItem } from '@/components/ui/list';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { useRecoveryCodeGeneration } from '@/hooks/my-account/use-recovery-code';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { ENROLL, CONFIRM } from '@/lib/constants/my-account/mfa/mfa-constants';
import {
  ENTER_QR,
  ENTER_CONTACT,
  QR_PHASE_INSTALLATION,
  SHOW_RECOVERY_CODE,
} from '@/lib/constants/my-account/mfa/mfa-constants';
import { cn } from '@/lib/utils';

type EnrollmentFormPhase =
  | 'PICK'
  | typeof ENTER_CONTACT
  | typeof ENTER_QR
  | typeof QR_PHASE_INSTALLATION
  | typeof SHOW_RECOVERY_CODE;

/**
 * Maps EnrollmentFactor.type (from step-up API) → MFAType (My Account API / UI components).
 * @param type - EnrollmentFactor type string from the step-up API.
 * @returns Corresponding MFAType, or null if the type is not recognised.
 */
function mapEnrollmentFactorTypeToMFAType(type: string): MFAType | null {
  const map: Record<string, MFAType> = {
    otp: FACTOR_TYPE_TOTP,
    push: FACTOR_TYPE_PUSH_NOTIFICATION,
    sms: FACTOR_TYPE_PHONE,
    email: FACTOR_TYPE_EMAIL,
    'recovery-code': FACTOR_TYPE_RECOVERY_CODE,
  };
  return map[type] ?? null;
}

/**
 * Maps MFAType (My Account / UI) → step-up API factorType (used in enroll() params).
 * @param mfaType - My Account MFA type.
 * @returns Corresponding step-up API factor type string.
 */
function mapMFATypeToStepUpFactorType(
  mfaType: MFAType,
): 'otp' | 'sms' | 'email' | 'push' | 'voice' {
  const map: Record<string, 'otp' | 'sms' | 'email' | 'push' | 'voice'> = {
    [FACTOR_TYPE_TOTP]: 'otp',
    [FACTOR_TYPE_PUSH_NOTIFICATION]: 'push',
    [FACTOR_TYPE_PHONE]: 'sms',
    [FACTOR_TYPE_EMAIL]: 'email',
  };
  return map[mfaType] ?? 'otp';
}

interface StepUpEnrollmentSetupFormProps {
  mfaToken: string;
  enrollmentFactors: EnrollmentFactor[];
  stepUpService: StepUpApiService;
  onSuccess: () => void;
  onClose: () => void;
}

/**
 * StepUpEnrollmentSetupForm
 *
 * Copy + adapted version of UserMFASetupForm for the step-up enrollment flow.
 *
 * Key differences:
 * - No Dialog wrapper (rendered inside GateKeeper's dialog)
 * - Adds a PICK phase: shows the list of available enrollment factors first
 * - Builds `enrollMfa` and `confirmEnrollment` adapters that translate
 *   the My Account API interface expected by sub-forms into step-up
 *   service calls (stepUpService.enroll() / stepUpService.verify())
 * - Passes selected MFAType → StepUpContactInputForm or StepUpQRCodeEnrollmentForm
 * @param root0 - Component props.
 * @returns Enrollment setup form element.
 */
export function StepUpEnrollmentSetupForm({
  mfaToken,
  enrollmentFactors,
  stepUpService,
  onSuccess,
  onClose,
}: StepUpEnrollmentSetupFormProps) {
  const { t } = useTranslator('common');
  const tMfa = useTranslator('mfa').t;

  const [phase, setPhase] = React.useState<EnrollmentFormPhase>('PICK');
  const [selectedFactor, setSelectedFactor] = React.useState<MFAType | null>(null);

  // We repurpose `auth_session` to carry the oobCode back from enroll → to verify.
  // This ref stores the oobCode between the enroll and verify calls.
  const oobCodeRef = React.useRef<string | null>(null);

  /*
   * enrollMfa adapter
   * Translates (MFAType, options) → stepUpService.enroll()
   * Returns a normalized object that matches what sub-component hooks expect:
   *   auth_session  → carries oobCode (for OOB verify call)
   *   barcode_uri   → barcodeUri from step-up enroll response
   *   id            → authenticator id
   *   manual_input_code → secret for TOTP manual entry
   */
  const enrollMfa = React.useCallback(
    async (
      factorType: MFAType,
      options: Record<string, string>,
    ): Promise<CreateAuthenticationMethodResponseContent> => {
      const stepUpFactorType = mapMFATypeToStepUpFactorType(factorType);

      type AnyParams = Parameters<typeof stepUpService.enroll>[0];
      let params: AnyParams;

      if (stepUpFactorType === 'sms' || stepUpFactorType === 'voice') {
        params = {
          mfaToken,
          factorType: stepUpFactorType,
          phoneNumber: options.phone_number ?? '',
        };
      } else if (stepUpFactorType === 'email') {
        params = { mfaToken, factorType: 'email', email: options.email ?? '' };
      } else if (stepUpFactorType === 'push') {
        params = { mfaToken, factorType: 'push' };
      } else {
        params = { mfaToken, factorType: 'otp' };
      }

      const response = await stepUpService.enroll(params);

      // For OOB factors the oobCode must reach verify(); store it in auth_session.
      const oobCode = 'oobCode' in response ? (response.oobCode ?? '') : '';
      oobCodeRef.current = oobCode || null;

      const barcodeUri = 'barcodeUri' in response ? (response.barcodeUri ?? '') : '';
      const secret = 'secret' in response ? (response.secret ?? '') : '';

      // Return shape compatible with CreateAuthenticationMethodResponseContent
      return {
        id: response.id ?? '',
        auth_session: oobCode, // repurposed: carries oobCode for OOB verify
        barcode_uri: barcodeUri,
        manual_input_code: secret,
      } as unknown as CreateAuthenticationMethodResponseContent;
    },
    [mfaToken, stepUpService],
  );

  /*
   * confirmEnrollment adapter
   * Translates (factorType, authSession, authId, { userOtpCode }) → stepUpService.verify()
   *
   * For OTP/TOTP:  verify({ mfaToken, otp: userOtpCode })
   * For OOB:       verify({ mfaToken, oobCode: authSession, bindingCode: userOtpCode })
   *   (authSession carries the oobCode from the enroll response via enrollMfa adapter above)
   */
  const confirmEnrollment = React.useCallback(
    async (
      factorType: MFAType,
      authSession: string,
      _authenticationMethodId: string,
      options: { userOtpCode?: string },
    ): Promise<unknown> => {
      const isOtp = factorType === FACTOR_TYPE_TOTP;

      if (isOtp) {
        await stepUpService.verify({ mfaToken, otp: options.userOtpCode });
      } else {
        await stepUpService.verify({
          mfaToken,
          oobCode: authSession,
          bindingCode: options.userOtpCode,
        });
      }

      return {};
    },
    [mfaToken, stepUpService],
  );

  const handleEnrollError = React.useCallback(
    (_error: Error, _stage: typeof ENROLL | typeof CONFIRM) => {
      // Errors are displayed inside the sub-forms; no top-level toast needed here
    },
    [],
  );

  // Fake dummy hook call: useRecoveryCodeGeneration is only invoked if SHOW_RECOVERY_CODE is needed.
  // Keep the hook call unconditional (rules of hooks) but we skip RECOVERY_CODE in step-up for now.
  const { fetchRecoveryCode, loading: recoveryLoading } = useRecoveryCodeGeneration({
    factorType: selectedFactor ?? FACTOR_TYPE_RECOVERY_CODE,
    enrollMfa,
    onError: handleEnrollError,
    onClose,
  });

  React.useEffect(() => {
    if (phase === SHOW_RECOVERY_CODE) {
      fetchRecoveryCode();
    }
  }, [phase]);

  const handlePickFactor = (enrollmentFactor: EnrollmentFactor) => {
    const mfaType = mapEnrollmentFactorTypeToMFAType(enrollmentFactor.type);
    if (!mfaType) return;

    setSelectedFactor(mfaType);

    const phaseMap: Partial<Record<MFAType, EnrollmentFormPhase>> = {
      [FACTOR_TYPE_EMAIL]: ENTER_CONTACT,
      [FACTOR_TYPE_PHONE]: ENTER_CONTACT,
      [FACTOR_TYPE_PUSH_NOTIFICATION]: QR_PHASE_INSTALLATION,
      [FACTOR_TYPE_TOTP]: ENTER_QR,
      [FACTOR_TYPE_RECOVERY_CODE]: SHOW_RECOVERY_CODE,
    };

    setPhase(phaseMap[mfaType] ?? ENTER_CONTACT);
  };

  const renderPickPhase = () => (
    <div className="w-full">
      <p className="text-sm text-muted-foreground text-left mb-4">
        {t('error.mfa.enrollment_required')}
      </p>

      <List className="flex flex-col gap-0 w-full">
        {enrollmentFactors.map((factor) => {
          const mfaType = mapEnrollmentFactorTypeToMFAType(factor.type);
          const displayKey = `error.mfa.authenticator_type.${factor.type}`;
          const displayName = t(displayKey);

          return (
            <ListItem
              key={factor.type}
              className="flex items-center justify-between py-4 border-b last:border-b-0"
              aria-label={displayName}
            >
              <span className="text-sm font-medium text-card-foreground">{displayName}</span>
              <Button
                type="button"
                size="default"
                variant="outline"
                className="text-sm shrink-0 ml-4"
                onClick={() => handlePickFactor(factor)}
                disabled={!mfaType}
                aria-label={`${t('error.mfa.enroll_button')} ${displayName}`}
              >
                {t('error.mfa.enroll_button')}
              </Button>
            </ListItem>
          );
        })}
      </List>

      <Separator className="mt-6" />

      <div className="flex justify-center mt-4">
        <Button
          type="button"
          variant="outline"
          size="default"
          className="text-sm"
          onClick={onClose}
          aria-label={t('error.mfa.cancel')}
        >
          {t('error.mfa.cancel')}
        </Button>
      </div>
    </div>
  );

  const renderInstallationPhase = () => (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex flex-col items-center justify-center flex-1 space-y-10">
        <p className={cn('text-center text-primary text-sm font-normal')}>
          {tMfa('enrollment_form.show_otp.install_guardian_description')}
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
              <span className={cn('text-sm text-center')}>{tMfa('app-store')}</span>
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
              <span className={cn('text-sm text-center')}>{tMfa('google-play')}</span>
            </Card>
          </a>
        </div>
        <div className="flex flex-col gap-4 w-full mt-6 mb-6">
          <Separator />
          <div className="flex flex-row justify-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setPhase('PICK')}>
              {t('error.mfa.back')}
            </Button>
            <Button size="sm" onClick={() => setPhase(ENTER_QR)}>
              {t('error.mfa.continue')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRecoveryCodePhase = () => {
    if (recoveryLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <Spinner />
        </div>
      );
    }
    return null;
  };

  if (!selectedFactor || phase === 'PICK') {
    return renderPickPhase();
  }

  switch (phase) {
    case QR_PHASE_INSTALLATION:
      return renderInstallationPhase();

    case ENTER_CONTACT:
      return (
        <StepUpContactInputForm
          factorType={selectedFactor}
          enrollMfa={enrollMfa}
          confirmEnrollment={confirmEnrollment}
          onError={handleEnrollError}
          onSuccess={onSuccess}
          onClose={onClose}
        />
      );

    case ENTER_QR:
      return (
        <StepUpQRCodeEnrollmentForm
          factorType={selectedFactor}
          enrollMfa={enrollMfa}
          confirmEnrollment={confirmEnrollment}
          onError={handleEnrollError}
          onSuccess={onSuccess}
          onClose={onClose}
        />
      );

    case SHOW_RECOVERY_CODE:
      return renderRecoveryCodePhase();

    default:
      return null;
  }
}
