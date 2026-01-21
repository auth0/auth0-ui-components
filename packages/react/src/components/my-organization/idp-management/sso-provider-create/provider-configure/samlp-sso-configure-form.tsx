import {
  createProviderConfigureSchema,
  type SamlpConfigureFormValues,
} from '@auth0/universal-components-core';
import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useTranslator } from '../../../../../hooks/use-translator';
import { cn } from '../../../../../lib/theme-utils';
import type { ProviderConfigureFieldsProps } from '../../../../../types/my-organization/idp-management/sso-provider/sso-provider-create-types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../../../ui/accordion';
import { Checkbox } from '../../../../ui/checkbox';
import { FileUpload } from '../../../../ui/file-upload';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '../../../../ui/form';
import { Label } from '../../../../ui/label';
import { Link } from '../../../../ui/link';
import { RadioGroup, RadioGroupItem } from '../../../../ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../ui/select';
import { TextField } from '../../../../ui/text-field';

import { CommonConfigureFields } from './common-configure-fields';

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
  { value: 'HTTP-Redirect', label: 'HTTP-Redirect' },
  { value: 'HTTP-POST', label: 'HTTP-POST' },
] as const;

export interface SamlpConfigureFormHandle {
  validate: () => Promise<boolean>;
  getData: () => SamlpConfigureFormValues;
  isDirty: () => boolean;
  reset: (data?: SamlpConfigureFormValues) => void;
}

interface SamlpConfigureFormProps extends Omit<ProviderConfigureFieldsProps, 'strategy'> {}

export const SamlpProviderForm = React.forwardRef<
  SamlpConfigureFormHandle,
  SamlpConfigureFormProps
>(function SamlpProviderForm(
  { initialData, readOnly = false, customMessages = {}, className, onFormDirty, idpConfig },
  ref,
) {
  const { t } = useTranslator(
    'idp_management.create_sso_provider.provider_configure',
    customMessages,
  );

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const samlpData = initialData as SamlpConfigureFormValues | undefined;

  const form = useForm<SamlpConfigureFormValues>({
    resolver: zodResolver(createProviderConfigureSchema('samlp')),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      meta_data_source: samlpData?.meta_data_source || 'meta_data_url',
      metadataUrl: samlpData?.metadataUrl || '',
      single_sign_on_login_url: samlpData?.single_sign_on_login_url || '',
      cert: samlpData?.cert || '',
      signSAMLRequest: samlpData?.signSAMLRequest || false,
      signatureAlgorithm: samlpData?.signatureAlgorithm || 'rsa-sha256',
      digestAlgorithm: samlpData?.digestAlgorithm || 'sha256',
      bindingMethod: samlpData?.bindingMethod || 'HTTP-POST',
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

  const typeValue = form.watch('meta_data_source');
  const showMetadataFileField = typeValue === 'meta_data_file';

  const signRequestEnabled = form.watch('signSAMLRequest');

  const handleFileUpload = async (files: File[]) => {
    setUploadedFiles(files);

    const file = files[0];
    if (file) {
      try {
        const content = await file.text();
        form.setValue('cert', content);
      } catch (error) {
        console.error('Error reading file:', error);
      }
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
              <FormLabel className="text-sm font-medium text-(length:--font-size-label)">
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
              <FormMessage
                role="alert"
                className="text-sm text-left text-(length:--font-size-paragraph)"
              />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="metadataUrl"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-(length:--font-size-label)">
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
              <FormMessage
                role="alert"
                className="text-sm text-left text-(length:--font-size-paragraph)"
              />
              <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
                {t('fields.samlp.meta_data_url.helper_text')}
              </FormDescription>
            </FormItem>
          )}
        />

        {showMetadataFileField && (
          <>
            <FormField
              control={form.control}
              name="single_sign_on_login_url"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-(length:--font-size-label)">
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
                  <FormMessage
                    role="alert"
                    className="text-sm text-left text-(length:--font-size-paragraph)"
                  />
                  <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
                    {t('fields.samlp.single_sign_on_login_url.helper_text')}
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cert"
              render={() => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-(length:--font-size-label)">
                    {t('fields.samlp.cert.label')}
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <FileUpload
                        accept=".pem"
                        onChange={handleFileUpload}
                        value={uploadedFiles}
                        maxFiles={1}
                        disabled={readOnly}
                        className="w-full"
                        placeholder={t('fields.samlp.cert.placeholder')}
                      />
                    </div>
                  </FormControl>
                  <FormMessage
                    role="alert"
                    className="text-sm text-left text-(length:--font-size-paragraph)"
                  />
                  <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
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
                      <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
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
                        <FormLabel className="text-sm font-medium text-(length:--font-size-label)">
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
                        <FormMessage
                          role="alert"
                          className="text-sm text-left text-(length:--font-size-paragraph)"
                        />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="digestAlgorithm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-(length:--font-size-label)">
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
                        <FormMessage
                          role="alert"
                          className="text-sm text-left text-(length:--font-size-paragraph)"
                        />
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
                    <FormLabel className="text-sm font-medium text-(length:--font-size-label)">
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
                    <FormMessage
                      role="alert"
                      className="text-sm text-left text-(length:--font-size-paragraph)"
                    />
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
      </div>
    </Form>
  );
});
