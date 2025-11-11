import * as React from 'react';

import { useTheme } from '../../hooks/use-theme';
import { cn } from '../../lib/theme-utils';

import { Spinner } from './spinner';

export interface QRCodeDisplayerProps {
  value: string;
  size?: number;
  className?: string;
  alt?: string;
  loadingMessage?: string;
  errorMessage?: string;
}

export function QRCodeDisplayer({
  value,
  size = 150,
  className,
  alt = 'QR Code',
  loadingMessage = 'Loading QR code',
  errorMessage = 'Failed to load QR code',
}: QRCodeDisplayerProps) {
  const [qrUrl, setQrUrl] = React.useState<string | null>(null);
  const [hasError, setHasError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const { isDarkMode } = useTheme();

  const qrCodeColorScheme = React.useMemo(
    () => ({
      dark: isDarkMode ? '#FFFFFF' : '#000000',
      light: isDarkMode ? '#000000' : '#FFFFFF',
    }),
    [isDarkMode],
  );

  React.useEffect(() => {
    if (!value) {
      setQrUrl(null);
      setHasError(true);
      setIsLoading(false);
      return;
    }

    const generateQRCode = async () => {
      try {
        // Lazy load qrcode only in browser
        const { toDataURL } = await import('qrcode');
        const dataURL = await toDataURL(value, {
          width: size,
          margin: 1,
          color: qrCodeColorScheme,
        });
        setQrUrl(dataURL);
        setHasError(false);
      } catch (err) {
        setQrUrl(null);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    generateQRCode();
  }, [value, size, qrCodeColorScheme]);

  const wrapperProps = {
    className: cn(
      'flex items-center justify-center rounded p-2',
      'bg-gray-100 dark:bg-gray-800',
      hasError && 'text-gray-500 dark:text-gray-400 text-sm',
      className,
    ),
    style: { width: size, height: size },
  };

  if (isLoading) {
    return (
      <div {...wrapperProps} aria-label={loadingMessage}>
        <Spinner aria-label={loadingMessage} />
      </div>
    );
  }

  if (hasError || !qrUrl) {
    return (
      <div {...wrapperProps} role="alert" aria-live="assertive" aria-label={errorMessage}>
        <span>{errorMessage}</span>
      </div>
    );
  }

  return (
    <img
      src={qrUrl}
      alt={alt}
      width={size}
      height={size}
      className={cn('block rounded', className)}
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
