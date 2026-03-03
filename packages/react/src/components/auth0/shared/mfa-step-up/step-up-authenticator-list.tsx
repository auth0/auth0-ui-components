import type { StepUpAuthenticator } from '@auth0/universal-components-core';

import { Button } from '@/components/ui/button';
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { List, ListItem } from '@/components/ui/list';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { useTranslator } from '@/hooks/shared/use-translator';

interface StepUpAuthenticatorListProps {
  authenticators: StepUpAuthenticator[];
  onSelectAuthenticator: (auth: StepUpAuthenticator) => void;
  onCancel: () => void;
  isChallenging: boolean;
  challengingAuthenticatorId: string | null;
}

/**
 * Returns the translated display name for an authenticator.
 * @param auth - The authenticator.
 * @param t - Translation function.
 * @returns Display name string.
 */
function getAuthenticatorDisplayName(
  auth: StepUpAuthenticator,
  t: (key: string) => string,
): string {
  const key = auth.type ?? auth.authenticatorType;
  const typeKey = `error.mfa.authenticator_type.${key}`;
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
 * Displays enrolled authenticators as a list of cards for the step-up challenge flow.
 * Each card shows the authenticator name and registration date, with a Verify action on the right.
 *
 * @param props - Component props.
 * @param props.authenticators - List of enrolled authenticators.
 * @param props.onSelectAuthenticator - Callback when the user picks an authenticator to verify.
 * @param props.onCancel - Callback when the user cancels.
 * @param props.isChallenging - Whether a challenge is in progress.
 * @param props.challengingAuthenticatorId - ID of the authenticator currently being challenged.
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
      <List className="flex flex-col gap-3">
        {authenticators.map((auth) => {
          const displayName = getAuthenticatorDisplayName(auth, t);
          const formattedDate = formatDate(auth.createdAt);
          const isCurrentlyChallenging = challengingAuthenticatorId === auth.id;

          return (
            <ListItem key={auth.id} aria-label={displayName}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">{displayName}</CardTitle>
                  {formattedDate && (
                    <CardDescription className="text-xs">
                      {t('error.mfa.registered_on').replace('${date}', formattedDate)}
                    </CardDescription>
                  )}
                  <CardAction>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => onSelectAuthenticator(auth)}
                      disabled={isChallenging}
                      aria-label={`${t('error.mfa.verify_button')} ${displayName}`}
                    >
                      {isCurrentlyChallenging ? (
                        <Spinner size="sm" colorScheme="foreground" />
                      ) : (
                        t('error.mfa.verify_button')
                      )}
                    </Button>
                  </CardAction>
                </CardHeader>
              </Card>
            </ListItem>
          );
        })}
      </List>

      <Separator className="mt-6" />

      <div className="flex justify-center mt-4">
        <Button
          variant="ghost"
          size="sm"
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
