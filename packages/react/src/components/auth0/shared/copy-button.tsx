/**
 * Icon button that copies a value and confirms it in a tooltip.
 * @module copy-button
 * @internal
 */

import { Copy } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useCopyToClipboard } from '@/hooks/shared/use-copy-to-clipboard';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';

export interface CopyButtonProps {
  value: string | (() => string);
  onCopy?: () => void;
  className?: string;
  iconClassName?: string;
  tooltipSide?: 'top' | 'bottom' | 'left' | 'right';
  tooltipAlign?: 'start' | 'center' | 'end';
}

/**
 * Copy-to-clipboard icon button with "Copied!" / "Failed to copy" tooltip feedback.
 * @param props - Component props.
 * @param props.value - Value to copy, or a getter evaluated on click.
 * @param props.onCopy - Called after a successful copy.
 * @param props.className - Button class names.
 * @param props.iconClassName - Icon class names.
 * @param props.tooltipSide - Tooltip side.
 * @param props.tooltipAlign - Tooltip alignment.
 * @returns JSX element
 */
function CopyButton({
  value,
  onCopy,
  className,
  iconClassName,
  tooltipSide = 'top',
  tooltipAlign = 'end',
}: CopyButtonProps) {
  const { t } = useTranslator('common');
  const { status, copy } = useCopyToClipboard();
  const [tooltipOpen, setTooltipOpen] = React.useState(false);

  React.useEffect(() => {
    if (status === 'idle') setTooltipOpen(false);
  }, [status]);

  const handleCopy = async () => {
    const text = typeof value === 'function' ? value() : value;
    if (!text) return;
    const copied = await copy(text);
    setTooltipOpen(true);
    if (copied) onCopy?.();
  };

  const tooltipText =
    status === 'copied' ? t('copied') : status === 'error' ? t('copy_failed') : t('copy');

  return (
    <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={className}
          onClick={handleCopy}
          aria-label={t('copy')}
        >
          <Copy className={cn('h-4 w-4', iconClassName)} aria-hidden="true" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side={tooltipSide} align={tooltipAlign} sideOffset={5}>
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  );
}

export { CopyButton };
