/**
 * SAML-P SSO provider configuration form.
 * @module samlp-sso-configure-form
 * @internal
 */

import {
  createProviderConfigureSchema,
  type SamlpConfigureFormValues,
  type SamlpConfigureFormInput,
} from '@auth0/universal-components-core';
import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { CommonConfigureFields } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/common-configure-fields';
import { SsoCrossAppAccessSection } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-cross-app-access-section';
import { SsoThirdPartyAccessSection } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-third-party-access-section';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { FileUpload } from '@/components/ui/file-upload';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Link } from '@/components/ui/link';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TextField } from '@/components/ui/text-field';
import { useTranslator } from '@/hooks/shared/use-translator';
import { FORM_REVALIDATE_MODE, FORM_VALIDATION_MODE } from '@/lib/constants/form-constants';
import { ALLOWED_CERT_EXTENSIONS } from '@/lib/constants/my-organization/idp-management/idp-management-constants';
import { cn } from '@/lib/utils';
import type { ProviderConfigureFieldsProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';

const SAMLP_HELP_LINKS = {
  sign_request: 'domain/pem?cert=connection',
} as const;

const SIGNATURE_ALGORITHMS = [
  { value: 'rsa-sha1', label: 'RSA-SHA1' },
  { value: 'rsa-sha256', label: 'RSA-SHA256' },
] as const;

const DIGEST_ALGORITHMS = [
  { value: 'sha1', label: 'SHA1' },
  { value: 'sha256', label: 'SHA256' },
] as const;

const BINDING_METHODS = [
  { value: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect', label: 'HTTP-Redirect' },
  { value: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST', label: 'HTTP-POST' },
] as const;

export interface SamlpConfigureFormHandle {
  validate: () => Promise<boolean>;
  getData: () => SamlpConfigureFormValues;
  isDirty: () => boolean;
  reset: (data?: SamlpConfigureFormValues) => void;
}

interface SamlpConfigureFormProps extends Omit<ProviderConfigureFieldsProps, 'strategy'> {
  showCrossAppAccess?: boolean;
  isCrossAppAccessReadOnly?: boolean;
}

export const SamlpProviderForm = React.forwardRef<
  SamlpConfigureFormHandle,
  SamlpConfigureFormProps
>(function SamlpProviderForm(
  {
    initialData,
    readOnly = false,
    customMessages = {},
    className,
    onFormDirty,
    idpConfig,
    showThirdPartyAccess = false,
    showCrossAppAccess = false,
    isCrossAppAccessReadOnly = false,
    isOrganizationBlocked = false,
    styling,
  },
  ref,
) {
  const { t } = useTranslator(
    'idp_management.create_sso_provider.provider_configure',
    customMessages,
  );

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const samlpData = initialData as SamlpConfigureFormInput | undefined;
  const hasSignInEndpoint = Boolean(samlpData?.signInEndpoint);
  const defaultMetaDataSource =
    samlpData?.meta_data_source ?? (hasSignInEndpoint ? 'meta_data_file' : 'meta_data_url');

  const form = useForm<SamlpConfigureFormValues>({
    resolver: zodResolver(createProviderConfigureSchema('samlp')),
    mode: FORM_VALIDATION_MODE,
    reValidateMode: FORM_REVALIDATE_MODE,
    defaultValues: {
      meta_data_source: defaultMetaDataSource,
      metadataUrl: samlpData?.metadataUrl || '',
      signInEndpoint: samlpData?.signInEndpoint || '',
      signingCert: samlpData?.signingCert || '',
      signSAMLRequest: samlpData?.signSAMLRequest || false,
      signatureAlgorithm: samlpData?.signatureAlgorithm || 'rsa-sha256',
      digestAlgorithm: samlpData?.digestAlgorithm || 'sha256',
      bindingMethod: samlpData?.bindingMethod || 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
      show_as_button: samlpData?.show_as_button ?? false,
      assign_membership_on_login: samlpData?.assign_membership_on_login ?? false,
      use_for_third_party_client_access: samlpData?.use_for_third_party_client_access ?? false,
      cross_app_access_resource_app: samlpData?.cross_app_access_resource_app ?? undefined,
      discovery_url: samlpData?.discovery_url ?? '',
    },
  });

  const discoveryUrlValue = form.watch('discovery_url') ?? '';

  const { isDirty } = form.formState;

  React.useEffect(() => {
    onFormDirty?.(isDirty);
  }, [isDirty, onFormDirty]);

  React.useImperativeHandle(ref, () => ({
    validate: async () => {
      return await form.trigger();
    },
    getData: () => {
      const rawData = form.getValues();
      const schema = createProviderConfigureSchema('samlp');
      const result = schema.safeParse(rawData);
      return result.success ? result.data : rawData;
    },
    isDirty: () => form.formState.isDirty,
    reset: (data) => {
      if (data) {
        form.reset(data);
      } else {
        form.reset();
      }
    },
  }));

  const typeValue = form.watch('meta_data_source');
  const showMetadataFileField = typeValue === 'meta_data_file';

  const signRequestEnabled = form.watch('signSAMLRequest');

  const handleFileUpload = async (files: File[]) => {
    setUploadedFiles(files);

    const file = files[0];
    if (file) {
      try {
        const content = await file.text();
        form.setValue('signingCert', content, { shouldDirty: true, shouldValidate: true });
      } catch (error) {
        console.error('Error reading file:', error);
      }
    } else {
      form.setValue('signingCert', '', { shouldDirty: true, shouldValidate: true });
    }
  };

  return (
    <Form {...form}>
      <div className={cn('space-y-6', className)}>
        <FormField
          control={form.control}
          name="meta_data_source"
          render={({ field }) => (
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
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="meta_data_url" id="meta_data_url" />
                    <Label htmlFor="meta_data_url" className="text-sm font-normal cursor-pointer">
                      {t('fields.samlp.meta_data_source.options.meta_data_url.label')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="meta_data_file" id="meta_data_file" />
                    <Label htmlFor="meta_data_file" className="text-sm font-normal cursor-pointer">
                      {t('fields.samlp.meta_data_source.options.meta_data_file.label')}
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage role="alert" className="text-left text-paragraph" />
            </FormItem>
          )}
        />

        {!showMetadataFileField && (
          <FormField
            control={form.control}
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

        {showMetadataFileField && (
          <>
            <FormField
              control={form.control}
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
              control={form.control}
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
                        onChange={handleFileUpload}
                        value={uploadedFiles}
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

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="advanced-settings">
            <AccordionTrigger className="text-sm font-medium">
              {t('fields.samlp.advanced_settings.title')}
            </AccordionTrigger>
            <AccordionContent className="space-y-6">
              <FormField
                control={form.control}
                name="signSAMLRequest"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                        disabled={readOnly}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium cursor-pointer">
                        {t('fields.samlp.advanced_settings.sign_request.label')}
                      </FormLabel>
                      <FormDescription className="text-paragraph font-normal text-left">
                        <>
                          {t.trans(
                            typeValue === 'meta_data_url'
                              ? 'fields.samlp.advanced_settings.sign_request.helper_text_metadata_url'
                              : 'fields.samlp.advanced_settings.sign_request.helper_text_metadata_file',
                            {
                              components: {
                                link: (children: string) => (
                                  <Link
                                    key="samlp-sign-request-link"
                                    href={SAMLP_HELP_LINKS.sign_request}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {children}
                                  </Link>
                                ),
                              },
                            },
                          )}
                        </>
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {signRequestEnabled && (
                <>
                  <FormField
                    control={form.control}
                    name="signatureAlgorithm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-label font-medium">
                          {t('fields.samlp.advanced_settings.sign_request_algorithm.label')}
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t(
                                  'fields.samlp.advanced_settings.sign_request_algorithm.placeholder',
                                )}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SIGNATURE_ALGORITHMS.map((algorithm) => (
                              <SelectItem key={algorithm.value} value={algorithm.value}>
                                {algorithm.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage role="alert" className="text-left text-paragraph" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="digestAlgorithm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-label font-medium">
                          {t('fields.samlp.advanced_settings.sign_request_algorithm_digest.label')}
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t(
                                  'fields.samlp.advanced_settings.sign_request_algorithm_digest.placeholder',
                                )}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DIGEST_ALGORITHMS.map((algorithm) => (
                              <SelectItem key={algorithm.value} value={algorithm.value}>
                                {algorithm.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage role="alert" className="text-left text-paragraph" />
                      </FormItem>
                    )}
                  />
                </>
              )}
              <FormField
                control={form.control}
                name="bindingMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-label font-medium">
                      {t('fields.samlp.advanced_settings.request_protocol_binding.label')}
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t(
                              'fields.samlp.advanced_settings.request_protocol_binding.placeholder',
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BINDING_METHODS.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage role="alert" className="text-left text-paragraph" />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <CommonConfigureFields
          idpConfig={idpConfig}
          readOnly={readOnly}
          customMessages={customMessages}
        />

        {showThirdPartyAccess && (
          <FormField
            control={form.control}
            name="use_for_third_party_client_access"
            render={({ field }) => (
              <SsoThirdPartyAccessSection
                checked={field.value ?? false}
                onChange={field.onChange}
                readOnly={readOnly}
                isOrganizationBlocked={isOrganizationBlocked}
                className={styling?.classes?.['ProviderConfigure-ThirdPartyAccess']}
              />
            )}
          />
        )}

        {showCrossAppAccess && (
          <FormField
            control={form.control}
            name="cross_app_access_resource_app"
            render={({ field }) => (
              <SsoCrossAppAccessSection
                checked={field.value?.status === 'enabled'}
                onChange={(checked) =>
                  field.onChange(checked ? { status: 'enabled' } : { status: 'disabled' })
                }
                readOnly={readOnly || isCrossAppAccessReadOnly}
                strategy="samlp"
                discoveryUrl={discoveryUrlValue}
                onDiscoveryUrlChange={(url) =>
                  form.setValue('discovery_url', url, { shouldDirty: true, shouldValidate: true })
                }
                discoveryUrlError={form.formState.errors.discovery_url?.message}
                className={styling?.classes?.['ProviderConfigure-CrossAppAccess']}
              />
            )}
          />
        )}
      </div>
    </Form>
  );
});
