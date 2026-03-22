/**
 * MFA enrollment setup form.
 * @module enrollment-form
 * @internal
 */

import {
  FACTOR_TYPE_EMAIL,
  FACTOR_TYPE_OTP,
  FACTOR_TYPE_PUSH,
  FACTOR_TYPE_SMS,
  FACTOR_TYPE_VOICE,
  createEmailContactSchema,
  createSmsContactSchema,
  type EmailContactForm,
  type EnrollmentFactor,
  type EnrollmentResponse,
  type EnrollParams,
  type MfaRequiredError,
  type SmsContactForm,
} from '@auth0/universal-components-core';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { VerifyForm } from './verify-form';

import AppleLogo from '@/assets/icons/apple-logo';
import GoogleLogo from '@/assets/icons/google-logo';
import { CopyableTextField } from '@/components/auth0/shared/copyable-text-field';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { QRCodeDisplayer } from '@/components/ui/qr-code';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { TextField } from '@/components/ui/text-field';
import { useMfaStepUp } from '@/hooks/shared/use-mfa-step-up';
import { useTranslator } from '@/hooks/shared/use-translator';

interface EnrollmentFormProps {
  error: MfaRequiredError;
  factor: EnrollmentFactor;
  onComplete: () => void;
  onCancel: () => void;
}

const GUARDIAN_APP_STORE_URL = 'https://apps.apple.com/us/app/auth0-guardian/id1093447833';
const GUARDIAN_PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.auth0.guardian';

const FACTOR_INITIAL_STEP: Record<string, EnrollStep> = {
  [FACTOR_TYPE_OTP]: 'qr',
  [FACTOR_TYPE_PUSH]: 'install',
};

type EnrollStep = 'install' | 'input' | 'qr' | 'verify' | 'recovery';
type ContactForm = EmailContactForm | SmsContactForm;

/**
 * Multi-step enrollment form for MFA step-up. Supports OTP, Push, SMS, Voice, and Email factors.
 * Recovery codes are shown on first enrollment of any factor.
 *
 * @param props - Component props.
 * @returns Enrollment form element.
 * @internal
 */
export function EnrollmentForm({ error, factor, onComplete, onCancel }: EnrollmentFormProps) {
  const { t } = useTranslator('gate_keeper');

  const mfaToken = error.mfa_token;

  const isOtp = factor.type === FACTOR_TYPE_OTP;
  const isPush = factor.type === FACTOR_TYPE_PUSH;

  const [step, setStep] = useState<EnrollStep>(FACTOR_INITIAL_STEP[factor.type] ?? 'input');
  const [enrollResponse, setEnrollResponse] = useState<EnrollmentResponse | undefined>();
  const [recoveryConfirmed, setRecoveryConfirmed] = useState(false);

  const handleVerifyComplete = useCallback(() => {
    if (enrollResponse?.recoveryCodes?.length) {
      setStep('recovery');
    } else {
      onComplete();
    }
  }, [enrollResponse, onComplete]);

  const { enroll, isLoading } = useMfaStepUp({ error, onComplete: handleVerifyComplete });

  const contactSchema = useMemo(
    () =>
      factor.type === FACTOR_TYPE_EMAIL
        ? createEmailContactSchema(t('mfa.enroll.invalid_email'))
        : createSmsContactSchema(t('mfa.enroll.invalid_phone_number')),
    [factor.type, t],
  );

  const inputForm = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    mode: 'onChange',
  });

  // OTP only: call enroll on mount then show QR.
  useEffect(() => {
    if (!isOtp) return;

    const initialiseOtpEnrollment = async () => {
      const response = await enroll({ mfaToken, factorType: FACTOR_TYPE_OTP });
      if (response) setEnrollResponse(response);
    };

    initialiseOtpEnrollment();
  }, [enroll, isOtp, mfaToken]);

  const handleInputSubmit = async ({ contact }: ContactForm) => {
    const params: EnrollParams =
      factor.type === FACTOR_TYPE_EMAIL
        ? { mfaToken, factorType: FACTOR_TYPE_EMAIL, email: contact }
        : { mfaToken, factorType: factor.type as 'sms' | 'voice', phoneNumber: contact };

    const response = await enroll(params);

    if (response) {
      setEnrollResponse(response);
      setStep('verify');
    }
  };

  const handlePushEnroll = async () => {
    const response = await enroll({ mfaToken, factorType: FACTOR_TYPE_PUSH });
    if (!response) return;
    setEnrollResponse(response);
    setStep('qr');
  };

  if (isOtp && !enrollResponse && step === 'qr') {
    return (
      <div className="flex items-center justify-center p-8" role="status" aria-live="polite">
        <Spinner />
      </div>
    );
  }

  if (step === 'install') {
    return (
      <>
        <DialogHeader>
          <DialogTitle>{t('mfa.enroll.install_title')}</DialogTitle>
          <DialogDescription>{t('mfa.enroll.install_description')}</DialogDescription>
        </DialogHeader>
        <Separator />

        <div className="flex gap-4 my-4">
          <a
            href={GUARDIAN_APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Card className="flex flex-col items-center gap-2 p-4 h-full">
              <AppleLogo className="w-8 h-8" />
              <span className="text-sm text-center">{t('mfa.enroll.app_store')}</span>
            </Card>
          </a>
          <a
            href={GUARDIAN_PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Card className="flex flex-col items-center gap-2 p-4 h-full">
              <GoogleLogo className="w-8 h-8" />
              <span className="text-sm text-center">{t('mfa.enroll.google_play')}</span>
            </Card>
          </a>
        </div>

        <Separator />

        <div className="flex justify-end gap-3 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            aria-label={t('mfa.back')}
          >
            {t('mfa.back')}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handlePushEnroll}
            disabled={isLoading}
            aria-label={t('mfa.continue')}
          >
            {isLoading && <Spinner size="sm" colorScheme="foreground" />}
            {t('mfa.continue')}
          </Button>
        </div>
      </>
    );
  }

  if (step === 'verify' && enrollResponse) {
    return (
      <VerifyForm
        error={error}
        authenticator={{ ...enrollResponse, name: inputForm.getValues('contact') }}
        onComplete={handleVerifyComplete}
        onCancel={() => setStep(isOtp ? 'qr' : 'input')}
      />
    );
  }

  if (step === 'input') {
    const inputConfig =
      factor.type === FACTOR_TYPE_SMS || factor.type === FACTOR_TYPE_VOICE
        ? {
            label: t('mfa.enroll.phone_label'),
            description: t('mfa.enroll.phone_description'),
            title: t('mfa.enroll.phone_title'),
            placeholder: '+1 555 000 0000',
            type: 'tel',
            autoComplete: 'tel',
          }
        : {
            label: t('mfa.enroll.email_label'),
            description: t('mfa.enroll.email_description'),
            title: t('mfa.enroll.email_title'),
            placeholder: 'you@example.com',
            type: 'email',
            autoComplete: 'email',
          };

    return (
      <>
        <DialogHeader>
          <DialogTitle>{inputConfig.title}</DialogTitle>
        </DialogHeader>
        <Separator />
        <Form {...inputForm}>
          <form onSubmit={inputForm.handleSubmit(handleInputSubmit)} className="space-y-6">
            <FormField
              control={inputForm.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    htmlFor="enroll-input"
                    className="text-left text-sm text-(length:--font-size-paragraph) font-medium"
                  >
                    {inputConfig.label}
                  </FormLabel>
                  <FormControl>
                    <TextField
                      id="enroll-input"
                      {...field}
                      type={inputConfig.type}
                      placeholder={inputConfig.placeholder}
                      autoComplete={inputConfig.autoComplete}
                    />
                  </FormControl>
                  <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
                    {inputConfig.description}
                  </FormDescription>
                  <FormMessage
                    className="text-left text-sm text-(length:--font-size-paragraph)"
                    id="contact-error"
                    role="alert"
                  />
                </FormItem>
              )}
            />

            <Separator />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                aria-label={t('mfa.back')}
              >
                {t('mfa.back')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!inputForm.formState.isValid || isLoading}
                aria-label={isLoading ? t('mfa.enroll.enrolling') : t('mfa.verify_button')}
              >
                {isLoading && <Spinner size="sm" colorScheme="foreground" />}
                {isLoading ? t('mfa.enroll.enrolling') : t('mfa.verify_button')}
              </Button>
            </div>
          </form>
        </Form>
      </>
    );
  }

  if (step === 'qr' && enrollResponse?.barcodeUri) {
    const barcodeUri = enrollResponse.barcodeUri;
    const description = isPush
      ? t('mfa.enroll.push_scan_description')
      : t('mfa.enroll.scan_description');
    return (
      <>
        <DialogHeader>
          <DialogTitle>{t('mfa.title')}</DialogTitle>
        </DialogHeader>
        <Separator />
        <div className="flex justify-center my-4">
          <QRCodeDisplayer size={160} value={barcodeUri} alt={t('mfa.enroll.qr_alt')} />
        </div>

        <div className="space-y-4" aria-describedby="qr-description">
          <p
            id="qr-description"
            className="font-semibold text-base text-center text-(length:--font-size-paragraph) text-primary"
          >
            {description}
          </p>

          {!isPush && (
            <p className="font-normal text-sm text-(length:--font-size-paragraph)">
              {t('mfa.enroll.scan_helper')}
            </p>
          )}

          {enrollResponse.authenticatorType === FACTOR_TYPE_OTP && (
            <CopyableTextField value={enrollResponse.secret} />
          )}
        </div>

        <Separator className="mt-4" />

        <div className="flex justify-end gap-3 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={isPush ? () => setStep('install') : onCancel}
            disabled={isLoading}
            aria-label={t('mfa.back')}
          >
            {t('mfa.back')}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => (isOtp ? setStep('verify') : handleVerifyComplete())}
            disabled={isLoading}
            aria-label={t('mfa.continue')}
          >
            {isLoading && <Spinner size="sm" colorScheme="foreground" />}
            {t('mfa.continue')}
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('mfa.enroll.recovery_title')}</DialogTitle>
        <DialogDescription>{t('mfa.enroll.recovery_description')}</DialogDescription>
      </DialogHeader>
      <Separator />
      <div className="space-y-4 my-6">
        {enrollResponse?.recoveryCodes?.[0] && (
          <CopyableTextField value={enrollResponse.recoveryCodes[0]} />
        )}

        <div className="flex items-center gap-3">
          <Checkbox
            id="recovery-confirmed"
            checked={recoveryConfirmed}
            onCheckedChange={(checked) => setRecoveryConfirmed(checked === true)}
          />
          <Label htmlFor="recovery-confirmed" className="cursor-pointer">
            {t('mfa.enroll.recovery_confirmed')}
          </Label>
        </div>
      </div>

      <Separator />

      <div className="flex justify-end gap-3 mt-4">
        <Button
          type="button"
          variant="primary"
          onClick={onComplete}
          disabled={!recoveryConfirmed}
          aria-label={t('mfa.continue')}
        >
          {t('mfa.continue')}
        </Button>
      </div>
    </>
  );
}
