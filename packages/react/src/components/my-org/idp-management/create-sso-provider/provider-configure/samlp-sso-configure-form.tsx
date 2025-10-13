import type {
  SharedComponentProps,
  ProviderConfigureFormValues,
  ProviderConfigureFieldsMessages,
} from '@auth0-web-ui-components/core';
import type { ReactNode } from 'react';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { FileUpload } from '@/components/ui/file-upload';
import {
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
import { useTranslator } from '@/hooks';
import { cn } from '@/lib/theme-utils';

interface SamlpConfigureFormProps extends SharedComponentProps<ProviderConfigureFieldsMessages> {
  form: UseFormReturn<ProviderConfigureFormValues>;
  className?: string;
}

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

function SamlpProviderForm({
  form,
  readOnly = false,
  customMessages = {},
  className,
}: SamlpConfigureFormProps) {
  const { t } = useTranslator(
    'idp_management.create_sso_provider.provider_configure',
    customMessages,
  );

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const typeValue = form.watch('meta_data_source');
  const showMetadataFileField = typeValue === 'meta_data_file';

  const signRequestEnabled = form.watch('signSAMLRequest');

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

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(files);
    if (files.length > 0) {
      form.setValue('cert', files[0].name);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      <FormField
        control={form.control}
        name="meta_data_source"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-normal text-(length:--font-size-label)">
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
            <FormMessage role="alert" className="text-(length:--font-size-paragraph)" />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="metadataUrl"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="text-sm font-normal text-(length:--font-size-label)">
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
            <FormMessage role="alert" className="text-(length:--font-size-paragraph)" />
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
                <FormLabel className="text-sm font-normal text-(length:--font-size-label)">
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
                <FormMessage role="alert" className="text-(length:--font-size-paragraph)" />
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
                <FormLabel className="text-sm font-normal text-(length:--font-size-label)">
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
                <FormMessage role="alert" className="text-(length:--font-size-paragraph)" />
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
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                      disabled={readOnly}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-normal cursor-pointer">
                      {t('fields.samlp.advanced_settings.sign_request.label')}
                    </FormLabel>
                    <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
                      {renderHelperText(
                        'fields.samlp.advanced_settings.sign_request.helper_text',
                        SAMLP_HELP_LINKS.sign_request,
                      )}
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
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-normal">
                        {t('fields.samlp.advanced_settings.sign_request_algorithm.label')}
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger error={Boolean(fieldState.error)}>
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
                      <FormMessage role="alert" className="text-(length:--font-size-paragraph)" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="digestAlgorithm"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-normal">
                        {t('fields.samlp.advanced_settings.sign_request_algorithm_digest.label')}
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger error={Boolean(fieldState.error)}>
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
                      <FormMessage role="alert" className="text-(length:--font-size-paragraph)" />
                    </FormItem>
                  )}
                />
              </>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export default SamlpProviderForm;
