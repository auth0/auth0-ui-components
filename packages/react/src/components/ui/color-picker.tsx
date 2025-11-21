'use client';

import { hexToHsva, hsvaToHex, hsvaToRgba } from '@uiw/color-convert';
import { Alpha, Hue, Saturation } from '@uiw/react-color';
import { PipetteIcon } from 'lucide-react';
import React, {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type HTMLAttributes,
} from 'react';

import { cn } from '../../lib/theme-utils';

import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { TextField } from './text-field';

interface HsvaColor {
  h: number;
  s: number;
  v: number;
  a: number;
}

interface ColorPickerContextValue {
  hsva: HsvaColor;
  mode: string;
  setMode: (mode: string) => void;
  setHsva: (hsva: HsvaColor) => void;
  onChange?: (value: string) => void;
}

const ColorPickerContext = createContext<ColorPickerContextValue | undefined>(undefined);

export const useColorPicker = (): ColorPickerContextValue => {
  const context = useContext(ColorPickerContext);
  if (!context) {
    throw new Error('useColorPicker must be used within a ColorPickerProvider');
  }
  return context;
};

export type ColorPickerProps = {
  value?: HsvaColor;
  defaultValue?: HsvaColor;
  onChange?: (hex: string) => void;
  onChangeHsva?: (hsva: HsvaColor) => void;
} & Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'>;

export const ColorPicker = ({
  value,
  defaultValue = { h: 0, s: 0, v: 0, a: 1 },
  onChange,
  onChangeHsva,
  className,
  ...props
}: ColorPickerProps) => {
  const [mode, setMode] = useState('hex');
  const [hsva, setHsva] = useState<HsvaColor>(() => {
    try {
      if (value && typeof value === 'object') {
        return value;
      } else if (defaultValue && typeof defaultValue === 'object') {
        return defaultValue;
      }
      return { h: 0, s: 0, v: 0, a: 1 };
    } catch {
      return { h: 0, s: 0, v: 0, a: 1 };
    }
  });

  useEffect(() => {
    if (value !== undefined) {
      try {
        let newHsva: HsvaColor;
        if (value && typeof value === 'object') {
          newHsva = value;
        } else {
          return;
        }

        if (JSON.stringify(newHsva) !== JSON.stringify(hsva)) {
          setHsva(newHsva);
        }
      } catch (error) {
        // Intentionally ignore parse errors while avoiding an empty catch block
        void error;
      }
    }
  }, [value, hsva]);

  const handleHsvaChange = useCallback(
    (next: HsvaColor) => {
      setHsva(next);
      onChangeHsva?.(next);
      onChange?.(hsvaToHex(next));
    },
    [onChangeHsva, onChange],
  );

  const contextValue = useMemo(
    () => ({
      hsva,
      setHsva: handleHsvaChange,
      onChange,
      onChangeHsva,
      mode,
      setMode,
    }),
    [hsva, handleHsvaChange, onChange, onChangeHsva, mode, setMode],
  );

  return (
    <ColorPickerContext.Provider value={contextValue}>
      <div className={cn('flex size-full flex-col gap-4', className)} {...props} />
    </ColorPickerContext.Provider>
  );
};

export type ColorPickerSelectionProps = HTMLAttributes<HTMLDivElement>;

export const ColorPickerSelection = memo(({ className, ...props }: ColorPickerSelectionProps) => {
  const { hsva, setHsva } = useColorPicker();

  const handleSaturationChange = useCallback(
    (newColor: HsvaColor) => {
      const preservedHue = newColor.s < 1 || newColor.v < 1 ? hsva.h : newColor.h;
      setHsva({ ...hsva, s: newColor.s, v: newColor.v, h: preservedHue });
    },
    [setHsva, hsva],
  );

  return (
    <div className={cn('relative size-full', className)} {...props}>
      <Saturation
        hsva={hsva}
        pointer={({ prefixCls, left, top, color }) => (
          <div
            className={cn(
              'absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white',
              prefixCls,
            )}
            style={{ left, top, backgroundColor: color }}
          />
        )}
        onChange={(newColor) => handleSaturationChange(newColor)}
        radius={6}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
});
ColorPickerSelection.displayName = 'ColorPickerSelection';

export type ColorPickerHueProps = HTMLAttributes<HTMLDivElement>;

export const ColorPickerHue = ({ className, ...props }: ColorPickerHueProps) => {
  const { hsva, setHsva } = useColorPicker();

  const handleHueChange = useCallback(
    (newHue: { h: number }) => {
      setHsva({ ...hsva, ...{ h: newHue.h } });
    },
    [setHsva, hsva],
  );

  return (
    <div className={cn('relative flex h-4 w-full', className)} {...props}>
      <Hue
        hue={hsva.h}
        pointer={({ prefixCls, left, top, color }) => (
          <div
            className={cn(
              'bg-background shadow-bevel-xs border-border border-px absolute h-6 w-1.5 -translate-x-1/2 -translate-y-1 rounded-full',
              prefixCls,
            )}
            style={{ left, top, backgroundColor: color }}
          />
        )}
        onChange={(newHue) => handleHueChange(newHue)}
        radius={6}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};
ColorPickerHue.displayName = 'ColorPickerHue';

export type ColorPickerAlphaProps = HTMLAttributes<HTMLDivElement>;

export const ColorPickerAlpha = ({ className, ...props }: ColorPickerAlphaProps) => {
  const { hsva, setHsva } = useColorPicker();

  const handleAlphaChange = useCallback(
    (newAlpha: { a: number }) => {
      setHsva({ ...hsva, ...{ a: newAlpha.a } });
    },
    [setHsva, hsva],
  );

  return (
    <div className={cn('relative flex h-4 w-full', className)} {...props}>
      <Alpha
        hsva={hsva}
        pointer={({ prefixCls, left, top, color }) => (
          <div
            className={cn(
              'bg-background shadow-bevel-xs border-border border-px absolute h-6 w-1.5 -translate-x-1/2 -translate-y-1 rounded-full',
              prefixCls,
            )}
            style={{ left, top, backgroundColor: color }}
          />
        )}
        radius={6}
        onChange={handleAlphaChange}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};
ColorPickerAlpha.displayName = 'ColorPickerAlpha';

export type ColorPickerEyeDropperProps = ComponentProps<typeof Button>;

export const ColorPickerEyeDropper = ({ className, ...props }: ColorPickerEyeDropperProps) => {
  const { setHsva } = useColorPicker();

  type EyeDropperConstructorType = new () => {
    open: () => Promise<{ sRGBHex: string }>;
  };

  const handleEyeDropper = async () => {
    try {
      const EyeDropperConstructor = (
        window as unknown as { EyeDropper?: EyeDropperConstructorType }
      ).EyeDropper;
      if (!EyeDropperConstructor) {
        console.warn('EyeDropper API is not supported in this browser');
        return;
      }

      const eyeDropper = new EyeDropperConstructor();
      const result = await eyeDropper.open();
      if (result && typeof result.sRGBHex === 'string') {
        const newHsva = hexToHsva(result.sRGBHex);
        setHsva(newHsva);
      }
    } catch (error) {
      console.error('EyeDropper failed:', error);
    }
  };

  return (
    <Button
      className={cn('text-muted-foreground shrink-0 rounded-lg shadow-none', className)}
      onClick={handleEyeDropper}
      type="button"
      size="icon"
      variant="ghost"
      {...props}
    >
      <PipetteIcon size={20} />
    </Button>
  );
};
ColorPickerEyeDropper.displayName = 'ColorPickerEyeDropper';

export type ColorPickerOutputProps = ComponentProps<typeof SelectTrigger>;

const formats = ['hex', 'rgb', 'hsl'];
export const ColorPickerOutput = ({ ...props }: ColorPickerOutputProps) => {
  const { mode, setMode } = useColorPicker();

  return (
    <Select onValueChange={setMode} value={mode}>
      <SelectTrigger className="h-8 w-20 shrink-0 rounded-lg text-xs" {...props}>
        <SelectValue placeholder={mode.toUpperCase()} />
      </SelectTrigger>
      <SelectContent>
        {formats.map((format) => (
          <SelectItem className="text-xs" key={format} value={format}>
            {format.toUpperCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
ColorPickerOutput.displayName = 'ColorPickerOutput';

type PercentageInputProps = ComponentProps<typeof TextField>;

const PercentageInput = ({ className, ...props }: PercentageInputProps) => {
  return (
    <div className="relative">
      <TextField readOnly type="text" {...props} className={cn('h-8 w-20 rounded-lg', className)} />
      <span className="text-muted-foreground absolute top-1/2 right-2 -translate-y-1/2 text-xs">
        %
      </span>
    </div>
  );
};

export type ColorPickerFormatProps = HTMLAttributes<HTMLDivElement> & {
  alpha?: boolean;
};
export const ColorPickerFormat = ({ className, alpha, ...props }: ColorPickerFormatProps) => {
  const { hsva, mode } = useColorPicker();

  if (mode === 'hex') {
    const hex = hsvaToHex(hsva);
    const alphaValue = Math.round(hsva.a * 100);
    return (
      <div className={cn('relative flex w-full shrink items-center gap-1', className)} {...props}>
        <TextField
          readOnly
          type="text"
          value={hex}
          className={cn('h-8 flex-1 rounded-lg', className)}
        />
        {alpha && <PercentageInput value={alphaValue} />}
      </div>
    );
  }

  if (mode === 'rgb') {
    const rgba = hsvaToRgba(hsva);
    const alphaValue = Math.round(hsva.a * 100);
    return (
      <div className={cn('flex shrink items-center gap-1', className)} {...props}>
        {[rgba.r, rgba.g, rgba.b].map((value, index) => (
          <TextField
            className={cn('h-8 flex-1 rounded-lg', className)}
            key={index}
            readOnly
            type="text"
            value={Math.round(value)}
          />
        ))}
        {alpha && <PercentageInput value={alphaValue} />}
      </div>
    );
  }

  if (mode === 'hsl') {
    const { h, s, v, a } = hsva;
    const l = (v * (100 - s)) / 100;
    const sPercent = s;
    const lPercent = l;
    const alphaValue = Math.round(a * 100);

    return (
      <div className={cn('flex shrink items-center gap-1', className)} {...props}>
        {[Math.round(h), Math.round(sPercent), Math.round(lPercent)].map((value, index) => (
          <TextField
            className={cn('h-8 flex-1 rounded-lg', className)}
            key={index}
            readOnly
            type="text"
            value={value}
          />
        ))}
        {alpha && <PercentageInput value={alphaValue} />}
      </div>
    );
  }

  return null;
};
ColorPickerFormat.displayName = 'ColorPickerFormat';

export type ColorPickerInputProps = {
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onChangeHsva?: (hsva: HsvaColor) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  variant?: 'default' | 'input';
  children?: React.ReactNode;
  showTextInput?: boolean;
  showColorPicker?: boolean;
  alpha?: boolean;
};

export const ColorPickerInput = ({
  name,
  value,
  defaultValue = '#000000',
  onChange,
  onChangeHsva,
  placeholder = 'Enter color value',
  className,
  disabled,
  variant = 'input',
  children,
  showTextInput = true,
  showColorPicker = true,
  alpha = false,
  ...props
}: ColorPickerInputProps) => {
  const [open, setOpen] = useState(false);
  const [hsva, setHsva] = useState<HsvaColor>(() => {
    try {
      if (typeof value === 'string') {
        return hexToHsva(value);
      } else if (value && typeof value === 'object') {
        return value;
      } else if (typeof defaultValue === 'string') {
        return hexToHsva(defaultValue);
      } else if (defaultValue && typeof defaultValue === 'object') {
        return defaultValue;
      }
      return { h: 0, s: 0, v: 0, a: 1 };
    } catch {
      return { h: 0, s: 0, v: 0, a: 1 };
    }
  });
  const [textValue, setTextValue] = useState(() => {
    try {
      if (typeof value === 'string') {
        return value;
      } else if (value && typeof value === 'object') {
        return hsvaToHex(value);
      } else if (typeof defaultValue === 'string') {
        return defaultValue;
      } else if (defaultValue && typeof defaultValue === 'object') {
        return hsvaToHex(defaultValue);
      }
      return '#000000';
    } catch {
      return '#000000';
    }
  });
  const [isValidColor, setIsValidColor] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (value !== undefined) {
      try {
        let newHsva: HsvaColor;
        if (typeof value === 'string') {
          newHsva = hexToHsva(value);
        } else if (value && typeof value === 'object') {
          newHsva = value;
        } else {
          return;
        }
        setHsva(newHsva);
        setTextValue(hsvaToHex(newHsva));
      } catch (error) {
        // Intentionally ignore parse errors while avoiding an empty catch block
        void error;
      }
    }
  }, [value]);

  const currentValue = hsvaToHex(hsva);

  const validateColor = (colorValue: string): boolean => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(colorValue);
  };

  /**
   * Formats hex color input with smart expansion rules:
   * - Single letter: repeat 6 times (e.g., 'a' -> '#aaaaaa')
   * - Two letters: repeat 3 times (e.g., 'ab' -> '#ababab')
   * - Three letters: expand each to 2 (e.g., 'abc' -> '#aabbcc')
   * - Automatically adds # prefix and filters invalid characters
   */
  const formatHexInput = (input: string): string => {
    let cleanInput = input.replace(/^#/, '').toLowerCase();

    cleanInput = cleanInput.replace(/[^0-9a-f]/g, '');

    if (cleanInput.length === 0) return '';

    if (cleanInput.length === 1) {
      cleanInput = cleanInput.repeat(6);
    } else if (cleanInput.length === 2) {
      cleanInput = cleanInput.repeat(3);
    } else if (cleanInput.length === 3) {
      cleanInput = cleanInput
        .split('')
        .map((char) => char + char)
        .join('');
    } else if (cleanInput.length > 6) {
      cleanInput = cleanInput.substring(0, 6);
    }

    return `#${cleanInput}`;
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;

    setTextValue(rawValue);
    setIsValidColor(true);
  };

  const handleTextKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      const formattedValue = formatHexInput(textValue);
      setTextValue(formattedValue);

      const isValid = validateColor(formattedValue);
      setIsValidColor(isValid);

      if (isValid) {
        try {
          const newHsva = hexToHsva(formattedValue);
          const preservedHsva = {
            ...newHsva,
            h: newHsva.s < 1 || newHsva.v < 1 ? hsva.h : newHsva.h,
          };
          setHsva(preservedHsva);
          onChangeHsva?.(preservedHsva);
          if (onChange) {
            onChange(hsvaToHex(preservedHsva));
          }
        } catch {
          // Invalid color, keep current
        }
      }
    }
  };

  const handleTextBlur = () => {
    const formattedValue = formatHexInput(textValue);
    setTextValue(formattedValue);

    const isValid = validateColor(formattedValue);
    setIsValidColor(isValid);

    if (isValid) {
      try {
        const newHsva = hexToHsva(formattedValue);

        const preservedHsva = {
          ...newHsva,
          h: newHsva.s < 1 || newHsva.v < 1 ? hsva.h : newHsva.h,
        };
        setHsva(preservedHsva);
        onChangeHsva?.(preservedHsva);
        if (onChange) {
          onChange(hsvaToHex(preservedHsva));
        }
      } catch (error) {
        // Intentionally ignore parse errors while avoiding an empty catch block
        void error;
      }
    } else if (textValue) {
      setTextValue(hsvaToHex(hsva));
      setIsValidColor(true);
    }
  };

  const handlePickerOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);

    if (!isOpen) {
      setTextValue(hsvaToHex(hsva));
    }
  };

  if (variant === 'default') {
    return (
      <ColorPicker
        value={hsva}
        onChangeHsva={(next) => {
          setHsva(next);
          onChangeHsva?.(next);
          onChange?.(hsvaToHex(next));
        }}
        className={className}
        {...props}
      >
        {children}
      </ColorPicker>
    );
  }

  return (
    <div className={cn(className)} {...props}>
      {showTextInput && (
        <div className={cn('relative', className)}>
          <TextField
            ref={inputRef}
            name={name}
            value={textValue}
            onChange={handleTextChange}
            onKeyDown={handleTextKeyDown}
            onBlur={handleTextBlur}
            placeholder={placeholder}
            disabled={disabled}
            error={!isValidColor && textValue !== ''}
            startAdornment={
              showColorPicker ? (
                <div className="mx-1 flex h-6 w-6 items-center justify-center">
                  <button
                    ref={triggerRef}
                    type="button"
                    className="hover:ring-primary/20 border-primary/10 h-5 w-5 cursor-pointer items-center justify-center rounded-md border transition-all hover:ring-2"
                    style={{ backgroundColor: isValidColor ? currentValue : '#ccc' }}
                    onClick={() => setOpen(!open)}
                    disabled={disabled}
                  />
                </div>
              ) : (
                <div
                  className="h-6 w-6 rounded border"
                  style={{ backgroundColor: isValidColor ? currentValue : '#ccc' }}
                />
              )
            }
          />
        </div>
      )}
      {showColorPicker && (
        <Popover open={open} onOpenChange={handlePickerOpenChange}>
          <PopoverTrigger ref={triggerRef} asChild>
            <div className="sr-only" />
          </PopoverTrigger>
          <PopoverContent
            className="w-full max-w-72 p-0"
            align="start"
            side="bottom"
            sideOffset={0}
          >
            <div className="p-4">
              <ColorPicker
                value={hsva}
                onChangeHsva={(next) => {
                  setHsva(next);
                  onChangeHsva?.(next);
                }}
                onChange={(hex) => {
                  onChange?.(hex);
                }}
              >
                {children || (
                  <div className="space-y-2">
                    <ColorPickerSelection className="h-64 w-full" />
                    <div className="flex items-center justify-center gap-4">
                      <div className="flex flex-1 flex-col gap-2">
                        <ColorPickerHue />
                        {alpha && <ColorPickerAlpha />}
                      </div>

                      <ColorPickerEyeDropper />
                    </div>
                    <div className="flex items-center gap-2">
                      <ColorPickerOutput />
                      <ColorPickerFormat alpha={alpha} />
                    </div>
                  </div>
                )}
              </ColorPicker>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
