/** @internal */
import type { ComponentProps } from 'react';

import { Button } from '@/components/ui/button';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { MfaStepUpClasses } from '@/types/mfa-step-up-types';

interface WithClasses {
  classes?: MfaStepUpClasses;
}

/**
 * The dialog's header. Takes the integrator's `MfaStepUp-header` class.
 *
 * @param props - Header props.
 * @param props.className - Classes to add.
 * @param props.classes - The integrator's class overrides.
 * @returns Header element.
 * @internal
 */
export function MfaDialogHeader({
  className,
  classes,
  ...props
}: ComponentProps<typeof DialogHeader> & WithClasses) {
  return <DialogHeader className={cn(className, classes?.['MfaStepUp-header'])} {...props} />;
}

/**
 * The dialog's title. Takes the integrator's `MfaStepUp-title` class.
 *
 * @param props - Title props.
 * @param props.className - Classes to add.
 * @param props.classes - The integrator's class overrides.
 * @returns Title element.
 * @internal
 */
export function MfaDialogTitle({
  className,
  classes,
  ...props
}: ComponentProps<typeof DialogTitle> & WithClasses) {
  return <DialogTitle className={cn(className, classes?.['MfaStepUp-title'])} {...props} />;
}

/**
 * The dialog's description. Takes the integrator's `MfaStepUp-description` class.
 *
 * @param props - Description props.
 * @param props.className - Classes to add.
 * @param props.classes - The integrator's class overrides.
 * @returns Description element.
 * @internal
 */
export function MfaDialogDescription({
  className,
  classes,
  ...props
}: ComponentProps<typeof DialogDescription> & WithClasses) {
  return (
    <DialogDescription className={cn(className, classes?.['MfaStepUp-description'])} {...props} />
  );
}

/**
 * A button of the dialog. Takes `MfaStepUp-primaryButton` or, for any other variant,
 * `MfaStepUp-secondaryButton`.
 *
 * @param props - Button props.
 * @param props.variant - Primary, or any secondary look.
 * @param props.className - Classes to add.
 * @param props.classes - The integrator's class overrides.
 * @returns Button element.
 * @internal
 */
export function MfaButton({
  variant,
  className,
  classes,
  ...props
}: ComponentProps<typeof Button> & WithClasses) {
  const own = variant === 'primary' ? 'MfaStepUp-primaryButton' : 'MfaStepUp-secondaryButton';
  return <Button variant={variant} className={cn(className, classes?.[own])} {...props} />;
}

/**
 * An action of the dialog that looks like a link, such as "resend". It is a button, so the keyboard
 * can reach it. Takes the integrator's `MfaStepUp-link` class.
 *
 * @param props - Button props.
 * @param props.className - Classes to add.
 * @param props.classes - The integrator's class overrides.
 * @returns Button element.
 * @internal
 */
export function MfaLink({
  className,
  classes,
  ...props
}: ComponentProps<typeof Button> & WithClasses) {
  return (
    <Button
      type="button"
      variant="link"
      className={cn('h-auto p-0', className, classes?.['MfaStepUp-link'])}
      {...props}
    />
  );
}
