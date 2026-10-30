/**
 * Inline text with copy-to-clipboard button.
 * @module copyable-text
 * @internal
 */

import * as React from 'react';

import { CopyButton } from '@/components/auth0/shared/copy-button';
import { cn } from '@/lib/utils';

export interface CopyableTextProps {
  value: string;
  className?: string;
  buttonClassName?: string;
  tooltipSide?: 'top' | 'bottom' | 'left' | 'right';
  tooltipAlign?: 'start' | 'center' | 'end';
  onCopy?: () => void;
}

const CopyableText = React.forwardRef<HTMLSpanElement, CopyableTextProps>(
  (
    { value, className, buttonClassName, tooltipSide = 'top', tooltipAlign = 'end', onCopy },
    ref,
  ) => (
    <span ref={ref} className={cn('flex items-center gap-1', className)}>
      <span className="text-sm text-primary">{value}</span>
      <CopyButton
        value={value}
        onCopy={onCopy}
        className={cn('h-6 w-6 shrink-0', buttonClassName)}
        iconClassName="h-3.5 w-3.5"
        tooltipSide={tooltipSide}
        tooltipAlign={tooltipAlign}
      />
    </span>
  ),
);

CopyableText.displayName = 'CopyableText';

export { CopyableText };
