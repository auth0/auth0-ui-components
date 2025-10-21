import type { ProviderConfigureFormValues } from '@auth0-web-ui-components/core';
import * as React from 'react';

import { useTranslator } from '../../../../../hooks/use-translator';
import type { ProviderConfigureProps } from '../../../../../types';
import { Section } from '../../../../ui/section';

import {
  ProviderConfigureFields,
  type ProviderConfigureFormHandle,
} from './provider-configure-fields';

export interface ProviderConfigureHandle {
  validate: () => Promise<boolean>;
  getData: () => ProviderConfigureFormValues;
}

export const ProviderConfigure = React.forwardRef<ProviderConfigureHandle, ProviderConfigureProps>(
  function ProviderConfigure(
    { strategy, initialData, readOnly = false, customMessages = {}, className },
    ref,
  ) {
    const { t } = useTranslator(
      'idp_management.create_sso_provider.provider_configure',
      customMessages,
    );

    const formRef = React.useRef<ProviderConfigureFormHandle>(null);

    React.useImperativeHandle(ref, () => ({
      validate: async () => {
        return (await formRef.current?.validate()) ?? false;
      },
      getData: () => {
        return formRef.current?.getData() as ProviderConfigureFormValues;
      },
    }));

    return (
      <div className={className}>
        <Section title={t('title')} description={t('description')}>
          <ProviderConfigureFields
            ref={formRef}
            strategy={strategy}
            initialData={initialData}
            readOnly={readOnly}
            customMessages={customMessages.fields}
          />
        </Section>
      </div>
    );
  },
);

export default ProviderConfigure;
