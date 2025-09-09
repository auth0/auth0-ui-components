import * as React from 'react';
import QRCode from 'qrcode';
import { useTheme } from '@/hooks';
import { cn } from '@/lib/theme-utils';
import { Spinner } from '@/components/ui/spinner';

export interface QRCodeDisplayerProps {
  /**
   * The URI/data to encode in the QR code (required)
   */
  barcodeUri: string;
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
   * Text to display while loading
   * @default "Loading QR code"
   */
  loadingText?: string;
  /**
   * Text to display when there's an error loading/generating the QR code
   * @default "Failed to load QR code"
   */
  errorLoadingText?: string;
}

export function QRCodeDisplayer({
  barcodeUri,
  size = 150,
  className,
  alt = 'QR Code',
  loadingText = 'Loading QR code',
  errorLoadingText = 'Failed to load QR code',
}: QRCodeDisplayerProps) {
  const [qrCodeDataURL, setQrCodeDataURL] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  const { isDarkMode } = useTheme();

  React.useEffect(() => {
    const generateQRCode = async () => {
      if (!barcodeUri) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setHasError(false);

      try {
        const dataURL = await QRCode.toDataURL(barcodeUri, {
          width: size,
          margin: 1,
          color: {
            // Adapt colors based on theme
            dark: isDarkMode ? '#FFFFFF' : '#000000',
            light: isDarkMode ? '#000000' : '#FFFFFF',
          },
        });
        setQrCodeDataURL(dataURL);
      } catch (error) {
        setHasError(true);
        setQrCodeDataURL('');
      } finally {
        setIsLoading(false);
      }
    };

    generateQRCode();
  }, [barcodeUri, size, isDarkMode]);

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded',
          className,
        )}
        style={{ width: size, height: size }}
        aria-label={loadingText}
      >
        <Spinner aria-label={loadingText} />
      </div>
    );
  }

  if (hasError || !qrCodeDataURL) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm rounded',
          className,
        )}
        style={{ width: size, height: size }}
        aria-label={errorLoadingText}
        role="alert"
        aria-live="assertive"
      >
        <span>{errorLoadingText}</span>
      </div>
    );
  }

  return (
    <img
      src={qrCodeDataURL}
      alt={alt}
      width={size}
      height={size}
      className={cn('block rounded', className)}
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
