/**
 * Connection-level access fields (third-party access and Cross App Access) shared by all SSO provider configure forms.
 * @module connection-access-fields
 * @internal
 */

import { STRATEGIES } from '@auth0/universal-components-core';
import * as React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { isCrossAppAccessStrategy } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/connection-access-defaults';
import { SsoCrossAppAccessSection } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-cross-app-access-section';
import { SsoThirdPartyAccessSection } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-third-party-access-section';
import { FormField } from '@/components/ui/form';
import type {
  ConnectionAccessFieldsProps,
  ConnectionAccessFormValues,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';

type SamlCrossAppAccessProps = Omit<
  React.ComponentProps<typeof SsoCrossAppAccessSection>,
  'strategy' | 'discoveryUrl' | 'onDiscoveryUrlChange' | 'discoveryUrlError'
>;

/**
 * SAML Cross App Access section. Only SAML subscribes to `discovery_url`.
 * @param props - Section props without the SAML-specific fields.
 * @returns The SAML Cross App Access section.
 */
function SamlCrossAppAccess(props: SamlCrossAppAccessProps): React.ReactElement {
  const form = useFormContext<ConnectionAccessFormValues>();
  const discoveryUrl = useWatch({ control: form.control, name: 'discovery_url' }) ?? '';

  return (
    <SsoCrossAppAccessSection
      {...props}
      strategy="samlp"
      discoveryUrl={discoveryUrl}
      onDiscoveryUrlChange={(url) =>
        form.setValue('discovery_url', url, { shouldDirty: true, shouldValidate: true })
      }
      discoveryUrlError={form.formState.errors.discovery_url?.message}
    />
  );
}

/**
 * Renders the third-party access and Cross App Access fields for an SSO provider form.
 * Must be rendered inside a react-hook-form `Form`.
 * @param props - Component props.
 * @returns The access fields, or null when none apply.
 */
export function ConnectionAccessFields({
  strategy,
  readOnly = false,
  showThirdPartyAccess = false,
  isThirdPartyAccessReadOnly = false,
  isOrganizationBlocked = false,
  showCrossAppAccess = false,
  isCrossAppAccessReadOnly = false,
  classes,
}: ConnectionAccessFieldsProps): React.ReactElement | null {
  const form = useFormContext<ConnectionAccessFormValues>();
  const renderCrossAppAccess = showCrossAppAccess && isCrossAppAccessStrategy(strategy);

  if (!showThirdPartyAccess && !renderCrossAppAccess) {
    return null;
  }

  return (
    <>
      {showThirdPartyAccess && (
        <FormField
          control={form.control}
          name="use_for_third_party_client_access"
          render={({ field }) => (
            <SsoThirdPartyAccessSection
              checked={field.value ?? false}
              onChange={field.onChange}
              readOnly={readOnly || isThirdPartyAccessReadOnly}
              isOrganizationBlocked={isOrganizationBlocked}
              className={classes?.['ProviderConfigure-ThirdPartyAccess']}
            />
          )}
        />
      )}

      {renderCrossAppAccess && (
        <FormField
          control={form.control}
          name="cross_app_access_resource_app"
          render={({ field }) => {
            const sectionProps = {
              checked: field.value?.status === 'enabled',
              onChange: (checked: boolean) =>
                field.onChange(checked ? { status: 'enabled' } : { status: 'disabled' }),
              readOnly: readOnly || isCrossAppAccessReadOnly,
              className: classes?.['ProviderConfigure-CrossAppAccess'],
            };

            if (strategy === STRATEGIES.SAMLP) {
              return <SamlCrossAppAccess {...sectionProps} />;
            }

            if (strategy === STRATEGIES.OIDC || strategy === STRATEGIES.OKTA) {
              return <SsoCrossAppAccessSection {...sectionProps} strategy={strategy} />;
            }

            // Unreachable: the XAA strategies are OIDC, Okta and SAML.
            return <></>;
          }}
        />
      )}
    </>
  );
}
