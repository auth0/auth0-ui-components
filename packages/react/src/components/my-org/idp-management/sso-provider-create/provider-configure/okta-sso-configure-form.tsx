import {
  createProviderConfigureSchema,
  type OktaConfigureFormValues,
} from '@auth0/universal-components-core';
import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import { useProviderFormMode } from '../../../../../hooks/my-org/idp-management/use-provider-form-mode';
import { useCoreClient } from '../../../../../hooks/use-core-client';
import { useTranslator } from '../../../../../hooks/use-translator';
import { cn } from '../../../../../lib/utils';
import type { ProviderConfigureFieldsProps } from '../../../../../types/my-org/idp-management/sso-provider/sso-provider-create-types';
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
import { Link } from '../../../../ui/link';
import { TextField } from '../../../../ui/text-field';

import { CommonConfigureFields } from './common-configure-fields';

const OKTA_HELP_LINKS = {
  domain: 'https://developer.okta.com/docs/guides/find-your-domain/main/',
  client_id: 'https://developer.okta.com/docs/guides/find-your-app-credentials/main',
  client_secret: 'https://developer.okta.com/docs/guides/find-your-app-credentials/main',
} as const;

export interface OktaConfigureFormHandle {
  validate: () => Promise<boolean>;
  getData: () => OktaConfigureFormValues;
  isDirty: () => boolean;
  reset: (data?: OktaConfigureFormValues) => void;
}

interface OktaConfigureFormProps extends Omit<ProviderConfigureFieldsProps, 'strategy'> {}

export const OktaProviderForm = React.forwardRef<OktaConfigureFormHandle, OktaConfigureFormProps>(
  function OktaProviderForm(
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
    const { t } = useTranslator(
      'idp_management.create_sso_provider.provider_configure',
      customMessages,
    );

    const { coreClient } = useCoreClient();
    const { showCopyButtons } = useProviderFormMode(mode);

    const callbackUrl = React.useMemo(() => {
      const domain = coreClient?.auth?.domain || 'YOUR_DOMAIN';
      return `https://${domain}/login/callback`;
    }, [coreClient?.auth?.domain]);

    const oktaData = initialData as OktaConfigureFormValues | undefined;

    const form = useForm<OktaConfigureFormValues>({
      resolver: zodResolver(createProviderConfigureSchema('okta')),
      mode: 'onSubmit',
      reValidateMode: 'onChange',
      defaultValues: {
        domain: oktaData?.domain || '',
        client_id: oktaData?.client_id || '',
        client_secret: oktaData?.client_secret || '',
        icon_url: oktaData?.icon_url || '',
        callback_url: oktaData?.callback_url || callbackUrl,
      },
    });

    const { isDirty } = form.formState;

    React.useEffect(() => {
      onFormDirty?.(isDirty);
    }, [isDirty, onFormDirty]);

    React.useImperativeHandle(ref, () => ({
      validate: async () => {
        return await form.trigger();
      },
      getData: () => form.getValues(),
      isDirty: () => form.formState.isDirty,
      reset: (data) => {
        if (data) {
          form.reset(data);
        } else {
          form.reset();
        }
      },
    }));

    return (
      <Form {...form}>
        <div className={cn('space-y-6', className)}>
          <FormField
            control={form.control}
            name="domain"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-(length:--font-size-label)">
                  {t('fields.okta.domain.label')}
                </FormLabel>
                <FormControl>
                  <TextField
                    type="text"
                    placeholder={t('fields.okta.domain.placeholder')}
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
                  <>
                    {t.trans('fields.okta.domain.helper_text', {
                      components: {
                        link: (children: string) => (
                          <Link
                            key="okta-domain-link"
                            href={OKTA_HELP_LINKS.domain}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {children}
                          </Link>
                        ),
                      },
                    })}
                  </>
                </FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="client_id"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-(length:--font-size-label)">
                  {t('fields.okta.client_id.label')}
                </FormLabel>
                <FormControl>
                  <CopyableTextField
                    type="text"
                    placeholder={t('fields.okta.client_id.placeholder')}
                    error={Boolean(fieldState.error)}
                    readOnly={readOnly}
                    showCopyButton={showCopyButtons}
                    {...field}
                  />
                </FormControl>
                <FormMessage
                  role="alert"
                  className="text-sm text-left text-(length:--font-size-paragraph)"
                />
                <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
                  <>
                    {t.trans('fields.okta.client_id.helper_text', {
                      components: {
                        link: (children: string) => (
                          <Link
                            key="okta-client-id-link"
                            href={OKTA_HELP_LINKS.client_id}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {children}
                          </Link>
                        ),
                      },
                    })}
                  </>
                </FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="client_secret"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-(length:--font-size-label)">
                  {t('fields.okta.client_secret.label')}
                </FormLabel>
                <FormControl>
                  <CopyableTextField
                    type="password"
                    placeholder={t('fields.okta.client_secret.placeholder')}
                    error={Boolean(fieldState.error)}
                    readOnly={readOnly}
                    showCopyButton={showCopyButtons}
                    {...field}
                  />
                </FormControl>
                <FormMessage
                  role="alert"
                  className="text-sm text-left text-(length:--font-size-paragraph)"
                />
                <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
                  <>
                    {t.trans('fields.okta.client_secret.helper_text', {
                      components: {
                        link: (children: string) => (
                          <Link
                            key="okta-client-secret-link"
                            href={OKTA_HELP_LINKS.client_secret}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {children}
                          </Link>
                        ),
                      },
                    })}
                  </>
                </FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="callback_url"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-(length:--font-size-label)">
                  {t('fields.okta.callback_url.label')}
                </FormLabel>
                <FormControl>
                  <CopyableTextField
                    type="text"
                    placeholder={t('fields.okta.callback_url.placeholder')}
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
                  {t('fields.okta.callback_url.helper_text')}
                </FormDescription>
              </FormItem>
            )}
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
