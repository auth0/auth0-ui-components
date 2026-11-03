import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useServiceProviderValues } from '../use-service-provider-values';

const mockGetDomain = vi.fn<() => string | undefined>();

vi.mock('@/hooks/shared/use-core-client', () => ({
  useCoreClient: () => ({ coreClient: { getDomain: mockGetDomain } }),
}));

describe('useServiceProviderValues', () => {
  beforeEach(() => {
    mockGetDomain.mockReturnValue('acme.us.auth0.com');
  });

  it('builds values for the tenant domain and connection', () => {
    const { result } = renderHook(() => useServiceProviderValues({ connectionName: 'my-saml' }));

    expect(result.current.callbackUrl).toBe('https://acme.us.auth0.com/login/callback');
    expect(result.current.samlSsoUrl).toBe(
      'https://acme.us.auth0.com/login/callback?connection=my-saml',
    );
    expect(result.current.serviceProviderEntityId).toBe('urn:auth0:acme:my-saml');
    expect(result.current.pingFederatePartnerEntityId).toBe('urn:auth0:acme:my-saml');
    expect(result.current.adfsRelyingPartyIdentifier).toBe('urn:auth0:acme');
  });

  it('leaves connection-based values without a connection when none is given', () => {
    const { result } = renderHook(() => useServiceProviderValues());

    expect(result.current.samlSsoUrl).toBe('https://acme.us.auth0.com/login/callback');
    expect(result.current.serviceProviderEntityId).toBe('');
  });

  it('uses resolveSamlMetadata for the entity ID when provided', () => {
    const resolveSamlMetadata = vi.fn(() => ({ entityId: 'urn:custom:my-saml' }));
    const { result } = renderHook(() =>
      useServiceProviderValues({ connectionName: 'my-saml', resolveSamlMetadata }),
    );

    expect(resolveSamlMetadata).toHaveBeenCalledWith({ connectionName: 'my-saml' });
    expect(result.current.serviceProviderEntityId).toBe('urn:custom:my-saml');
    expect(result.current.pingFederatePartnerEntityId).toBe('urn:custom:my-saml');
  });

  it('does not call resolveSamlMetadata without a connection name', () => {
    const resolveSamlMetadata = vi.fn(() => ({ entityId: 'x' }));
    const { result } = renderHook(() => useServiceProviderValues({ resolveSamlMetadata }));

    expect(resolveSamlMetadata).not.toHaveBeenCalled();
    expect(result.current.serviceProviderEntityId).toBe('');
  });

  describe('without a configured domain', () => {
    beforeEach(() => {
      mockGetDomain.mockReturnValue(undefined);
    });

    it('uses the fallback domain in URLs', () => {
      const { result } = renderHook(() => useServiceProviderValues({ connectionName: 'c' }));

      expect(result.current.callbackUrl).toBe('https://YOUR_DOMAIN/login/callback');
      expect(result.current.samlSsoUrl).toBe('https://YOUR_DOMAIN/login/callback?connection=c');
    });

    it('accepts a custom fallback domain', () => {
      const { result } = renderHook(() =>
        useServiceProviderValues({ fallbackDomain: 'your-domain' }),
      );

      expect(result.current.callbackUrl).toBe('https://your-domain/login/callback');
    });

    it('leaves entity IDs empty instead of deriving them from the fallback', () => {
      const { result } = renderHook(() => useServiceProviderValues({ connectionName: 'c' }));

      expect(result.current.serviceProviderEntityId).toBe('');
      expect(result.current.adfsRelyingPartyIdentifier).toBe('');
    });
  });
});
