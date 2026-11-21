/**
 * SAML connection source: metadata URL, or sign-in URL plus signing certificate.
 * @module sso-saml-connection-fields
 * @internal
 */

import type { SamlpConfigureFormValues } from '@auth0/universal-components-core';
import { useFormContext } from 'react-hook-form';

import { FileUpload } from '@/components/ui/file-upload';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TextField } from '@/components/ui/text-field';
import { useFileContentField } from '@/hooks/my-organization/idp-management/sso-provider-shared/use-file-content-field';
import { useTranslator } from '@/hooks/shared/use-translator';
import {
  ALLOWED_CERT_EXTENSIONS,
  SAML_CONNECTION_SOURCES,
  SAML_CONNECTION_SOURCE_TAB_LABEL_KEYS,
} from '@/lib/constants/my-organization/idp-management/idp-management-constants';
import type {
  SamlConnectionSource,
  SsoSamlConnectionFieldsProps,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-shared-types';

/**
 * Lets the administrator connect the SAML identity provider either by metadata URL or manually
 * (sign-in URL and signing certificate). Reads and writes `meta_data_source`, `metadataUrl`,
 * `signInEndpoint` and `signingCert` in the surrounding form.
 * @param props - Component props.
 * @param props.readOnly - Disable editing.
 * @param props.sourceSelector - `radio` (default) or `tabs` (Automatic / Manual).
 * @param props.customMessages - Custom translation messages.
 * @returns JSX element
 */
export function SsoSamlConnectionFields({
  readOnly = false,
  sourceSelector = 'radio',
  customMessages = {},
}: SsoSamlConnectionFieldsProps) {
  const { t } = useTranslator(
    'idp_management.create_sso_provider.provider_configure',
    customMessages,
  );
  const { control, watch } = useFormContext<SamlpConfigureFormValues>();
  const certificate = useFileContentField<SamlpConfigureFormValues>('signingCert');

  const isManual = watch('meta_data_source') === 'meta_data_file';
  const sourceLabel = (source: SamlConnectionSource) =>
    t(`fields.samlp.meta_data_source.options.${source}.label`);

  return (
    <>
      <FormField
        control={control}
        name="meta_data_source"
        render={({ field }) =>
          sourceSelector === 'tabs' ? (
            <FormItem>
              <Tabs value={field.value} onValueChange={field.onChange}>
                <TabsList aria-label={t('fields.samlp.meta_data_source.label')}>
                  {SAML_CONNECTION_SOURCES.map((source) => (
                    <TabsTrigger key={source} value={source} disabled={readOnly}>
                      {t(SAML_CONNECTION_SOURCE_TAB_LABEL_KEYS[source])}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <FormMessage role="alert" className="text-left text-paragraph" />
            </FormItem>
          ) : (
            <FormItem>
              <FormLabel className="text-label font-medium">
                {t('fields.samlp.meta_data_source.label')}
              </FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={readOnly}
                  className="flex flex-col space-y-2"
                >
                  {SAML_CONNECTION_SOURCES.map((source) => (
                    <div key={source} className="flex items-center space-x-2">
                      <RadioGroupItem value={source} id={source} />
                      <Label htmlFor={source} className="text-sm font-normal cursor-pointer">
                        {sourceLabel(source)}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage role="alert" className="text-left text-paragraph" />
            </FormItem>
          )
        }
      />

      {!isManual && (
        <FormField
          control={control}
          name="metadataUrl"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-label font-medium">
                {t('fields.samlp.meta_data_url.label')}
              </FormLabel>
              <FormControl>
                <TextField
                  type="url"
                  placeholder={t('fields.samlp.meta_data_url.placeholder')}
                  error={Boolean(fieldState.error)}
                  readOnly={readOnly}
                  aria-required={true}
                  aria-invalid={Boolean(fieldState.error)}
                  {...field}
                />
              </FormControl>
              <FormMessage role="alert" className="text-left text-paragraph" />
              <FormDescription className="text-paragraph font-normal text-left">
                {t('fields.samlp.meta_data_url.helper_text')}
              </FormDescription>
            </FormItem>
          )}
        />
      )}

      {isManual && (
        <>
          <FormField
            control={control}
            name="signInEndpoint"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-label font-medium">
                  {t('fields.samlp.single_sign_on_login_url.label')}
                </FormLabel>
                <FormControl>
                  <TextField
                    type="url"
                    placeholder={t('fields.samlp.single_sign_on_login_url.placeholder')}
                    error={Boolean(fieldState.error)}
                    readOnly={readOnly}
                    aria-required={true}
                    aria-invalid={Boolean(fieldState.error)}
                    {...field}
                  />
                </FormControl>
                <FormMessage role="alert" className="text-left text-paragraph" />
                <FormDescription className="text-paragraph font-normal text-left">
                  {t('fields.samlp.single_sign_on_login_url.helper_text')}
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="signingCert"
            render={() => (
              <FormItem>
                <FormLabel className="text-label font-medium">
                  {t('fields.samlp.cert.label')}
                </FormLabel>
                <FormControl>
                  <div className="space-y-3">
                    <FileUpload
                      accept={ALLOWED_CERT_EXTENSIONS.join(',')}
                      onChange={certificate.onFilesChange}
                      value={certificate.files}
                      maxFiles={1}
                      disabled={readOnly}
                      className="w-full"
                      placeholder={t('fields.samlp.cert.placeholder')}
                    />
                  </div>
                </FormControl>
                <FormMessage role="alert" className="text-left text-paragraph" />
                <FormDescription className="text-paragraph font-normal text-left">
                  {t('fields.samlp.cert.helper_text')}
                </FormDescription>
              </FormItem>
            )}
          />
        </>
      )}
    </>
  );
}
