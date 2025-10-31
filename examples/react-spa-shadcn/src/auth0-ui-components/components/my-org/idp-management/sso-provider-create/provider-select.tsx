import type { IdpStrategy } from '@auth0/web-ui-components-core';
import { STRATEGY_DISPLAY_NAMES, STRATEGIES } from '@auth0/web-ui-components-core';
import React from 'react';

import EntraIdLogo from '../../../../assets/icons/entraid-logo';
import GoogleLogo from '../../../../assets/icons/google-logo';
import MicrosoftLogo from '../../../../assets/icons/microsoft-logo';
import OidcLogo from '../../../../assets/icons/oidc-logo';
import OktaLogo from '../../../../assets/icons/okta-logo';
import PingIdLogo from '../../../../assets/icons/pingid-logo';
import SamlpLogo from '../../../../assets/icons/sampl-logo';
import { Button } from '../../../../components/ui/button';
import { Section } from '../../../../components/ui/section';
import { useTranslator } from '../../../../hooks/use-translator';
import type { ProviderSelectProps } from '../../../../types/my-org/idp-management/sso-provider/sso-provider-create-types';

const STRATEGY_ICONS: Record<IdpStrategy, React.FC<{ className?: string }>> = {
  [STRATEGIES.OKTA]: OktaLogo,
  [STRATEGIES.GOOGLE_APPS]: GoogleLogo,
  [STRATEGIES.WAAD]: EntraIdLogo,
  [STRATEGIES.ADFS]: MicrosoftLogo,
  [STRATEGIES.PINGFEDERATE]: PingIdLogo,
  [STRATEGIES.SAMLP]: SamlpLogo,
  [STRATEGIES.OIDC]: OidcLogo,
};

function ProviderSelect({
  strategyList,
  onClickStrategy,
  customMessages = {},
  className,
}: ProviderSelectProps) {
  const { t } = useTranslator('idp_management.create_sso_provider.provider_select', customMessages);

  return (
    <Section title={t('title')} description={t('description')} className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {strategyList.map((strategyType) => {
          const IconComponent = STRATEGY_ICONS[strategyType as IdpStrategy];
          const displayName = STRATEGY_DISPLAY_NAMES[strategyType as IdpStrategy];
          return (
            <Button
              key={strategyType}
              variant="outline"
              className="justify-start h-10 py-2.5 px-3"
              onClick={() => onClickStrategy(strategyType)}
            >
              <div className="flex items-center gap-3 w-full text-left">
                <IconComponent className="w-4 h-4 flex-shrink-0 text-primary" />
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{displayName}</span>
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
