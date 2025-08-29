import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/theme-utils';
import { TextField, textFieldVariants } from '@/components/ui/text-field';
import { Label } from '@/components/ui/label';

const regex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

const isValidHexColor = (color: string): boolean => regex.test(color);

const formatHexColor = (input: string): string => {
  const cleaned = input.replace(/^#+/, '');
  return cleaned ? `#${cleaned.toUpperCase()}` : '';
};

const colorPickerStyles = cva('h-7 w-7 rounded', {
  variants: {
    disabled: {
      true: 'opacity-50 cursor-not-allowed',
      false: 'cursor-pointer hover:scale-105 transition-transform',
    },
  },
  defaultVariants: {
    disabled: false,
  },
});

export interface ColorPickerProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'variant'> {
  error?: boolean;
  helperText?: string;
  value?: string;
  label?: string;
  size?: VariantProps<typeof textFieldVariants>['size'];
  variant?: VariantProps<typeof textFieldVariants>['variant'];
}

export const ColorPicker = React.forwardRef<HTMLInputElement, ColorPickerProps>(
  (
    {
      className,
      value = '',
      onChange,
      disabled = false,
      id,
      error,
      helperText,
      placeholder,
      label,
      size,
      variant,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatHexColor(e.target.value);
      onChange?.({
        ...e,
        target: { ...e.target, value: formatted },
      } as React.ChangeEvent<HTMLInputElement>);
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const hex = e.target.value.toUpperCase();
      onChange?.({
        ...e,
        target: { ...e.target, value: hex },
      } as React.ChangeEvent<HTMLInputElement>);
    };

    const handleColorKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.currentTarget.click();
      }
    };

    const isColorValid = isValidHexColor(value);
    const hasError = !!(error || (value && !isColorValid));

    const adornment = (
      <input
        type="color"
        id={inputId}
        value={isColorValid ? value.toUpperCase() : '#000000'}
        onChange={handleColorChange}
        onKeyDown={handleColorKeyDown}
        disabled={disabled}
        className={colorPickerStyles({ disabled })}
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-describedby={helperText}
        aria-invalid={hasError}
        title={value}
      />
    );

    const describedBy = [helperText, error].filter(Boolean).join(' ');

    return (
      <div className={cn('w-full', className)} role="group" aria-labelledby={`${inputId}-label`}>
        {label && (
          <Label
            id={`${inputId}-label`}
            htmlFor={inputId}
            className="mb-1 text-left"
            aria-required={props.required}
          >
            {label}
          </Label>
        )}
        <TextField
          ref={ref}
          id={inputId}
          type="text"
          inputMode="text"
          pattern={regex.source}
          value={value.toUpperCase()}
          onChange={handleTextChange}
          disabled={disabled}
          className="p-2"
          placeholder={placeholder}
          aria-invalid={hasError}
          aria-describedby={describedBy}
          aria-label={label}
          error={hasError}
          helperText={helperText}
          startAdornment={adornment}
          size={size}
          variant={variant}
          role="textbox"
          {...props}
        />
      </div>
    );
  },
);

ColorPicker.displayName = 'ColorPicker';
