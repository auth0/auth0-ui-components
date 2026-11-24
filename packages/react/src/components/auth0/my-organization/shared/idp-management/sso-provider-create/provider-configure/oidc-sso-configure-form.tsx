/**
 * OIDC SSO provider configuration form.
 * @module oidc-sso-configure-form
 * @internal
 */

import {
  createProviderConfigureSchema,
  STRATEGIES,
  type OidcConfigureFormValues,
} from '@auth0/universal-components-core';
import * as React from 'react';

import { CommonConfigureFields } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/common-configure-fields';
import { getConnectionAccessDefaults } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/connection-access-defaults';
import { SsoOidcConnectionFields } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-oidc-connection-fields';
import { Form } from '@/components/ui/form';
import { useStrategyConfigureForm } from '@/hooks/my-organization/idp-management/sso-provider-shared/use-strategy-configure-form';
import { useProviderFormMode } from '@/hooks/my-organization/use-provider-form-mode';
import { cn } from '@/lib/utils';
import type {
  OidcConfigureFormHandle,
  OidcConfigureFormProps,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';

const schema = createProviderConfigureSchema('oidc');

export const OidcProviderForm = React.forwardRef<OidcConfigureFormHandle, OidcConfigureFormProps>(
  function OidcProviderForm(
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

    const oidcData = initialData as OidcConfigureFormValues | undefined;

    const form = useStrategyConfigureForm(ref, {
      schema,
      readOnly,
      onFormDirty,
      defaultValues: {
        discovery_url: oidcData?.discovery_url || '',
        type: oidcData?.type || 'back_channel',
        client_id: oidcData?.client_id || '',
        client_secret: oidcData?.client_secret || '',
        show_as_button: oidcData?.show_as_button ?? false,
        assign_membership_on_login: oidcData?.assign_membership_on_login ?? false,
        ...getConnectionAccessDefaults(
          oidcData,
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
          <SsoOidcConnectionFields
            showCopyButton={showCopyButtons}
            readOnly={readOnly}
            customMessages={customMessages}
          />

          <CommonConfigureFields
            idpConfig={idpConfig}
            readOnly={isLoginSettingsReadOnly}
            customMessages={customMessages}
            strategy={STRATEGIES.OIDC}
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
