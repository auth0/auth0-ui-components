import * as React from 'react';
import { useI18n, useMFA } from '@/hooks';
import type { ManageMfaProps, MFAType, Authenticator } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { EnrollmentForm } from '@/components/mfa/enrollment-form';

/**
 * ManageMfa Component
 *
 * A component responsible for managing Multi-Factor Authentication (MFA) factors for a user.
 * This component handles the mfa access token fetching ,fetching authenticators, enrolling, and deletion of MFA factors and manages the MFA access token.
 * It operates in both ProxyMode (RWA) and SPA modes for authentication.
 *
 * - **ProxyMode (RWA)**: In this mode, the component interacts with a proxy service to manage MFA
 * - **SPA (Single Page Application)**: In this mode, the component communicates directly with the API to manage MFA factors.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Object} [props.localization={}] - Localization object for i18n support.
 * This object should contain key-value pairs for each language and its associated translations.
 *
 * Example:
 * ```js
 * localization={{
 *   title: 'Manage MFA Factors',
 *   description: 'Here you can manage your Multi-Factor Authentication (MFA) factors.',
 *   loading: 'Loading...',
 *   errors: {
 *     factorsLoadingError: 'An error occurred while loading MFA factors.',
 *   },
 *   noActiveMfa: 'No active MFA factors found.',
 *   enrollFactor: 'Successfully enrolled the MFA factor.',
 *   removeFactor: 'Successfully removed the MFA factor.',
 *   delete: 'Delete',
 *   enroll: 'Enroll',
 * }}
 * ```
 * @param {boolean} [props.hideHeader=false] - Whether to hide the header.
 * @param {boolean} [props.showActiveOnly=false] - Whether to show only active MFA factors.
 * @param {boolean} [props.disableEnroll=false] - Whether to disable the enrollment of new factors.
 * @param {boolean} [props.disableDelete=false] - Whether to disable the deletion of factors.
 * @param {boolean} [props.readOnly=false] - Whether the component is in read-only mode.
 * @param {Object} [props.factorConfig={}] - Configuration for MFA factors, controlling visibility and enabled state.
 * @param {Function} [props.onEnroll] - Callback fired when an MFA factor is successfully enrolled.
 * @param {Function} [props.onDelete] - Callback fired when an MFA factor is successfully deleted.
 * @param {Function} [props.onFetch] - Callback fired when MFA factors are fetched.
 * @param {Function} [props.onErrorAction] - Callback fired when an error occurs during an action (enroll/delete).
 * @param {Function} [props.onBeforeAction] - Callback fired before performing an action (enroll/delete).
 *
 * @returns {React.JSX.Element} The rendered component.
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
}: ManageMfaProps): React.JSX.Element {
  const t = useI18n('mfa', localization);
  const { fetchFactors, enrollMfa, deleteMfa, confirmEnrollment } = useMFA();

  const [factors, setFactors] = React.useState<Authenticator[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [enrollFactor, setEnrollFactor] = React.useState<MFAType | null>(null);

  /**
   * Loads the available MFA factors from the API and updates the state.
   * This is called on initial load and when factors need to be refreshed.
   */
  const loadFactors = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const factors = await fetchFactors(showActiveOnly);
      setFactors(factors);
      onFetch?.();
    } catch (err) {
      setError(t('errors.factorsLoadingError'));
    }

    setLoading(false);
  }, [fetchFactors, showActiveOnly, onFetch, onErrorAction]);

  React.useEffect(() => {
    loadFactors();
  }, [loadFactors]);

  /**
   * Filters visible MFA factors based on the provided factor configuration.
   * Each factor's visibility is determined by the configuration settings.
   *
   * @returns {Authenticator[]} Filtered MFA factors.
   */
  const visibleFactors = React.useMemo(() => {
    return factors.filter((factor) => {
      const config = factorConfig[factor.factorName as keyof typeof factorConfig];
      return config?.visible !== false;
    });
  }, [factors, factorConfig]);

  /**
   * Handles the enrollment button click for a specific MFA factor.
   * Opens the enrollment dialog for the chosen factor.
   *
   * @param {MFAType} factor - The MFA factor to be enrolled.
   */
  const handleEnrollClick = (factor: MFAType) => {
    setEnrollFactor(factor);
    setDialogOpen(true);
  };

  /**
   * Handles the deletion of an MFA factor.
   * If the action is allowed (i.e., not read-only or disabled), it calls the deleteMfa function.
   *
   * @param {string} factorId - The ID of the factor to be deleted.
   * @param {MFAType} factorType - The type of the MFA factor to be deleted.
   */
  const handleDelete = React.useCallback(
    async (factorId: string, factorType: MFAType) => {
      if (readOnly || disableDelete) return;

      if (onBeforeAction) {
        const proceed = await onBeforeAction('delete', factorType);
        if (!proceed) return;
      }

      setDeleting(true);

      try {
        await deleteMfa(factorId);
        toast.success(t('removeFactor'), {
          duration: 2000,
          onAutoClose: async () => {
            onDelete?.();
            await loadFactors();
          },
        });
      } catch (err) {
        const e = err as Error;
        toast.error(e.message);
        onErrorAction?.(e, 'delete');
      } finally {
        setDeleting(false);
      }
    },
    [readOnly, disableDelete, onBeforeAction, deleteMfa, onErrorAction, onDelete, loadFactors, t],
  );

  /**
   * Handles the successful enrollment of an MFA factor.
   * Displays a success message and reloads the factors list.
   */
  const handleEnrollSuccess = React.useCallback(async () => {
    setDialogOpen(false);
    setEnrollFactor(null);
    toast.success(t('enrollFactor'), {
      duration: 2000,
      onAutoClose: async () => {
        onEnroll?.();
        await loadFactors();
      },
    });
  }, [loadFactors, onEnroll]);

  /**
   * Handles errors during the enrollment or confirmation process.
   *
   * @param {Error} error - The error object containing the failure message.
   * @param {string} stage - The stage of the process ('enroll' or 'confirm').
   */
  const handleEnrollError = React.useCallback(
    (error: Error, stage: 'enroll' | 'confirm') => {
      toast.error(`${stage === 'enroll' ? 'Enrollment' : 'Confirmation'} failed: ${error.message}`);
      onErrorAction?.(error, stage);
    },
    [onErrorAction],
  );

  //TODO
  if (loading) return <p>{t('loading')}</p>;
  if (error) return <p className="text-3xl font-bold underline">{error}</p>;

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
              const isEnabledFactor =
                factorConfig?.[factor.factorName as MFAType]?.enabled !== false;

              return (
                <div
                  key={`${factor.name}-${idx}`}
                  className={`flex flex-col gap-6 ${!isEnabledFactor ? 'opacity-50 pointer-events-none' : ''}`}
                  aria-disabled={!isEnabledFactor}
                >
                  {idx > 0 && <Separator />}
                  <div className="flex flex-col items-center justify-between space-y-6 md:flex-row md:space-x-2 md:space-y-0">
                    <Label className="flex flex-col items-start space-y-1">
                      <span className="leading-6 text-left">
                        {t(`${factor.factorName}.title`)}
                        {factor.active && (
                          <Badge variant="default" className="ml-3">
                            {t('enrolled')}
                          </Badge>
                        )}
                      </span>
                      <p className="font-normal leading-snug text-muted-foreground text-left">
                        {t(`${factor.factorName}.description`)}
                      </p>
                    </Label>

                    <div className="flex items-center justify-end space-x-24 md:min-w-72">
                      {factor.active
                        ? !readOnly && (
                            <Button
                              type="submit"
                              onClick={() => handleDelete(factor.id, factor.factorName as MFAType)}
                              disabled={disableDelete || deleting || !isEnabledFactor}
                              aria-label={`Delete authenticator ${factor.factorName}`}
                            >
                              {t('delete')}
                            </Button>
                          )
                        : !readOnly && (
                            <Button
                              onClick={() => handleEnrollClick(factor.factorName as MFAType)}
                              disabled={disableEnroll || !isEnabledFactor}
                            >
                              {t('enroll')}
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

      {enrollFactor && (
        <EnrollmentForm
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            setEnrollFactor(null);
          }}
          factorType={enrollFactor}
          enrollMfa={enrollMfa}
          confirmEnrollment={confirmEnrollment}
          onSuccess={handleEnrollSuccess}
          onError={handleEnrollError}
        />
      )}
    </>
  );
}
