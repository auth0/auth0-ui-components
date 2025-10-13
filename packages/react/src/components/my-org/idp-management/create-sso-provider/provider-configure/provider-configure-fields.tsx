import { Form } from '@/components/ui/form';
import { cn } from '@/lib/theme-utils';
import type { ProviderConfigureFieldsProps } from '@/types';

import AdfsProviderForm from './adfs-sso-configure-form';
import GoogleAppsProviderForm from './google-apps-sso-configure-form';
import OidcProviderForm from './oidc-sso-configure-form';
import OktaProviderForm from './okta-sso-configure-form';
import PingFederateProviderForm from './ping-federate-sso-configure-form';
import SamlpProviderForm from './samlp-sso-configure-form';
import WaadProviderForm from './waad-sso-configure-form';

export function ProviderConfigureFields({
  form,
  readOnly = false,
  customMessages = {},
  className,
  strategy,
}: ProviderConfigureFieldsProps) {
  const renderProviderForm = () => {
    switch (strategy) {
      case 'okta':
        return <OktaProviderForm form={form} readOnly={readOnly} customMessages={customMessages} />;
      case 'google-apps':
        return (
          <GoogleAppsProviderForm form={form} readOnly={readOnly} customMessages={customMessages} />
        );
      case 'waad':
        return <WaadProviderForm form={form} readOnly={readOnly} customMessages={customMessages} />;
      case 'ping-federate':
        return (
          <PingFederateProviderForm
            form={form}
            readOnly={readOnly}
            customMessages={customMessages}
          />
        );
      case 'adfs':
        return <AdfsProviderForm form={form} readOnly={readOnly} customMessages={customMessages} />;
      case 'samlp':
        return (
          <SamlpProviderForm form={form} readOnly={readOnly} customMessages={customMessages} />
        );
      case 'oidc':
        return <OidcProviderForm form={form} readOnly={readOnly} customMessages={customMessages} />;
      default:
        return null;
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      <Form {...form}>{renderProviderForm()}</Form>
    </div>
  );
}
