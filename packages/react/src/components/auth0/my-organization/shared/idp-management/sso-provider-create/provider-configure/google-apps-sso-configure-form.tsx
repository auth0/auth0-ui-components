/**
 * Google Apps SSO provider configuration form.
 * @module google-apps-sso-configure-form
 * @internal
 */

import {
  createProviderConfigureSchema,
  STRATEGIES,
  type GoogleAppsConfigureFormValues,
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
  GoogleAppsConfigureFormHandle,
  GoogleAppsConfigureFormProps,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';

const schema = createProviderConfigureSchema('google-apps');

export const GoogleAppsProviderForm = React.forwardRef<
  GoogleAppsConfigureFormHandle,
  GoogleAppsConfigureFormProps
>(function GoogleAppsProviderForm(
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

  const googleAppsData = initialData as GoogleAppsConfigureFormValues | undefined;

  const form = useStrategyConfigureForm(ref, {
    schema,
    readOnly,
    onFormDirty,
    defaultValues: {
      domain: googleAppsData?.domain || '',
      client_id: googleAppsData?.client_id || '',
      client_secret: googleAppsData?.client_secret || '',
      callback_url: callbackUrl || '',
      show_as_button: googleAppsData?.show_as_button ?? false,
      assign_membership_on_login: googleAppsData?.assign_membership_on_login ?? false,
      ...getConnectionAccessDefaults(
        googleAppsData,
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
          readOnly={isLoginSettingsReadOnly}
          customMessages={customMessages}
          strategy={STRATEGIES.GOOGLE_APPS}
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
});
