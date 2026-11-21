/**
 * ADFS SSO provider configuration form.
 * @module adfs-sso-configure-form
 * @internal
 */

import {
  createProviderConfigureSchema,
  STRATEGIES,
  type AdfsConfigureFormInput,
  type AdfsConfigureFormValues,
} from '@auth0/universal-components-core';
import * as React from 'react';

import { CommonConfigureFields } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/common-configure-fields';
import { getConnectionAccessDefaults } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/connection-access-defaults';
import { SsoAdfsConnectionFields } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-adfs-connection-fields';
import { Form } from '@/components/ui/form';
import {
  parseStrategyConfigureValues,
  useStrategyConfigureForm,
} from '@/hooks/my-organization/idp-management/sso-provider-shared/use-strategy-configure-form';
import { cn } from '@/lib/utils';
import type { ProviderConfigureFieldsProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';
import type { StrategyConfigureFormHandle } from '@/types/my-organization/idp-management/sso-provider/sso-provider-shared-types';

const schema = createProviderConfigureSchema('adfs');

export type AdfsConfigureFormHandle = StrategyConfigureFormHandle<AdfsConfigureFormValues>;

interface AdfsConfigureFormProps extends Omit<ProviderConfigureFieldsProps, 'strategy'> {}

export const AdfsProviderForm = React.forwardRef<AdfsConfigureFormHandle, AdfsConfigureFormProps>(
  function AdfsProviderForm(
    {
      initialData,
      readOnly = false,
      isLoginSettingsReadOnly = readOnly,
      customMessages = {},
      className,
      onFormDirty,
      idpConfig,
      connectionSourceSelector = 'radio',
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
    const adfsData = initialData as AdfsConfigureFormInput | undefined;

    const form = useStrategyConfigureForm(ref, {
      schema,
      onFormDirty,
      defaultValues: {
        meta_data_source: adfsData?.meta_data_source || 'meta_data_url',
        meta_data_location_url: adfsData?.meta_data_location_url || '',
        adfs_server: adfsData?.adfs_server || '',
        fedMetadataXml: adfsData?.fedMetadataXml || '',
        show_as_button: adfsData?.show_as_button ?? false,
        assign_membership_on_login: adfsData?.assign_membership_on_login ?? false,
        ...getConnectionAccessDefaults(
          adfsData,
          crossAppAccessDefaultValue,
          mode,
          showCrossAppAccess,
          showThirdPartyAccess,
        ),
      },
      getData: (adfsForm) => parseStrategyConfigureValues(schema, adfsForm.getValues()),
    });

    return (
      <Form {...form}>
        <div className={cn('space-y-6', className)}>
          <SsoAdfsConnectionFields
            readOnly={readOnly}
            sourceSelector={connectionSourceSelector}
            customMessages={customMessages}
          />

          <CommonConfigureFields
            idpConfig={idpConfig}
            readOnly={isLoginSettingsReadOnly}
            customMessages={customMessages}
            strategy={STRATEGIES.ADFS}
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
