/**
 * Azure AD (WAAD) SSO provider configuration form.
 * @module waad-sso-configure-form
 * @internal
 */

import {
  createProviderConfigureSchema,
  STRATEGIES,
  type WaadConfigureFormValues,
} from '@auth0/universal-components-core';
import * as React from 'react';

import { CommonConfigureFields } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/common-configure-fields';
import { getConnectionAccessDefaults } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/connection-access-defaults';
import { SsoCallbackUrlField } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-callback-url-field';
import { SsoClientCredentialsFields } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-client-credentials-fields';
import { SsoIdpDomainField } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-idp-domain-field';
import { Form } from '@/components/ui/form';
import { useServiceProviderValues } from '@/hooks/my-organization/idp-management/sso-provider-shared/use-service-provider-values';
import { useStrategyConfigureForm } from '@/hooks/my-organization/idp-management/sso-provider-shared/use-strategy-configure-form';
import { useProviderFormMode } from '@/hooks/my-organization/use-provider-form-mode';
import { cn } from '@/lib/utils';
import type {
  WaadConfigureFormHandle,
  WaadConfigureFormProps,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';

const schema = createProviderConfigureSchema('waad');

export const WaadProviderForm = React.forwardRef<WaadConfigureFormHandle, WaadConfigureFormProps>(
  function WaadProviderForm(
    {
      initialData,
      readOnly = false,
      isLoginSettingsReadOnly = readOnly,
      customMessages = {},
      className,
      onFormDirty,
      idpConfig,
      mode = 'create',
      showThirdPartyAccess = false,
      isThirdPartyAccessReadOnly = false,
      isOrganizationBlocked = false,
      showCrossAppAccess = false,
      isCrossAppAccessReadOnly = false,
      crossAppAccessDefaultValue,
      styling,
    },
    ref,
  ) {
    const { showCopyButtons } = useProviderFormMode(mode);
    const { callbackUrl } = useServiceProviderValues();

    const waadData = initialData as WaadConfigureFormValues | undefined;

    const form = useStrategyConfigureForm(ref, {
      schema,
      readOnly,
      onFormDirty,
      defaultValues: {
        tenant_domain: waadData?.tenant_domain || '',
        client_id: waadData?.client_id || '',
        client_secret: waadData?.client_secret || '',
        callback_url: waadData?.callback_url || callbackUrl,
        show_as_button: waadData?.show_as_button ?? false,
        assign_membership_on_login: waadData?.assign_membership_on_login ?? false,
        ...getConnectionAccessDefaults(
          waadData,
          crossAppAccessDefaultValue,
          mode,
          showCrossAppAccess,
          showThirdPartyAccess,
        ),
      },
    });

    return (
      <Form {...form}>
        <div className={cn('space-y-6', className)}>
          <SsoIdpDomainField
            name="tenant_domain"
            messageKey="fields.waad.tenant_domain"
            readOnly={readOnly}
            customMessages={customMessages}
          />

          <SsoClientCredentialsFields
            messageKey="fields.waad"
            showCopyButton={showCopyButtons}
            readOnly={readOnly}
            customMessages={customMessages}
          />

          <SsoCallbackUrlField messageKey="fields.waad" customMessages={customMessages} />

          <CommonConfigureFields
            idpConfig={idpConfig}
            readOnly={isLoginSettingsReadOnly}
            customMessages={customMessages}
            strategy={STRATEGIES.WAAD}
            showThirdPartyAccess={showThirdPartyAccess}
            isThirdPartyAccessReadOnly={isThirdPartyAccessReadOnly}
            isOrganizationBlocked={isOrganizationBlocked}
            showCrossAppAccess={showCrossAppAccess}
            isCrossAppAccessReadOnly={isCrossAppAccessReadOnly}
            classes={styling?.classes}
          />
        </div>
      </Form>
    );
  },
);
