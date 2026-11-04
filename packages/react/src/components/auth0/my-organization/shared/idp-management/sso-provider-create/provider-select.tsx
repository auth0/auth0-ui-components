/**
 * SSO provider type selection step.
 * @module provider-select
 * @internal
 */

import type { IdpStrategy } from '@auth0/universal-components-core';
import { STRATEGY_DISPLAY_NAMES } from '@auth0/universal-components-core';

import { SsoStrategyIcon } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-strategy-icon';
import { Section } from '@/components/auth0/shared/section';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { ProviderSelectProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';

/**
 * Provider selection component for SSO setup.
 * @param props - Component props.
 * @param props.isLoading - Whether the component is in a loading state
 * @param props.strategyList - List of available strategies
 * @param props.onClickStrategy - Callback fired when a strategy is selected
 * @param props.customMessages - Custom translation messages to override defaults
 * @param props.className - Optional CSS class name for styling
 * @returns JSX element
 */
function ProviderSelect({
  isLoading,
  strategyList,
  onClickStrategy,
  customMessages = {},
  className,
}: ProviderSelectProps) {
  const { t } = useTranslator('idp_management.create_sso_provider.provider_select', customMessages);

  return (
    <Section title={t('title')} description={t('description')} className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center min-h-[100px]">
            <Spinner />
          </div>
        ) : (
          strategyList.map((strategyType) => {
            const displayName = STRATEGY_DISPLAY_NAMES[strategyType as IdpStrategy];
            return (
              <Button
                key={strategyType}
                variant="outline"
                className="justify-start h-10 py-2.5 px-3"
                onClick={() => onClickStrategy(strategyType)}
              >
                <div className="flex items-center gap-3 w-full text-left">
                  <SsoStrategyIcon
                    strategy={strategyType as IdpStrategy}
                    className="w-4 h-4 flex-shrink-0 text-primary"
                  />
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{displayName}</span>
                  </div>
                </div>
              </Button>
            );
          })
        )}
      </div>
    </Section>
  );
}

export { ProviderSelect };
