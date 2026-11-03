/**
 * SAML connection source: metadata URL, or sign-in URL plus signing certificate.
 * @module sso-saml-connection-fields
 * @internal
 */

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
import { useFileContentField } from '@/hooks/my-organization/use-file-content-field';
import { useTranslator } from '@/hooks/shared/use-translator';
import { ALLOWED_CERT_EXTENSIONS } from '@/lib/constants/my-organization/idp-management/idp-management-constants';

export type SamlConnectionSource = 'meta_data_url' | 'meta_data_file';

export interface SsoSamlConnectionFieldsProps {
  readOnly?: boolean;
  /** How the source is chosen: a radio group (advanced flow) or tabs (guided setup). */
  sourceSelector?: 'radio' | 'tabs';
  customMessages?: Partial<Record<string, unknown>>;
}

const SOURCES: readonly SamlConnectionSource[] = ['meta_data_url', 'meta_data_file'];

/** Tab labels follow the guided setup wording: automatic (metadata URL) or manual entry. */
const TAB_LABEL_KEYS: Record<SamlConnectionSource, string> = {
  meta_data_url: 'fields.common.connection_method.automatic',
  meta_data_file: 'fields.common.connection_method.manual',
};

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
  const { control, watch } = useFormContext();
  const certificate = useFileContentField('signingCert');

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
                  {SOURCES.map((source) => (
                    <TabsTrigger key={source} value={source} disabled={readOnly}>
                      {t(TAB_LABEL_KEYS[source])}
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
                  {SOURCES.map((source) => (
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
