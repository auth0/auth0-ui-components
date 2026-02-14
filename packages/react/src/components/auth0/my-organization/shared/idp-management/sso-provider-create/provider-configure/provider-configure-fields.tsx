import { STRATEGIES } from '@auth0/universal-components-core';
import * as React from 'react';

import {
  AdfsProviderForm,
  type AdfsConfigureFormHandle,
} from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/adfs-sso-configure-form';
import {
  GoogleAppsProviderForm,
  type GoogleAppsConfigureFormHandle,
} from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/google-apps-sso-configure-form';
import {
  OidcProviderForm,
  type OidcConfigureFormHandle,
} from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/oidc-sso-configure-form';
import {
  OktaProviderForm,
  type OktaConfigureFormHandle,
} from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/okta-sso-configure-form';
import {
  PingFederateProviderForm,
  type PingFederateConfigureFormHandle,
} from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/ping-federate-sso-configure-form';
import {
  SamlpProviderForm,
  type SamlpConfigureFormHandle,
} from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/samlp-sso-configure-form';
import {
  WaadProviderForm,
  type WaadConfigureFormHandle,
} from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/waad-sso-configure-form';
import { cn } from '@/lib/utils';
import type { ProviderConfigureFieldsProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';

export type ProviderConfigureFormHandle =
  | OktaConfigureFormHandle
  | GoogleAppsConfigureFormHandle
  | WaadConfigureFormHandle
  | PingFederateConfigureFormHandle
  | AdfsConfigureFormHandle
  | SamlpConfigureFormHandle
  | OidcConfigureFormHandle;

export const ProviderConfigureFields = React.forwardRef<
  ProviderConfigureFormHandle,
  ProviderConfigureFieldsProps
>(function ProviderConfigureFields({ strategy, className, ...props }, ref) {
  const renderProviderForm = () => {
    switch (strategy) {
      case STRATEGIES.OKTA:
        return (
          <OktaProviderForm ref={ref as React.ForwardedRef<OktaConfigureFormHandle>} {...props} />
        );
      case STRATEGIES.GOOGLE_APPS:
        return (
          <GoogleAppsProviderForm
            ref={ref as React.ForwardedRef<GoogleAppsConfigureFormHandle>}
            {...props}
          />
        );
      case STRATEGIES.WAAD:
        return (
          <WaadProviderForm ref={ref as React.ForwardedRef<WaadConfigureFormHandle>} {...props} />
        );
      case STRATEGIES.PINGFEDERATE:
        return (
          <PingFederateProviderForm
            ref={ref as React.ForwardedRef<PingFederateConfigureFormHandle>}
            {...props}
          />
        );
      case STRATEGIES.ADFS:
        return (
          <AdfsProviderForm ref={ref as React.ForwardedRef<AdfsConfigureFormHandle>} {...props} />
        );
      case STRATEGIES.SAMLP:
        return (
          <SamlpProviderForm ref={ref as React.ForwardedRef<SamlpConfigureFormHandle>} {...props} />
        );
      case STRATEGIES.OIDC:
        return (
          <OidcProviderForm ref={ref as React.ForwardedRef<OidcConfigureFormHandle>} {...props} />
        );
      default:
        return null;
    }
  };

  return <div className={cn('space-y-6', className)}>{renderProviderForm()}</div>;
});
