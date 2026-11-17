/**
 * Single-line text with a tooltip that shows the full text only when it is truncated.
 * @module truncated-text
 * @internal
 */

import * as React from 'react';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface TruncatedTextProps {
  text: string;
  className?: string;
}

/**
 * Truncates the text to one line and shows it in full in a tooltip when it overflows.
 * @param props - Component props.
 * @param props.text - Text to show
 * @param props.className - Optional CSS class names for the text
 * @returns JSX element
 * @internal
 */
export function TruncatedText({ text, className }: TruncatedTextProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [open, setOpen] = React.useState(false);

  // Stay controlled and only allow opening while the text overflows.
  const handleOpenChange = React.useCallback((nextOpen: boolean) => {
    const element = ref.current;
    setOpen(nextOpen && !!element && element.scrollWidth > element.clientWidth);
  }, []);

  return (
    <Tooltip open={open} onOpenChange={handleOpenChange}>
      <TooltipTrigger asChild>
        <span ref={ref} className={cn('truncate', className)}>
          {text}
        </span>
      </TooltipTrigger>
      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
  );
}
