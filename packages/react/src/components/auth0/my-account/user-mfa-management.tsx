/** @module user-mfa-management */

import { getComponentStyles } from '@auth0/universal-components-core';
import * as React from 'react';

import { FactorDeleteModal } from '@/components/auth0/my-account/shared/user-mfa-management/factor-delete/factor-delete-modal';
import { EnrollFactorModal } from '@/components/auth0/my-account/shared/user-mfa-management/factor-enrollment/enroll-factor-modal';
import { MFAEmptyState } from '@/components/auth0/my-account/shared/user-mfa-management/factor-list/empty-state';
import { MFAErrorState } from '@/components/auth0/my-account/shared/user-mfa-management/factor-list/error-state';
import { FactorsList } from '@/components/auth0/my-account/shared/user-mfa-management/factor-list/factors-list';
import { GateKeeper } from '@/components/auth0/shared/gate-keeper/gate-keeper';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { List, ListItem } from '@/components/ui/list';
import { useUserMFA } from '@/hooks/my-account/use-user-mfa';
import { useTelemetry } from '@/hooks/shared/use-telemetry';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type {
  UserMFAManagementProps,
  UserMFAManagementViewProps,
} from '@/types/my-account/user-mfa-management/user-mfa-management-types';

const DEFAULT_STYLING: UserMFAManagementProps['styling'] = {
  variables: { common: {}, light: {}, dark: {} },
  classes: {},
};

/**
 * Multi-factor authentication management component.
 *
 * Complete MFA management interface for enrolling, viewing, and deleting authentication
 * factors. Supports TOTP authenticators, SMS, Email, Push notifications, and recovery codes.
 *
 * @param props - {@link UserMFAManagementProps}
 * @param props.customMessages - Custom i18n message overrides
 * @param props.styling - CSS variables and class overrides
 * @param props.hideHeader - Hide the header section
 * @param props.showActiveOnly - Show only enrolled factors
 * @param props.disableEnroll - Disable enroll actions
 * @param props.disableDelete - Disable delete actions
 * @param props.readOnly - Render in read-only mode
 * @param props.factorConfig - Per-factor visibility/enabled configuration
 * @param props.enrollAction - Lifecycle hooks for enrollment; onBefore to cancel, onAfter on success
 * @param props.deleteAction - Lifecycle hooks for deletion; onBefore to cancel, onAfter on success
 * @param props.schema - Validation schema overrides
 * @returns MFA management component
 *
 * @see {@link UserMFAManagementProps} for full props documentation
 *
 * @example
 * ```tsx
 * <UserMFAManagement
 *   enrollAction={{ onAfter: (factor) => console.log('Enrolled:', factor) }}
 *   deleteAction={{ onAfter: (factor) => console.log('Deleted:', factor) }}
 *   factorConfig={{
 *     otp: { enabled: true },
 *     sms: { enabled: true },
 *     email: { enabled: false },
 *   }}
 * />
 * ```
 */
function UserMFAManagement({
  customMessages = {},
  styling = DEFAULT_STYLING,
  hideHeader = false,
  showActiveOnly = false,
  disableEnroll = false,
  disableDelete = false,
  readOnly = false,
  factorConfig = {},
  enrollAction,
  deleteAction,
  schema,
}: UserMFAManagementProps) {
  useTelemetry('user-mfa-management');
  const {
    factorsByType,
    isLoadingFactors,
    isEnrolling,
    isDeleting,
    isConfirming,
    error,
    isEnrollDialogOpen,
    enrollFactor,
    enrollmentPhase,
    contact,
    otpData,
    recoveryCode,
    isDeleteDialogOpen,
    factorToDelete,
    visibleFactorTypes,
    hasNoActiveFactors,
    handleEnroll,
    handleCloseEnrollDialog,
    handleDeleteFactor,
    handleConfirmDelete,
    handleCancelDelete,
    handleSendCode,
    handleResendCode,
    handleConfirmOtp,
    handleConfirmPush,
    handleConfirmRecoveryCode,
    handleEnterQRPhase,
  } = useUserMFA({
    showActiveOnly,
    readOnly,
    disableDelete,
    factorConfig,
    customMessages,
    enrollAction,
    deleteAction,
  });

  return (
    <GateKeeper styling={styling} isLoading={isLoadingFactors}>
      <UserMFAManagementView
        error={error}
        schema={schema}
        isEnrolling={isEnrolling}
        isDeleting={isDeleting}
        isConfirming={isConfirming}
        styling={styling}
        customMessages={customMessages}
        hideHeader={hideHeader}
        showActiveOnly={showActiveOnly}
        disableEnroll={disableEnroll}
        disableDelete={disableDelete}
        readOnly={readOnly}
        factorConfig={factorConfig}
        isEnrollDialogOpen={isEnrollDialogOpen}
        enrollFactor={enrollFactor}
        enrollmentPhase={enrollmentPhase}
        contact={contact}
        otpData={otpData}
        recoveryCode={recoveryCode}
        isDeleteDialogOpen={isDeleteDialogOpen}
        factorToDelete={factorToDelete}
        factorsByType={factorsByType}
        visibleFactorTypes={visibleFactorTypes}
        hasNoActiveFactors={hasNoActiveFactors}
        onEnrollFactor={handleEnroll}
        onDeleteFactor={handleDeleteFactor}
        onCloseEnrollDialog={handleCloseEnrollDialog}
        onConfirmDelete={handleConfirmDelete}
        onCancelDelete={handleCancelDelete}
        onSubmitContact={handleSendCode}
        onResendCode={handleResendCode}
        onConfirmOtp={handleConfirmOtp}
        onContinueQRScan={handleConfirmPush}
        onConfirmRecoveryCode={handleConfirmRecoveryCode}
        onStartQREnrollment={handleEnterQRPhase}
      />
    </GateKeeper>
  );
}

/**
 * UserMFAManagementView — Presentational component.
 * @param props - All state and handlers passed directly.
 * @returns User Management View element
 * @internal
 */
function UserMFAManagementView({
  error,
  schema,
  isEnrolling,
  isDeleting,
  isConfirming,
  styling,
  customMessages,
  hideHeader,
  showActiveOnly,
  disableEnroll,
  disableDelete,
  readOnly,
  factorConfig,
  isEnrollDialogOpen,
  enrollFactor,
  enrollmentPhase,
  contact,
  otpData,
  recoveryCode,
  isDeleteDialogOpen,
  factorToDelete,
  factorsByType,
  visibleFactorTypes,
  hasNoActiveFactors,
  onEnrollFactor,
  onDeleteFactor,
  onCloseEnrollDialog,
  onConfirmDelete,
  onCancelDelete,
  onSubmitContact,
  onResendCode,
  onConfirmOtp,
  onContinueQRScan,
  onConfirmRecoveryCode,
  onStartQREnrollment,
}: UserMFAManagementViewProps) {
  const { isDarkMode } = useTheme();
  const { t } = useTranslator('user_mfa_management', customMessages);
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  return (
    <StyledScope style={currentStyles.variables}>
      <Card className={cn('p-6 gap-4', currentStyles.classes?.['UserMFAManagement-card'])}>
        {error ? (
          <MFAErrorState
            title={t('component_error.title')}
            description={t('component_error.description')}
          />
        ) : (
          <>
            {!hideHeader && (
              <div className={cn(currentStyles.classes?.['UserMFAManagement-header'])}>
                <CardTitle
                  id="mfa-management-title"
                  className="text-2xl text-(length:--font-size-heading) font-medium text-left"
                >
                  {t('header.title')}
                </CardTitle>
                <CardDescription
                  id="mfa-management-desc"
                  className="text-sm text-(length:--font-size-paragraph) text-muted-foreground text-left"
                >
                  {t('header.description')}
                </CardDescription>
              </div>
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
                        'w-full p-0 m-0 py-6 first:pt-0 last:pb-0 gap-3',
                        !isEnabledFactor && 'opacity-50 pointer-events-none',
                      )}
                      aria-disabled={!isEnabledFactor}
                      tabIndex={0}
                      aria-label={t(`factors.${factorType}.title`)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <span
                            className={cn(
                              'break-words text-card-foreground whitespace-normal text-base text-(length:--font-size-body) font-medium',
                            )}
                            id={`factor-title-${factorType}`}
                          >
                            {t(`factors.${factorType}.title`)}
                          </span>

                          {hasActiveFactors && (
                            <Badge
                              variant="success"
                              size="sm"
                              className="shrink-0"
                              aria-label={t('factors.meta.enabled')}
                            >
                              {t('factors.meta.enabled')}
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
                            aria-label={t(`factors.${factorType}.button_text`)}
                            aria-describedby={`factor-title-${factorType}`}
                          >
                            {t(`factors.${factorType}.button_text`)}
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
                          {t(`factors.${factorType}.description`)}
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
      </Card>
      {enrollFactor && (
        <EnrollFactorModal
          open={isEnrollDialogOpen}
          onClose={onCloseEnrollDialog}
          factorType={enrollFactor}
          enrollmentPhase={enrollmentPhase}
          contact={contact}
          otpData={otpData}
          recoveryCode={recoveryCode}
          isEnrolling={isEnrolling}
          isConfirming={isConfirming}
          onSubmitContact={onSubmitContact}
          onResendCode={onResendCode}
          onConfirmOtp={onConfirmOtp}
          onContinueQRScan={onContinueQRScan}
          onConfirmRecoveryCode={onConfirmRecoveryCode}
          onStartQREnrollment={onStartQREnrollment}
          schema={schema}
          styling={styling}
          customMessages={customMessages}
        />
      )}
      <FactorDeleteModal
        open={isDeleteDialogOpen}
        onOpenChange={(open) => !open && onCancelDelete()}
        factorToDelete={factorToDelete}
        isDeletingFactor={isDeleting}
        onConfirm={onConfirmDelete}
        onCancel={onCancelDelete}
        styling={styling}
        customMessages={customMessages}
      />
    </StyledScope>
  );
}

export { UserMFAManagement, UserMFAManagementView };
