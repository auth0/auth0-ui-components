/**
 * Google Apps SSO provider configuration form.
 * @module google-apps-sso-configure-form
 * @internal
 */

import type { GoogleAppsConfigureFormValues } from '@auth0/universal-components-core';
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

export type GoogleAppsConfigureFormHandle =
  StrategyConfigureFormHandle<GoogleAppsConfigureFormValues>;

interface GoogleAppsConfigureFormProps extends Omit<ProviderConfigureFieldsProps, 'strategy'> {}

export const GoogleAppsProviderForm = React.forwardRef<
  GoogleAppsConfigureFormHandle,
  GoogleAppsConfigureFormProps
>(function GoogleAppsProviderForm(
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

  const googleAppsData = initialData as GoogleAppsConfigureFormValues | undefined;

  const form = useStrategyConfigureForm<GoogleAppsConfigureFormValues>(ref, {
    strategy: 'google-apps',
    mode: readOnly ? undefined : FORM_VALIDATION_MODE,
    onFormDirty,
    defaultValues: {
      domain: googleAppsData?.domain || '',
      client_id: googleAppsData?.client_id || '',
      client_secret: googleAppsData?.client_secret || '',
      callback_url: callbackUrl || '',
      show_as_button: googleAppsData?.show_as_button ?? false,
      assign_membership_on_login: googleAppsData?.assign_membership_on_login ?? false,
    },
  });

  return (
    <Form {...form}>
      <div className={cn('space-y-6', className)}>
        <SsoIdpDomainField
          name="domain"
          messageKey="fields.google-apps.domain"
          readOnly={readOnly}
          customMessages={customMessages}
        />

        <SsoClientCredentialsFields
          messageKey="fields.google-apps"
          showCopyButton={showCopyButtons}
          readOnly={readOnly}
          customMessages={customMessages}
        />

        <SsoCallbackUrlField messageKey="fields.google-apps" customMessages={customMessages} />

        <CommonConfigureFields
          idpConfig={idpConfig}
          readOnly={readOnly}
          customMessages={customMessages}
        />
      </div>
    </Form>
  );
});
