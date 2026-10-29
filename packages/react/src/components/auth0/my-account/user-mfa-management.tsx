/**
 * Multi-factor authentication management component.
 *
 * Complete MFA management interface for enrolling, viewing, and deleting authentication factors. Supports TOTP authenticators, SMS, Email, Push notifications, and recovery codes.
 * @module user-mfa-management
 */

import {
  getComponentStyles,
  type Authenticator,
  type MFAType,
} from '@auth0/universal-components-core';
import * as React from 'react';

import { FactorDeleteModal } from '@/components/auth0/my-account/shared/user-mfa-management/factor-delete/factor-delete-modal';
import { EnrollFactorModal } from '@/components/auth0/my-account/shared/user-mfa-management/factor-enrollment/enroll-factor-modal';
import { MFAEmptyState } from '@/components/auth0/my-account/shared/user-mfa-management/factor-list/empty-state';
import { FactorsList } from '@/components/auth0/my-account/shared/user-mfa-management/factor-list/factors-list';
import {
  CompoundHeader,
  CompoundHeaderActions,
  CompoundHeaderContent,
  CompoundHeaderDescription,
  CompoundHeaderTitle,
} from '@/components/auth0/shared/compound-header';
import { GateKeeper } from '@/components/auth0/shared/gate-keeper/gate-keeper';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { createUserMFAModel, useUserMFAModel } from '@/hooks/my-account/use-user-mfa';
import { useTelemetry } from '@/hooks/shared/use-telemetry';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { createCompoundContext } from '@/lib/composability/create-compound-context';
import { getButtonContract, useRender } from '@/lib/composability/use-render';
import { cn } from '@/lib/utils';
import type {
  MFAEnrolledFactorModel,
  MFAFactorModel,
  UserMFAManagementActionProps,
  UserMFAManagementContextValue,
  UserMFAManagementDefaultLayoutProps,
  UserMFAManagementFactorListProps,
  UserMFAManagementFactorsProps,
  UserMFAManagementHeaderActionsProps,
  UserMFAManagementHeaderProps,
  UserMFAManagementPartProps,
  UserMFAManagementProps,
  UserMFAManagementRootProps,
  UserMFAManagementViewProps,
  UserMFAModel,
} from '@/types/my-account/user-mfa-management/user-mfa-management-types';

const COMPONENT = 'UserMFAManagement';

const DEFAULT_STYLING: NonNullable<UserMFAManagementProps['styling']> = {
  variables: { common: {}, light: {}, dark: {} },
  classes: {},
};

const [MFAProvider, useMFAContext] =
  createCompoundContext<UserMFAManagementContextValue>(COMPONENT);

const [FactorProvider, useFactorContext] = createCompoundContext<MFAFactorModel>(
  COMPONENT,
  'Factor',
);

const [EnrolledFactorProvider, useEnrolledFactorContext] =
  createCompoundContext<MFAEnrolledFactorModel>(COMPONENT, 'FactorList');

/**
 * Reads the MFA management context. Use it in host components rendered inside
 * `UserMFAManagement.Root`.
 * @returns The context value, see {@link UserMFAManagementContextValue}.
 */
function useUserMFAManagementContext(): UserMFAManagementContextValue {
  return useMFAContext('useUserMFAManagementContext');
}

/**
 * Reads the current factor type inside `UserMFAManagement.Factor`.
 * @returns The factor model, see {@link MFAFactorModel}.
 */
function useUserMFAFactorContext(): MFAFactorModel {
  return useFactorContext('useUserMFAFactorContext');
}

/**
 * Reads the current enrolled authenticator inside a `UserMFAManagement.FactorList`
 * render function.
 * @returns The enrolled factor model, see {@link MFAEnrolledFactorModel}.
 */
function useUserMFAEnrolledFactorContext(): MFAEnrolledFactorModel {
  return useEnrolledFactorContext('useUserMFAEnrolledFactorContext');
}

interface MFAScopeProps {
  model: UserMFAModel;
  customMessages: UserMFAManagementProps['customMessages'];
  styling: UserMFAManagementProps['styling'];
  schema: UserMFAManagementProps['schema'];
  hideHeader: boolean;
  children: React.ReactNode;
}

/**
 * Provides the context, the style scope and the enroll and delete dialogs. Shared by
 * `Root`, which builds the model from the API, and `View`, which builds it from props.
 * @param props - {@link MFAScopeProps}
 * @returns Scoped children and the dialogs.
 * @internal
 */
function MFAScope({
  model,
  customMessages = {},
  styling = DEFAULT_STYLING,
  schema,
  hideHeader,
  children,
}: MFAScopeProps) {
  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const value = React.useMemo<UserMFAManagementContextValue>(
    () => ({
      model,
      customMessages,
      styling,
      classes: currentStyles.classes ?? {},
      hideHeader,
    }),
    [model, customMessages, styling, currentStyles.classes, hideHeader],
  );

  return (
    <MFAProvider value={value}>
      <StyledScope style={currentStyles.variables}>
        {children}
        {model.enrollFactor && (
          <EnrollFactorModal
            open={model.isEnrollDialogOpen}
            onClose={model.handleCloseEnrollDialog}
            factorType={model.enrollFactor}
            enrollmentPhase={model.enrollmentPhase}
            contact={model.contact}
            otpData={model.otpData}
            recoveryCode={model.recoveryCode}
            isEnrolling={model.isEnrolling}
            isConfirming={model.isConfirming}
            onSubmitContact={model.handleSendCode}
            onResendCode={model.handleResendCode}
            onConfirmOtp={model.handleConfirmOtp}
            onContinueQRScan={model.handleConfirmPush}
            onConfirmRecoveryCode={model.handleConfirmRecoveryCode}
            onStartQREnrollment={model.handleEnterQRPhase}
            schema={schema}
            styling={styling}
            customMessages={customMessages}
          />
        )}
        <FactorDeleteModal
          open={model.isDeleteDialogOpen}
          onOpenChange={(open) => !open && model.handleCancelDelete()}
          factorToDelete={model.factorToDelete}
          isDeletingFactor={model.isDeleting}
          onConfirm={model.handleConfirmDelete}
          onCancel={model.handleCancelDelete}
          styling={styling}
          customMessages={customMessages}
        />
      </StyledScope>
    </MFAProvider>
  );
}

/**
 * Owns data, state and the enroll and delete dialogs for every composition level.
 * Error and MFA step-up states replace the children; loading is shown by `Factors`,
 * so host content inside `Root` stays visible.
 *
 * @param props - {@link UserMFAManagementRootProps}
 * @returns Root element.
 */
function Root({
  children,
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
}: UserMFAManagementRootProps) {
  useTelemetry('user-mfa-management');
  const model = useUserMFAModel({
    showActiveOnly,
    readOnly,
    disableEnroll,
    disableDelete,
    factorConfig,
    customMessages,
    enrollAction,
    deleteAction,
  });

  return (
    <GateKeeper styling={styling}>
      <MFAScope
        model={model}
        customMessages={customMessages}
        styling={styling}
        schema={schema}
        hideHeader={hideHeader}
      >
        {children}
      </MFAScope>
    </GateKeeper>
  );
}

/**
 * The pre-composed layout used by `<UserMFAManagement />`.
 * @param props - {@link UserMFAManagementDefaultLayoutProps}
 * @returns Default layout.
 */
function DefaultLayout({ enrollAction, renderFactor }: UserMFAManagementDefaultLayoutProps) {
  const { hideHeader } = useMFAContext('DefaultLayout');

  const renderDefaultFactor = () => (
    <Factor>
      <FactorHeader>
        <FactorTitle />
        <FactorDescription />
        <FactorActions>{enrollAction ?? <EnrollAction />}</FactorActions>
      </FactorHeader>
      <FactorList />
    </Factor>
  );

  return (
    <>
      {!hideHeader && <Header />}
      <Factors>{renderFactor ?? renderDefaultFactor}</Factors>
    </>
  );
}

/**
 * Page header. Defaults to the translated title and description.
 * @param props - {@link UserMFAManagementHeaderProps}
 * @returns Header element.
 */
function Header({ children, align, className }: UserMFAManagementHeaderProps) {
  const { customMessages } = useMFAContext('Header');
  const { t } = useTranslator('user_mfa_management', customMessages);

  return (
    <CompoundHeader label={t('header.title')} className={className}>
      {children ?? (
        <CompoundHeaderContent align={align}>
          <Title />
          <Description />
        </CompoundHeaderContent>
      )}
    </CompoundHeader>
  );
}

/**
 * Wraps `Title` and `Description` inside a custom `Header`.
 * @param props - Content props.
 * @returns Header content element.
 */
function HeaderContent(props: UserMFAManagementHeaderProps) {
  useMFAContext('HeaderContent');
  return <CompoundHeaderContent {...props} />;
}

/**
 * Page title. Children replace the translated text.
 * @param props - {@link UserMFAManagementPartProps}
 * @returns Title element.
 */
function Title({ children, className }: UserMFAManagementPartProps) {
  const { customMessages } = useMFAContext('Title');
  const { t } = useTranslator('user_mfa_management', customMessages);
  return (
    <CompoundHeaderTitle className={className}>{children ?? t('header.title')}</CompoundHeaderTitle>
  );
}

/**
 * Page description. Children replace the translated text.
 * @param props - {@link UserMFAManagementPartProps}
 * @returns Description element.
 */
function Description({ children, className }: UserMFAManagementPartProps) {
  const { customMessages } = useMFAContext('Description');
  const { t } = useTranslator('user_mfa_management', customMessages);
  return (
    <CompoundHeaderDescription className={className}>
      {children ?? t('header.description')}
    </CompoundHeaderDescription>
  );
}

/**
 * Action region of a custom `Header`.
 * @param props - {@link UserMFAManagementHeaderActionsProps}
 * @returns Header actions element.
 */
function HeaderActions(props: UserMFAManagementHeaderActionsProps) {
  useMFAContext('HeaderActions');
  return <CompoundHeaderActions {...props} />;
}

/**
 * The factor cards. Shows a spinner while loading, and `EmptyState` when
 * `showActiveOnly` is set and nothing is enrolled.
 * @param props - {@link UserMFAManagementFactorsProps}
 * @returns Factors element.
 */
function Factors({ children, className }: UserMFAManagementFactorsProps) {
  const { model } = useMFAContext('Factors');

  if (model.isLoadingFactors) {
    return (
      <div className="flex items-center justify-center p-8" aria-busy="true">
        <Spinner />
      </div>
    );
  }
  if (model.showActiveOnly && model.hasNoActiveFactors) return <EmptyState />;

  return (
    <div className={cn('flex flex-col gap-4 w-full', className)}>
      {model.visibleFactorTypes.map((factorType) => (
        <FactorScope key={factorType} factorType={factorType}>
          {children ? children(factorType) : <Factor />}
        </FactorScope>
      ))}
    </div>
  );
}

/**
 * Provides one factor type's context.
 * @param props - Factor type and content.
 * @param props.factorType - Factor type.
 * @param props.children - Factor content.
 * @returns Factor context provider.
 * @internal
 */
function FactorScope({ factorType, children }: { factorType: MFAType; children: React.ReactNode }) {
  const { model } = useMFAContext('Factors');
  return <FactorProvider value={model.getFactorProps(factorType)}>{children}</FactorProvider>;
}

/**
 * Message shown when `showActiveOnly` is set and no factor is enrolled.
 * @param props - {@link UserMFAManagementPartProps}
 * @returns Empty state element or null.
 */
function EmptyState({ children, className }: UserMFAManagementPartProps) {
  const { model, customMessages, classes } = useMFAContext('EmptyState');
  const { t } = useTranslator('user_mfa_management', customMessages);
  if (model.isLoadingFactors || !model.hasNoActiveFactors) return null;

  return (
    <Card className={cn(classes['UserMFAManagement-item'], className)}>
      {children ?? <MFAEmptyState message={t('no_active_mfa')} />}
    </Card>
  );
}

/**
 * One factor type card. Defaults to header and enrolled list. Disabled factors
 * (`factorConfig[type].enabled: false`) are dimmed and inert.
 * @param props - {@link UserMFAManagementPartProps}
 * @returns Factor element.
 */
function Factor({ children, className }: UserMFAManagementPartProps) {
  const { customMessages, classes } = useMFAContext('Factor');
  const { factorType, isEnabled } = useFactorContext('Factor');
  const { t } = useTranslator('user_mfa_management', customMessages);

  return (
    <Card
      className={cn(
        !isEnabled && 'opacity-50 pointer-events-none',
        classes['UserMFAManagement-item'],
        className,
      )}
      aria-disabled={!isEnabled}
      aria-label={t(`factors.${factorType}.title`)}
    >
      {children ?? (
        <>
          <FactorHeader />
          <FactorList />
        </>
      )}
    </Card>
  );
}

/**
 * Header of a factor card. Defaults to title, description and enroll action.
 * @param props - {@link UserMFAManagementPartProps}
 * @returns Factor header element.
 */
function FactorHeader({ children, className }: UserMFAManagementPartProps) {
  useFactorContext('FactorHeader');
  return (
    <CardHeader className={className}>
      {children ?? (
        <>
          <FactorTitle />
          <FactorDescription />
          <FactorActions>
            <EnrollAction />
          </FactorActions>
        </>
      )}
    </CardHeader>
  );
}

/**
 * Factor name. Defaults to the translated title and status badge.
 * @param props - {@link UserMFAManagementPartProps}
 * @returns Factor title element.
 */
function FactorTitle({ children, className }: UserMFAManagementPartProps) {
  const { customMessages } = useMFAContext('FactorTitle');
  const { factorType } = useFactorContext('FactorTitle');
  const { t } = useTranslator('user_mfa_management', customMessages);

  return (
    <CardTitle className={cn('flex flex-wrap items-center gap-2 sm:gap-3', className)}>
      {children ?? (
        <>
          <span
            className="break-words text-card-foreground whitespace-normal text-body font-medium"
            id={`factor-title-${factorType}`}
          >
            {t(`factors.${factorType}.title`)}
          </span>
          <FactorStatus />
        </>
      )}
    </CardTitle>
  );
}

/**
 * "Enabled" badge, shown when the factor type has an enrolled authenticator.
 * @param props - {@link UserMFAManagementPartProps}
 * @returns Badge element or null.
 */
function FactorStatus({ children, className }: UserMFAManagementPartProps) {
  const { customMessages } = useMFAContext('FactorStatus');
  const { hasActiveFactors } = useFactorContext('FactorStatus');
  const { t } = useTranslator('user_mfa_management', customMessages);
  if (!hasActiveFactors) return null;

  return (
    <Badge
      variant="success"
      size="sm"
      className={cn('shrink-0', className)}
      aria-label={t('factors.meta.enabled')}
    >
      {children ?? t('factors.meta.enabled')}
    </Badge>
  );
}

/**
 * Factor description, shown while nothing of this type is enrolled.
 * @param props - {@link UserMFAManagementPartProps}
 * @returns Description element or null.
 */
function FactorDescription({ children, className }: UserMFAManagementPartProps) {
  const { customMessages } = useMFAContext('FactorDescription');
  const { factorType, hasActiveFactors } = useFactorContext('FactorDescription');
  const { t } = useTranslator('user_mfa_management', customMessages);
  if (hasActiveFactors) return null;

  return (
    <CardDescription
      className={cn('font-normal text-paragraph break-words', className)}
      id={`factor-desc-${factorType}`}
    >
      {children ?? t(`factors.${factorType}.description`)}
    </CardDescription>
  );
}

/**
 * Action region of a factor card header.
 * @param props - {@link UserMFAManagementPartProps}
 * @returns Card action element.
 */
function FactorActions({ children, className }: UserMFAManagementPartProps) {
  useFactorContext('FactorActions');
  return <CardAction className={className}>{children}</CardAction>;
}

/**
 * Starts enrollment of the current factor type. Hidden when `readOnly`, disabled
 * by `disableEnroll` or a disabled factor. Use `render` to replace the button while
 * keeping the behaviour.
 *
 * @param props - {@link UserMFAManagementActionProps}
 * @returns Enroll action element or null.
 */
const EnrollAction = React.forwardRef<HTMLButtonElement, UserMFAManagementActionProps>(
  function EnrollAction({ render, children, className }, ref) {
    const { customMessages } = useMFAContext('EnrollAction');
    const { factorType, enrollAction } = useFactorContext('EnrollAction');
    const { t } = useTranslator('user_mfa_management', customMessages);
    const label = t(`factors.${factorType}.button_text`);

    const element = useRender({
      render,
      ref,
      state: {
        pending: enrollAction.pending,
        disabled: enrollAction.disabled || enrollAction.pending,
      },
      props: {
        ...getButtonContract(enrollAction),
        'aria-label': label,
        'aria-describedby': `factor-title-${factorType}`,
        className,
      },
      defaultRender: (props) => (
        <Button
          size="default"
          variant="outline"
          {...props}
          className={cn('text-sm w-full sm:w-auto shrink-0', props.className)}
        >
          {children ?? label}
        </Button>
      ),
    });

    return enrollAction.hidden ? null : element;
  },
);

/**
 * Enrolled authenticators of the current factor type. Renders nothing while none
 * are enrolled. Defaults to the built-in list with a remove menu; pass a function
 * to render each authenticator yourself, with `DeleteAction` for removal.
 *
 * @param props - {@link UserMFAManagementFactorListProps}
 * @returns Factor list element or null.
 */
function FactorList({ children, className }: UserMFAManagementFactorListProps) {
  const { model, customMessages, styling } = useMFAContext('FactorList');
  const { factorType, activeFactors, hasActiveFactors, isEnabled } = useFactorContext('FactorList');
  if (!hasActiveFactors) return null;

  if (!children) {
    return (
      <CardContent className={className}>
        <FactorsList
          factors={activeFactors}
          factorType={factorType}
          readOnly={model.readOnly}
          isEnabledFactor={isEnabled}
          onDeleteFactor={model.handleDeleteFactor}
          isDeletingFactor={model.isDeleting}
          disableDelete={model.disableDelete}
          styling={styling}
          customMessages={customMessages}
        />
      </CardContent>
    );
  }

  return (
    <CardContent className={cn('space-y-2', className)}>
      {activeFactors.map((factor: Authenticator) => (
        <EnrolledFactorProvider
          key={factor.id}
          value={model.getEnrolledFactorProps(factor, factorType)}
        >
          {children(factor)}
        </EnrolledFactorProvider>
      ))}
    </CardContent>
  );
}

/**
 * Removes the current enrolled authenticator, for `FactorList` render functions.
 * Opens the confirmation dialog mounted by `Root`. Hidden when `readOnly`.
 *
 * @param props - {@link UserMFAManagementActionProps}
 * @returns Delete action element or null.
 */
const DeleteAction = React.forwardRef<HTMLButtonElement, UserMFAManagementActionProps>(
  function DeleteAction({ render, children, className }, ref) {
    const { customMessages } = useMFAContext('DeleteAction');
    const { deleteAction } = useEnrolledFactorContext('DeleteAction');
    const { t } = useTranslator('user_mfa_management', customMessages);

    const element = useRender({
      render,
      ref,
      state: {
        pending: deleteAction.pending,
        disabled: deleteAction.disabled || deleteAction.pending,
      },
      props: {
        ...getButtonContract(deleteAction),
        className,
      },
      defaultRender: (props) => (
        <Button size="sm" variant="outline" {...props}>
          {children ?? t('actions.remove_button_label')}
        </Button>
      ),
    });

    return deleteAction.hidden ? null : element;
  },
);

/**
 * Presentational MFA management, driven entirely by props. Renders the same layout
 * as `<UserMFAManagement />` without fetching, for docs and tests.
 * @param props - {@link UserMFAManagementViewProps}
 * @returns View element.
 */
function UserMFAManagementView(props: UserMFAManagementViewProps) {
  const model = createUserMFAModel(
    {
      factorsByType: props.factorsByType,
      isLoadingFactors: false,
      isEnrolling: props.isEnrolling,
      isDeleting: props.isDeleting,
      isConfirming: props.isConfirming,
      isEnrollDialogOpen: props.isEnrollDialogOpen,
      enrollFactor: props.enrollFactor,
      enrollmentPhase: props.enrollmentPhase,
      isDeleteDialogOpen: props.isDeleteDialogOpen,
      factorToDelete: props.factorToDelete,
      visibleFactorTypes: props.visibleFactorTypes,
      hasNoActiveFactors: props.hasNoActiveFactors,
      contact: props.contact,
      otpData: props.otpData,
      recoveryCode: props.recoveryCode,
      handleCancelDelete: props.onCancelDelete,
      handleConfirmDelete: props.onConfirmDelete,
      handleEnroll: async (factor) => props.onEnrollFactor(factor),
      handleCloseEnrollDialog: props.onCloseEnrollDialog,
      handleDeleteFactor: props.onDeleteFactor,
      handleSendCode: props.onSubmitContact,
      handleResendCode: props.onResendCode,
      handleConfirmOtp: props.onConfirmOtp,
      handleConfirmPush: props.onContinueQRScan,
      handleConfirmRecoveryCode: props.onConfirmRecoveryCode,
      handleEnterQRPhase: props.onStartQREnrollment,
    },
    {
      readOnly: props.readOnly,
      disableEnroll: props.disableEnroll,
      disableDelete: props.disableDelete,
      showActiveOnly: props.showActiveOnly,
      factorConfig: props.factorConfig ?? {},
    },
  );

  return (
    <MFAScope
      model={model}
      customMessages={props.customMessages}
      styling={props.styling}
      schema={props.schema}
      hideHeader={props.hideHeader}
    >
      <DefaultLayout />
    </MFAScope>
  );
}

/**
 * Multi-factor authentication management component.
 *
 * Complete MFA management interface for enrolling, viewing, and deleting authentication
 * factors. Supports TOTP authenticators, SMS, Email, Push notifications, and recovery codes.
 *
 * Composition levels:
 * - Default: `<UserMFAManagement />`.
 * - Narrow: replace one element with `render`, e.g.
 *   `<DefaultLayout enrollAction={<UserMFAManagement.EnrollAction render={<MyButton />} />} />`.
 * - Structural: arrange `Header`, `Factors`, `Factor` and their parts inside `Root`.
 * - Headless: `useUserMFAModel()` and host-owned markup.
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
 *
 * @example
 * ```tsx
 * <UserMFAManagement.Root readOnly={!canEdit}>
 *   <UserMFAManagement.Header />
 *   <UserMFAManagement.Factors>
 *     {() => (
 *       <UserMFAManagement.Factor>
 *         <UserMFAManagement.FactorHeader>
 *           <UserMFAManagement.FactorTitle />
 *           <UserMFAManagement.FactorActions>
 *             <UserMFAManagement.EnrollAction render={<MyButton />} />
 *           </UserMFAManagement.FactorActions>
 *         </UserMFAManagement.FactorHeader>
 *         <UserMFAManagement.FactorList />
 *       </UserMFAManagement.Factor>
 *     )}
 *   </UserMFAManagement.Factors>
 * </UserMFAManagement.Root>
 * ```
 */
function UserMFAManagementDefault(props: UserMFAManagementProps) {
  return (
    <Root {...props}>
      <DefaultLayout />
    </Root>
  );
}

const UserMFAManagement = Object.assign(UserMFAManagementDefault, {
  Root,
  DefaultLayout,
  Header,
  HeaderContent,
  Title,
  Description,
  HeaderActions,
  Factors,
  EmptyState,
  Factor,
  FactorHeader,
  FactorTitle,
  FactorStatus,
  FactorDescription,
  FactorActions,
  EnrollAction,
  FactorList,
  DeleteAction,
});

export {
  UserMFAManagement,
  UserMFAManagementView,
  useUserMFAManagementContext,
  useUserMFAFactorContext,
  useUserMFAEnrolledFactorContext,
};
