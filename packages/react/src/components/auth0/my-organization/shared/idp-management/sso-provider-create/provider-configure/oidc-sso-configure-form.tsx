/**
 * OIDC SSO provider configuration form.
 * @module oidc-sso-configure-form
 * @internal
 */

import type { OidcConfigureFormValues } from '@auth0/universal-components-core';
import * as React from 'react';

import { CommonConfigureFields } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/common-configure-fields';
import { SsoCrossAppAccessSection } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-cross-app-access-section';
import { SsoOidcConnectionFields } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-oidc-connection-fields';
import { SsoThirdPartyAccessSection } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-third-party-access-section';
import { Form, FormField } from '@/components/ui/form';
import { useProviderFormMode } from '@/hooks/my-organization/use-provider-form-mode';
import {
  useStrategyConfigureForm,
  type StrategyConfigureFormHandle,
} from '@/hooks/my-organization/use-strategy-configure-form';
import { cn } from '@/lib/utils';
import type { ProviderConfigureFieldsProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';

export type OidcConfigureFormHandle = StrategyConfigureFormHandle<OidcConfigureFormValues>;

interface OidcConfigureFormProps extends Omit<ProviderConfigureFieldsProps, 'strategy'> {
  showCrossAppAccess?: boolean;
  isCrossAppAccessReadOnly?: boolean;
}

export const OidcProviderForm = React.forwardRef<OidcConfigureFormHandle, OidcConfigureFormProps>(
  function OidcProviderForm(
    {
      initialData,
      readOnly = false,
      customMessages = {},
      className,
      onFormDirty,
      idpConfig,
      mode = 'create',
      showThirdPartyAccess = false,
      showCrossAppAccess = false,
      isCrossAppAccessReadOnly = false,
      isOrganizationBlocked = false,
      styling,
    },
    ref,
  ) {
    const { showCopyButtons } = useProviderFormMode(mode);

    const oidcData = initialData as OidcConfigureFormValues | undefined;

    const form = useStrategyConfigureForm<OidcConfigureFormValues>(ref, {
      strategy: 'oidc',
      onFormDirty,
      defaultValues: {
        discovery_url: oidcData?.discovery_url || '',
        type: oidcData?.type || 'back_channel',
        client_id: oidcData?.client_id || '',
        client_secret: oidcData?.client_secret || '',
        show_as_button: oidcData?.show_as_button ?? false,
        assign_membership_on_login: oidcData?.assign_membership_on_login ?? false,
        use_for_third_party_client_access:
          (oidcData as { use_for_third_party_client_access?: boolean })
            ?.use_for_third_party_client_access ?? false,
        cross_app_access_resource_app:
          (oidcData as { cross_app_access_resource_app?: { status: 'enabled' | 'disabled' } })
            ?.cross_app_access_resource_app ?? undefined,
      },
    });

    return (
      <Form {...form}>
        <div className={cn('space-y-6', className)}>
          <SsoOidcConnectionFields
            showCopyButton={showCopyButtons}
            readOnly={readOnly}
            customMessages={customMessages}
          />

          <CommonConfigureFields
            idpConfig={idpConfig}
            readOnly={readOnly}
            customMessages={customMessages}
          />

          {showThirdPartyAccess && (
            <FormField
              control={form.control}
              name="use_for_third_party_client_access"
              render={({ field }) => (
                <SsoThirdPartyAccessSection
                  checked={field.value ?? false}
                  onChange={field.onChange}
                  readOnly={readOnly}
                  isOrganizationBlocked={isOrganizationBlocked}
                  className={styling?.classes?.['ProviderConfigure-ThirdPartyAccess']}
                />
              )}
            />
          )}

          {showCrossAppAccess && (
            <FormField
              control={form.control}
              name="cross_app_access_resource_app"
              render={({ field }) => (
                <SsoCrossAppAccessSection
                  checked={field.value?.status === 'enabled'}
                  onChange={(checked) =>
                    field.onChange(checked ? { status: 'enabled' } : { status: 'disabled' })
                  }
                  readOnly={readOnly || isCrossAppAccessReadOnly}
                  strategy="oidc"
                  className={styling?.classes?.['ProviderConfigure-CrossAppAccess']}
                />
              )}
            />
          )}
        </div>
      </Form>
    );
  },
);
