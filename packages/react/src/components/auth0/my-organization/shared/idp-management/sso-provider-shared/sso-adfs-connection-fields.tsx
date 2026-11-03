/**
 * ADFS connection source: metadata URL (with the metadata location), or a federation metadata file.
 * @module sso-adfs-connection-fields
 * @internal
 */

import { useFormContext } from 'react-hook-form';

import {
  SsoConnectionSourceSelector,
  type ConnectionSourceSelectorVariant,
} from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-connection-source-selector';
import { SsoFileField } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-file-field';
import { SsoUrlField } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-url-field';

export interface SsoAdfsConnectionFieldsProps {
  readOnly?: boolean;
  /** How the source is chosen: a radio group (advanced flow) or tabs (guided setup). */
  sourceSelector?: ConnectionSourceSelectorVariant;
  customMessages?: Partial<Record<string, unknown>>;
}

/**
 * Lets the administrator connect ADFS by metadata URL or by uploading the federation metadata
 * file. Reads and writes `meta_data_source`, `adfs_server`, `meta_data_location_url` and
 * `fedMetadataXml` in the surrounding form.
 * @param props - Component props.
 * @param props.readOnly - Disable editing.
 * @param props.sourceSelector - `radio` (default) or `tabs` (Automatic / Manual).
 * @param props.customMessages - Custom translation messages.
 * @returns JSX element
 */
export function SsoAdfsConnectionFields({
  readOnly = false,
  sourceSelector = 'radio',
  customMessages = {},
}: SsoAdfsConnectionFieldsProps) {
  const { watch } = useFormContext();
  const source = watch('meta_data_source');

  return (
    <>
      <SsoConnectionSourceSelector
        messageKey="fields.adfs.meta_data_source"
        variant={sourceSelector}
        readOnly={readOnly}
        customMessages={customMessages}
      />

      {source === 'meta_data_url' && (
        <>
          <SsoUrlField
            name="adfs_server"
            messageKey="fields.adfs.meta_data_url"
            required
            readOnly={readOnly}
            customMessages={customMessages}
          />
          <SsoUrlField
            name="meta_data_location_url"
            messageKey="fields.adfs.meta_data_location_url"
            copyable
            readOnly={readOnly}
            customMessages={customMessages}
          />
        </>
      )}

      {source === 'meta_data_file' && (
        <SsoFileField
          name="fedMetadataXml"
          messageKey="fields.adfs.federation_metadata_file"
          accept=".xml"
          readOnly={readOnly}
          customMessages={customMessages}
        />
      )}
    </>
  );
}
