/** @module user-mfa-management */

import { getComponentStyles } from '@auth0/universal-components-core';
import * as React from 'react';

import { DeleteFactorConfirmation } from '@/components/auth0/my-account/shared/mfa/delete-factor-confirmation';
import { MFAEmptyState } from '@/components/auth0/my-account/shared/mfa/empty-state';
import { MFAErrorState } from '@/components/auth0/my-account/shared/mfa/error-state';
import { FactorsList } from '@/components/auth0/my-account/shared/mfa/factors-list';
import { UserMFASetupForm } from '@/components/auth0/my-account/shared/mfa/user-mfa-setup-form';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { List, ListItem } from '@/components/ui/list';
import { Spinner } from '@/components/ui/spinner';
import { useMFA } from '@/hooks/my-account/use-mfa';
import { useMFALogic } from '@/hooks/my-account/use-mfa-logic';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type {
  UserMFAMgmtProps,
  UserMFAMgmtLogicProps,
  UserMFAMgmtHandlerProps,
  UserMFAMgmtViewProps,
} from '@/types/my-account/mfa/mfa-types';

/**
 * User MFA management container(logic) component
 * Handles loading factors, enroll/delete flows, and UI state.
 *
 * @param props - Component props.
 * @param props.customMessages - Override i18n messages.
 * @param props.styling - CSS variables and class overrides.
 * @param props.hideHeader - Hide the header section.
 * @param props.showActiveOnly - Show only enrolled factors.
 * @param props.disableEnroll - Disable enroll actions.
 * @param props.disableDelete - Disable delete actions.
 * @param props.readOnly - Render in read-only mode.
 * @param props.factorConfig - Per-factor visibility/enabled config.
 * @param props.onEnroll - Called after successful enroll.
 * @param props.onDelete - Called after successful delete.
 * @param props.onFetch - Called after factors load.
 * @param props.onErrorAction - Called when actions error.
 * @param props.onBeforeAction - Called before actions; return false to cancel.
 * @param props.schema - Validation schema overrides.
 * @returns MFA management UI.
 * @internal
 */
function UserMFAMgmtContainer(props: UserMFAMgmtProps) {
  const {
    customMessages = {},
    styling = {
      variables: {
        common: {},
        light: {},
        dark: {},
      },
      classes: {},
    },
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
    schema,
  } = props;
  const { fetchFactors, enrollMfa, deleteMfa, confirmEnrollment } = useMFA();

  const {
    factorsByType,
    loading,
    error,
    isDeletingFactor,
    dialogOpen,
    enrollFactor,
    isDeleteDialogOpen,
    factorToDelete,
    visibleFactorTypes,
    hasNoActiveFactors,
    setIsDeleteDialogOpen,
    loadFactors,
    handleEnroll,
    handleCloseDialog,
    handleDeleteFactor,
    handleConfirmDelete,
    handleEnrollSuccess,
    handleEnrollError,
  } = useMFALogic({
    readOnly,
    customMessages,
    disableDelete,
    showActiveOnly,
    factorConfig,
    fetchFactors,
    deleteMfa,
    confirmEnrollment,
    onFetch,
    onEnroll,
    onDelete,
    onErrorAction,
    onBeforeAction,
  });

  React.useEffect(() => {
    loadFactors();
  }, []);

  const logic: UserMFAMgmtLogicProps = {
    isLoading: loading,
    isDeleting: isDeletingFactor,
    styling,
    customMessages,
    hideHeader,
    showActiveOnly,
    disableEnroll,
    disableDelete,
    readOnly,
    factorConfig,
    error,
    schema,
    dialogOpen,
    enrollFactor,
    isDeleteDialogOpen,
    factorToDelete,
    factorsByType,
    visibleFactorTypes,
    hasNoActiveFactors,
    confirmEnrollment,
  };

  const handlers: UserMFAMgmtHandlerProps = {
    enrollMfa,
    onEnrollFactor: handleEnroll,
    onDeleteFactor: handleDeleteFactor,
    handleCloseDialog,
    handleEnrollError,
    handleEnrollSuccess,
    handleConfirmDelete,
    setIsDeleteDialogOpen,
  };

  return <UserMFAMgmtView logic={logic} handlers={handlers} />;
}

/**
 * UserMFAMgmtView — Presentational component.
 * @param props - View props with logic and handlers
 * @returns User Management View element
 * @internal
 */
function UserMFAMgmtView({ logic, handlers }: UserMFAMgmtViewProps) {
  const {
    isLoading,
    isDeleting,
    styling,
    customMessages,
    hideHeader,
    showActiveOnly,
    disableEnroll,
    disableDelete,
    readOnly,
    factorConfig,
    schema,
    error,
    dialogOpen,
    enrollFactor,
    isDeleteDialogOpen,
    factorToDelete,
    factorsByType,
    visibleFactorTypes,
    hasNoActiveFactors,
    confirmEnrollment,
  } = logic;

  const {
    enrollMfa,
    onEnrollFactor,
    onDeleteFactor,
    handleCloseDialog,
    handleEnrollSuccess,
    handleEnrollError,
    handleConfirmDelete,
    setIsDeleteDialogOpen,
  } = handlers;

  const { loader, isDarkMode } = useTheme();
  const { t } = useTranslator('mfa', customMessages);
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  return (
    <StyledScope style={currentStyles.variables}>
      {isLoading ? (
        <div className="flex items-center justify-center py-16">{loader || <Spinner />}</div>
      ) : (
        <Card
          className={cn('py-10 px-8 sm:py-8 sm:px-6', currentStyles.classes?.['UserMFAMgmt-card'])}
        >
          <CardContent>
            {error ? (
              <MFAErrorState
                title={t('component_error_title')}
                description={t('component_error_description')}
              />
            ) : (
              <>
                {!hideHeader && (
                  <>
                    <CardTitle
                      id="mfa-management-title"
                      className="text-2xl text-(length:--font-size-heading) font-medium text-left"
                    >
                      {t('title')}
                    </CardTitle>
                    <CardDescription
                      id="mfa-management-desc"
                      className="text-sm text-(length:--font-size-paragraph) text-muted-foreground text-left"
                    >
                      {t('description')}
                    </CardDescription>
                  </>
                )}
                {showActiveOnly && hasNoActiveFactors ? (
                  <MFAEmptyState message={t('no_active_mfa')} />
                ) : (
                  <List
                    className="flex flex-col gap-0 w-full"
                    aria-labelledby="mfa-management-title"
                    aria-describedby="mfa-management-desc"
                  >
                    {visibleFactorTypes.map((factorType) => {
                      const factors = factorsByType[factorType] || [];
                      const activeFactors = factors.filter((f) => f.enrolled);
                      const isEnabledFactor = factorConfig?.[factorType]?.enabled !== false;
                      const hasActiveFactors = activeFactors.length > 0;

                      return (
                        <ListItem
                          key={factorType}
                          className={cn(
                            'w-full p-0 m-0 py-6 gap-3',
                            !isEnabledFactor && 'opacity-50 pointer-events-none',
                          )}
                          aria-disabled={!isEnabledFactor}
                          tabIndex={0}
                          aria-label={t(`${factorType}.title`)}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                              <span
                                className={cn(
                                  'break-words text-card-foreground whitespace-normal text-base text-(length:--font-size-body) font-medium',
                                )}
                                id={`factor-title-${factorType}`}
                              >
                                {t(`${factorType}.title`)}
                              </span>

                              {hasActiveFactors && (
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

                            {!readOnly && (
                              <Button
                                size="default"
                                variant="outline"
                                className="text-sm w-full sm:w-auto shrink-0"
                                onClick={() => onEnrollFactor(factorType)}
                                disabled={disableEnroll || !isEnabledFactor}
                                aria-label={t(`${factorType}.button-text`)}
                                aria-describedby={`factor-title-${factorType}`}
                              >
                                {t(`${factorType}.button-text`)}
                              </Button>
                            )}
                          </div>

                          {!hasActiveFactors && (
                            <p
                              className={cn(
                                'font-normal text-sm text-(length:--font-size-paragraph) text-muted-foreground text-left break-words',
                              )}
                              id={`factor-desc-${factorType}`}
                            >
                              {t(`${factorType}.description`)}
                            </p>
                          )}

                          {hasActiveFactors && (
                            <FactorsList
                              factors={activeFactors}
                              factorType={factorType}
                              readOnly={readOnly}
                              isEnabledFactor={isEnabledFactor}
                              onDeleteFactor={onDeleteFactor}
                              isDeletingFactor={isDeleting}
                              disableDelete={disableDelete}
                              styling={styling}
                              customMessages={customMessages}
                            />
                          )}
                        </ListItem>
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
          schema={schema}
          styling={styling}
          customMessages={customMessages}
        />
      )}
      <DeleteFactorConfirmation
        open={isDeleteDialogOpen}
        onOpenChange={(open) => !isDeleting && setIsDeleteDialogOpen(open)}
        factorToDelete={factorToDelete}
        isDeletingFactor={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
        styling={styling}
        customMessages={customMessages}
      />
    </StyledScope>
  );
}

/**
 * Multi-factor authentication management component.
 *
 * Complete MFA management interface for enrolling, viewing, and deleting authentication
 * factors. Supports TOTP authenticators, SMS, Email, Push notifications, and recovery codes.
 *
 * @param props - {@link UserMFAMgmtProps}
 * @param props.customMessages - Custom i18n message overrides
 * @param props.styling - CSS variables and class overrides
 * @param props.hideHeader - Hide the header section
 * @param props.showActiveOnly - Show only enrolled factors
 * @param props.disableEnroll - Disable enroll actions
 * @param props.disableDelete - Disable delete actions
 * @param props.readOnly - Render in read-only mode
 * @param props.factorConfig - Per-factor visibility/enabled configuration
 * @param props.onEnroll - Callback after successful enrollment
 * @param props.onDelete - Callback after successful deletion
 * @param props.onFetch - Callback after factors are loaded
 * @param props.onErrorAction - Callback when actions error
 * @param props.onBeforeAction - Callback before actions; return false to cancel
 * @param props.schema - Validation schema overrides
 * @returns MFA management component
 *
 * @see {@link UserMFAMgmtProps} for full props documentation
 *
 * @example
 * ```tsx
 * <UserMFAMgmt
 *   onEnroll={(factor) => console.log('Enrolled:', factor)}
 *   onDelete={(factor) => console.log('Deleted:', factor)}
 *   factorConfig={{
 *     otp: { enabled: true },
 *     sms: { enabled: true },
 *     email: { enabled: false },
 *   }}
 * />
 * ```
 */
const UserMFAMgmt = UserMFAMgmtContainer;

export { UserMFAMgmt, UserMFAMgmtView };
