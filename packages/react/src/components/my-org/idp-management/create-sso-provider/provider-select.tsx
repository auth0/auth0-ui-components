import type { IdpStrategy } from '@auth0-web-ui-components/core';
import React from 'react';

import GoogleLogo from '@/assets/icons/google-logo';
import { MicrosoftLogo } from '@/assets/icons/microsoft-logo';
import { OktaLogo } from '@/assets/icons/okta-logo';
import { Button } from '@/components/ui/button';
import { Section } from '@/components/ui/section';
import { useTranslator } from '@/hooks';
import type { ProviderSelectProps } from '@/types';

const STRATEGY_CONFIG: Record<
  IdpStrategy,
  { name: string; icon: React.FC<{ className?: string }> }
> = {
  okta: {
    name: 'Okta',
    icon: OktaLogo,
  },
  'google-apps': {
    name: 'Google Workspace',
    icon: GoogleLogo,
  },
  waad: {
    name: 'Entra ID',
    icon: GoogleLogo,
  },
  adfs: {
    name: 'ADFS',
    icon: MicrosoftLogo,
  },
  'ping-federate': {
    name: 'PingFederate',
    icon: OktaLogo,
  },
  samlp: {
    name: 'Custom SAML',
    icon: OktaLogo,
  },
  oidc: {
    name: 'Custom OIDC',
    icon: OktaLogo,
  },
};

function ProviderSelect({
  strategyList,
  onClickStrategy,
  customMessages = {},
  className,
}: ProviderSelectProps) {
  const { t } = useTranslator(
    'idp_management.create_sso_provider.select_sso_provider',
    customMessages,
  );

  return (
    <Section title={t('title')} description={t('description')} className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {strategyList.map((strategyType) => {
          const strategy = STRATEGY_CONFIG[strategyType as IdpStrategy];
          const IconComponent = strategy.icon;
          return (
            <Button
              key={strategyType}
              variant="outline"
              className="justify-start h-10 py-2.5 px-3"
              onClick={() => onClickStrategy(strategyType)}
            >
              <div className="flex items-center gap-3 w-full text-left">
                <IconComponent className="w-8 h-8 flex-shrink-0 text-primary" />
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{strategy.name}</span>
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </Section>
  );
}

export { ProviderSelect };
