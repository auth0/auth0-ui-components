import {
  createProviderConfigureSchema,
  type WaadConfigureFormValues,
} from '@auth0-web-ui-components/core';
import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import { useCoreClient } from '../../../../../hooks';
import { useTranslator } from '../../../../../hooks/use-translator';
import { cn } from '../../../../../lib/theme-utils';
import type { ProviderConfigureFieldsProps } from '../../../../../types';
import { CopyableTextField } from '../../../../ui/copyable-text-field';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '../../../../ui/form';
import { TextField } from '../../../../ui/text-field';

export interface WaadConfigureFormHandle {
  validate: () => Promise<boolean>;
  getData: () => WaadConfigureFormValues;
}

interface WaadConfigureFormProps extends Omit<ProviderConfigureFieldsProps, 'strategy'> {}

export const WaadProviderForm = React.forwardRef<WaadConfigureFormHandle, WaadConfigureFormProps>(
  function WaadProviderForm(
    { initialData, readOnly = false, customMessages = {}, className },
    ref,
  ) {
    const { t } = useTranslator(
      'idp_management.create_sso_provider.provider_configure',
      customMessages,
    );

    const { coreClient } = useCoreClient();

    const callbackUrl = React.useMemo(() => {
      const domain = coreClient?.auth?.domain || 'your domain';
      return `https://${domain}/login/callback`;
    }, [coreClient?.auth?.domain]);

    const waadData = initialData as WaadConfigureFormValues | undefined;

    const form = useForm<WaadConfigureFormValues>({
      resolver: zodResolver(createProviderConfigureSchema('waad')),
      mode: 'onSubmit',
      reValidateMode: 'onChange',
      defaultValues: {
        tenant_domain: waadData?.tenant_domain || '',
        client_id: waadData?.client_id || '',
        client_secret: waadData?.client_secret || '',
        callback_url: waadData?.callback_url || callbackUrl,
      },
    });

    React.useImperativeHandle(ref, () => ({
      validate: async () => {
        return await form.trigger();
      },
      getData: () => form.getValues(),
    }));

    return (
      <Form {...form}>
        <div className={cn('space-y-6', className)}>
          <FormField
            control={form.control}
            name="tenant_domain"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-sm font-normal text-(length:--font-size-label)">
                  {t('fields.waad.tenant_domain.label')}
                </FormLabel>
                <FormControl>
                  <TextField
                    type="text"
                    placeholder={t('fields.waad.tenant_domain.placeholder')}
                    error={Boolean(fieldState.error)}
                    readOnly={readOnly}
                    {...field}
                  />
                </FormControl>
                <FormMessage
                  role="alert"
                  className="text-sm text-left text-(length:--font-size-paragraph)"
                />
                <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
                  {t('fields.waad.tenant_domain.helper_text')}
                </FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="client_id"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-sm font-normal text-(length:--font-size-label)">
                  {t('fields.waad.client_id.label')}
                </FormLabel>
                <FormControl>
                  <CopyableTextField
                    type="text"
                    placeholder={t('fields.waad.client_id.placeholder')}
                    error={Boolean(fieldState.error)}
                    readOnly={readOnly}
                    {...field}
                  />
                </FormControl>
                <FormMessage
                  role="alert"
                  className="text-sm text-left text-(length:--font-size-paragraph)"
                />
                <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
                  {t('fields.waad.client_id.helper_text')}
                </FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="client_secret"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-sm font-normal text-(length:--font-size-label)">
                  {t('fields.waad.client_secret.label')}
                </FormLabel>
                <FormControl>
                  <CopyableTextField
                    type="password"
                    placeholder={t('fields.waad.client_secret.placeholder')}
                    error={Boolean(fieldState.error)}
                    readOnly={readOnly}
                    {...field}
                  />
                </FormControl>
                <FormMessage
                  role="alert"
                  className="text-sm text-left text-(length:--font-size-paragraph)"
                />
                <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
                  {t('fields.waad.client_secret.helper_text')}
                </FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="callback_url"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-sm font-normal text-(length:--font-size-label)">
                  {t('fields.waad.callback_url.label')}
                </FormLabel>
                <FormControl>
                  <CopyableTextField
                    type="text"
                    placeholder={t('fields.waad.callback_url.placeholder')}
                    error={Boolean(fieldState.error)}
                    readOnly={true}
                    {...field}
                  />
                </FormControl>
                <FormMessage
                  role="alert"
                  className="text-sm text-left text-(length:--font-size-paragraph)"
                />
                <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
                  {t('fields.waad.callback_url.helper_text')}
                </FormDescription>
              </FormItem>
            )}
          />
        </div>
      </Form>
    );
  },
);
