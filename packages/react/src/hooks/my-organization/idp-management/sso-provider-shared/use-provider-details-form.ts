/**
 * Provider details form hook.
 * Owns the details form: its schema, defaults and the domains selection.
 * @module use-provider-details-form
 */

import {
  createProviderDetailsSchema,
  DOMAIN_VERIFICATION_MODES,
  type ProviderDetailsFormValues,
} from '@auth0/universal-components-core';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { useTranslator } from '@/hooks/shared/use-translator';
import { FORM_REVALIDATE_MODE, FORM_VALIDATION_MODE } from '@/lib/constants/form-constants';
import type {
  UseProviderDetailsFormOptions,
  UseProviderDetailsFormReturn,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';

/**
 * Hook for the provider details form state and the domains selection.
 * @param options - Hook options.
 * @param options.initialData - Values the form starts with.
 * @param options.domains - The domains field, or null when it is not offered.
 * @param options.customMessages - Custom translation messages.
 * @returns The form, the domains the field offers, and derived flags.
 */
export function useProviderDetailsForm({
  initialData,
  domains = null,
  customMessages = {},
}: UseProviderDetailsFormOptions): UseProviderDetailsFormReturn {
  const { t } = useTranslator(
    'idp_management.create_sso_provider.provider_details',
    customMessages,
  );

  const hasDomainsField = domains !== null;
  const isDomainsRequired = domains?.mode === DOMAIN_VERIFICATION_MODES.REQUIRED;
  const isDomainsLoading = domains?.isLoading ?? false;
  const domainsError = t('fields.domains.error');

  const schema = useMemo(
    () =>
      createProviderDetailsSchema({
        domains: { required: isDomainsRequired, errorMessage: domainsError },
      }),
    [isDomainsRequired, domainsError],
  );

  const form = useForm<ProviderDetailsFormValues>({
    resolver: zodResolver(schema),
    mode: FORM_VALIDATION_MODE,
    reValidateMode: FORM_REVALIDATE_MODE,
    defaultValues: {
      name: initialData?.name || '',
      display_name: initialData?.display_name || '',
      ...(hasDomainsField ? { domains: initialData?.domains ?? [] } : {}),
    },
  });

  const domainNames = useMemo(
    () => (domains?.options ?? []).map(({ domain }) => domain),
    [domains?.options],
  );

  useEffect(() => {
    if (hasDomainsField && form.getValues('domains') === undefined) {
      form.setValue('domains', []);
    }
  }, [hasDomainsField, form]);

  useEffect(() => {
    const selected = form.getValues('domains');
    if (!selected?.length || isDomainsLoading) return;
    const available = selected.filter((name) => domainNames.includes(name));
    if (available.length !== selected.length) {
      form.setValue('domains', available, { shouldDirty: true });
    }
  }, [domainNames, isDomainsLoading, form]);

  const getData = useCallback((): ProviderDetailsFormValues => {
    const { domains: selected, ...details } = form.getValues();
    return hasDomainsField ? { ...details, domains: selected ?? [] } : details;
  }, [form, hasDomainsField]);

  const showNoVerifiedDomainsAlert =
    isDomainsRequired && Boolean(domains?.canList) && !isDomainsLoading && domainNames.length === 0;

  return { form, domainNames, isDomainsRequired, showNoVerifiedDomainsAlert, getData };
}
