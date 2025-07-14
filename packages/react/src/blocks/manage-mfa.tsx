import * as React from 'react';

import { useComponentConfig, useMFA, useTranslator } from '@/hooks';
import type { ManageMfaProps } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { EnrollmentForm } from '@/components/mfa/enrollment-form';
import { ENROLL, CONFIRM } from '@/lib/mfa-constants';
import { Spinner } from '@/components/ui/spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { withCoreClient } from '@/hoc';
import { Authenticator, MFAType } from '@auth0-web-ui-components/core';

/**
 * ManageMfa Component
 *
 * A component responsible for managing Multi-Factor Authentication (MFA) factors for a user.
 * This component handles the mfa access token fetching ,fetching authenticators, enrolling, and deletion of MFA factors and manages the MFA access token.
 * It operates in both ProxyMode (RWA) and SPA modes for authentication.
 *
 * - **ProxyMode (RWA)**: In this mode, the component interacts with a proxy service to manage MFA
 * - **SPA (Single Page Application)**: In this mode, the component communicates directly with the API to manage MFA factors.
 * * @param {Object} props - The properties passed to the component.
 * @param {Object} [props.messages] - Custom messages to override default translations for this component instance.
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
function ManageMfaComponent({
  messages,
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
  const { t } = useTranslator('mfa', messages);

  const {
    config: { loader },
  } = useComponentConfig();
  const { fetchFactors, enrollMfa, deleteMfa, confirmEnrollment } = useMFA();

  const [factors, setFactors] = React.useState<Authenticator[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isDeletingFactor, setIsDeletingFactor] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [enrollFactor, setEnrollFactor] = React.useState<MFAType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [factorToDelete, setFactorToDelete] = React.useState<{
    id: string;
    type: MFAType;
  } | null>(null);

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
      setError(t('errors.factors_loading_error'));
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

  const handleCloseDialog = React.useCallback(() => {
    setDialogOpen(false);
    setEnrollFactor(null);
  }, []);

  /**
   * Handles the initial click on the delete button for an MFA factor.
   * This function either:
   * 1. Triggers the onBeforeAction callback and proceeds with deletion if approved
   * 2. Opens a confirmation dialog if no onBeforeAction is provided
   *
   * The function prevents deletion if:
   * - Component is in readonly mode
   * - Delete action is disabled
   * - onBeforeAction returns false
   *
   * @param {string} factorId - The unique identifier of the MFA factor to delete
   * @param {MFAType} factorType - The type of MFA factor being deleted (e.g., 'sms', 'email', 'totp')
   * @returns {Promise<void>}
   */
  const handleDeleteClick = React.useCallback(
    async (factorId: string, factorType: MFAType) => {
      if (readOnly || disableDelete) return;

      if (onBeforeAction) {
        // If onBeforeAction exists, proceed directly
        const canProceed = await onBeforeAction('delete', factorType);
        if (!canProceed) return;
        await handleConfirmDelete(factorId);
      } else {
        setFactorToDelete({ id: factorId, type: factorType });
        setIsDeleteDialogOpen(true);
      }
    },
    [readOnly, disableDelete, onBeforeAction],
  );

  /**
   * Handles the confirmation and execution of MFA factor deletion.
   * This callback is triggered when a user confirms the deletion in the confirmation dialog
   * or when deletion is approved through onBeforeAction.
   *
   * The function:
   * 1. Deletes the MFA factor
   * 2. Reloads the factors list
   * 3. Shows success/error notifications
   * 4. Handles cleanup of dialog and loading states
   *
   * @param {string} factorId - The unique identifier of the MFA factor to delete
   * @throws {Error} When deletion fails or factors cannot be reloaded
   */
  const handleConfirmDelete = React.useCallback(
    async (factorId: string) => {
      setIsDeletingFactor(true);

      const cleanUp = () => {
        setIsDeletingFactor(false);
        setIsDeleteDialogOpen(false);
        setFactorToDelete(null);
      };

      try {
        await deleteMfa(factorId);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(t('errors.delete_factor'));
        toast.error(t('errors.delete_factor'));
        onErrorAction?.(error, 'delete');
        cleanUp();
        return;
      }

      toast.success(t('remove_factor'), {
        duration: 2000,
        onAutoClose: () => onDelete?.(),
      });

      try {
        await loadFactors();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(t('errors.factors_loading_error'));
        onErrorAction?.(error, 'delete');
      } finally {
        cleanUp();
      }
    },
    [deleteMfa, loadFactors, onDelete, onErrorAction, t],
  );

  /**
   * Handles the successful enrollment of an MFA factor.
   * Displays a success message and reloads the factors list.
   */
  const handleEnrollSuccess = React.useCallback(async () => {
    setDialogOpen(false);
    setEnrollFactor(null);
    try {
      toast.success(t('enroll_factor'), {
        duration: 2000,
        onAutoClose: () => {
          onEnroll?.();
        },
      });
      await loadFactors();
    } catch {
      toast.dismiss();
      toast.error(t('errors.factors_loading_error'));
    }
  }, [loadFactors, onEnroll, t]);

  /**
   * Handles errors during the enrollment or confirmation process.
   *
   * @param {Error} error - The error object containing the failure message.
   * @param {string} stage - The stage of the process ('enroll' or 'confirm').
   */
  const handleEnrollError = React.useCallback(
    (error: Error, stage: typeof ENROLL | typeof CONFIRM) => {
      toast.error(
        `${stage === ENROLL ? t('enrollment') : t('confirmation')} ${t('errors.failed', { message: error.message })}`,
      );
      onErrorAction?.(error, stage);
    },
    [onErrorAction, t],
  );

  return (
    <>
      <Toaster position="top-right" />
      {loading ? (
        loader || <Spinner />
      ) : error ? (
        <div className="flex items-center justify-center p-4">
          <Label className="text-center text-destructive">{error}</Label>
        </div>
      ) : (
        <Card>
          {!hideHeader && (
            <CardHeader>
              <CardTitle>{t('title')}</CardTitle>
              <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
          )}

          <CardContent className="grid gap-6 p-4 pt-0 md:p-6 md:pt-0">
            {showActiveOnly && visibleFactors.length === 0 ? (
              <Label className="text-center text-muted-foreground">{t('no_active_mfa')}</Label>
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
                            <Badge variant="success" size="sm" className="ml-3">
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
                                size="sm"
                                onClick={() =>
                                  handleDeleteClick(factor.id, factor.factorName as MFAType)
                                }
                                disabled={disableDelete || isDeletingFactor || !isEnabledFactor}
                                aria-label={t('delete_factor', { factorName: factor.factorName })}
                              >
                                {t('delete')}
                              </Button>
                            )
                          : !readOnly && (
                              <Button
                                size="sm"
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
      )}
      {enrollFactor && (
        <EnrollmentForm
          open={dialogOpen}
          onClose={handleCloseDialog}
          factorType={enrollFactor}
          enrollMfa={enrollMfa}
          confirmEnrollment={confirmEnrollment}
          onSuccess={handleEnrollSuccess}
          onError={handleEnrollError}
        />
      )}
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => !isDeletingFactor && setIsDeleteDialogOpen(open)}
      >
        <DialogContent aria-describedby="delete-mfa-description">
          <DialogHeader>
            <DialogTitle className="text-center">{t('delete_mfa_title')}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p id="delete-mfa-description" className="text-center text-muted-foreground">
              {t('delete_mfa_content')}
            </p>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeletingFactor}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => factorToDelete && handleConfirmDelete(factorToDelete.id)}
              disabled={isDeletingFactor}
            >
              {isDeletingFactor ? t('deleting') : t('delete')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const ManageMfa = withCoreClient(ManageMfaComponent);
