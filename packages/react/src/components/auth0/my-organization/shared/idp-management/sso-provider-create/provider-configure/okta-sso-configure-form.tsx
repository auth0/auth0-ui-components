/**
 * Okta SSO provider configuration form.
 * @module okta-sso-configure-form
 * @internal
 */

import type { OktaConfigureFormValues } from '@auth0/universal-components-core';
import * as React from 'react';

import { CommonConfigureFields } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/common-configure-fields';
import { SsoCallbackUrlField } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-callback-url-field';
import { SsoClientCredentialsFields } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-client-credentials-fields';
import { SsoCrossAppAccessSection } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-cross-app-access-section';
import { SsoIdpDomainField } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-idp-domain-field';
import { Form, FormField } from '@/components/ui/form';
import { useProviderFormMode } from '@/hooks/my-organization/use-provider-form-mode';
import { useServiceProviderValues } from '@/hooks/my-organization/use-service-provider-values';
import {
  useStrategyConfigureForm,
  type StrategyConfigureFormHandle,
} from '@/hooks/my-organization/use-strategy-configure-form';
import { FORM_VALIDATION_MODE } from '@/lib/constants/form-constants';
import { cn } from '@/lib/utils';
import type { ProviderConfigureFieldsProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';

const OKTA_HELP_LINKS = {
  domain: 'https://developer.okta.com/docs/guides/find-your-domain/main/',
  client_id: 'https://developer.okta.com/docs/guides/find-your-app-credentials/main',
  client_secret: 'https://developer.okta.com/docs/guides/find-your-app-credentials/main',
} as const;

export type OktaConfigureFormHandle = StrategyConfigureFormHandle<OktaConfigureFormValues>;

interface OktaConfigureFormProps extends Omit<ProviderConfigureFieldsProps, 'strategy'> {
  showCrossAppAccess?: boolean;
  isCrossAppAccessReadOnly?: boolean;
}

export const OktaProviderForm = React.forwardRef<OktaConfigureFormHandle, OktaConfigureFormProps>(
  function OktaProviderForm(
    {
      initialData,
      readOnly = false,
      customMessages = {},
      className,
      onFormDirty,
      idpConfig,
      mode = 'create',
      showCrossAppAccess = false,
      isCrossAppAccessReadOnly = false,
      crossAppAccessDefaultValue,
      styling,
    },
    ref,
  ) {
    const { showCopyButtons } = useProviderFormMode(mode);
    const { callbackUrl } = useServiceProviderValues();

    const oktaData = initialData as OktaConfigureFormValues | undefined;

    const form = useStrategyConfigureForm<OktaConfigureFormValues>(ref, {
      strategy: 'okta',
      mode: readOnly ? undefined : FORM_VALIDATION_MODE,
      onFormDirty,
      defaultValues: {
        domain: oktaData?.domain || '',
        client_id: oktaData?.client_id || '',
        client_secret: oktaData?.client_secret || '',
        icon_url: oktaData?.icon_url || '',
        callback_url: oktaData?.callback_url || callbackUrl,
        show_as_button: oktaData?.show_as_button ?? false,
        assign_membership_on_login: oktaData?.assign_membership_on_login ?? false,
        cross_app_access_resource_app:
          (oktaData as { cross_app_access_resource_app?: { status: 'enabled' | 'disabled' } })
            ?.cross_app_access_resource_app ??
          (crossAppAccessDefaultValue !== undefined
            ? { status: crossAppAccessDefaultValue }
            : undefined),
      },
    });

    return (
      <Form {...form}>
        <div className={cn('space-y-6', className)}>
          <SsoIdpDomainField
            name="domain"
            messageKey="fields.okta.domain"
            helpUrl={OKTA_HELP_LINKS.domain}
            readOnly={readOnly}
            customMessages={customMessages}
          />

          <SsoClientCredentialsFields
            messageKey="fields.okta"
            helpUrls={{
              clientId: OKTA_HELP_LINKS.client_id,
              clientSecret: OKTA_HELP_LINKS.client_secret,
            }}
            showCopyButton={showCopyButtons}
            readOnly={readOnly}
            customMessages={customMessages}
          />

          <SsoCallbackUrlField messageKey="fields.okta" customMessages={customMessages} />

          <CommonConfigureFields
            idpConfig={idpConfig}
            readOnly={readOnly}
            customMessages={customMessages}
          />

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
                  strategy="okta"
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
