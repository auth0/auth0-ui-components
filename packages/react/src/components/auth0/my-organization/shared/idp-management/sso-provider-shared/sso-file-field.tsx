/**
 * File upload whose text content is stored in a form field (certificate, metadata file).
 * @module sso-file-field
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
import { useFileContentField } from '@/hooks/my-organization/use-file-content-field';
import { useTranslator } from '@/hooks/shared/use-translator';

export interface SsoFileFieldProps {
  /** Form field that receives the file content. */
  name: string;
  /** Message key prefix with `label`, `placeholder` and `helper_text`. */
  messageKey: string;
  /** Accepted file extensions, comma separated (e.g. `.pem,.cer`). */
  accept: string;
  readOnly?: boolean;
  /** Message key shown when a dropped file does not match `accept`. Off when omitted. */
  invalidFileMessageKey?: string;
  customMessages?: Partial<Record<string, unknown>>;
}

/**
 * Single-file upload for connection settings.
 * @param props - Component props.
 * @param props.name - Form field name.
 * @param props.messageKey - Message key prefix.
 * @param props.accept - Accepted extensions.
 * @param props.readOnly - Disable the upload.
 * @param props.invalidFileMessageKey - Error message key for rejected files.
 * @param props.customMessages - Custom translation messages.
 * @returns JSX element
 */
export function SsoFileField({
  name,
  messageKey,
  accept,
  readOnly = false,
  invalidFileMessageKey,
  customMessages = {},
}: SsoFileFieldProps) {
  const { t } = useTranslator(
    'idp_management.create_sso_provider.provider_configure',
    customMessages,
  );
  const { control, setError } = useFormContext();
  const { files, onFilesChange } = useFileContentField(name);

  const extensions = accept.split(',').map((extension) => extension.trim().toLowerCase());
  const onInvalidFiles = invalidFileMessageKey
    ? (rejected: File[]) => {
        const hasWrongType = rejected.some(
          (file) => !extensions.some((extension) => file.name.toLowerCase().endsWith(extension)),
        );
        if (hasWrongType) {
          setError(name, { type: 'manual', message: t(invalidFileMessageKey) });
        }
      }
    : undefined;

  return (
    <FormField
      control={control}
      name={name}
      render={() => (
        <FormItem>
          <FormLabel className="text-label font-medium">{t(`${messageKey}.label`)}</FormLabel>
          <FormControl>
            <div className="space-y-3">
              <FileUpload
                accept={accept}
                onChange={onFilesChange}
                onInvalidFiles={onInvalidFiles}
                value={files}
                maxFiles={1}
                disabled={readOnly}
                className="w-full"
                placeholder={t(`${messageKey}.placeholder`)}
              />
            </div>
          </FormControl>
          <FormMessage role="alert" className="text-left text-paragraph" />
          <FormDescription className="text-paragraph font-normal text-left">
            {t(`${messageKey}.helper_text`)}
          </FormDescription>
        </FormItem>
      )}
    />
  );
}
