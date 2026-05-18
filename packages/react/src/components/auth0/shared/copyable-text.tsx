/**
 * Inline text with copy-to-clipboard button.
 * @module copyable-text
 * @internal
 */

import { Copy } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useTranslator } from '@/hooks/shared/use-translator';
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
  ) => {
    const { t } = useTranslator('common');
    const [tooltipText, setTooltipText] = React.useState(t('copy'));
    const [tooltipOpen, setTooltipOpen] = React.useState(false);

    const resetTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    React.useEffect(() => {
      return () => {
        if (resetTimeoutRef.current) {
          clearTimeout(resetTimeoutRef.current);
        }
      };
    }, []);

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(value);
        setTooltipText(t('copied'));
        setTooltipOpen(true);
        if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
        resetTimeoutRef.current = setTimeout(() => {
          setTooltipText(t('copy'));
          setTooltipOpen(false);
        }, 1000);
        onCopy?.();
      } catch {
        setTooltipText(t('copy_failed'));
        setTooltipOpen(true);
        if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
        resetTimeoutRef.current = setTimeout(() => {
          setTooltipText(t('copy'));
          setTooltipOpen(false);
        }, 1000);
      }
    };

    return (
      <span ref={ref} className={cn('flex items-center gap-1', className)}>
        <span className="text-sm text-primary">{value}</span>
        <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn('h-6 w-6 shrink-0', buttonClassName)}
              onClick={handleCopy}
              aria-label={t('copy')}
            >
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side={tooltipSide}
            align={tooltipAlign}
            sideOffset={5}
            className="z-[1000]"
          >
            {tooltipText}
          </TooltipContent>
        </Tooltip>
      </span>
    );
  },
);

CopyableText.displayName = 'CopyableText';

export { CopyableText };
