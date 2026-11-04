/**
 * Parts of the `UserMFAManagement` delete dialog.
 *
 * The dialog is driven by the model: `Root` mounts it, or the host renders `DeleteDialog`
 * and arranges the parts.
 * @module delete-dialog-parts
 * @internal
 */

import * as React from 'react';

import { useMFAContext } from './mfa-context';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useTranslator } from '@/hooks/shared/use-translator';
import { getButtonContract, useRender } from '@/lib/composability/use-render';
import { cn } from '@/lib/utils';
import type {
  UserMFAManagementActionProps,
  UserMFAManagementChildrenProps,
  UserMFAManagementPartProps,
} from '@/types/my-account/user-mfa-management/user-mfa-management-types';

/**
 * Confirmation dialog for removing an authenticator, driven by the model. `Root` mounts
 * it, so it works however the parts are arranged. To compose it, set `Root`'s
 * `mountDialogs` to `false` and render it yourself. Children replace the default content.
 * @param props - {@link UserMFAManagementChildrenProps}
 * @returns Dialog element.
 */
export function DeleteDialog({ children }: UserMFAManagementChildrenProps) {
  const { model } = useMFAContext('DeleteDialog');
  const { handleCancelDelete } = model;

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) handleCancelDelete();
    },
    [handleCancelDelete],
  );

  return (
    <Dialog open={model.isDeleteDialogOpen} onOpenChange={handleOpenChange}>
      {children ?? <DeleteDialogContent />}
    </Dialog>
  );
}

/**
 * Panel of the delete dialog. Defaults to header, separator, description and footer.
 * @param props - {@link UserMFAManagementPartProps}
 * @returns Dialog content element.
 */
export function DeleteDialogContent({ children, className }: UserMFAManagementPartProps) {
  const { variables, classes } = useMFAContext('DeleteDialogContent');

  return (
    <DialogContent
      style={variables}
      className={cn(
        'w-[600px] min-h-44 max-h-[90vh] gap-4',
        classes['FactorDeleteModal-dialogContent'],
        className,
      )}
    >
      {children ?? (
        <>
          <DeleteDialogHeader />
          <DeleteDialogSeparator />
          <DeleteDialogDescription />
          <DeleteDialogFooter />
        </>
      )}
    </DialogContent>
  );
}

/**
 * Header of the delete dialog. Defaults to the title.
 * @param props - {@link UserMFAManagementPartProps}
 * @returns Dialog header element.
 */
export function DeleteDialogHeader({ children, className }: UserMFAManagementPartProps) {
  useMFAContext('DeleteDialogHeader');
  return <DialogHeader className={className}>{children ?? <DeleteDialogTitle />}</DialogHeader>;
}

/**
 * Title of the delete dialog. Children replace the translated text.
 * @param props - {@link UserMFAManagementPartProps}
 * @returns Dialog title element.
 */
export function DeleteDialogTitle({ children, className }: UserMFAManagementPartProps) {
  const { customMessages } = useMFAContext('DeleteDialogTitle');
  const { t } = useTranslator('user_mfa_management', customMessages);

  return (
    <DialogTitle className={cn('text-left text-title font-medium', className)}>
      {children ?? t('remove_factor_dialog.title')}
    </DialogTitle>
  );
}

/**
 * Line between the header and the consent message.
 * @param props - Class name.
 * @param props.className - Class name.
 * @returns Separator element.
 */
export function DeleteDialogSeparator({ className }: { className?: string }) {
  useMFAContext('DeleteDialogSeparator');
  return <Separator className={className} />;
}

/**
 * Consent message of the delete dialog, for the type of the authenticator being removed.
 * Children replace the text. It describes the dialog to assistive technology.
 * @param props - {@link UserMFAManagementPartProps}
 * @returns Dialog description element.
 */
export function DeleteDialogDescription({ children, className }: UserMFAManagementPartProps) {
  const { model, customMessages } = useMFAContext('DeleteDialogDescription');
  const { t } = useTranslator('user_mfa_management', customMessages);
  const type = model.factorToDelete?.type;

  return (
    <DialogDescription
      className={cn('text-center text-paragraph font-normal text-primary', className)}
    >
      {children ?? (type && t(`remove_factor_dialog.consent.${type}`))}
    </DialogDescription>
  );
}

/**
 * Action region of the delete dialog. Defaults to cancel and confirm.
 * @param props - {@link UserMFAManagementPartProps}
 * @returns Dialog footer element.
 */
export function DeleteDialogFooter({ children, className }: UserMFAManagementPartProps) {
  useMFAContext('DeleteDialogFooter');

  return (
    <DialogFooter className={cn('mt-6', className)}>
      {children ?? (
        <>
          <DeleteDialogCancel />
          <DeleteDialogConfirm />
        </>
      )}
    </DialogFooter>
  );
}

/**
 * Closes the delete dialog without removing. Disabled while a removal is running. Use
 * `render` to replace the button while keeping the behaviour.
 *
 * @param props - {@link UserMFAManagementActionProps}
 * @returns Cancel action element.
 */
export const DeleteDialogCancel = React.forwardRef<HTMLButtonElement, UserMFAManagementActionProps>(
  function DeleteDialogCancel({ render, children, className }, ref) {
    const { model, customMessages } = useMFAContext('DeleteDialogCancel');
    const { t } = useTranslator('user_mfa_management', customMessages);
    const label = t('actions.cancel_button_label');
    const { isDeleting, handleCancelDelete } = model;

    return useRender({
      render,
      ref,
      state: { pending: false, disabled: isDeleting },
      props: {
        ...getButtonContract({ onClick: handleCancelDelete, disabled: isDeleting, pending: false }),
        className,
      },
      defaultRender: (props) => (
        <Button
          variant="outline"
          size="default"
          {...props}
          className={cn('text-sm', props.className)}
          aria-label={label}
        >
          {children ?? label}
        </Button>
      ),
    });
  },
);

/**
 * Removes the authenticator the dialog is about. Disabled and labelled as deleting while
 * the removal runs. Use `render` to replace the button while keeping the behaviour.
 *
 * @param props - {@link UserMFAManagementActionProps}
 * @returns Confirm action element.
 */
export const DeleteDialogConfirm = React.forwardRef<
  HTMLButtonElement,
  UserMFAManagementActionProps
>(function DeleteDialogConfirm({ render, children, className }, ref) {
  const { model, customMessages } = useMFAContext('DeleteDialogConfirm');
  const { t } = useTranslator('user_mfa_management', customMessages);
  const label = t('actions.confirm_button_label');
  const pending = model.isDeleting;

  return useRender({
    render,
    ref,
    state: { pending, disabled: pending },
    props: {
      ...getButtonContract({
        onClick: () => void model.handleConfirmDelete(),
        disabled: false,
        pending,
      }),
      className,
    },
    defaultRender: (props) => (
      <Button
        variant="destructive"
        size="default"
        {...props}
        className={cn('text-sm', props.className)}
        aria-label={label}
      >
        {children ?? (pending ? t('actions.deleting_button_text') : label)}
      </Button>
    ),
  });
});
