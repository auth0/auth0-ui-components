/** @module user-mfa-management */

import { getComponentStyles } from '@auth0/universal-components-core';
import * as React from 'react';

import { FactorDeleteModal } from '@/components/auth0/my-account/shared/user-mfa-management/factor-delete/factor-delete-modal';
import { EnrollFactorModal } from '@/components/auth0/my-account/shared/user-mfa-management/factor-enrollment/enroll-factor-modal';
import { MFAEmptyState } from '@/components/auth0/my-account/shared/user-mfa-management/factor-list/empty-state';
import { MFAErrorState } from '@/components/auth0/my-account/shared/user-mfa-management/factor-list/error-state';
import { FactorsList } from '@/components/auth0/my-account/shared/user-mfa-management/factor-list/factors-list';
import { GateKeeper } from '@/components/auth0/shared/gate-keeper/gate-keeper';
import { Header } from '@/components/auth0/shared/header';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from '@/components/ui/card';
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
      {!hideHeader && <Header title={t('header.title')} description={t('header.description')} />}

      {error ? (
        <Card className={cn(currentStyles.classes?.['UserMFAManagement-item'])}>
          <MFAErrorState
            title={t('component_error.title')}
            description={t('component_error.description')}
          />
        </Card>
      ) : showActiveOnly && hasNoActiveFactors ? (
        <Card className={cn(currentStyles.classes?.['UserMFAManagement-item'])}>
          <MFAEmptyState message={t('no_active_mfa')} />
        </Card>
      ) : (
        <div className="flex flex-col gap-4 w-full">
          {visibleFactorTypes.map((factorType) => {
            const factors = factorsByType[factorType] || [];
            const activeFactors = factors.filter((f) => f.enrolled);
            const isEnabledFactor = factorConfig?.[factorType]?.enabled !== false;
            const hasActiveFactors = activeFactors.length > 0;

            return (
              <Card
                key={factorType}
                className={cn(
                  !isEnabledFactor && 'opacity-50 pointer-events-none',
                  currentStyles.classes?.['UserMFAManagement-item'],
                )}
                aria-disabled={!isEnabledFactor}
                aria-label={t(`factors.${factorType}.title`)}
              >
                <CardHeader>
                  <CardTitle className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span
                      className="break-words text-card-foreground whitespace-normal text-body font-medium"
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
                  </CardTitle>

                  {!hasActiveFactors && (
                    <CardDescription
                      className="font-normal text-paragraph break-words"
                      id={`factor-desc-${factorType}`}
                    >
                      {t(`factors.${factorType}.description`)}
                    </CardDescription>
                  )}

                  {!readOnly && (
                    <CardAction>
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
                    </CardAction>
                  )}
                </CardHeader>

                {hasActiveFactors && (
                  <CardContent>
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
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
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
