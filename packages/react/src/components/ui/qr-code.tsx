import QRCode from 'qrcode';
import * as React from 'react';

import { Spinner } from '@/components/ui/spinner';
import { useTheme } from '@/hooks';
import { cn } from '@/lib/theme-utils';

export interface QRCodeDisplayerProps {
  /**
   * The URI/data to encode in the QR code (required)
   */
  value: string;
  /**
   * Size of the QR code in pixels
   * @default 150
   */
  size?: number;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Alternative text for accessibility
   * @default "QR Code"
   */
  alt?: string;
  /**
   * Text to display while loading the QR code
   * @default "Loading QR code"
   */
  loadingMessage?: string;
  /**
   * Text to display in the error state
   * @default "Failed to load QR code"
   */
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
        const dataURL = await QRCode.toDataURL(value, {
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
