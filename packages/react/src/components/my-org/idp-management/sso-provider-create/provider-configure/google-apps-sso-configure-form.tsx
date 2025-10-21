import {
  createProviderConfigureSchema,
  type GoogleAppsConfigureFormValues,
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

export interface GoogleAppsConfigureFormHandle {
  validate: () => Promise<boolean>;
  getData: () => GoogleAppsConfigureFormValues;
}

interface GoogleAppsConfigureFormProps extends Omit<ProviderConfigureFieldsProps, 'strategy'> {}

export const GoogleAppsProviderForm = React.forwardRef<
  GoogleAppsConfigureFormHandle,
  GoogleAppsConfigureFormProps
>(function GoogleAppsProviderForm(
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

  const googleAppsData = initialData as GoogleAppsConfigureFormValues | undefined;

  const form = useForm<GoogleAppsConfigureFormValues>({
    resolver: zodResolver(createProviderConfigureSchema('google-apps')),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      domain: googleAppsData?.domain || '',
      client_id: googleAppsData?.client_id || '',
      client_secret: googleAppsData?.client_secret || '',
      callback_url: callbackUrl || '',
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
          name="domain"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-sm font-normal text-(length:--font-size-label)">
                {t('fields.google-apps.domain.label')}
              </FormLabel>
              <FormControl>
                <TextField
                  type="text"
                  placeholder={t('fields.google-apps.domain.placeholder')}
                  error={Boolean(fieldState.error)}
                  readOnly={readOnly}
                  {...field}
                />
              </FormControl>
              <FormMessage
                role="alert"
                className="text-sm text-left text-(length:--font-size-paragraph)"
              />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="client_id"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-sm font-normal text-(length:--font-size-label)">
                {t('fields.google-apps.client_id.label')}
              </FormLabel>
              <FormControl>
                <CopyableTextField
                  type="text"
                  placeholder={t('fields.google-apps.client_id.placeholder')}
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
                {t('fields.google-apps.client_id.helper_text')}
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
                {t('fields.google-apps.client_secret.label')}
              </FormLabel>
              <FormControl>
                <CopyableTextField
                  type="password"
                  placeholder={t('fields.google-apps.client_secret.placeholder')}
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
                {t('fields.google-apps.client_secret.helper_text')}
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
                {t('fields.google-apps.callback_url.label')}
              </FormLabel>
              <FormControl>
                <CopyableTextField
                  type="text"
                  placeholder={t('fields.google-apps.callback_url.placeholder')}
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
                {t('fields.google-apps.callback_url.helper_text')}
              </FormDescription>
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
});
