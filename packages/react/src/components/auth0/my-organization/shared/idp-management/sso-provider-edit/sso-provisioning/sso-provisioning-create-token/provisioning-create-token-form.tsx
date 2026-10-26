/**
 * SCIM token create form fields (step 1 of the create-token modal).
 * @module provisioning-create-token-form
 * @internal
 */

import { SCIM_TOKEN_MIN_LIFETIME_SECONDS } from '@auth0/universal-components-core';
import * as React from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { TextField } from '@/components/ui/text-field';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { ProvisioningCreateTokenFormProps } from '@/types/my-organization/idp-management/sso-provisioning/provisioning-token-types';

/**
 * @param props - Component props.
 * @param props.form - react-hook-form instance owned by the modal
 * @param props.rules - Form rules from the Connection Profile
 * @param props.customMessages - Custom translation messages to override defaults
 * @returns JSX element
 */
export function ProvisioningCreateTokenForm({
  form,
  rules,
  customMessages = {},
}: ProvisioningCreateTokenFormProps): React.JSX.Element {
  const { t } = useTranslator(
    'idp_management.edit_sso_provider.tabs.provisioning.content.details.manage_tokens.create_modal.fields',
    customMessages,
  );

  const noExpiration = form.watch('noExpiration');

  return (
    <div className="space-y-6 text-left">
      <FormField
        control={form.control}
        name="noExpiration"
        render={({ field }) => (
          <FormItem className="flex items-start gap-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
            </FormControl>
            <div className="space-y-1">
              <FormLabel className="text-label font-medium">{t('no_expiration.label')}</FormLabel>
              <FormDescription className="text-paragraph font-normal text-left">
                {t('no_expiration.helper_text')}
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      {!noExpiration && (
        <FormField
          control={form.control}
          name="tokenLifetime"
          render={({ field, fieldState }) => (
            <FormItem className="pl-8">
              <FormLabel className="text-label font-medium">{t('token_lifetime.label')}</FormLabel>
              <FormControl>
                <TextField
                  inputMode="numeric"
                  error={Boolean(fieldState.error)}
                  endAdornment={
                    <span className="pr-2 text-sm text-muted-foreground">
                      {t('token_lifetime.suffix')}
                    </span>
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-left text-paragraph" role="alert" />
              <FormDescription className="text-paragraph font-normal text-left">
                {rules.defaultExpiry !== null && (
                  <span className="block">
                    {t('token_lifetime.helper_default', { seconds: String(rules.defaultExpiry) })}
                  </span>
                )}
                {rules.maxAllowedExpiry !== null && (
                  <span className="block">
                    {t('token_lifetime.helper_max', { seconds: String(rules.maxAllowedExpiry) })}
                  </span>
                )}
                <span className="block">
                  {t('token_lifetime.helper_min', {
                    seconds: String(SCIM_TOKEN_MIN_LIFETIME_SECONDS),
                  })}
                </span>
              </FormDescription>
            </FormItem>
          )}
        />
      )}

      <Separator />

      <FormField
        control={form.control}
        name="scopes"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel className="text-label font-medium">{t('scopes.label')}</FormLabel>
            <div className="grid grid-cols-2 gap-3">
              {rules.allowedScopes.map((scope) => {
                const id = `scim-token-scope-${scope.replace(':', '-')}`;
                const checked = field.value.includes(scope);
                return (
                  <div key={scope} className="flex items-center gap-2">
                    <Checkbox
                      id={id}
                      checked={checked}
                      onCheckedChange={(next) =>
                        field.onChange(
                          next === true
                            ? [...field.value, scope]
                            : field.value.filter((value) => value !== scope),
                        )
                      }
                    />
                    <Label htmlFor={id} className="text-sm font-normal">
                      {scope}
                    </Label>
                  </div>
                );
              })}
            </div>
            <FormMessage className="text-left text-paragraph" role="alert" />
            <FormDescription className="text-paragraph font-normal text-left">
              {t('scopes.helper_text')}
            </FormDescription>
          </FormItem>
        )}
      />
    </div>
  );
}
