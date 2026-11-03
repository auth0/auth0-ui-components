/**
 * Azure AD (WAAD) SSO provider configuration form.
 * @module waad-sso-configure-form
 * @internal
 */

import type { WaadConfigureFormValues } from '@auth0/universal-components-core';
import * as React from 'react';

import { CommonConfigureFields } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/common-configure-fields';
import { SsoCallbackUrlField } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-callback-url-field';
import { SsoClientCredentialsFields } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-client-credentials-fields';
import { SsoIdpDomainField } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-idp-domain-field';
import { Form } from '@/components/ui/form';
import { useProviderFormMode } from '@/hooks/my-organization/use-provider-form-mode';
import { useServiceProviderValues } from '@/hooks/my-organization/use-service-provider-values';
import {
  useStrategyConfigureForm,
  type StrategyConfigureFormHandle,
} from '@/hooks/my-organization/use-strategy-configure-form';
import { FORM_VALIDATION_MODE } from '@/lib/constants/form-constants';
import { cn } from '@/lib/utils';
import type { ProviderConfigureFieldsProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';

export type WaadConfigureFormHandle = StrategyConfigureFormHandle<WaadConfigureFormValues>;

interface WaadConfigureFormProps extends Omit<ProviderConfigureFieldsProps, 'strategy'> {}

export const WaadProviderForm = React.forwardRef<WaadConfigureFormHandle, WaadConfigureFormProps>(
  function WaadProviderForm(
    {
      initialData,
      readOnly = false,
      customMessages = {},
      className,
      onFormDirty,
      idpConfig,
      mode = 'create',
    },
    ref,
  ) {
    const { showCopyButtons } = useProviderFormMode(mode);
    const { callbackUrl } = useServiceProviderValues();

    const waadData = initialData as WaadConfigureFormValues | undefined;

    const form = useStrategyConfigureForm<WaadConfigureFormValues>(ref, {
      strategy: 'waad',
      mode: readOnly ? undefined : FORM_VALIDATION_MODE,
      onFormDirty,
      defaultValues: {
        tenant_domain: waadData?.tenant_domain || '',
        client_id: waadData?.client_id || '',
        client_secret: waadData?.client_secret || '',
        callback_url: waadData?.callback_url || callbackUrl,
        show_as_button: waadData?.show_as_button ?? false,
        assign_membership_on_login: waadData?.assign_membership_on_login ?? false,
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
            readOnly={readOnly}
            customMessages={customMessages}
          />
        </div>
      </Form>
    );
  },
);
