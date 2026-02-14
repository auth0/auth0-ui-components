import { Copy } from 'lucide-react';
import * as React from 'react';

import { TextField, type TextFieldProps } from '@/components/auth0/shared/text-field';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useTranslator } from '@/hooks/shared/use-translator';
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
    const { t } = useTranslator('common');
    const [tooltipText, setTooltipText] = React.useState(t('copy'));
    const [tooltipOpen, setTooltipOpen] = React.useState(false);

    const handleCopy = async () => {
      if (props.value) {
        await navigator.clipboard.writeText(String(props.value));
        setTooltipText(t('copied'));
        setTooltipOpen(true);
        setTimeout(() => {
          setTooltipText(t('copy'));
          setTooltipOpen(false);
        }, 1000);
        onCopy?.();
      }
    };

    const copyButton = (
      <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn('h-8 w-8', copyButtonClassName)}
            onClick={handleCopy}
            aria-label={t('copy')}
          >
            <Copy className="h-4 w-4" aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={tooltipSide} align={tooltipAlign} sideOffset={5} className="z-[1000]">
          {tooltipText}
        </TooltipContent>
      </Tooltip>
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
