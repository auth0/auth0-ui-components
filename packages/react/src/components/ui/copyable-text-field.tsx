import { Copy } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useTranslator } from '@/hooks';

interface CopyableTextFieldProps {
  value: string;
  label?: string;
  onCopy?: () => void;
}

export function CopyableTextField({ value, label, onCopy }: CopyableTextFieldProps) {
  const { t } = useTranslator('common');
  const [tooltipText, setTooltipText] = React.useState(t('copy'));
  const [tooltipOpen, setTooltipOpen] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setTooltipText(t('copied'));
    setTooltipOpen(true);
    setTimeout(() => {
      setTooltipText(t('copy'));
      setTooltipOpen(false);
    }, 1000);
    onCopy?.();
  };

  return (
    <TextField
      readOnly
      value={value}
      aria-label={label}
      className="text-sm"
      endAdornment={
        <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleCopy}
              aria-label={t('copy')}
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" align="end" sideOffset={5} className="z-[1000]">
            {tooltipText}
          </TooltipContent>
        </Tooltip>
      }
    />
  );
}
