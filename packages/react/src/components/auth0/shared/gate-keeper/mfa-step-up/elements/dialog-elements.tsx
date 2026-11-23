/** @internal */
import type { ComponentProps } from 'react';

import { Button } from '@/components/ui/button';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link } from '@/components/ui/link';
import { cn } from '@/lib/utils';
import { useGateKeeperContext } from '@/providers/gate-keeper-context';

/**
 * The dialog's header. Takes the integrator's `MfaStepUp-header` class.
 *
 * @param props - Header props.
 * @param props.className - Classes to add.
 * @returns Header element.
 * @internal
 */
export function MfaDialogHeader({ className, ...props }: ComponentProps<typeof DialogHeader>) {
  const classes = useGateKeeperContext().mfaStepUp?.classes;
  return <DialogHeader className={cn(className, classes?.['MfaStepUp-header'])} {...props} />;
}

/**
 * The dialog's title. Takes the integrator's `MfaStepUp-title` class.
 *
 * @param props - Title props.
 * @param props.className - Classes to add.
 * @returns Title element.
 * @internal
 */
export function MfaDialogTitle({ className, ...props }: ComponentProps<typeof DialogTitle>) {
  const classes = useGateKeeperContext().mfaStepUp?.classes;
  return <DialogTitle className={cn(className, classes?.['MfaStepUp-title'])} {...props} />;
}

/**
 * The dialog's description. Takes the integrator's `MfaStepUp-description` class.
 *
 * @param props - Description props.
 * @param props.className - Classes to add.
 * @returns Description element.
 * @internal
 */
export function MfaDialogDescription({
  className,
  ...props
}: ComponentProps<typeof DialogDescription>) {
  const classes = useGateKeeperContext().mfaStepUp?.classes;
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
 * @returns Button element.
 * @internal
 */
export function MfaButton({ variant, className, ...props }: ComponentProps<typeof Button>) {
  const classes = useGateKeeperContext().mfaStepUp?.classes;
  const own = variant === 'primary' ? 'MfaStepUp-primaryButton' : 'MfaStepUp-secondaryButton';
  return <Button variant={variant} className={cn(className, classes?.[own])} {...props} />;
}

/**
 * A link of the dialog. Takes the integrator's `MfaStepUp-link` class.
 *
 * @param props - Link props.
 * @param props.className - Classes to add.
 * @returns Link element.
 * @internal
 */
export function MfaLink({ className, ...props }: ComponentProps<typeof Link>) {
  const classes = useGateKeeperContext().mfaStepUp?.classes;
  return <Link className={cn(className, classes?.['MfaStepUp-link'])} {...props} />;
}
