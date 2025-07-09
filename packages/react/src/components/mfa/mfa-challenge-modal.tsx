import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Spinner } from '../ui/spinner';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useI18n } from '../../hooks/use-i18n';

// Temporary types until they're exported from core
interface MfaChallenge {
  type: 'mfa_required' | 'step_up_authentication';
  challengeToken: string;
  availableMethods: MfaChallengeMethod[];
  message?: string;
}

interface MfaChallengeMethod {
  type: string;
  authenticatorId: string;
  name: string;
  preferred?: boolean;
}

interface ResolveChallengeOptions {
  challengeToken: string;
  authenticatorId: string;
  code: string;
}

interface ResolveChallengeResponse {
  success: boolean;
  accessToken?: string;
  error?: string;
}

interface MfaChallengeModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Challenge information from the enrollment attempt */
  challenge: MfaChallenge;
  /** Function to resolve the challenge */
  onResolveChallenge: (options: ResolveChallengeOptions) => Promise<ResolveChallengeResponse>;
  /** Called when challenge is successfully resolved */
  onSuccess: (accessToken: string) => void;
  /** Called when there's an error resolving the challenge */
  onError: (error: Error) => void;
  /** Called when modal should be closed */
  onClose: () => void;
  /** Localization object */
  localization?: Record<string, string>;
}

const ChallengeCodeSchema = z.object({
  code: z.string().min(1, 'Code is required'),
});

type ChallengeCodeForm = z.infer<typeof ChallengeCodeSchema>;

/**
 * Modal component for handling MFA challenges before enrollment.
 * Displays available authentication methods and allows users to complete the challenge.
 */
export function MfaChallengeModal({
  open,
  challenge,
  onResolveChallenge,
  onSuccess,
  onError,
  onClose,
  localization = {},
}: MfaChallengeModalProps): React.JSX.Element {
  const t = useI18n('mfa_challenge', localization);
  const [selectedMethod, setSelectedMethod] = useState<MfaChallengeMethod | null>(
    challenge.availableMethods[0] || null,
  );
  const [loading, setLoading] = useState(false);

  const form = useForm<ChallengeCodeForm>({
    resolver: zodResolver(ChallengeCodeSchema),
    mode: 'onChange',
  });

  const handleSubmit = useCallback(
    async (data: ChallengeCodeForm) => {
      if (!selectedMethod) return;

      setLoading(true);
      try {
        const result = await onResolveChallenge({
          challengeToken: challenge.challengeToken,
          authenticatorId: selectedMethod.authenticatorId,
          code: data.code,
        });

        if (result.success && result.accessToken) {
          onSuccess(result.accessToken);
          onClose();
        } else {
          onError(new Error(result.error || 'Challenge resolution failed'));
        }
      } catch (error) {
        onError(error instanceof Error ? error : new Error('Unexpected error'));
      } finally {
        setLoading(false);
      }
    },
    [selectedMethod, challenge.challengeToken, onResolveChallenge, onSuccess, onError, onClose],
  );

  const getMethodDisplayName = (method: MfaChallengeMethod): string => {
    switch (method.type) {
      case 'sms':
        return t('methods.sms');
      case 'email':
        return t('methods.email');
      case 'totp':
        return t('methods.totp');
      case 'push-notification':
        return t('methods.push');
      default:
        return method.name;
    }
  };

  const getCodePlaceholder = (method: MfaChallengeMethod): string => {
    switch (method.type) {
      case 'sms':
      case 'email':
        return t('placeholders.otp_code');
      case 'totp':
        return t('placeholders.app_code');
      default:
        return t('placeholders.code');
    }
  };

  const isOtpMethod = (method: MfaChallengeMethod): boolean => {
    return ['sms', 'email', 'totp'].includes(method.type);
  };

  return (
    <Dialog open={open} onOpenChange={!loading ? onClose : undefined}>
      <DialogContent aria-describedby="mfa-challenge-description" className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">{t('title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div id="mfa-challenge-description" className="text-center text-muted-foreground">
            <p>{challenge.message || t('description')}</p>
          </div>

          {challenge.availableMethods.length > 1 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('select_method')}</Label>
              <div className="grid gap-2">
                {challenge.availableMethods.map((method) => (
                  <Button
                    key={method.authenticatorId}
                    variant={
                      selectedMethod?.authenticatorId === method.authenticatorId
                        ? 'default'
                        : 'outline'
                    }
                    className="justify-start h-auto p-3"
                    onClick={() => setSelectedMethod(method)}
                    disabled={loading}
                  >
                    <div className="text-left">
                      <div className="font-medium">{getMethodDisplayName(method)}</div>
                      {method.preferred && (
                        <div className="text-xs text-muted-foreground">{t('preferred')}</div>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {selectedMethod && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('enter_code', { method: getMethodDisplayName(selectedMethod) })}
                      </FormLabel>
                      <FormControl>
                        {isOtpMethod(selectedMethod) ? (
                          <div className="flex justify-center">
                            <InputOTP maxLength={6} {...field}>
                              <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                              </InputOTPGroup>
                            </InputOTP>
                          </div>
                        ) : (
                          <Input placeholder={getCodePlaceholder(selectedMethod)} {...field} />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={onClose}
                    disabled={loading}
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={loading || !form.formState.isValid}
                  >
                    {loading ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        {t('verifying')}
                      </>
                    ) : (
                      t('verify')
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
