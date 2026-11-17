/**
 * Blocking overlay shown while an SSO provider test is running.
 * @module sso-provider-test-polling-overlay
 * @internal
 */

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type { SsoProviderTestPollingOverlayProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-test-types';

const preventDismiss = (event: Event) => event.preventDefault();

/**
 * Non-dismissable overlay with a spinner and a Close and Retry action.
 * @param props - Component props.
 * @param props.open - Whether the overlay is shown.
 * @param props.onRetry - Called when Close and Retry is clicked.
 * @param props.blockedTestUrl - Test URL shown as a link when the browser blocked the test window.
 * @param props.customMessages - Custom translation messages to override defaults.
 * @param props.styling - Styling configuration.
 * @returns JSX element
 */
export function SsoProviderTestPollingOverlay({
  open,
  onRetry,
  blockedTestUrl,
  customMessages = {},
  styling,
}: SsoProviderTestPollingOverlayProps) {
  const { t } = useTranslator('idp_management.test_sso_provider.overlay', customMessages);

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={preventDismiss}
        onPointerDownOutside={preventDismiss}
        onInteractOutside={preventDismiss}
        className={cn(
          'flex flex-col items-center gap-6 text-center',
          styling?.classes?.['SsoProviderTest-overlay'],
        )}
      >
        <DialogTitle className="sr-only">{t('title')}</DialogTitle>
        <DialogDescription className="sr-only">{t('description')}</DialogDescription>

        <Spinner size="lg" />

        {blockedTestUrl && (
          <p className="text-muted-foreground text-paragraph">
            {t('popup_blocked_text')}{' '}
            <a
              href={blockedTestUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              {t('open_window_link_label')}
            </a>
          </p>
        )}

        <div className="flex flex-col items-center gap-3">
          <p className="text-subtitle font-semibold">{t('trouble_text')}</p>
          <Button type="button" variant="outline" onClick={onRetry}>
            {t('retry_button_label')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
