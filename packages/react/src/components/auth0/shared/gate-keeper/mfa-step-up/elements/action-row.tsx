/** @internal */
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';
import type { MfaStepUpClasses } from '@/types/mfa-step-up-types';

/**
 * The row of buttons at the bottom of an MFA screen. Right-aligned, unless the wizard says otherwise.
 *
 * @param props - Div props.
 * @param props.className - Classes to add.
 * @param props.classes - The integrator's class overrides.
 * @returns Action row element.
 * @internal
 */
export function ActionRow({
  className,
  classes,
  ...props
}: ComponentProps<'div'> & { classes?: MfaStepUpClasses }) {
  return (
    <div
      className={cn(
        'flex justify-end gap-3 group-data-[actions-align=left]/mfa:justify-start group-data-[actions-align=center]/mfa:justify-center',
        className,
        classes?.['MfaStepUp-actions'],
      )}
      {...props}
    />
  );
}
