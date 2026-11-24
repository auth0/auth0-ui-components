/**
 * Text field with copy-to-clipboard button.
 * @module copyable-text-field
 * @internal
 */

import * as React from 'react';

import { CopyButton } from '@/components/auth0/shared/copy-button';
import { TextField, type TextFieldProps } from '@/components/ui/text-field';
import { cn } from '@/lib/utils';

export interface CopyableTextFieldProps extends TextFieldProps {
  onCopy?: () => void;
  copyButtonClassName?: string;
  tooltipSide?: 'top' | 'bottom' | 'left' | 'right';
  tooltipAlign?: 'start' | 'center' | 'end';
  showCopyButton?: boolean;
}

const CopyableTextField = React.forwardRef<HTMLInputElement, CopyableTextFieldProps>(
  (
    {
      onCopy,
      copyButtonClassName,
      tooltipSide = 'top',
      tooltipAlign = 'end',
      readOnly = true,
      endAdornment,
      showCopyButton = true,
      ...props
    },
    ref,
  ) => {
    const copyButton = (
      <CopyButton
        value={props.value === undefined || props.value === null ? '' : String(props.value)}
        onCopy={onCopy}
        className={cn('h-8 w-8', copyButtonClassName)}
        tooltipSide={tooltipSide}
        tooltipAlign={tooltipAlign}
      />
    );

    return (
      <TextField
        ref={ref}
        readOnly={readOnly}
        {...props}
        endAdornment={
          showCopyButton ? (
            endAdornment ? (
              <div className="flex items-center gap-1">
                {endAdornment}
                {copyButton}
              </div>
            ) : (
              copyButton
            )
          ) : (
            endAdornment
          )
        }
      />
    );
  },
);

CopyableTextField.displayName = 'CopyableTextField';

export { CopyableTextField };
