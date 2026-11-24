/**
 * ADFS connection source: metadata URL (with the metadata location), or a federation metadata file.
 * @module sso-adfs-connection-fields
 * @internal
 */

import type { AdfsConfigureFormValues } from '@auth0/universal-components-core';

import { SsoConnectionSourceSelector } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-connection-source-selector';
import { SsoFileField } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-file-field';
import { SsoUrlField } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-url-field';
import { useFileContentField } from '@/hooks/my-organization/idp-management/sso-provider-shared/use-file-content-field';
import type { SsoAdfsConnectionFieldsProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-shared-types';

/**
 * Connects ADFS by metadata URL or by uploading the federation metadata file.
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
  const federationMetadata = useFileContentField<AdfsConfigureFormValues>('fedMetadataXml');

  return (
    <SsoConnectionSourceSelector
      messageKey="fields.adfs.meta_data_source"
      variant={sourceSelector}
      readOnly={readOnly}
      customMessages={customMessages}
      panels={{
        meta_data_url: (
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
        ),
        meta_data_file: (
          <SsoFileField
            name="fedMetadataXml"
            messageKey="fields.adfs.federation_metadata_file"
            accept=".xml"
            files={federationMetadata.files}
            onFilesChange={federationMetadata.onFilesChange}
            readOnly={readOnly}
            customMessages={customMessages}
          />
        ),
      }}
    />
  );
}
