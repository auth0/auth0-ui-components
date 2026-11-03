/**
 * OIDC communication channel handling for the `type` form field.
 * @module use-oidc-channel
 */

import * as React from 'react';
import { useFormContext } from 'react-hook-form';

export type OidcChannel = 'back_channel' | 'front_channel';

export interface UseOidcChannelResult {
  channel: OidcChannel | undefined;
  showClientSecret: boolean;
}

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
