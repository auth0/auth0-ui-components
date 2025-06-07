import * as React from 'react';
import { useComponentConfig, useI18n } from '@/hooks';
import { useMfaList, useDeleteMfa, useEnrollMfa, useMfaAccessToken } from '../hooks';
import { MFAType, ManageMfaProps, MFALocaleContent } from './types';
import { Badge } from '@/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Label } from '@/ui/label';
import { Separator } from '@/ui/separator';
import { toast } from 'sonner';
import { Button } from '@/ui/button';
import { Toaster } from '@/ui/sonner';

/**
 * ManageMfa
 *
 * React component for managing Multi-Factor Authentication (MFA) enrollments.
 *
 * Allows users to view their enrolled MFA authenticators, enroll new ones,
 * and delete existing enrollments. Supports loading and error states and
 * notifies parent components of key actions and errors via callback props.
 *
 * ## Features
 * - Displays a list of MFA factors, optionally filtering to only active factors.
 * - Enroll and delete MFA authenticators with support for async hooks.
 * - Localization support through the `localization` prop.
 * - Optional title and description display.
 * - Disable enroll/delete buttons or put component in read-only mode.
 * - Supports pre-action confirmation via `onBeforeAction`.
 * - Emits events/callbacks on enroll, delete, fetch, and error occurrences.
 * - Uses Auth0 access tokens internally for API calls.
 * - Shows toast notifications on success or failure.
 * - Supports per-factor configuration for visibility and enablement via `factorConfig`.
 *
 * ## Requirements
 * Must be rendered within a component tree wrapped by `Auth0ComponentProvider` or equivalent,
 * providing authentication context and hooks.
 *
 * @param {Object} props
 * @param {Object<string, {title: string; description: string}>} [props.localization] - Optional localization overrides for UI text, keyed by language codes.
 * @param {boolean} [props.hideHeader=true] - Whether to show the component's title and description.
 * @param {boolean} [props.showActiveOnly=false] - Show only active enrolled MFA factors.
 * @param {boolean} [props.disableEnroll=false] - Disable enrolling new MFA factors.
 * @param {boolean} [props.disableDelete=false] - Disable deleting enrolled MFA factors.
 * @param {boolean} [props.readOnly=false] - Set component to read-only mode (no actions allowed).
 * @param {Object<string, {visible?: boolean, enabled?: boolean}>} [props.factorConfig] - Optional per-factor configuration to control visibility (`visible`) and enablement (`enabled`).
 * @param {() => void} [props.onEnroll] - Callback fired after a successful MFA enrollment.
 * @param {() => void} [props.onDelete] - Callback fired after a successful MFA deletion.
 * @param {() => void} [props.onFetch] - Callback fired after MFA factors are fetched successfully.
 * @param {(error: Error, action: 'enroll' | 'delete') => void} [props.onErrorAction] - Callback fired on enroll/delete error with error and action type.
 * @param {(action: 'enroll' | 'delete', factorType: MFAType) => Promise<boolean>} [props.onBeforeAction] - Optional async callback invoked before enroll or delete action; returning false cancels the action.
 *
 * @returns {JSX.Element} The ManageMfa component UI.
 *
 * @example
 * ```tsx
 * <ManageMfa
 *   localization={{
 *     en: { title: "My MFA Settings", description: "Manage your 2FA methods" },
 *     es: { title: "Configuración MFA", description: "Administra tus métodos de 2FA" },
 *   }}
 *   showActiveOnly={true}
 *   factorConfig={{
 *     sms: { visible: true, enabled: true },
 *     'push-notification': { visible: false },
 *     totp: { enabled: false },
 *   }}
 *   onEnroll={() => console.log('MFA enrolled')}
 *   onDelete={() => console.log('MFA deleted')}
 *   onErrorAction={(error, action) => console.error(`Error during ${action}:`, error)}
 * />
 * ```
 */

export function ManageMfa({
  localization = {},
  hideHeader = false,
  showActiveOnly = false,
  disableEnroll = false,
  disableDelete = false,
  readOnly = false,
  factorConfig = {},
  onEnroll,
  onDelete,
  onFetch,
  onErrorAction,
  onBeforeAction,
}: ManageMfaProps) {
  const {
    config: { authDetails },
  } = useComponentConfig();
  const { accessToken, error: tokenError, loading: tokenLoading } = useMfaAccessToken();
  const t = useI18n<MFALocaleContent>('mfa', localization);
  // Fetch MFA factors list
  const {
    loading: factorsLoading,
    error: factorsError,
    factors,
    fetchFactors,
  } = useMfaList(accessToken, showActiveOnly);

  const visibleFactors = React.useMemo(() => {
    if (!factors?.length) return [];

    return factors.filter((factor) => {
      const name = factor.name;
      const config = factorConfig[name as keyof typeof factorConfig];
      return config?.visible !== false;
    });
  }, [factors, factorConfig]);

  // Delete MFA hook
  const { loading: deleting, deleteMfa } = useDeleteMfa(accessToken);

  //TODO Enroll MFA hook
  const {
    loading: enrolling,
    error: enrollError,
    response: enrollResponse,
    enrollMfa,
  } = useEnrollMfa(accessToken);

  // Side effect: notify parent of factors fetch
  React.useEffect(() => {
    if (factors && onFetch) {
      onFetch();
    }
  }, [factors, onFetch]);

  //TODO Handlers with onBeforeAction check
  const handleEnroll = async (params: Parameters<typeof enrollMfa>[0], factorType: MFAType) => {
    if (readOnly || disableEnroll) return;

    if (onBeforeAction) {
      const proceed = await onBeforeAction('enroll', factorType);
      if (!proceed) return;
    }
    await enrollMfa(params);
    if (enrollError) {
      toast.error(enrollError.message);
      return;
    }
    if (enrollResponse) {
      toast.success(t('enrollFactor'));
      onEnroll?.();
    }
  };

  const handleDelete = async (factorId: string, factorType: MFAType) => {
    if (readOnly || disableDelete) return;

    if (onBeforeAction) {
      const proceed = await onBeforeAction('delete', factorType);
      if (!proceed) return;
    }

    const { success, error } = await deleteMfa(factorId);

    if (error) {
      toast.error(error.message);
      onErrorAction?.(error, 'delete');
      return;
    }

    if (success) {
      toast.success(t('removeFactor'));
      onDelete?.(); // notify parent
      await fetchFactors(); //refresh MFA factors after delete
    }
  };

  //TODO Render loading & error states
  if (tokenLoading || factorsLoading) {
    return <p>Loading...</p>;
  }

  if (tokenError) {
    return <p>{t('errors.accessTokenError', { error: tokenError.message })}</p>;
  }

  if (factorsError) {
    return <p>{t('errors.factorsLoadingError', { error: factorsError.message })}</p>;
  }

  return (
    <>
      <Toaster position="top-right" />
      <Card>
        {!hideHeader && (
          <CardHeader>
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </CardHeader>
        )}

        <CardContent className="grid gap-6 p-4 pt-0 md:p-6 md:pt-0">
          {showActiveOnly && visibleFactors.length === 0 ? (
            <Label className="text-center text-muted-foreground">{t('noActiveMfa')}</Label>
          ) : (
            visibleFactors.map((factor, idx) => {
              const config = factorConfig[factor.name as keyof typeof factorConfig];
              const isEnabled = Boolean(config?.enabled);

              return (
                <div
                  key={`${factor.name}-${idx}`}
                  className={`flex flex-col gap-6 ${!isEnabled ? 'opacity-50 pointer-events-none' : ''}`}
                  aria-disabled={!isEnabled}
                >
                  {idx > 0 && <Separator />}
                  <div className="flex flex-col items-center justify-between space-y-6 md:flex-row md:space-x-2 md:space-y-0">
                    <Label className="flex flex-col space-y-1">
                      <span className="leading-6">
                        {t(`${factor.factorName}.title`)}
                        {factor.active && (
                          <Badge variant="default" className="ml-3">
                            {t('enrolled')}
                          </Badge>
                        )}
                      </span>
                      <p className="max-w-fit font-normal leading-snug text-muted-foreground">
                        {t(`${factor.factorName}.description`)}
                      </p>
                    </Label>

                    <div className="flex items-center justify-end space-x-24 md:min-w-72">
                      {factor.active
                        ? !readOnly && (
                            <Button
                              type="submit"
                              onClick={() => handleDelete(factor.id, factor.name as MFAType)}
                              disabled={disableDelete || deleting || !isEnabled}
                              aria-label={`Delete authenticator ${factor.title || factor.name}`}
                            >
                              {t('delete')}
                            </Button>
                          )
                        : !readOnly && (
                            <Button
                              onClick={() =>
                                //TODO
                                handleEnroll(
                                  {
                                    client_id: authDetails?.clientId || '',
                                    authenticator_types: [factor.authenticator_type],
                                  },
                                  factor.authenticator_type as MFAType,
                                )
                              }
                              disabled={disableEnroll || enrolling}
                            >
                              {enrolling ? t('enrolling') : t('enroll')}
                            </Button>
                          )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </>
  );
}
