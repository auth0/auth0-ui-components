import * as React from 'react';
import { MoreVertical, Trash2, Mail, Smartphone } from 'lucide-react';

import {
  Authenticator,
  type MFAType,
  FACTOR_TYPE_EMAIL,
  FACTOR_TYPE_SMS,
} from '@auth0-web-ui-components/core';

import type { UserMFAMgmtProps } from '@/types';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { ENROLL, CONFIRM } from '@/lib/mfa-constants';
import { UserMFASetupForm } from '@/components/mfa/user-mfa-setup-form';
import { Spinner } from '@/components/ui/spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { List, ListItem } from '@/components/ui/list';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

import { withCoreClient } from '@/hoc';
import { useComponentConfig, useMFA, useTranslator } from '@/hooks';

/**
 * UserMFAMgmt Component
 *
 * A component responsible for managing Multi-Factor Authentication (MFA) factors for a user.
 * This component handles fetching the MFA access token, fetching authenticators, enrolling, and deletion of MFA factors, and manages the MFA access token.
 * It operates in both ProxyMode (RWA) and SPA modes for authentication.
 *
 * - **ProxyMode (RWA)**: In this mode, the component interacts with a proxy service to manage MFA
 * - **SPA (Single Page Application)**: In this mode, the component communicates directly with the API to manage MFA factors.
 * * @param {Object} props - The properties passed to the component.
 * @param {Object} [props.customMessages] - Custom messages to override default translations for this component instance.
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
 * @param {Object} [props.schemaValidation] - Optional validation schema for email and phone number fields.
 *   @param {RegExp} [props.schemaValidation.email] - Regex for validating email input.
 *   @param {RegExp} [props.schemaValidation.phone] - Regex for validating phone number input.
 *
 * @example
 * <UserMFAMgmt
 *   localization={{
 *     title: 'Manage MFA Factors',
 *     description: 'Here you can manage your Multi-Factor Authentication (MFA) factors.',
 *     loading: 'Loading...',
 *     errors: {
 *       factorsLoadingError: 'An error occurred while loading MFA factors.',
 *     },
 *     no_active_mfa: 'No active MFA factors found.',
 *     enroll_factor: 'Successfully enrolled the MFA factor.',
 *     remove_factor: 'Successfully removed the MFA factor.',
 *     delete: 'Delete',
 *     enroll: 'Enroll',
 *   }}
 *   hideHeader={false}
 *   showActiveOnly={false}
 *   disableEnroll={false}
 *   disableDelete={false}
 *   readOnly={false}
 *   factorConfig={{}}
 *   onEnroll={() => {}}
 *   onDelete={() => {}}
 *   onFetch={() => {}}
 *   onErrorAction={() => {}}
 *   onBeforeAction={() => {}}
 *   schemaValidation={{
 *     email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
 *     phone: /^\+?[1-9]\d{1,14}$/
 *   }}
 * />
 *
 * @returns {React.JSX.Element} The rendered component.
 */
function UserMFAMgmtComponent({
  customMessages = {},
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
  schemaValidation,
}: UserMFAMgmtProps): React.JSX.Element {
  const { t } = useTranslator('mfa', customMessages);
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
  const handleEnroll = (factor: MFAType) => {
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
  const handleDeleteFactor = React.useCallback(
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
        loader || <Spinner aria-label={t('loading')} />
      ) : (
        <Card>
          <CardContent>
            {error ? (
              <div
                className="flex flex-col items-center justify-center p-4 space-y-2"
                role="alert"
                aria-live="assertive"
              >
                <h1
                  className="text-2xl font-medium text-center text-destructive"
                  id="mfa-management-title"
                >
                  {t('component_error_title')}
                </h1>
                <p className="text-center text-destructive">{t('component_error_description')}</p>
              </div>
            ) : (
              <>
                {!hideHeader && (
                  <>
                    <CardTitle>
                      <h1 className="text-2xl font-medium text-left" id="mfa-management-title">
                        {t('title')}
                      </h1>
                    </CardTitle>
                    <CardDescription id="mfa-management-desc">
                      <p className="text-base text-muted-foreground text-left">
                        {t('description')}
                      </p>
                    </CardDescription>
                  </>
                )}
                {showActiveOnly && visibleFactors.length === 0 ? (
                  <p className="text-center text-muted-foreground" role="status">
                    {t('no_active_mfa')}
                  </p>
                ) : (
                  <List
                    className="flex flex-col gap-0 w-full"
                    aria-labelledby="mfa-management-title"
                    aria-describedby="mfa-management-desc"
                  >
                    {visibleFactors.map((factor, idx) => {
                      const isEnabledFactor =
                        factorConfig?.[factor.factorName as MFAType]?.enabled !== false;
                      return (
                        <React.Fragment key={`${factor.name}-${idx}`}>
                          <ListItem
                            className={`w-full p-0 m-0 ${!isEnabledFactor ? 'opacity-50 pointer-events-none' : ''}`}
                            aria-disabled={!isEnabledFactor}
                            tabIndex={0}
                            aria-label={t(`${factor.factorName}.title`)}
                          >
                            <div className="flex w-full flex-col sm:flex-row items-start py-6 gap-2 sm:gap-4">
                              <div className="flex flex-col min-w-0 gap-2 flex-grow w-full">
                                <div className="grid grid-cols-4 gap-2 sm:gap-6 items-center w-full">
                                  <div className="col-span-4 sm:col-span-3 text-left text-base font-medium flex flex-row flex-wrap items-center gap-2 sm:gap-3 break-words w-full">
                                    <span
                                      className="break-words whitespace-normal"
                                      id={`factor-title-${idx}`}
                                    >
                                      {t(`${factor.factorName}.title`)}
                                    </span>
                                    {factor.active && (
                                      <Badge
                                        variant="success"
                                        size="sm"
                                        className="shrink-0"
                                        aria-label={t('enabled')}
                                      >
                                        {t('enabled')}
                                      </Badge>
                                    )}
                                  </div>
                                  {!factor.active && !readOnly && (
                                    <div className="col-span-4 sm:col-span-1 flex justify-end mt-2 sm:mt-0 w-full sm:w-auto">
                                      <Button
                                        size="default"
                                        variant="outline"
                                        className="text-sm"
                                        onClick={() => handleEnroll(factor.factorName as MFAType)}
                                        disabled={disableEnroll || !isEnabledFactor}
                                        aria-label={t(`${factor.factorName}.button-text`)}
                                        aria-describedby={`factor-title-${idx}`}
                                      >
                                        {t(`${factor.factorName}.button-text`)}
                                      </Button>
                                    </div>
                                  )}
                                  {factor.active &&
                                    !(
                                      factor.factorName === FACTOR_TYPE_SMS ||
                                      factor.factorName === FACTOR_TYPE_EMAIL
                                    ) &&
                                    !readOnly && (
                                      <div className="flex justify-end">
                                        <Popover>
                                          <PopoverTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              aria-label={t('actions')}
                                              className="p-2"
                                              tabIndex={0}
                                            >
                                              <MoreVertical
                                                className="w-5 h-5"
                                                aria-hidden="true"
                                              />
                                            </Button>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-30 p-2" role="menu">
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              className="flex items-center justify-start px-4 py-2 gap-2 text-red-600 font-normal text-sm"
                                              onClick={() =>
                                                handleDeleteFactor(
                                                  factor.id,
                                                  factor.factorName as MFAType,
                                                )
                                              }
                                              disabled={
                                                disableDelete ||
                                                isDeletingFactor ||
                                                !isEnabledFactor
                                              }
                                              aria-label={t('remove')}
                                              role="menuitem"
                                            >
                                              <Trash2
                                                className="w-4 h-4 mr-1 color-red-10"
                                                aria-hidden="true"
                                              />
                                              <span className="color-red-10">{t('remove')}</span>
                                            </Button>
                                          </PopoverContent>
                                        </Popover>
                                      </div>
                                    )}
                                </div>
                                {factor.active &&
                                (factor.factorName === FACTOR_TYPE_SMS ||
                                  factor.factorName === FACTOR_TYPE_EMAIL) ? (
                                  <Card
                                    className="border rounded-lg shadow-none bg-transparent p-0 w-full mt-2"
                                    aria-label={t(`${factor.factorName}.title`)}
                                  >
                                    <CardContent className="flex flex-row items-center justify-between gap-3 p-3 w-full">
                                      <div className="flex items-center gap-3">
                                        {factor.factorName === FACTOR_TYPE_SMS ? (
                                          <Smartphone
                                            className="w-5 h-5 text-muted-foreground"
                                            aria-hidden="true"
                                          />
                                        ) : (
                                          <Mail
                                            className="w-5 h-5 text-muted-foreground"
                                            aria-hidden="true"
                                          />
                                        )}
                                        <span className="font-medium text-base text-foreground">
                                          {factor.name}
                                        </span>
                                      </div>
                                      {!readOnly && (
                                        <Popover>
                                          <PopoverTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              aria-label={t('actions')}
                                              className="p-2"
                                              tabIndex={0}
                                            >
                                              <MoreVertical
                                                className="w-5 h-5"
                                                aria-hidden="true"
                                              />
                                            </Button>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-30 p-2" role="menu">
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              className="flex items-center justify-start px-4 py-2 gap-2 text-red-600 font-normal text-sm"
                                              onClick={() =>
                                                handleDeleteFactor(
                                                  factor.id,
                                                  factor.factorName as MFAType,
                                                )
                                              }
                                              disabled={
                                                disableDelete ||
                                                isDeletingFactor ||
                                                !isEnabledFactor
                                              }
                                              aria-label={t('remove')}
                                              role="menuitem"
                                            >
                                              <Trash2
                                                className="w-4 h-4 mr-1 color-red-10"
                                                aria-hidden="true"
                                              />
                                              <span className="color-red-10">{t('remove')}</span>
                                            </Button>
                                          </PopoverContent>
                                        </Popover>
                                      )}
                                    </CardContent>
                                  </Card>
                                ) : !factor.active ? (
                                  <p
                                    className="font-normal text-muted-foreground text-left break-words mt-1"
                                    id={`factor-desc-${idx}`}
                                  >
                                    {t(`${factor.factorName}.description`)}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </ListItem>
                        </React.Fragment>
                      );
                    })}
                  </List>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
      {enrollFactor && (
        <UserMFASetupForm
          open={dialogOpen}
          onClose={handleCloseDialog}
          factorType={enrollFactor}
          enrollMfa={enrollMfa}
          confirmEnrollment={confirmEnrollment}
          onSuccess={handleEnrollSuccess}
          onError={handleEnrollError}
          schemaValidation={schemaValidation}
        />
      )}
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => !isDeletingFactor && setIsDeleteDialogOpen(open)}
        aria-modal="true"
        aria-labelledby="delete-mfa-title"
        aria-describedby="delete-mfa-description"
      >
        <DialogContent aria-describedby="delete-mfa-description" className="w-[400px] h-[548px]">
          <DialogHeader>
            <DialogTitle id="delete-mfa-title" className="text-center text-xl font-medium">
              {t('delete_mfa_title')}
            </DialogTitle>
            <Separator className="my-2" />
          </DialogHeader>

          <div className="flex flex-col items-center justify-center flex-1 space-y-10">
            <p id="delete-mfa-description" className="text-center text-base font-medium">
              {t(`delete_mfa_${factorToDelete?.type}_consent`)}
            </p>

            <div className="flex flex-col space-y-3 w-full">
              <Button
                variant="destructive"
                size="lg"
                className="text-sm"
                onClick={() => factorToDelete && handleConfirmDelete(factorToDelete.id)}
                disabled={isDeletingFactor}
                aria-label={t('confirm')}
              >
                {isDeletingFactor ? t('deleting') : t('confirm')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-sm"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isDeletingFactor}
                aria-label={t('cancel')}
              >
                {t('cancel')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const UserMFAMgmt = withCoreClient(UserMFAMgmtComponent);
