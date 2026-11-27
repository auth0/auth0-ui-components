/**
 * SSO provider details form step.
 * @module provider-details
 * @internal
 */

import { Info } from 'lucide-react';
import * as React from 'react';

import { Section } from '@/components/auth0/shared/section';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Link } from '@/components/ui/link';
import { TextField } from '@/components/ui/text-field';
import { useProviderDetailsForm } from '@/hooks/my-organization/idp-management/sso-provider-shared/use-provider-details-form';
import { useTranslator } from '@/hooks/shared/use-translator';
import { CONFIGURE_ORG_DOMAINS_DOCS_URL } from '@/lib/constants/my-organization/idp-management/idp-management-constants';
import type {
  ProviderDetailsFormHandle,
  ProviderDetailsProps,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';

export const ProviderDetails = React.forwardRef<ProviderDetailsFormHandle, ProviderDetailsProps>(
  function ProviderDetails(
    {
      initialData,
      mode,
      domains: domainsField = null,
      readOnly = false,
      customMessages = {},
      className,
      onFormDirty,
    },
    ref,
  ) {
    const { t } = useTranslator(
      'idp_management.create_sso_provider.provider_details',
      customMessages,
    );

    const { form, domainNames, isDomainsRequired, showNoVerifiedDomainsAlert, getData } =
      useProviderDetailsForm({ initialData, domains: domainsField, customMessages });

    const { isDirty } = form.formState;

    const domainOptions = React.useMemo<ComboboxOption[]>(
      () => domainNames.map((name) => ({ value: name, label: name })),
      [domainNames],
    );

    const docsLink = (children: string) => (
      <Link
        key="domains-docs-link"
        href={CONFIGURE_ORG_DOMAINS_DOCS_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </Link>
    );

    React.useEffect(() => {
      onFormDirty?.(isDirty);
    }, [isDirty, onFormDirty]);

    React.useImperativeHandle(ref, () => ({
      validate: async () => {
        return await form.trigger();
      },
      getData,
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
        <div className={className}>
          <Section title={t('title')} description={t('description')}>
            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-label font-medium">{t('fields.name.label')}</FormLabel>
                  <FormControl>
                    <TextField
                      placeholder={t('fields.name.placeholder')}
                      error={Boolean(fieldState.error)}
                      readOnly={mode === 'edit' ? true : readOnly}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-left text-paragraph" role="alert" />
                  <FormDescription className="text-paragraph font-normal text-left">
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
                  <FormLabel className="text-label font-medium">
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
                  <FormMessage className="text-left text-paragraph" role="alert" />
                  <FormDescription className="text-paragraph font-normal text-left">
                    {t('fields.display_name.helper_text')}
                  </FormDescription>
                </FormItem>
              )}
            />
            {domainsField && (
              <FormField
                control={form.control}
                name="domains"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-label font-medium">
                      {isDomainsRequired
                        ? t('fields.domains.label')
                        : t('fields.domains.label_optional')}
                    </FormLabel>
                    <FormControl>
                      <Combobox
                        multiple
                        value={field.value ?? []}
                        onChange={(next) => field.onChange(Array.isArray(next) ? next : [next])}
                        options={domainOptions}
                        placeholder={t('fields.domains.placeholder')}
                        noOptionsMessage={t('fields.domains.empty_message')}
                        loading={domainsField.isLoading}
                        disabled={readOnly || !domainsField.canList}
                      />
                    </FormControl>
                    <FormDescription className="text-paragraph font-normal text-left">
                      {t('fields.domains.helper_text')}
                    </FormDescription>
                    <p className="text-paragraph font-normal text-left text-muted-foreground">
                      <>
                        {t.trans('fields.domains.learn_more', { components: { link: docsLink } })}
                      </>
                    </p>
                    {!domainsField.canList && (
                      <p className="text-paragraph font-normal text-left text-muted-foreground">
                        {t('fields.domains.no_permission')}
                      </p>
                    )}
                    <FormMessage className="text-left text-paragraph" role="alert" />
                  </FormItem>
                )}
              />
            )}

            {showNoVerifiedDomainsAlert && (
              <Alert variant="warning">
                <Info />
                <AlertDescription className="text-warning-foreground">
                  <strong>{t('alerts.no_verified_domains.title')}</strong>{' '}
                  <>
                    {t.trans('alerts.no_verified_domains.description', {
                      components: { link: docsLink },
                    })}
                  </>
                </AlertDescription>
              </Alert>
            )}
          </Section>
        </div>
      </Form>
    );
  },
);
