import type { StepUpAuthenticator } from '@auth0/universal-components-core';

import { Button } from '@/components/ui/button';
import { List, ListItem } from '@/components/ui/list';
import { Spinner } from '@/components/ui/spinner';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';

interface StepUpAuthenticatorListProps {
  authenticators: StepUpAuthenticator[];
  onSelectAuthenticator: (auth: StepUpAuthenticator) => void;
  onCancel: () => void;
  isChallenging: boolean;
  challengingAuthenticatorId: string | null;
}

/**
 * Derives a human-readable display name for an authenticator.
 * Uses `name` field first; falls back to the type-based translation key.
 * @param auth - The authenticator to derive a display name for.
 * @param t - Translation function.
 * @returns Human-readable display name string.
 */
function getAuthenticatorDisplayName(
  auth: StepUpAuthenticator,
  t: (key: string) => string,
): string {
  if (auth.name) return auth.name;

  const typeKey = `error.mfa.authenticator_type.${auth.authenticatorType}`;
  return t(typeKey);
}

/**
 * Formats an ISO date string to a locale-friendly display date.
 * @param isoDate - ISO date string to format.
 * @returns Locale-friendly display date, or undefined if the input is absent or invalid.
 */
function formatDate(isoDate: string | undefined): string | undefined {
  if (!isoDate) return undefined;
  try {
    return new Date(isoDate).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return undefined;
  }
}

/**
 * StepUpAuthenticatorList
 *
 * Displays the list of enrolled authenticators for the step-up challenge flow.
 * The user picks one authenticator to verify with by clicking the "Verify" button.
 * @param root0 - Component props.
 * @returns Authenticator list element.
 */
export function StepUpAuthenticatorList({
  authenticators,
  onSelectAuthenticator,
  onCancel,
  isChallenging,
  challengingAuthenticatorId,
}: StepUpAuthenticatorListProps) {
  const { t } = useTranslator('common');

  return (
    <div className="w-full">
      <p
        className="text-sm text-muted-foreground text-left mb-4"
        id="step-up-authenticator-list-description"
      >
        {t('error.mfa.subtitle')}
      </p>

      <List
        className="flex flex-col gap-0 w-full"
        aria-labelledby="step-up-authenticator-list-description"
      >
        {authenticators.map((auth) => {
          const displayName = getAuthenticatorDisplayName(auth, t);
          const formattedDate = formatDate(auth.createdAt);
          const isCurrentlyChallenging = challengingAuthenticatorId === auth.id;

          return (
            <ListItem
              key={auth.id}
              className="flex items-center justify-between py-4 border-b last:border-b-0"
              aria-label={displayName}
            >
              <div className="flex flex-col gap-0.5">
                <span className={cn('text-sm font-medium text-card-foreground')}>
                  {displayName}
                </span>
                {formattedDate && (
                  <span className="text-xs text-muted-foreground">
                    {t('error.mfa.registered_on').replace('${date}', formattedDate)}
                  </span>
                )}
              </div>

              <Button
                type="button"
                size="default"
                variant="outline"
                className="text-sm shrink-0 ml-4"
                onClick={() => onSelectAuthenticator(auth)}
                disabled={isChallenging}
                aria-label={`${t('error.mfa.verify_button')} ${displayName}`}
              >
                {isCurrentlyChallenging ? <Spinner size="sm" /> : t('error.mfa.verify_button')}
              </Button>
            </ListItem>
          );
        })}
      </List>

      <div className="flex justify-end mt-6">
        <Button
          type="button"
          variant="outline"
          size="default"
          className="text-sm"
          onClick={onCancel}
          disabled={isChallenging}
          aria-label={t('error.mfa.cancel')}
        >
          {t('error.mfa.cancel')}
        </Button>
      </div>
    </div>
  );
}
