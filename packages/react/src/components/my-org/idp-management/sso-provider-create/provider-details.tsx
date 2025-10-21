import {
  createProviderDetailsSchema,
  type ProviderDetailsFormValues,
} from '@auth0-web-ui-components/core';
import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import { useTranslator } from '../../../../hooks/use-translator';
import type { ProviderDetailsProps } from '../../../../types';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../ui/form';
import { Section } from '../../../ui/section';
import { TextField } from '../../../ui/text-field';

export interface ProviderDetailsFormHandle {
  validate: () => Promise<boolean>;
  getData: () => ProviderDetailsFormValues;
}

export const ProviderDetails = React.forwardRef<ProviderDetailsFormHandle, ProviderDetailsProps>(
  function ProviderDetails({ initialData, readOnly = false, customMessages = {}, className }, ref) {
    const { t } = useTranslator(
      'idp_management.create_sso_provider.provider_details',
      customMessages,
    );

    const form = useForm<ProviderDetailsFormValues>({
      resolver: zodResolver(createProviderDetailsSchema()),
      mode: 'onSubmit',
      reValidateMode: 'onChange',
      defaultValues: {
        name: initialData?.name || '',
        display_name: initialData?.display_name || '',
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
        <div className={className}>
          <Section title={t('title')} description={t('description')}>
            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-sm text-(length:--font-size-label) font-normal">
                    {t('fields.name.label')}
                  </FormLabel>
                  <FormControl>
                    <TextField
                      placeholder={t('fields.name.placeholder')}
                      error={Boolean(fieldState.error)}
                      readOnly={readOnly}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage
                    className="text-left text-sm text-(length:--font-size-paragraph)"
                    role="alert"
                  />
                  <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
                    {t('fields.name.helper_text')}
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="display_name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-sm text-(length:--font-size-label) font-normal">
                    {t('fields.display_name.label')}
                  </FormLabel>
                  <FormControl>
                    <TextField
                      placeholder={t('fields.display_name.placeholder')}
                      error={Boolean(fieldState.error)}
                      readOnly={readOnly}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage
                    className="text-left text-sm text-(length:--font-size-paragraph)"
                    role="alert"
                  />
                  <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
                    {t('fields.display_name.helper_text')}
                  </FormDescription>
                </FormItem>
              )}
            />
          </Section>
        </div>
      </Form>
    );
  },
);
