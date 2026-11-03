/**
 * ADFS SSO provider configuration form.
 * @module adfs-sso-configure-form
 * @internal
 */

import type {
  AdfsConfigureFormInput,
  AdfsConfigureFormValues,
} from '@auth0/universal-components-core';
import * as React from 'react';

import { CommonConfigureFields } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/common-configure-fields';
import { SsoAdfsConnectionFields } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-adfs-connection-fields';
import { Form } from '@/components/ui/form';
import {
  parseStrategyConfigureValues,
  useStrategyConfigureForm,
  type StrategyConfigureFormHandle,
} from '@/hooks/my-organization/use-strategy-configure-form';
import { cn } from '@/lib/utils';
import type { ProviderConfigureFieldsProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';

export type AdfsConfigureFormHandle = StrategyConfigureFormHandle<AdfsConfigureFormValues>;

interface AdfsConfigureFormProps extends Omit<ProviderConfigureFieldsProps, 'strategy'> {}

export const AdfsProviderForm = React.forwardRef<AdfsConfigureFormHandle, AdfsConfigureFormProps>(
  function AdfsProviderForm(
    {
      initialData,
      readOnly = false,
      customMessages = {},
      className,
      onFormDirty,
      idpConfig,
      connectionSourceSelector = 'radio',
    },
    ref,
  ) {
    const adfsData = initialData as AdfsConfigureFormInput | undefined;

    const form = useStrategyConfigureForm<AdfsConfigureFormValues>(ref, {
      strategy: 'adfs',
      onFormDirty,
      defaultValues: {
        meta_data_source: adfsData?.meta_data_source || 'meta_data_url',
        meta_data_location_url: adfsData?.meta_data_location_url || '',
        adfs_server: adfsData?.adfs_server || '',
        fedMetadataXml: adfsData?.fedMetadataXml || '',
        show_as_button: adfsData?.show_as_button ?? false,
        assign_membership_on_login: adfsData?.assign_membership_on_login ?? false,
      },
      getData: (adfsForm) => parseStrategyConfigureValues('adfs', adfsForm.getValues()),
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
            readOnly={readOnly}
            customMessages={customMessages}
          />
        </div>
      </Form>
    );
  },
);
