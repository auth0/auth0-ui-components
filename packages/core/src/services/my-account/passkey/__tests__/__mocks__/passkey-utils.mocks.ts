export const toBuffer = (str: string) => new TextEncoder().encode(str).buffer as ArrayBuffer;

export interface MockCredentialOverrides {
  id?: string;
  rawId?: ArrayBuffer;
  authenticatorAttachment?: string | null;
  response?: {
    clientDataJSON?: ArrayBuffer;
    attestationObject?: ArrayBuffer;
  };
}

export const mockCredential = (overrides: MockCredentialOverrides = {}) =>
  ({
    id: overrides.id ?? 'credential-id',
    rawId: overrides.rawId ?? toBuffer('rawId'),
    type: 'public-key',
    authenticatorAttachment:
      'authenticatorAttachment' in overrides ? overrides.authenticatorAttachment : 'platform',
    response: {
      clientDataJSON: overrides.response?.clientDataJSON ?? toBuffer('clientData'),
      attestationObject: overrides.response?.attestationObject ?? toBuffer('attestation'),
    },
  }) as unknown as PublicKeyCredential;
