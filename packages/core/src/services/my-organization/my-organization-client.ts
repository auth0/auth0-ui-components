/**
 * MyOrganization client initialization.
 * @module my-organization-client
 * @internal
 */

import { MyOrganizationClient } from '@auth0/myorganization-js';

import { createProxyFetcher, createSpaFetcher } from '../../api/api-utils';
import type { ClientAuthConfig } from '../../auth/auth-types';

export const MY_ORGANIZATION_PROXY_PATH = 'my-org';
export const MY_ORGANIZATION_DPOP_NONCE_ID = '__auth0_my_organization_api__';

/**
 * Creates a MyOrganizationClient configured for the given auth mode.
 * @param config - Auth configuration (proxy or SPA mode)
 * @returns Configured MyOrganizationClient instance
 * @internal
 */
export function createMyOrganizationClient(config: ClientAuthConfig) {
  if (config.mode === 'proxy') {
    return new MyOrganizationClient({
      domain: '',
      baseUrl: new URL(MY_ORGANIZATION_PROXY_PATH, config.proxyUrl).href,
      telemetry: false,
      fetcher: createProxyFetcher(),
    });
  }

  return new MyOrganizationClient({
    domain: config.domain,
    telemetry: false,
    fetcher: createSpaFetcher(config, MY_ORGANIZATION_DPOP_NONCE_ID),
  });
}

/**
 * Creates a mock MyOrganizationClient with hardcoded data for development and testing.
 * @param _config - Auth configuration (unused in mock)
 * @returns Mock MyOrganizationClient instance
 * @internal
 */
export function createMockMyOrganizationClient(_config: ClientAuthConfig) {
  return {
    organization: {
      configuration: {
        get: () =>
          Promise.resolve({
            allowed_strategies: ['samlp', 'oidc', 'adfs', 'waad', 'google-apps', 'okta'],
            connection_deletion_behavior: 'allow',
            allowed_roles: [
              { id: 'role_id_1', name: 'Admin', description: 'Full access' },
              { id: 'role_id_2', name: 'Member', description: 'They are not an admin' },
              { id: 'role_id_3', name: 'Editor', description: 'They can edit things' },
            ],
          }),
      },
      domains: {
        list: () =>
          Promise.resolve({
            data: [
              {
                id: 'ord_1ctwYRk98Yk6TBUMX9J3cc',
                org_id: 'org_HdiNOwdtHO4fuiTU',
                domain: 'acme.com',
                status: 'verified',
                verification_txt: 'e7d1460097a29cf98c1808fb70f7b155',
                verification_host: '_ss-verification.org_HdiNOwdtHO4fuiTU.acme.com',
              },
              {
                id: 'ord_1ctCAedWhdwC2jxwqJ6XNU',
                org_id: 'org_HdiNOwdtHO4fuiTU',
                domain: 'new-domain.com',
                status: 'pending',
                verification_txt: '4ea9a74799fb2f4f080e17b97a2d54ec',
                verification_host: '_ss-verification.org_HdiNOwdtHO4fuiTU.new-domain.com',
              },
            ],
          }),
      },
      invitations: {
        list: () =>
          Promise.resolve({
            data: [
              {
                id: 'oui_12asdf12',
                organization_id: 'org_123234',
                inviter: { name: 'Allison the Admin' },
                invitee: { email: 'user@example.com' },
                identity_provider_id: 'con_abc123',
                created_at: '2025-05-01T12:00:00.000Z',
                expires_at: '2025-05-03T12:00:00.000Z',
                roles: ['role_id_1', 'role_id_2'],
                invitation_url:
                  'https://login.example.com/authorize?invitation=oui_12asdf12&organization=org_123234',
                ticket_id: '1asdfasd23usjdef',
              },
              {
                id: 'oui_34ghij34',
                organization_id: 'org_123234',
                inviter: { name: 'Allison the Admin' },
                invitee: { email: 'jane.smith@example.com' },
                created_at: '2025-05-02T09:30:00.000Z',
                expires_at: '2025-05-04T09:30:00.000Z',
                roles: ['role_id_1'],
                invitation_url:
                  'https://login.example.com/authorize?invitation=oui_34ghij34&organization=org_123234',
                ticket_id: '2bsdfbsd34vtjefg',
              },
            ],
            response: { next: null, total: 2 },
          }),
        get: (id: string) =>
          Promise.resolve({
            id,
            organization_id: 'org_123234',
            inviter: { name: 'Allison the Admin' },
            invitee: { email: 'user@example.com' },
            identity_provider_id: 'con_abc123',
            created_at: '2025-05-01T12:00:00.000Z',
            expires_at: '2025-05-03T12:00:00.000Z',
            roles: ['role_id_1', 'role_id_2'],
            invitation_url:
              'https://login.example.com/authorize?invitation=' + id + '&organization=org_123234',
            ticket_id: '1asdfasd23usjdef',
          }),
        create: () =>
          Promise.resolve([
            {
              id: 'oui_new_abc123',
              organization_id: 'org_123234',
              inviter: { name: 'Allison the Admin' },
              invitee: { email: 'new.user@example.com' },
              created_at: new Date().toISOString(),
              expires_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
              roles: ['role_id_1'],
              invitation_url:
                'https://login.example.com/authorize?invitation=oui_new_abc123&organization=org_123234',
              ticket_id: 'new_ticket_123',
            },
          ]),
        delete: () => Promise.resolve(undefined),
      },
      members: {
        list: () =>
          Promise.resolve({
            data: [
              {
                user_id: 'auth0|123234235',
                name: 'Millard Lauren',
                email: 'millard.lauren@acme.com',
                created_at: '2025-09-01T23:59:00.000Z',
                last_login: '2025-09-01T23:59:00.000Z',
              },
              {
                user_id: 'auth0|987654321',
                name: 'Jane Smith',
                email: 'jane.smith@acme.com',
                created_at: '2025-08-15T10:00:00.000Z',
                last_login: '2025-09-01T08:30:00.000Z',
              },
              {
                user_id: 'auth0|555666777',
                name: 'Bob Wilson',
                email: 'bob.wilson@acme.com',
                created_at: '2025-07-20T14:30:00.000Z',
                last_login: '2025-08-28T16:45:00.000Z',
              },
            ],
            response: { next: null, total: 3 },
          }),
        get: (userId: string) =>
          Promise.resolve({
            user_id: userId,
            name: 'Millard Lauren',
            email: 'millard.lauren@acme.com',
            phone_number: '+1 (123) 456-7891',
            created_at: '2025-09-01T23:59:00.000Z',
            last_login: '2025-09-01T23:59:00.000Z',
            roles: [
              { id: 'role_id_2', name: 'Member', description: 'They are not an admin' },
              { id: 'role_id_3', name: 'Editor', description: 'They can edit things' },
            ],
          }),
        deleteMembers: () => Promise.resolve(undefined),
        roles: {
          list: () =>
            Promise.resolve({
              roles: [
                { id: 'role_id_2', name: 'Member', description: 'They are not an admin' },
                { id: 'role_id_3', name: 'Editor', description: 'They can edit things' },
              ],
            }),
          assign: () => Promise.resolve({}),
          unassign: () => Promise.resolve({}),
        },
      },
      memberships: {
        deleteMemberships: () => Promise.resolve(undefined),
      },
      identityProviders: {
        list: () => Promise.resolve({ identity_providers: [] }),
      },
    },
  } as unknown as MyOrganizationClient;
}
