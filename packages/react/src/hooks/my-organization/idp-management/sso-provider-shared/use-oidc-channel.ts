/**
 * OIDC communication channel handling for the `type` form field.
 * @module use-oidc-channel
 */

import * as React from 'react';
import { useFormContext } from 'react-hook-form';

import type {
  OidcChannel,
  UseOidcChannelResult,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-shared-types';

/**
 * Watches the OIDC channel and clears the client secret (value and error)
 * @returns The current channel and whether to show the client secret.
 */
export function useOidcChannel(): UseOidcChannelResult {
  const { watch, clearErrors, setValue } = useFormContext();
  const channel = watch('type') as OidcChannel | undefined;

  React.useEffect(() => {
    if (channel === 'front_channel') {
      clearErrors('client_secret');
      setValue('client_secret', '', { shouldValidate: false });
    }
  }, [channel, clearErrors, setValue]);

  return { channel, showClientSecret: channel === 'back_channel' };
}
