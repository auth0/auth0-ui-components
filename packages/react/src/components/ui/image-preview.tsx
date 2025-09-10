import { Link, X } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { cn } from '@/lib/theme-utils';

export interface ImagePreviewProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  error?: string;
  disableFileUpload?: boolean;
  placeholder?: string;
  helperText?: string;
}

export const ImagePreview = React.forwardRef<HTMLDivElement, ImagePreviewProps>(
  (
    {
      value,
      onChange,
      disabled = false,
      className,
      error,
      disableFileUpload = false,
      placeholder,
      helperText,
      ...props
    },
    ref,
  ) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        onChange?.(result);
      };
      reader.readAsDataURL(file);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
    };

    const handleRemove = () => {
      onChange?.('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    return (
      <div ref={ref} className={cn('w-full', className)}>
        <div className="border border-border rounded-lg overflow-hidden">
          <div
            className={cn(
              'relative border-b border-border p-6 flex items-center justify-center bg-muted/30 min-h-[120px]',
              disabled && 'opacity-50 cursor-not-allowed',
            )}
          >
            {value ? (
              <div className="relative">
                <img src={value} alt="Preview" className="h-20 w-20 object-cover rounded-lg" />
                {!disabled && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                    onClick={handleRemove}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ) : (
              <div
                className="h-20 w-20 bg-muted rounded-lg border-2 border-dashed border-border cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => !disabled && !disableFileUpload && fileInputRef.current?.click()}
              />
            )}

            {!disableFileUpload && (
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled}
              />
            )}
          </div>

          <div className="p-4">
            <TextField
              value={value}
              placeholder={placeholder}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              error={!!error}
              helperText={helperText}
              startAdornment={
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled || disableFileUpload}
                  className={cn('h-8 w-8', disableFileUpload && 'opacity-50')}
                >
                  <Link className="h-4 w-4" />
                </Button>
              }
              {...props}
            />
          </div>
        </div>
      </div>
    );
  },
);

ImagePreview.displayName = 'ImagePreview';
