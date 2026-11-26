/**
 * Parts of one enrolled authenticator row of `UserMFAManagement`: icon, name, dates, menu
 * and the delete action. `FactorList` draws the default row from them, or the host
 * arranges them.
 * @module enrolled-factor-parts
 * @internal
 */

import {
  FACTOR_TYPE_PHONE,
  FACTOR_TYPE_EMAIL,
  FACTOR_TYPE_TOTP,
  FACTOR_TYPE_PUSH_NOTIFICATION,
  FACTOR_TYPE_RECOVERY_CODE,
  type Authenticator,
  type MFAType,
} from '@auth0/universal-components-core';
import {
  MoreVertical,
  Trash2,
  Mail,
  Smartphone,
  RectangleEllipsis,
  ShieldCheck,
} from 'lucide-react';
import * as React from 'react';

import { getAuthenticatorLabel } from './factor-list/factor-label';
import { EnrolledFactorProvider, useEnrolledFactorContext, useMFAContext } from './mfa-context';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslator } from '@/hooks/shared/use-translator';
import { getButtonContract, useRender } from '@/lib/composability/use-render';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils/date';
import { useId } from '@/lib/utils/use-id-compat';
import type {
  UserMFAManagementActionProps,
  UserMFAManagementChildrenProps,
  UserMFAManagementPartProps,
} from '@/types/my-account/user-mfa-management/user-mfa-management-types';

const FACTOR_ICONS = {
  [FACTOR_TYPE_PHONE]: Smartphone,
  [FACTOR_TYPE_EMAIL]: Mail,
  [FACTOR_TYPE_TOTP]: RectangleEllipsis,
  [FACTOR_TYPE_PUSH_NOTIFICATION]: Smartphone,
  [FACTOR_TYPE_RECOVERY_CODE]: ShieldCheck,
} as const;

/**
 * Provides one enrolled authenticator's context.
 * @param props - Authenticator, factor type and row content.
 * @param props.factor - The enrolled authenticator.
 * @param props.factorType - Factor type of the authenticator.
 * @param props.children - Row content.
 * @returns Enrolled factor context provider.
 * @internal
 */
export function EnrolledFactorScope({
  factor,
  factorType,
  children,
}: {
  factor: Authenticator;
  factorType: MFAType;
  children: React.ReactNode;
}) {
  const { model, customMessages } = useMFAContext('FactorList');
  const { t } = useTranslator('user_mfa_management', customMessages);
  const labelId = useId();
  const label = getAuthenticatorLabel(factor, factorType, t);

  return (
    <EnrolledFactorProvider
      value={{ ...model.getEnrolledFactorProps(factor, factorType), label, labelId }}
    >
      {children}
    </EnrolledFactorProvider>
  );
}

/**
 * One enrolled authenticator row. Defaults to icon, details and menu.
 * @param props - {@link UserMFAManagementPartProps}
 * @returns Row element.
 */
export function EnrolledFactor({ children, className }: UserMFAManagementPartProps) {
  const { label } = useEnrolledFactorContext('EnrolledFactor');

  return (
    <Card
      className={cn(
        'border border-[color:var(--color-border)] rounded-lg bg-transparent p-0 w-full',
        className,
      )}
      aria-label={label}
    >
      <CardContent className="flex flex-row items-center gap-3 p-3">
        {children ?? (
          <>
            <EnrolledFactorIcon />
            <EnrolledFactorDetails />
            <EnrolledFactorMenu />
          </>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Icon of the factor type. Children replace it.
 * @param props - {@link UserMFAManagementPartProps}
 * @returns Icon element or null.
 */
export function EnrolledFactorIcon({ children, className }: UserMFAManagementPartProps) {
  const { factorType } = useEnrolledFactorContext('EnrolledFactorIcon');
  const Icon = FACTOR_ICONS[factorType as keyof typeof FACTOR_ICONS];
  if (children) return <>{children}</>;
  if (!Icon) return null;

  return (
    <Icon className={cn('w-5 h-5 text-muted-foreground shrink-0', className)} aria-hidden="true" />
  );
}

/**
 * Name and dates of the authenticator. Defaults to `EnrolledFactorName` and
 * `EnrolledFactorMeta`.
 * @param props - {@link UserMFAManagementPartProps}
 * @returns Details element.
 */
export function EnrolledFactorDetails({ children, className }: UserMFAManagementPartProps) {
  useEnrolledFactorContext('EnrolledFactorDetails');

  return (
    <div className={cn('min-w-0 flex flex-col flex-1', className)}>
      {children ?? (
        <>
          <EnrolledFactorName />
          <EnrolledFactorMeta />
        </>
      )}
    </div>
  );
}

/**
 * Name of the current enrolled authenticator: the phone number, the email or the factor
 * title. `DeleteAction` and `EnrolledFactorMenuDelete` are described by it, so screen
 * readers say which authenticator a remove button acts on. Children replace the text and
 * keep the id.
 *
 * @param props - {@link UserMFAManagementPartProps}
 * @returns Authenticator name element.
 */
export function EnrolledFactorName({ children, className }: UserMFAManagementPartProps) {
  const { label, labelId } = useEnrolledFactorContext('EnrolledFactorName');

  return (
    <span
      id={labelId}
      title={children ? undefined : label}
      className={cn('font-medium text-body text-foreground truncate', className)}
    >
      {children ?? label}
    </span>
  );
}

/**
 * Created and last used dates, separated by a bullet. Renders nothing when none are
 * known. Children replace the default; compose `EnrolledFactorCreatedAt` and
 * `EnrolledFactorLastUsedAt` to reorder or drop them.
 * @param props - {@link UserMFAManagementPartProps}
 * @returns Meta element or null.
 */
export function EnrolledFactorMeta({ children, className }: UserMFAManagementPartProps) {
  const { factor } = useEnrolledFactorContext('EnrolledFactorMeta');
  if (!children && !factor.created_at && !factor.last_auth_at) return null;

  return (
    <span className={cn('text-sm font-normal text-muted-foreground', className)}>
      {children ?? (
        <>
          <EnrolledFactorCreatedAt />
          {factor.created_at && factor.last_auth_at && ' • '}
          <EnrolledFactorLastUsedAt />
        </>
      )}
    </span>
  );
}

/**
 * Date the authenticator was enrolled. Renders nothing when unknown.
 * @param props - {@link UserMFAManagementPartProps}
 * @returns Created date element or null.
 */
export function EnrolledFactorCreatedAt({ children, className }: UserMFAManagementPartProps) {
  const { customMessages } = useMFAContext('EnrolledFactorCreatedAt');
  const { factor } = useEnrolledFactorContext('EnrolledFactorCreatedAt');
  const { t, currentLanguage } = useTranslator('user_mfa_management', customMessages);
  if (!factor.created_at) return null;

  return (
    <time dateTime={factor.created_at} className={className}>
      {children ??
        t('factors.meta.created_at', { date: formatDate(factor.created_at, currentLanguage) })}
    </time>
  );
}

/**
 * Date the authenticator was last used. Renders nothing when unknown.
 * @param props - {@link UserMFAManagementPartProps}
 * @returns Last used date element or null.
 */
export function EnrolledFactorLastUsedAt({ children, className }: UserMFAManagementPartProps) {
  const { customMessages } = useMFAContext('EnrolledFactorLastUsedAt');
  const { factor } = useEnrolledFactorContext('EnrolledFactorLastUsedAt');
  const { t, currentLanguage } = useTranslator('user_mfa_management', customMessages);
  if (!factor.last_auth_at) return null;

  return (
    <time dateTime={factor.last_auth_at} className={className}>
      {children ??
        t('factors.meta.last_used', { date: formatDate(factor.last_auth_at, currentLanguage) })}
    </time>
  );
}

/**
 * Row menu. Defaults to the kebab trigger and a content with the remove item, and renders
 * nothing when the delete action is hidden, such as when `readOnly`. Children replace the
 * default; compose `EnrolledFactorMenuTrigger`, `EnrolledFactorMenuContent` and
 * `EnrolledFactorMenuDelete`, with your own menu items next to the remove item. Use
 * `DeleteAction` instead to show remove as a button.
 * @param props - {@link UserMFAManagementChildrenProps}
 * @returns Menu element or null.
 */
export function EnrolledFactorMenu({ children }: UserMFAManagementChildrenProps) {
  const { deleteAction } = useEnrolledFactorContext('EnrolledFactorMenu');
  if (!children && deleteAction.hidden) return null;

  return (
    <div className="shrink-0">
      <DropdownMenu>
        {children ?? (
          <>
            <EnrolledFactorMenuTrigger />
            <EnrolledFactorMenuContent />
          </>
        )}
      </DropdownMenu>
    </div>
  );
}

/**
 * Button that opens the row menu. Children replace the kebab icon.
 * @param props - {@link UserMFAManagementPartProps}
 * @returns Menu trigger element.
 */
export function EnrolledFactorMenuTrigger({ children, className }: UserMFAManagementPartProps) {
  const { customMessages } = useMFAContext('EnrolledFactorMenuTrigger');
  useEnrolledFactorContext('EnrolledFactorMenuTrigger');
  const { t } = useTranslator('user_mfa_management', customMessages);

  return (
    <DropdownMenuTrigger
      variant="ghost"
      size="icon"
      aria-label={t('actions.menu_aria_label')}
      className={cn('p-2', className)}
    >
      {children ?? <MoreVertical className="w-5 h-5" aria-hidden="true" />}
    </DropdownMenuTrigger>
  );
}

/**
 * Popup of the row menu. Defaults to the remove item.
 * @param props - {@link UserMFAManagementPartProps}
 * @returns Menu content element.
 */
export function EnrolledFactorMenuContent({ children, className }: UserMFAManagementPartProps) {
  useEnrolledFactorContext('EnrolledFactorMenuContent');

  return (
    <DropdownMenuPortal>
      <DropdownMenuContent align="end" className={className}>
        {children ?? <EnrolledFactorMenuDelete />}
      </DropdownMenuContent>
    </DropdownMenuPortal>
  );
}

/**
 * Remove command as a menu item. Opens the confirmation dialog. Hidden when `readOnly`,
 * disabled by `disableDelete`, a running removal or a disabled factor. Use `render` to
 * replace the item while keeping the behaviour.
 *
 * @param props - {@link UserMFAManagementActionProps}
 * @returns Menu item element or null.
 */
export const EnrolledFactorMenuDelete = React.forwardRef<
  HTMLDivElement,
  UserMFAManagementActionProps
>(function EnrolledFactorMenuDelete({ render, children, className }, ref) {
  const { customMessages } = useMFAContext('EnrolledFactorMenuDelete');
  const { deleteAction, labelId } = useEnrolledFactorContext('EnrolledFactorMenuDelete');
  const { t } = useTranslator('user_mfa_management', customMessages);
  const label = t('actions.remove_button_label');
  const disabled = deleteAction.disabled || deleteAction.pending;

  const element = useRender({
    render,
    ref,
    state: { pending: deleteAction.pending, disabled },
    props: {
      disabled,
      'aria-busy': deleteAction.pending || undefined,
      'aria-describedby': labelId,
      onClick: deleteAction.onClick,
      className,
    },
    defaultRender: (props) => (
      <DropdownMenuItem
        {...props}
        aria-label={label}
        className={cn(
          'text-destructive-foreground focus:text-destructive-foreground',
          props.className,
        )}
      >
        {children ?? (
          <>
            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
            {label}
          </>
        )}
      </DropdownMenuItem>
    ),
  });

  return deleteAction.hidden ? null : element;
});

/**
 * Removes the current enrolled authenticator, for `FactorList` render functions.
 * Opens the confirmation dialog. Hidden when `readOnly`. Described by
 * `EnrolledFactorName` when the row renders one.
 *
 * @param props - {@link UserMFAManagementActionProps}
 * @returns Delete action element or null.
 */
export const DeleteAction = React.forwardRef<HTMLButtonElement, UserMFAManagementActionProps>(
  function DeleteAction({ render, children, className }, ref) {
    const { customMessages } = useMFAContext('DeleteAction');
    const { deleteAction, labelId } = useEnrolledFactorContext('DeleteAction');
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
        'aria-describedby': labelId,
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
