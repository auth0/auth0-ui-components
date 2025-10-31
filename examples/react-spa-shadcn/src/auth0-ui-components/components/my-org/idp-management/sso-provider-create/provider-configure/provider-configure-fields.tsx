import { STRATEGIES } from '@auth0/web-ui-components-core';
import * as React from 'react';

import { cn } from '../../../../../lib/theme-utils';
import type { ProviderConfigureFieldsProps } from '../../../../../types/my-org/idp-management/sso-provider/sso-provider-create-types';

import { AdfsProviderForm, type AdfsConfigureFormHandle } from './adfs-sso-configure-form';
import {
  GoogleAppsProviderForm,
  type GoogleAppsConfigureFormHandle,
} from './google-apps-sso-configure-form';
import { OidcProviderForm, type OidcConfigureFormHandle } from './oidc-sso-configure-form';
import { OktaProviderForm, type OktaConfigureFormHandle } from './okta-sso-configure-form';
import {
  PingFederateProviderForm,
  type PingFederateConfigureFormHandle,
} from './ping-federate-sso-configure-form';
import { SamlpProviderForm, type SamlpConfigureFormHandle } from './samlp-sso-configure-form';
import { WaadProviderForm, type WaadConfigureFormHandle } from './waad-sso-configure-form';

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
