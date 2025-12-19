import { Copy } from 'lucide-react';
import * as React from 'react';

import { useTranslator } from '../../hooks/use-translator';
import { cn } from '../../lib/theme-utils';

import { Button } from './button';
import { TextField, type TextFieldProps } from './text-field';
import { Tooltip, TooltipTrigger, TooltipContent } from './tooltip';

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
