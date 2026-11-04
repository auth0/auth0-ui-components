/**
 * Passkey management component.
 *
 * Displays enrolled passkeys with options to add and revoke, as a default component,
 * compound parts and a headless model.
 * @module user-passkey-management
 */

import {
  getComponentStyles,
  type UserPasskeyManagementRevokeModalMessages,
} from '@auth0/universal-components-core';
import { MoreVertical, Trash2, UserRoundKey } from 'lucide-react';
import * as React from 'react';

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import { createUserPasskeyModel, useUserPasskeyModel } from '@/hooks/my-account/use-user-passkey';
import { useTelemetry } from '@/hooks/shared/use-telemetry';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { createCompoundContext } from '@/lib/composability/create-compound-context';
import { getButtonContract, useRender } from '@/lib/composability/use-render';
import { cn } from '@/lib/utils';
import { useId } from '@/lib/utils/use-id-compat';
import type {
  Passkey,
  UserPasskeyItemContextValue,
  UserPasskeyManagementActionProps,
  UserPasskeyManagementChildrenProps,
  UserPasskeyManagementContextValue,
  UserPasskeyManagementDefaultLayoutProps,
  UserPasskeyManagementHeaderActionsProps,
  UserPasskeyManagementHeaderProps,
  UserPasskeyManagementListProps,
  UserPasskeyManagementPartProps,
  UserPasskeyManagementProps,
  UserPasskeyManagementRootProps,
  UserPasskeyManagementViewProps,
  UserPasskeyModel,
} from '@/types/my-account/user-passkey-management/user-passkey-management-types';

const COMPONENT = 'UserPasskeyManagement';

const DEFAULT_STYLING: NonNullable<UserPasskeyManagementProps['styling']> = {
  variables: { common: {}, light: {}, dark: {} },
  classes: {},
};

const [PasskeyProvider, usePasskeyContext] =
  createCompoundContext<UserPasskeyManagementContextValue>(COMPONENT);

const [PasskeyItemProvider, usePasskeyItemContext] =
  createCompoundContext<UserPasskeyItemContextValue>(COMPONENT, 'Item');

/**
 * Reads the passkey management context. Use it in host components rendered
 * inside `UserPasskeyManagement.Root`.
 * @returns The context value, see {@link UserPasskeyManagementContextValue}.
 */
function useUserPasskeyManagementContext(): UserPasskeyManagementContextValue {
  return usePasskeyContext('useUserPasskeyManagementContext');
}

/**
 * Reads the current row inside `UserPasskeyManagement.Item`.
 * @returns The row context, see {@link UserPasskeyItemContextValue}.
 */
function useUserPasskeyItemContext(): UserPasskeyItemContextValue {
  return usePasskeyItemContext('useUserPasskeyItemContext');
}

interface PasskeyScopeProps {
  model: UserPasskeyModel;
  customMessages: UserPasskeyManagementProps['customMessages'];
  styling: UserPasskeyManagementProps['styling'];
  hideHeader: boolean;
  mountDialogs: boolean;
  children: React.ReactNode;
}

/**
 * Provides the context, the style scope and the revoke dialog. Shared by `Root`,
 * which builds the model from the API, and `View`, which builds it from props.
 * @param props - {@link PasskeyScopeProps}
 * @returns Scoped children and the revoke dialog.
 * @internal
 */
function PasskeyScope({
  model,
  customMessages = {},
  styling = DEFAULT_STYLING,
  hideHeader,
  mountDialogs,
  children,
}: PasskeyScopeProps) {
  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const value = React.useMemo<UserPasskeyManagementContextValue>(
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
    <PasskeyProvider value={value}>
      <StyledScope style={currentStyles.variables}>
        {children}
        {mountDialogs && <RevokeDialog />}
      </StyledScope>
    </PasskeyProvider>
  );
}

/**
 * Owns data, state and the revoke dialog for every composition level. Error and
 * MFA step-up states replace the children; loading is shown by the data parts
 * (`Section`, `List`), so host content inside `Root` stays visible. The default
 * revoke dialog is mounted here, so it works however the parts are arranged; set
 * `mountDialogs` to `false` to render `RevokeDialog` yourself.
 *
 * @param props - {@link UserPasskeyManagementRootProps}
 * @returns Root element.
 */
function Root({
  children,
  customMessages = {},
  styling = DEFAULT_STYLING,
  hideHeader = false,
  mountDialogs = true,
  addAction,
  revokeAction,
  onFetch,
}: UserPasskeyManagementRootProps) {
  useTelemetry('user-passkey-management');
  const model = useUserPasskeyModel({ customMessages, addAction, revokeAction, onFetch });

  return (
    <GateKeeper styling={styling}>
      <PasskeyScope
        model={model}
        customMessages={customMessages}
        styling={styling}
        hideHeader={hideHeader}
        mountDialogs={mountDialogs}
      >
        {children}
      </PasskeyScope>
    </GateKeeper>
  );
}

/**
 * The pre-composed layout used by `<UserPasskeyManagement />`.
 * @param props - {@link UserPasskeyManagementDefaultLayoutProps}
 * @returns Default layout.
 */
function DefaultLayout({ addAction, renderItem }: UserPasskeyManagementDefaultLayoutProps) {
  const { hideHeader } = usePasskeyContext('DefaultLayout');

  return (
    <>
      {!hideHeader && <Header />}
      <Section>
        <SectionHeader>
          <SectionTitle />
          <EmptyState />
          <SectionActions>{addAction ?? <AddAction />}</SectionActions>
        </SectionHeader>
        <List>{renderItem}</List>
      </Section>
    </>
  );
}

/**
 * Page header. Defaults to the translated title and description.
 * @param props - {@link UserPasskeyManagementHeaderProps}
 * @returns Header element.
 */
function Header({ children, align, className }: UserPasskeyManagementHeaderProps) {
  const { customMessages } = usePasskeyContext('Header');
  const { t } = useTranslator('passkey', customMessages);

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
function HeaderContent(props: UserPasskeyManagementHeaderProps) {
  usePasskeyContext('HeaderContent');
  return <CompoundHeaderContent {...props} />;
}

/**
 * Page title. Children replace the translated text.
 * @param props - {@link UserPasskeyManagementPartProps}
 * @returns Title element.
 */
function Title({ children, className }: UserPasskeyManagementPartProps) {
  const { customMessages } = usePasskeyContext('Title');
  const { t } = useTranslator('passkey', customMessages);
  return (
    <CompoundHeaderTitle className={className}>{children ?? t('header.title')}</CompoundHeaderTitle>
  );
}

/**
 * Page description. Children replace the translated text.
 * @param props - {@link UserPasskeyManagementPartProps}
 * @returns Description element.
 */
function Description({ children, className }: UserPasskeyManagementPartProps) {
  const { customMessages } = usePasskeyContext('Description');
  const { t } = useTranslator('passkey', customMessages);
  return (
    <CompoundHeaderDescription className={className}>
      {children ?? t('header.description')}
    </CompoundHeaderDescription>
  );
}

/**
 * Action region of a custom `Header`.
 * @param props - {@link UserPasskeyManagementHeaderActionsProps}
 * @returns Header actions element.
 */
function HeaderActions(props: UserPasskeyManagementHeaderActionsProps) {
  usePasskeyContext('HeaderActions');
  return <CompoundHeaderActions {...props} />;
}

/**
 * The passkeys card. Shows a spinner instead of its content while loading.
 * @param props - {@link UserPasskeyManagementPartProps}
 * @returns Section element.
 */
function Section({ children, className }: UserPasskeyManagementPartProps) {
  const { model, classes } = usePasskeyContext('Section');

  return (
    <Card
      className={cn(classes['UserPasskeyManagement-root'], className)}
      aria-busy={model.isLoading || undefined}
    >
      {model.isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Spinner />
        </div>
      ) : (
        (children ?? (
          <>
            <SectionHeader />
            <List />
          </>
        ))
      )}
    </Card>
  );
}

/**
 * Header of the passkeys card. Defaults to title, empty state and add action.
 * @param props - {@link UserPasskeyManagementPartProps}
 * @returns Section header element.
 */
function SectionHeader({ children, className }: UserPasskeyManagementPartProps) {
  usePasskeyContext('SectionHeader');

  return (
    <CardHeader className={className}>
      {children ?? (
        <>
          <SectionTitle />
          <EmptyState />
          <SectionActions>
            <AddAction />
          </SectionActions>
        </>
      )}
    </CardHeader>
  );
}

/**
 * Title of the passkeys card. Defaults to the translated title and status badge.
 * @param props - {@link UserPasskeyManagementPartProps}
 * @returns Section title element.
 */
function SectionTitle({ children, className }: UserPasskeyManagementPartProps) {
  const { customMessages } = usePasskeyContext('SectionTitle');
  const { t } = useTranslator('passkey', customMessages);

  return (
    <CardTitle className={cn('flex flex-wrap items-center gap-2 sm:gap-3', className)}>
      {children ?? (
        <>
          <span className="text-body font-semibold text-card-foreground">{t('section_title')}</span>
          <StatusBadge />
        </>
      )}
    </CardTitle>
  );
}

/**
 * "Enabled" badge, shown when at least one passkey exists.
 * @param props - {@link UserPasskeyManagementPartProps}
 * @returns Badge element or null.
 */
function StatusBadge({ children, className }: UserPasskeyManagementPartProps) {
  const { model, customMessages } = usePasskeyContext('StatusBadge');
  const { t } = useTranslator('passkey', customMessages);
  if (model.isLoading || !model.hasPasskeys) return null;

  return (
    <Badge
      variant="success"
      size="sm"
      className={cn('shrink-0', className)}
      aria-label={t('enabled')}
    >
      {children ?? t('enabled')}
    </Badge>
  );
}

/**
 * Message shown when there are no passkeys.
 * @param props - {@link UserPasskeyManagementPartProps}
 * @returns Description element or null.
 */
function EmptyState({ children, className }: UserPasskeyManagementPartProps) {
  const { model, customMessages } = usePasskeyContext('EmptyState');
  const { t } = useTranslator('passkey', customMessages);
  if (model.isLoading || model.hasPasskeys) return null;

  return <CardDescription className={className}>{children ?? t('no_passkeys')}</CardDescription>;
}

/**
 * Action region of the passkeys card header.
 * @param props - {@link UserPasskeyManagementPartProps}
 * @returns Card action element.
 */
function SectionActions({ children, className }: UserPasskeyManagementPartProps) {
  usePasskeyContext('SectionActions');
  return <CardAction className={className}>{children}</CardAction>;
}

/**
 * Starts passkey enrollment. Hidden when `addAction.disabled` is set.
 * Use `render` to replace the button while keeping the behaviour.
 *
 * @param props - {@link UserPasskeyManagementActionProps}
 * @returns Add action element or null.
 */
const AddAction = React.forwardRef<HTMLButtonElement, UserPasskeyManagementActionProps>(
  function AddAction({ render, children, className }, ref) {
    const { model, customMessages } = usePasskeyContext('AddAction');
    const { t } = useTranslator('passkey', customMessages);
    const action = model.getAddActionProps();
    const label = t('add_passkey');

    const element = useRender({
      render,
      ref,
      state: { pending: action.pending, disabled: action.disabled || action.pending },
      props: {
        ...getButtonContract(action),
        'aria-label': label,
        className,
      },
      defaultRender: (props, state) => (
        <Button
          size="default"
          variant="outline"
          {...props}
          className={cn('text-sm w-full sm:w-auto shrink-0', props.className)}
        >
          {state.pending ? (
            <Spinner size="sm" colorScheme="primary" aria-hidden="true" />
          ) : (
            (children ?? label)
          )}
        </Button>
      ),
    });

    return action.hidden ? null : element;
  },
);

/**
 * The passkey rows. Renders nothing when there are no passkeys.
 * @param props - {@link UserPasskeyManagementListProps}
 * @returns List element or null.
 */
function List({ children, className }: UserPasskeyManagementListProps) {
  const { model } = usePasskeyContext('List');

  if (model.isLoading) {
    return (
      <CardContent className="flex items-center justify-center p-8">
        <Spinner />
      </CardContent>
    );
  }
  if (!model.hasPasskeys) return null;

  return (
    <CardContent className={cn('space-y-2', className)}>
      {model.passkeys.map((passkey) => (
        <ItemScope key={passkey.id} passkey={passkey}>
          {children ? children(passkey) : <Item />}
        </ItemScope>
      ))}
    </CardContent>
  );
}

/**
 * Provides one row's context.
 * @param props - Row passkey and content.
 * @param props.passkey - Row passkey.
 * @param props.children - Row content.
 * @returns Row context provider.
 * @internal
 */
function ItemScope({ passkey, children }: { passkey: Passkey; children: React.ReactNode }) {
  const { model } = usePasskeyContext('List');
  const nameId = useId();
  return (
    <PasskeyItemProvider value={{ ...model.getItemProps(passkey), nameId }}>
      {children}
    </PasskeyItemProvider>
  );
}

/**
 * One passkey row. Defaults to icon, details and menu.
 * @param props - {@link UserPasskeyManagementPartProps}
 * @returns Row element.
 */
function Item({ children, className }: UserPasskeyManagementPartProps) {
  const { classes } = usePasskeyContext('Item');
  usePasskeyItemContext('Item');

  return (
    <Card className={cn(classes['UserPasskeyManagement-item'], className)}>
      <CardHeader className="flex flex-row items-center gap-3">
        {children ?? (
          <>
            <ItemIcon />
            <ItemDetails />
            <ItemMenu />
          </>
        )}
      </CardHeader>
    </Card>
  );
}

/**
 * Row icon.
 * @param props - {@link UserPasskeyManagementPartProps}
 * @returns Icon element.
 */
function ItemIcon({ children, className }: UserPasskeyManagementPartProps) {
  usePasskeyItemContext('ItemIcon');
  return (
    <>
      {children ?? (
        <UserRoundKey
          className={cn('h-4 w-4 shrink-0 text-muted-foreground', className)}
          aria-hidden="true"
        />
      )}
    </>
  );
}

/**
 * Row name and meta.
 * @param props - {@link UserPasskeyManagementPartProps}
 * @returns Details element.
 */
function ItemDetails({ children, className }: UserPasskeyManagementPartProps) {
  usePasskeyItemContext('ItemDetails');
  return (
    <div className={cn('flex flex-col gap-0.5 flex-1 min-w-0', className)}>
      {children ?? (
        <>
          <ItemName />
          <ItemMeta />
        </>
      )}
    </div>
  );
}

/**
 * Passkey name.
 * @param props - {@link UserPasskeyManagementPartProps}
 * @returns Name element.
 */
function ItemName({ children, className }: UserPasskeyManagementPartProps) {
  const { passkey, nameId } = usePasskeyItemContext('ItemName');
  return (
    <CardTitle
      id={nameId}
      className={cn('text-body font-semibold text-card-foreground', className)}
    >
      {children ?? passkey.name}
    </CardTitle>
  );
}

/**
 * Device, created and last used dates, separated by bullets. Renders nothing when none
 * are known. Children replace the default segments; compose `ItemDevice`,
 * `ItemCreatedAt` and `ItemLastUsedAt` to reorder or drop them.
 * @param props - {@link UserPasskeyManagementPartProps}
 * @returns Meta element or null.
 */
function ItemMeta({ children, className }: UserPasskeyManagementPartProps) {
  const { passkey } = usePasskeyItemContext('ItemMeta');
  if (!children && !passkey.deviceInfo && !passkey.createdAt && !passkey.lastUsedAt) return null;

  return (
    <CardDescription className={cn('flex flex-wrap items-center gap-x-1.5', className)}>
      {children ?? (
        <>
          <ItemDevice />
          {passkey.createdAt && (
            <>
              {passkey.deviceInfo && <span aria-hidden="true">•</span>}
              <ItemCreatedAt />
            </>
          )}
          {passkey.lastUsedAt && (
            <>
              {(passkey.deviceInfo || passkey.createdAt) && <span aria-hidden="true">•</span>}
              <ItemLastUsedAt />
            </>
          )}
        </>
      )}
    </CardDescription>
  );
}

/**
 * Device the passkey was created on. Renders nothing when unknown.
 * @param props - {@link UserPasskeyManagementPartProps}
 * @returns Device element or null.
 */
function ItemDevice({ children, className }: UserPasskeyManagementPartProps) {
  const { passkey } = usePasskeyItemContext('ItemDevice');
  const device = children ?? passkey.deviceInfo;
  if (!device) return null;

  return <span className={className}>{device}</span>;
}

/**
 * Date the passkey was created. Renders nothing when unknown.
 * @param props - {@link UserPasskeyManagementPartProps}
 * @returns Created date element or null.
 */
function ItemCreatedAt({ children, className }: UserPasskeyManagementPartProps) {
  const { customMessages } = usePasskeyContext('ItemCreatedAt');
  const { passkey } = usePasskeyItemContext('ItemCreatedAt');
  const { t } = useTranslator('passkey', customMessages);
  if (!children && !passkey.createdAt) return null;

  return (
    <span className={className}>
      {children ??
        t('created_at', { date: new Date(passkey.createdAt ?? '').toLocaleDateString() })}
    </span>
  );
}

/**
 * Date the passkey was last used. Renders nothing when unknown.
 * @param props - {@link UserPasskeyManagementPartProps}
 * @returns Last used date element or null.
 */
function ItemLastUsedAt({ children, className }: UserPasskeyManagementPartProps) {
  const { customMessages } = usePasskeyContext('ItemLastUsedAt');
  const { passkey } = usePasskeyItemContext('ItemLastUsedAt');
  const { t } = useTranslator('passkey', customMessages);
  if (!children && !passkey.lastUsedAt) return null;

  return (
    <span className={className}>
      {children ??
        t('last_used', { date: new Date(passkey.lastUsedAt ?? '').toLocaleDateString() })}
    </span>
  );
}

/**
 * Row menu. Defaults to the kebab trigger and a content with the revoke item, and renders
 * nothing when `revokeAction.disabled` is set. Children replace the default; compose
 * `ItemMenuTrigger`, `ItemMenuContent` and `ItemMenuRevoke`, with your own menu items
 * next to the revoke item. Use `RevokeAction` instead to show revoke as a button.
 * @param props - {@link UserPasskeyManagementChildrenProps}
 * @returns Menu element or null.
 */
function ItemMenu({ children }: UserPasskeyManagementChildrenProps) {
  const { revokeAction } = usePasskeyItemContext('ItemMenu');
  if (!children && revokeAction.hidden) return null;

  return (
    <DropdownMenu>
      {children ?? (
        <>
          <ItemMenuTrigger />
          <ItemMenuContent />
        </>
      )}
    </DropdownMenu>
  );
}

/**
 * Button that opens the row menu. Children replace the kebab icon.
 * @param props - {@link UserPasskeyManagementPartProps}
 * @returns Menu trigger element.
 */
function ItemMenuTrigger({ children, className }: UserPasskeyManagementPartProps) {
  const { passkey } = usePasskeyItemContext('ItemMenuTrigger');

  return (
    <DropdownMenuTrigger
      aria-label={passkey.name}
      className={cn(
        'h-8 w-8 p-0 rounded-xl bg-primary border border-primary/20 shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50 shrink-0',
        className,
      )}
    >
      {children ?? <MoreVertical className="h-4 w-4 text-primary-foreground" />}
    </DropdownMenuTrigger>
  );
}

/**
 * Popup of the row menu. Defaults to the revoke item.
 * @param props - {@link UserPasskeyManagementPartProps}
 * @returns Menu content element.
 */
function ItemMenuContent({ children, className }: UserPasskeyManagementPartProps) {
  usePasskeyItemContext('ItemMenuContent');

  return (
    <DropdownMenuPortal>
      <DropdownMenuContent align="end" className={className}>
        {children ?? <ItemMenuRevoke />}
      </DropdownMenuContent>
    </DropdownMenuPortal>
  );
}

/**
 * Revoke command as a menu item. Opens the confirmation dialog. Hidden when
 * `revokeAction.disabled` is set. Use `render` to replace the item while keeping the
 * behaviour.
 *
 * @param props - {@link UserPasskeyManagementActionProps}
 * @returns Menu item element or null.
 */
const ItemMenuRevoke = React.forwardRef<HTMLDivElement, UserPasskeyManagementActionProps>(
  function ItemMenuRevoke({ render, children, className }, ref) {
    const { customMessages } = usePasskeyContext('ItemMenuRevoke');
    const { revokeAction } = usePasskeyItemContext('ItemMenuRevoke');
    const { t } = useTranslator('passkey', customMessages);
    const disabled = revokeAction.disabled || revokeAction.pending;

    const element = useRender({
      render,
      ref,
      state: { pending: revokeAction.pending, disabled },
      props: {
        disabled,
        'aria-busy': revokeAction.pending || undefined,
        onClick: revokeAction.onClick,
        className,
      },
      defaultRender: (props) => (
        <DropdownMenuItem
          {...props}
          className={cn(
            'text-destructive-foreground focus:text-destructive-foreground',
            props.className,
          )}
        >
          {children ?? (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              {t('actions.revoke')}
            </>
          )}
        </DropdownMenuItem>
      ),
    });

    return revokeAction.hidden ? null : element;
  },
);

/**
 * Revoke command for the current row as a button, for layouts without the menu.
 * Opens the confirmation dialog mounted by `Root`. Hidden when
 * `revokeAction.disabled` is set.
 *
 * @param props - {@link UserPasskeyManagementActionProps}
 * @returns Revoke action element or null.
 */
const RevokeAction = React.forwardRef<HTMLButtonElement, UserPasskeyManagementActionProps>(
  function RevokeAction({ render, children, className }, ref) {
    const { customMessages } = usePasskeyContext('RevokeAction');
    const { revokeAction, nameId } = usePasskeyItemContext('RevokeAction');
    const { t } = useTranslator('passkey', customMessages);

    const element = useRender({
      render,
      ref,
      state: {
        pending: revokeAction.pending,
        disabled: revokeAction.disabled || revokeAction.pending,
      },
      props: {
        ...getButtonContract(revokeAction),
        'aria-describedby': nameId,
        className,
      },
      defaultRender: (props) => (
        <Button size="sm" variant="outline" {...props}>
          {children ?? t('actions.revoke')}
        </Button>
      ),
    });

    return revokeAction.hidden ? null : element;
  },
);

/**
 * Translator for the revoke dialog, with the consumer's overrides for it.
 * @returns The translator of the `passkey.modals.revoke` namespace.
 * @internal
 */
function useRevokeTranslator() {
  const { customMessages } = usePasskeyContext('RevokeDialog');
  const overrides: Partial<UserPasskeyManagementRevokeModalMessages> | undefined =
    customMessages.modals?.revoke;
  return useTranslator('passkey.modals.revoke', overrides);
}

/**
 * Confirmation dialog for revoking a passkey, driven by the model. `Root` mounts it, so it
 * works however the parts are arranged. To compose it, set `Root`'s `mountDialogs` to
 * `false` and render it yourself. Children replace the default content.
 * @param props - {@link UserPasskeyManagementChildrenProps}
 * @returns Dialog element.
 */
function RevokeDialog({ children }: UserPasskeyManagementChildrenProps) {
  const { model } = usePasskeyContext('RevokeDialog');
  const { isRevoking, setIsRevokeModalOpen } = model;

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (!isRevoking) setIsRevokeModalOpen(open);
    },
    [isRevoking, setIsRevokeModalOpen],
  );

  return (
    <Dialog open={model.isRevokeModalOpen} onOpenChange={handleOpenChange}>
      {children ?? <RevokeDialogContent />}
    </Dialog>
  );
}

/**
 * Panel of the revoke dialog. Defaults to header, description and footer.
 * @param props - {@link UserPasskeyManagementPartProps}
 * @returns Dialog content element.
 */
function RevokeDialogContent({ children, className }: UserPasskeyManagementPartProps) {
  const { classes } = usePasskeyContext('RevokeDialogContent');

  return (
    <DialogContent className={cn(classes['PasskeyActionModal-modalContent'], className)}>
      {children ?? (
        <>
          <RevokeDialogHeader />
          <RevokeDialogDescription />
          <RevokeDialogFooter />
        </>
      )}
    </DialogContent>
  );
}

/**
 * Header of the revoke dialog. Defaults to the title.
 * @param props - {@link UserPasskeyManagementPartProps}
 * @returns Dialog header element.
 */
function RevokeDialogHeader({ children, className }: UserPasskeyManagementPartProps) {
  usePasskeyContext('RevokeDialogHeader');
  return <DialogHeader className={className}>{children ?? <RevokeDialogTitle />}</DialogHeader>;
}

/**
 * Title of the revoke dialog. Children replace the translated text.
 * @param props - {@link UserPasskeyManagementPartProps}
 * @returns Dialog title element.
 */
function RevokeDialogTitle({ children, className }: UserPasskeyManagementPartProps) {
  usePasskeyContext('RevokeDialogTitle');
  const { t } = useRevokeTranslator();
  return <DialogTitle className={className}>{children ?? t('title')}</DialogTitle>;
}

/**
 * Consent message of the revoke dialog, naming the passkey. Children replace the text.
 * It describes the dialog to assistive technology.
 * @param props - {@link UserPasskeyManagementPartProps}
 * @returns Dialog description element.
 */
function RevokeDialogDescription({ children, className }: UserPasskeyManagementPartProps) {
  const { model } = usePasskeyContext('RevokeDialogDescription');
  const { t } = useRevokeTranslator();

  return (
    <DialogDescription className={cn('py-4 text-paragraph font-normal text-primary', className)}>
      {children ?? (
        <>
          {t.trans('consent', {
            components: {
              bold: (text: string) => <strong key="passkey-name">{text}</strong>,
            },
            vars: { name: model.currentPasskey?.name ?? '' },
          })}
        </>
      )}
    </DialogDescription>
  );
}

/**
 * Action region of the revoke dialog. Defaults to cancel and confirm.
 * @param props - {@link UserPasskeyManagementPartProps}
 * @returns Dialog footer element.
 */
function RevokeDialogFooter({ children, className }: UserPasskeyManagementPartProps) {
  usePasskeyContext('RevokeDialogFooter');

  return (
    <DialogFooter className={className}>
      <div className="flex flex-row items-center justify-end gap-2 p-2">
        {children ?? (
          <>
            <RevokeDialogCancel />
            <RevokeDialogConfirm />
          </>
        )}
      </div>
    </DialogFooter>
  );
}

/**
 * Closes the revoke dialog without revoking. Disabled while a revoke is running. Use
 * `render` to replace the button while keeping the behaviour.
 *
 * @param props - {@link UserPasskeyManagementActionProps}
 * @returns Cancel action element.
 */
const RevokeDialogCancel = React.forwardRef<HTMLButtonElement, UserPasskeyManagementActionProps>(
  function RevokeDialogCancel({ render, children, className }, ref) {
    const { model } = usePasskeyContext('RevokeDialogCancel');
    const { t } = useRevokeTranslator();
    const { isRevoking, setIsRevokeModalOpen } = model;

    return useRender({
      render,
      ref,
      state: { pending: false, disabled: isRevoking },
      props: {
        ...getButtonContract({
          onClick: () => setIsRevokeModalOpen(false),
          disabled: isRevoking,
          pending: false,
        }),
        className,
      },
      defaultRender: (props) => (
        <Button
          variant="outline"
          {...props}
          className={cn('FormActions-previous', props.className)}
        >
          {children ?? t('cancel')}
        </Button>
      ),
    });
  },
);

/**
 * Revokes the passkey the dialog is about. Shows a spinner and is disabled while the
 * revoke runs. Use `render` to replace the button while keeping the behaviour.
 *
 * @param props - {@link UserPasskeyManagementActionProps}
 * @returns Confirm action element.
 */
const RevokeDialogConfirm = React.forwardRef<HTMLButtonElement, UserPasskeyManagementActionProps>(
  function RevokeDialogConfirm({ render, children, className }, ref) {
    const { model } = usePasskeyContext('RevokeDialogConfirm');
    const { t } = useRevokeTranslator();
    const pending = model.isRevoking;

    return useRender({
      render,
      ref,
      state: { pending, disabled: pending },
      props: {
        ...getButtonContract({
          onClick: () => void model.handleConfirmRevoke(),
          disabled: false,
          pending,
        }),
        className,
      },
      defaultRender: (props) => (
        <Button
          variant="destructive"
          {...props}
          className={cn('FormActions-next min-w-17.5', props.className)}
          aria-label={pending ? t('confirm') : undefined}
        >
          {pending ? (
            <Spinner colorScheme="primary" size="sm" aria-hidden="true" />
          ) : (
            (children ?? t('confirm'))
          )}
        </Button>
      ),
    });
  },
);

/**
 * Presentational passkey management, driven entirely by props. Renders the same
 * layout as `<UserPasskeyManagement />` without fetching, for docs and tests.
 * @param props - {@link UserPasskeyManagementViewProps}
 * @returns View element.
 */
function UserPasskeyManagementView({
  styling,
  customMessages,
  hideHeader,
  ...state
}: UserPasskeyManagementViewProps) {
  const model = createUserPasskeyModel({
    ...state,
    isLoading: false,
    readOnly: state.disableAdd && state.disableRevoke,
  });

  return (
    <PasskeyScope
      model={model}
      customMessages={customMessages}
      styling={styling}
      hideHeader={hideHeader}
      mountDialogs
    >
      <DefaultLayout />
    </PasskeyScope>
  );
}

/**
 * Passkey management component.
 *
 * Displays enrolled passkeys with options to add and revoke.
 *
 * Composition levels:
 * - Default: `<UserPasskeyManagement />`.
 * - Narrow: replace one element with `render`, e.g.
 *   `<DefaultLayout addAction={<UserPasskeyManagement.AddAction render={<MyButton />} />} />`.
 * - Structural: arrange `Header`, `Section`, `List`, `Item` and their parts inside `Root`.
 * - Headless: `useUserPasskeyModel()` and host-owned markup.
 *
 * @param props - {@link UserPasskeyManagementProps}
 * @param props.customMessages - Custom i18n message overrides
 * @param props.styling - CSS variables and class overrides
 * @param props.hideHeader - Hide the header section
 * @param props.addAction - Lifecycle hooks for the add passkey operation
 * @param props.revokeAction - Lifecycle hooks for the revoke passkey operation
 * @param props.onFetch - Callback after passkeys are loaded
 * @returns Passkey management component
 *
 * @see {@link UserPasskeyManagementProps} for full props documentation
 *
 * @example
 * ```tsx
 * <UserPasskeyManagement
 *   addAction={{ onAfter: () => console.log('Passkey added') }}
 *   revokeAction={{ onAfter: (passkey) => console.log('Revoked:', passkey.name) }}
 * />
 * ```
 *
 * @example
 * ```tsx
 * <UserPasskeyManagement.Root>
 *   <UserPasskeyManagement.Header>
 *     <UserPasskeyManagement.HeaderContent>
 *       <UserPasskeyManagement.Title />
 *     </UserPasskeyManagement.HeaderContent>
 *     <UserPasskeyManagement.HeaderActions>
 *       <UserPasskeyManagement.AddAction render={<MyButton />} />
 *     </UserPasskeyManagement.HeaderActions>
 *   </UserPasskeyManagement.Header>
 *   <UserPasskeyManagement.Section>
 *     <UserPasskeyManagement.List>
 *       {() => (
 *         <UserPasskeyManagement.Item>
 *           <UserPasskeyManagement.ItemDetails />
 *           <UserPasskeyManagement.RevokeAction />
 *         </UserPasskeyManagement.Item>
 *       )}
 *     </UserPasskeyManagement.List>
 *   </UserPasskeyManagement.Section>
 * </UserPasskeyManagement.Root>
 * ```
 */
function UserPasskeyManagementDefault(props: UserPasskeyManagementProps) {
  return (
    <Root {...props}>
      <DefaultLayout />
    </Root>
  );
}

const UserPasskeyManagement = Object.assign(UserPasskeyManagementDefault, {
  Root,
  DefaultLayout,
  Header,
  HeaderContent,
  Title,
  Description,
  HeaderActions,
  Section,
  SectionHeader,
  SectionTitle,
  StatusBadge,
  EmptyState,
  SectionActions,
  AddAction,
  List,
  Item,
  ItemIcon,
  ItemDetails,
  ItemName,
  ItemMeta,
  ItemDevice,
  ItemCreatedAt,
  ItemLastUsedAt,
  ItemMenu,
  ItemMenuTrigger,
  ItemMenuContent,
  ItemMenuRevoke,
  RevokeAction,
  RevokeDialog,
  RevokeDialogContent,
  RevokeDialogHeader,
  RevokeDialogTitle,
  RevokeDialogDescription,
  RevokeDialogFooter,
  RevokeDialogCancel,
  RevokeDialogConfirm,
});

export {
  UserPasskeyManagement,
  UserPasskeyManagementView,
  useUserPasskeyManagementContext,
  useUserPasskeyItemContext,
};
