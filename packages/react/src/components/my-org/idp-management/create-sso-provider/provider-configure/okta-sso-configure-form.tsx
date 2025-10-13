import type {
  SharedComponentProps,
  ProviderConfigureFormValues,
  ProviderConfigureFieldsMessages,
} from '@auth0-web-ui-components/core';
import type { ReactNode } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { CopyableTextField } from '@/components/ui/copyable-text-field';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Link } from '@/components/ui/link';
import { TextField } from '@/components/ui/text-field';
import { useTranslator } from '@/hooks';
import { cn } from '@/lib/theme-utils';

const OKTA_HELP_LINKS = {
  domain: 'https://developer.okta.com/docs/guides/find-your-domain/main/',
  client_id: 'https://developer.okta.com/docs/guides/find-your-app-credentials/main',
  client_secret: 'https://developer.okta.com/docs/guides/find-your-app-credentials/main',
} as const;

interface OktaConfigureFormProps extends SharedComponentProps<ProviderConfigureFieldsMessages> {
  form: UseFormReturn<ProviderConfigureFormValues>;
  className?: string;
}

function OktaProviderForm({
  form,
  readOnly,
  customMessages = {},
  className,
}: OktaConfigureFormProps) {
  const { t } = useTranslator(
    'idp_management.create_sso_provider.provider_configure',
    customMessages,
  );

  const renderHelperText = (translationKey: string, linkHref?: string): ReactNode => {
    if (!linkHref) {
      return t(translationKey);
    }

    const transResult = t.trans(translationKey, {
      components: {
        link: (children: string) => (
          <Link href={linkHref} target="_blank" rel="noopener noreferrer">
            {children}
          </Link>
        ),
      },
    });

    return Array.isArray(transResult) ? <>{transResult}</> : transResult;
  };

  return (
    <div className={cn('space-y-6', className)}>
      <FormField
        control={form.control}
        name="domain"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="text-sm font-normal text-(length:--font-size-label)">
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
            <FormMessage role="alert" className="text-(length:--font-size-paragraph)" />
            <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
              {renderHelperText('fields.okta.domain.helper_text', OKTA_HELP_LINKS.domain)}
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
              {t('fields.okta.client_id.label')}
            </FormLabel>
            <FormControl>
              <CopyableTextField
                type="text"
                placeholder={t('fields.okta.client_id.placeholder')}
                error={Boolean(fieldState.error)}
                readOnly={readOnly}
                {...field}
              />
            </FormControl>
            <FormMessage role="alert" className="text-(length:--font-size-paragraph)" />
            <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
              {renderHelperText('fields.okta.client_id.helper_text', OKTA_HELP_LINKS.client_id)}
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
              {t('fields.okta.client_secret.label')}
            </FormLabel>
            <FormControl>
              <CopyableTextField
                type="password"
                placeholder={t('fields.okta.client_secret.placeholder')}
                error={Boolean(fieldState.error)}
                readOnly={readOnly}
                {...field}
              />
            </FormControl>
            <FormMessage role="alert" className="text-(length:--font-size-paragraph)" />
            <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
              {renderHelperText(
                'fields.okta.client_secret.helper_text',
                OKTA_HELP_LINKS.client_secret,
              )}
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
            <FormMessage role="alert" className="text-(length:--font-size-paragraph)" />
            <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
              {t('fields.okta.callback_url.helper_text')}
            </FormDescription>
          </FormItem>
        )}
      />
    </div>
  );
}

export default OktaProviderForm;
