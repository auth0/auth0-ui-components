import { ImageIcon } from 'lucide-react';
import * as React from 'react';

import { TextField } from './text-field';
import type { TextFieldProps } from './text-field';

import { cn } from '@/lib/utils';

export interface ImagePreviewFieldProps extends Omit<TextFieldProps, 'onChange'> {
  previewClassName?: string;
  placeholder?: string;
  previewPlaceholder?: string;
  previewIcon?: React.ReactNode;
  imgSizes?: string;
  imgWidth?: number;
  imgHeight?: number;
  onImageLoad?: (imageUrl: string) => void;
  onImageError?: (error: Error) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function ImagePreviewField({
  placeholder = 'Enter image URL',
  previewPlaceholder = 'Paste an image URL to see a preview',
  previewIcon = <ImageIcon size={24} />,
  previewClassName,
  imgSizes,
  imgWidth,
  imgHeight,
  onImageLoad,
  onImageError,
  onChange,
  value,
  error,
  ...textFieldProps
}: ImagePreviewFieldProps) {
  const [imageUrl, setImageUrl] = React.useState<string>(value?.toString() || '');
  const [imageError, setImageError] = React.useState<boolean>(false);
  const [isValidUrl, setIsValidUrl] = React.useState<boolean>(true);

  const isValidImageUrl = (url: string): boolean => {
    if (!url.trim()) return true;

    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const isValid = isValidImageUrl(newValue);

    setIsValidUrl(isValid);
    setImageUrl(newValue);
    setImageError(false);

    onChange?.(e);
  };

  const handleImageLoad = () => {
    setImageError(false);
    onImageLoad?.(imageUrl);
  };

  const handleImageError = () => {
    setImageError(true);
    onImageError?.(new Error('Failed to load image'));
  };

  const hasError = error || (!isValidUrl && imageUrl.trim() !== '') || imageError;
  const showPreview = imageUrl.trim() !== '' && isValidUrl && !imageError;

  return (
    <div className="space-y-2">
      <div
        className={cn(
          'border-border/50 bg-muted/50 flex h-24 w-full items-center justify-center overflow-hidden rounded-lg border',
          showPreview && 'bg-background p-0',
          previewClassName,
        )}
      >
        {showPreview ? (
          <img
            loading="lazy"
            srcSet={imageUrl}
            src={imageUrl}
            sizes={imgSizes}
            decoding="async"
            alt="Preview"
            className="animate-in fade-in-0 max-h-24 max-w-24 object-contain blur-none transition-all duration-200 ease-in-out"
            height={imgHeight}
            width={imgWidth}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <div className="text-muted-foreground flex h-full w-full flex-col items-center justify-center gap-2 text-sm">
            {previewIcon}
            {imageUrl.trim() !== '' && !isValidUrl ? 'Invalid URL' : previewPlaceholder}
          </div>
        )}
      </div>

      <TextField
        {...textFieldProps}
        value={value}
        onChange={handleChange}
        error={hasError}
        placeholder={placeholder}
      />
    </div>
  );
}

export { ImagePreviewField };
