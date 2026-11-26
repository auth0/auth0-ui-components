/**
 * The steps of enrolling an MFA factor: install the app, enter a contact, scan the QR code and
 * save the recovery codes.
 * @module enrollment-steps
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
  type MfaStepUpMachine,
  type MfaStepUpSnapshot,
  type SmsContactForm,
} from '@auth0/universal-components-core';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { ActionRow } from './elements/action-row';
import {
  MfaButton,
  MfaDialogDescription,
  MfaDialogHeader,
  MfaDialogTitle,
} from './elements/dialog-elements';

import AppleLogo from '@/assets/icons/apple-logo';
import GoogleLogo from '@/assets/icons/google-logo';
import { CopyableTextField } from '@/components/auth0/shared/copyable-text-field';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { useTranslator } from '@/hooks/shared/use-translator';
import { FORM_VALIDATION_MODE } from '@/lib/constants/form-constants';
import { cn } from '@/lib/utils';
import type { MfaStepUpClasses } from '@/types/mfa-step-up-types';

interface EnrollmentStepProps {
  snapshot: MfaStepUpSnapshot;
  machine: MfaStepUpMachine;
  classes?: MfaStepUpClasses;
}

const GUARDIAN_APP_STORE_URL = 'https://apps.apple.com/us/app/auth0-guardian/id1093447833';
const GUARDIAN_PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.auth0.guardian';

type ContactForm = EmailContactForm | SmsContactForm;

/**
 * Asks the user to install the Guardian app before a push factor is enrolled.
 *
 * @param props - Component props.
 * @param props.snapshot - The flow's snapshot.
 * @param props.machine - The flow's machine.
 * @param props.classes - The integrator's class overrides.
 * @returns Install step element.
 * @internal
 */
export function InstallStep({ snapshot, machine, classes }: EnrollmentStepProps) {
  const { t } = useTranslator('gate_keeper');
  const isLoading = snapshot.request.isLoading;

  return (
    <>
      <MfaDialogHeader classes={classes}>
        <MfaDialogTitle classes={classes}>{t('mfa.enroll.install_title')}</MfaDialogTitle>
        <MfaDialogDescription classes={classes}>
          {t('mfa.enroll.install_description')}
        </MfaDialogDescription>
      </MfaDialogHeader>
      <Separator />

      <div className="flex gap-4 my-4">
        <a
          href={GUARDIAN_APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <Card
            className={cn(
              'flex flex-col items-center gap-2 p-4 h-full',
              classes?.['MfaStepUp-storeCard'],
            )}
          >
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
          <Card
            className={cn(
              'flex flex-col items-center gap-2 p-4 h-full',
              classes?.['MfaStepUp-storeCard'],
            )}
          >
            <GoogleLogo className="w-8 h-8" />
            <span className="text-sm text-center">{t('mfa.enroll.google_play')}</span>
          </Card>
        </a>
      </div>

      <Separator />

      <ActionRow classes={classes} className="mt-4">
        <MfaButton
          classes={classes}
          type="button"
          variant="outline"
          onClick={machine.back}
          disabled={isLoading}
          aria-label={t('mfa.back')}
        >
          {t('mfa.back')}
        </MfaButton>
        <MfaButton
          classes={classes}
          type="button"
          variant="primary"
          onClick={() => machine.next()}
          disabled={isLoading}
          aria-label={t('mfa.continue')}
        >
          {isLoading && <Spinner size="sm" colorScheme="foreground" />}
          {t('mfa.continue')}
        </MfaButton>
      </ActionRow>
    </>
  );
}

/**
 * Asks for the phone number or email a code will be sent to.
 *
 * @param props - Component props.
 * @param props.snapshot - The flow's snapshot.
 * @param props.machine - The flow's machine.
 * @param props.classes - The integrator's class overrides.
 * @returns Contact step element.
 * @internal
 */
export function ContactStep({ snapshot, machine, classes }: EnrollmentStepProps) {
  const { t } = useTranslator('gate_keeper');
  const isLoading = snapshot.request.isLoading;
  const isEmail = snapshot.facts.factor === FACTOR_TYPE_EMAIL;

  const contactSchema = useMemo(
    () =>
      isEmail
        ? createEmailContactSchema(t('mfa.enroll.invalid_email'))
        : createSmsContactSchema(t('mfa.enroll.invalid_phone_number')),
    [isEmail, t],
  );

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    mode: FORM_VALIDATION_MODE,
    defaultValues: { contact: snapshot.contact },
  });

  const inputConfig =
    snapshot.facts.factor === FACTOR_TYPE_SMS || snapshot.facts.factor === FACTOR_TYPE_VOICE
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
      <MfaDialogHeader classes={classes}>
        <MfaDialogTitle classes={classes}>{inputConfig.title}</MfaDialogTitle>
      </MfaDialogHeader>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(({ contact }) => machine.next(contact))}
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="contact"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="enroll-input" className="text-left text-paragraph font-medium">
                  {inputConfig.label}
                </FormLabel>
                <FormControl>
                  <TextField
                    id="enroll-input"
                    {...field}
                    type={inputConfig.type}
                    placeholder={inputConfig.placeholder}
                    autoComplete={inputConfig.autoComplete}
                    className={classes?.['MfaStepUp-field']}
                  />
                </FormControl>
                <FormDescription className="text-paragraph font-normal text-left">
                  {inputConfig.description}
                </FormDescription>
                <FormMessage className="text-left text-paragraph" id="contact-error" role="alert" />
              </FormItem>
            )}
          />

          <Separator />

          <ActionRow classes={classes}>
            <MfaButton
              classes={classes}
              type="button"
              variant="outline"
              onClick={machine.back}
              disabled={isLoading}
              aria-label={t('mfa.back')}
            >
              {t('mfa.back')}
            </MfaButton>
            <MfaButton
              classes={classes}
              type="submit"
              variant="primary"
              disabled={!form.formState.isValid || isLoading}
              aria-label={isLoading ? t('mfa.enroll.enrolling') : t('mfa.verify_button')}
            >
              {isLoading && <Spinner size="sm" colorScheme="foreground" />}
              {isLoading ? t('mfa.enroll.enrolling') : t('mfa.verify_button')}
            </MfaButton>
          </ActionRow>
        </form>
      </Form>
    </>
  );
}

/**
 * Shows the QR code to scan with an authenticator app, or with the Guardian app for push.
 *
 * @param props - Component props.
 * @param props.snapshot - The flow's snapshot.
 * @param props.machine - The flow's machine.
 * @param props.classes - The integrator's class overrides.
 * @returns QR step element.
 * @internal
 */
export function QrStep({ snapshot, machine, classes }: EnrollmentStepProps) {
  const { t } = useTranslator('gate_keeper');
  const isLoading = snapshot.request.isLoading;
  const isPush = snapshot.facts.factor === FACTOR_TYPE_PUSH;
  const { barcodeUri, authenticatorType, secret } = snapshot.enrollment;

  if (!barcodeUri) return null;

  return (
    <>
      <MfaDialogHeader classes={classes}>
        <MfaDialogTitle classes={classes}>{t('mfa.title')}</MfaDialogTitle>
      </MfaDialogHeader>
      <Separator />
      <div className={cn('flex justify-center my-4', classes?.['MfaStepUp-qrCode'])}>
        <QRCodeDisplayer size={160} value={barcodeUri} alt={t('mfa.enroll.qr_alt')} />
      </div>

      <div className="space-y-4" aria-describedby="qr-description">
        <p id="qr-description" className="font-semibold text-center text-paragraph text-primary">
          {isPush ? t('mfa.enroll.push_scan_description') : t('mfa.enroll.scan_description')}
        </p>

        {!isPush && <p className="font-normal text-paragraph">{t('mfa.enroll.scan_helper')}</p>}

        {authenticatorType === FACTOR_TYPE_OTP && secret && (
          <CopyableTextField value={secret} className={classes?.['MfaStepUp-field']} />
        )}
      </div>

      <Separator className="mt-4" />

      <ActionRow classes={classes} className="mt-4">
        <MfaButton
          classes={classes}
          type="button"
          variant="outline"
          onClick={machine.back}
          disabled={isLoading}
          aria-label={t('mfa.back')}
        >
          {t('mfa.back')}
        </MfaButton>
        <MfaButton
          classes={classes}
          type="button"
          variant="primary"
          onClick={() => machine.next()}
          disabled={isLoading}
          aria-label={t('mfa.continue')}
        >
          {isLoading && <Spinner size="sm" colorScheme="foreground" />}
          {t('mfa.continue')}
        </MfaButton>
      </ActionRow>
    </>
  );
}

/**
 * Shows the recovery codes, and waits for the user to say they saved them.
 *
 * @param props - Component props.
 * @param props.snapshot - The flow's snapshot.
 * @param props.machine - The flow's machine.
 * @param props.classes - The integrator's class overrides.
 * @returns Recovery codes step element.
 * @internal
 */
export function RecoveryStep({ snapshot, machine, classes }: EnrollmentStepProps) {
  const { t } = useTranslator('gate_keeper');
  const [isConfirmed, setIsConfirmed] = useState(false);

  const recoveryCodes = snapshot.newRecoveryCode
    ? [snapshot.newRecoveryCode]
    : (snapshot.enrollment.recoveryCodes ?? []);

  return (
    <>
      <MfaDialogHeader classes={classes}>
        <MfaDialogTitle classes={classes}>{t('mfa.enroll.backup_code_title')}</MfaDialogTitle>
        <MfaDialogDescription classes={classes}>
          {t('mfa.enroll.backup_code_description')}
        </MfaDialogDescription>
      </MfaDialogHeader>
      <div className="space-y-4 my-6">
        {recoveryCodes.map((code) => (
          <CopyableTextField
            key={code}
            value={code}
            className={cn(classes?.['MfaStepUp-field'], classes?.['MfaStepUp-recoveryCode'])}
          />
        ))}

        <div className="flex items-center gap-3">
          <Checkbox
            id="recovery-confirmed"
            checked={isConfirmed}
            onCheckedChange={(checked) => setIsConfirmed(checked === true)}
          />
          <Label htmlFor="recovery-confirmed" className="cursor-pointer">
            {t('mfa.enroll.backup_code_confirmed')}
          </Label>
        </div>
      </div>

      <ActionRow classes={classes}>
        <MfaButton
          classes={classes}
          type="button"
          variant="primary"
          onClick={() => machine.next()}
          disabled={!isConfirmed}
          aria-label={t('mfa.continue')}
        >
          {t('mfa.continue')}
        </MfaButton>
      </ActionRow>
    </>
  );
}
