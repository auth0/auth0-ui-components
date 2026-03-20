/** @internal */
import {
  normalizeFactorType,
  type EnrollmentFactor,
  type MfaAuthenticator,
  type MfaRequiredError,
} from '@auth0/universal-components-core';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardAction, CardHeader, CardTitle } from '@/components/ui/card';
import { List, ListItem } from '@/components/ui/list';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { useMfaRequirements } from '@/hooks/shared/use-mfa-requirements';
import { useTranslator } from '@/hooks/shared/use-translator';

interface AuthenticatorsListProps {
  error: MfaRequiredError;
  onSelectFactor: (factor: EnrollmentFactor) => void;
  onSelectAuthenticator: (authenticator: MfaAuthenticator) => void;
  onCancel: () => void;
}

/**
 * @param props - Component props.
 * @param props.error - The MFA required error.
 * @param props.onSelectFactor - Called when the user picks a factor to enroll.
 * @param props.onSelectAuthenticator - Called when the user picks an authenticator to challenge.
 * @param props.onCancel - Called when the user cancels.
 * @returns Authenticator list element, spinner during load, or null.
 * @internal
 */
export function AuthenticatorsList({
  error,
  onSelectFactor,
  onSelectAuthenticator,
  onCancel,
}: AuthenticatorsListProps) {
  const { t } = useTranslator('gate_keeper');
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  const { factors, authenticators, isEnrollMode, isLoading } = useMfaRequirements(error);

  const handleSelectFactor = (factor: EnrollmentFactor) => {
    setActiveItemId(factor.type);
    onSelectFactor(factor);
  };

  const handleSelectAuthenticator = (auth: MfaAuthenticator) => {
    setActiveItemId(auth.id);
    onSelectAuthenticator(auth);
  };

  const items = isEnrollMode
    ? factors.map((factor) => ({
        key: factor.type,
        label: t(`mfa.authenticator_type.${normalizeFactorType(factor.type)}`),
        buttonLabel: t('mfa.enroll_button'),
        onSelect: () => handleSelectFactor(factor),
      }))
    : authenticators.map((auth) => ({
        key: auth.id,
        label: auth.type
          ? t(`mfa.authenticator_type.${normalizeFactorType(auth.type)}`)
          : auth.name,
        buttonLabel: t('mfa.verify_button'),
        onSelect: () => handleSelectAuthenticator(auth),
      }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">{t('mfa.no_authenticators')}</p>
        <Separator />
        <div className="flex justify-end">
          <Button variant="outline" onClick={onCancel} aria-label={t('mfa.cancel')}>
            {t('mfa.cancel')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <List className="flex flex-col gap-3">
        {items.map((item) => (
          <ListItem key={item.key} aria-label={item.label}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold text-left">{item.label}</CardTitle>
                <CardAction>
                  <Button
                    variant="primary"
                    onClick={item.onSelect}
                    disabled={activeItemId !== null}
                    aria-label={`${item.buttonLabel} ${item.label}`}
                  >
                    {activeItemId === item.key ? (
                      <Spinner size="sm" colorScheme="foreground" />
                    ) : (
                      item.buttonLabel
                    )}
                  </Button>
                </CardAction>
              </CardHeader>
            </Card>
          </ListItem>
        ))}
      </List>
      <Separator />
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={activeItemId !== null}
          aria-label={t('mfa.cancel')}
        >
          {t('mfa.cancel')}
        </Button>
      </div>
    </div>
  );
}
