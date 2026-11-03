import type {
  IdpInstructionsPage,
  IdpInstructionsResponse,
  IdpProvisioningInstructionsPage,
  IdpProvisioningInstructionsResponse,
  IdpStrategy,
} from '@auth0/universal-components-core';

/**
 * Instruction fixtures that mirror the live My Organization API content: page keys and order,
 * entry and exit conditions, content keys and types, payload fields and tab structure.
 * Markdown text is short placeholder text; help links are the real public URLs.
 */

const BASE_URL = 'https://acme.auth0.com/my-org/public/instructions';
const TENANT = 'acme';
const VERSION_INFO = { version: '1', lifecycle_status: 'latest' } as const;

const pages: Record<IdpStrategy, IdpInstructionsPage[]> = {
  okta: [
    {
      key: 'okta-create-application',
      title: 'Create Application',
      contents: [
        {
          key: 'okta-create-application-1',
          type: 'markdown_component',
          markdown_component: {
            text: 'Create Application for Okta and {{companyName}}.\n\n![Create Application](/img/okta/okta-create-application.png)',
          },
        },
        {
          key: 'okta-create-application-2',
          type: 'callback_url_component',
        },
        {
          key: 'okta-create-application-3',
          type: 'markdown_component',
          markdown_component: {
            text: 'Create Application: step 2 for Okta.',
          },
        },
      ],
    },
    {
      key: 'okta-configure-connection',
      title: 'Configure Connection',
      exit_condition: 'connection_exists',
      contents: [
        {
          key: 'okta-configure-connection-1',
          type: 'markdown_component',
          markdown_component: {
            text: 'Configure Connection for Okta and {{companyName}}.\n\n![Configure Connection](/img/okta/okta-configure-connection.png)',
          },
        },
        {
          key: 'okta-configure-connection-2',
          type: 'okta_configure_connection_component',
          okta_configure_connection_component: {
            find_okta_domain_url: 'https://developer.okta.com/docs/guides/find-your-domain/main/',
            find_client_id_url:
              'https://developer.okta.com/docs/guides/find-your-app-credentials/main/',
            find_client_secret_url:
              'https://developer.okta.com/docs/guides/find-your-app-credentials/main/',
          },
        },
      ],
    },
    {
      key: 'okta-claims-mapping',
      title: 'Claims Mapping',
      entry_condition: 'if_mapping_present',
      contents: [
        {
          key: 'okta-claims-mapping-1',
          type: 'markdown_component',
          markdown_component: {
            text: 'Claims Mapping for Okta and {{companyName}}.\n\n![Claims Mapping](/img/okta/okta-claims-mapping.png)',
          },
        },
        {
          key: 'okta-claims-mapping-2',
          type: 'attribute_mapping_list_component',
        },
      ],
    },
    {
      key: 'okta-assign-access',
      title: 'Assign Access',
      contents: [
        {
          key: 'okta-assign-access-1',
          type: 'markdown_component',
          markdown_component: {
            text: 'Assign Access for Okta and {{companyName}}.\n\n![Assign Access](/img/okta/okta-assign-access.png)',
          },
        },
      ],
    },
    {
      key: 'okta-test-connection',
      title: 'Test SSO',
      exit_condition: 'connection_testing_suggested',
      contents: [
        {
          key: 'okta-test-connection-1',
          type: 'test_connection_component',
        },
      ],
    },
  ],
  oidc: [
    {
      key: 'oidc-create-application',
      title: 'Create Application',
      contents: [
        {
          key: 'oidc-create-application-1',
          type: 'markdown_component',
          markdown_component: {
            text: 'Create Application for your identity provider and {{companyName}}.\n\n![Create Application](/img/oidc/oidc-create-application.png)',
          },
        },
        {
          key: 'oidc-create-application-2',
          type: 'markdown_component',
          markdown_component: {
            text: 'Create Application: step 2 for your identity provider.',
          },
        },
        {
          key: 'oidc-create-application-3',
          type: 'callback_url_component',
        },
      ],
    },
    {
      key: 'oidc-configure-connection',
      title: 'Configure Connection',
      exit_condition: 'connection_exists',
      contents: [
        {
          key: 'oidc-configure-connection-1',
          type: 'markdown_component',
          markdown_component: {
            text: 'Configure Connection for your identity provider and {{companyName}}.\n\n![Configure Connection](/img/oidc/oidc-configure-connection.png)',
          },
        },
        {
          key: 'oidc-configure-connection-2',
          type: 'oidc_configure_connection_component',
        },
      ],
    },
    {
      key: 'oidc-claims-mapping',
      title: 'Claims Mapping',
      entry_condition: 'if_mapping_present',
      contents: [
        {
          key: 'oidc-claims-mapping-1',
          type: 'markdown_component',
          markdown_component: {
            text: 'Claims Mapping for your identity provider and {{companyName}}.\n\n![Claims Mapping](/img/oidc/oidc-claims-mapping.png)',
          },
        },
        {
          key: 'oidc-claims-mapping-2',
          type: 'attribute_mapping_list_component',
        },
      ],
    },
    {
      key: 'oidc-test-connection',
      title: 'Test SSO',
      exit_condition: 'connection_testing_suggested',
      contents: [
        {
          key: 'oidc-test-connection-1',
          type: 'test_connection_component',
        },
      ],
    },
  ],
  samlp: [
    {
      key: 'samlp-create-application',
      title: 'Create Application',
      contents: [
        {
          key: 'samlp-create-application-1',
          type: 'markdown_component',
          markdown_component: {
            text: 'Create Application for your identity provider and {{companyName}}.\n\n![Create Application](/img/samlp/samlp-create-application.png)',
          },
        },
        {
          key: 'samlp-create-application-2',
          type: 'sso_url_component',
        },
        {
          key: 'samlp-create-application-3',
          type: 'markdown_component',
          markdown_component: {
            text: 'Create Application: step 2 for your identity provider.',
          },
        },
        {
          key: 'samlp-create-application-4',
          type: 'service_provider_entity_id_component',
        },
        {
          key: 'samlp-create-application-5',
          type: 'markdown_component',
          markdown_component: {
            text: 'Create Application: step 3 for your identity provider.',
          },
        },
      ],
    },
    {
      key: 'samlp-configure-connection-tabs',
      title: 'Configure Connection',
      exit_condition: 'connection_exists',
      contents: [
        {
          key: 'samlp-configure-connection-tabs-1',
          type: 'markdown_component',
          markdown_component: {
            text: 'Configure Connection for your identity provider and {{companyName}}.\n\n![Configure Connection](/img/samlp/samlp-configure-connection-tabs.png)',
          },
        },
        {
          key: 'samlp-configure-connection-tabs-2',
          type: 'samlp_configure_connection_component',
        },
      ],
    },
    {
      key: 'samlp-attribute-mapping',
      title: 'Attribute Mapping',
      entry_condition: 'if_mapping_present',
      contents: [
        {
          key: 'samlp-attribute-mapping-1',
          type: 'markdown_component',
          markdown_component: {
            text: 'Attribute Mapping for your identity provider and {{companyName}}.\n\n![Attribute Mapping](/img/samlp/samlp-attribute-mapping.png)',
          },
        },
        {
          key: 'samlp-attribute-mapping-2',
          type: 'attribute_mapping_list_component',
        },
      ],
    },
    {
      key: 'samlp-test-connection',
      title: 'Test SSO',
      exit_condition: 'connection_testing_suggested',
      contents: [
        {
          key: 'samlp-test-connection-1',
          type: 'test_connection_component',
        },
      ],
    },
  ],
  waad: [
    {
      key: 'waad-create-application',
      title: 'Create Application',
      contents: [
        {
          key: 'waad-create-application-1',
          type: 'markdown_component',
          markdown_component: {
            text: 'Create Application for Entra ID and {{companyName}}.\n\n![Create Application](/img/waad/waad-create-application.png)',
          },
        },
        {
          key: 'waad-create-application-2',
          type: 'callback_url_component',
        },
        {
          key: 'waad-create-application-3',
          type: 'markdown_component',
          markdown_component: {
            text: 'Create Application: step 2 for Entra ID.',
          },
        },
      ],
    },
    {
      key: 'waad-configure-connection',
      title: 'Configure Connection',
      exit_condition: 'connection_exists',
      contents: [
        {
          key: 'waad-configure-connection-1',
          type: 'markdown_component',
          markdown_component: {
            text: 'Configure Connection for Entra ID and {{companyName}}.\n\n![Configure Connection](/img/waad/waad-configure-connection.png)',
          },
        },
        {
          key: 'waad-configure-connection-2',
          type: 'waad_configure_connection_component',
        },
      ],
    },
    {
      key: 'waad-claims-mapping',
      title: 'Claims Mapping',
      entry_condition: 'if_mapping_present',
      contents: [
        {
          key: 'waad-claims-mapping-1',
          type: 'markdown_component',
          markdown_component: {
            text: 'Claims Mapping for Entra ID and {{companyName}}.\n\n![Claims Mapping](/img/waad/waad-claims-mapping.png)',
          },
        },
        {
          key: 'waad-claims-mapping-2',
          type: 'attribute_mapping_list_component',
        },
      ],
    },
    {
      key: 'waad-assign-access',
      title: 'Assign Access',
      contents: [
        {
          key: 'waad-assign-access-1',
          type: 'markdown_component',
          markdown_component: {
            text: 'Assign Access for Entra ID and {{companyName}}.\n\n![Assign Access](/img/waad/waad-assign-access.png)',
          },
        },
        {
          key: 'waad-assign-access-2',
          type: 'tabs_component',
          tabs_component: {
            default_tab: 0,
            tabs: [
              {
                title: 'Specific Users or Groups',
                contents: [
                  {
                    key: 'waad-assign-access-specific-1',
                    type: 'markdown_component',
                    markdown_component: {
                      text: 'Assign Access: step 2 for Entra ID.',
                    },
                  },
                ],
              },
              {
                title: 'All Users',
                contents: [
                  {
                    key: 'waad-assign-access-all-1',
                    type: 'markdown_component',
                    markdown_component: {
                      text: 'Assign Access: step 3 for Entra ID.',
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    {
      key: 'waad-test-connection',
      title: 'Test SSO',
      exit_condition: 'connection_testing_suggested',
      contents: [
        {
          key: 'waad-test-connection-1',
          type: 'test_connection_component',
        },
      ],
    },
  ],
  'google-apps': [
    {
      key: 'google-apps-create-application',
      title: 'Create Application',
      contents: [
        {
          key: 'google-apps-create-application-1',
          type: 'markdown_component',
          markdown_component: {
            text: 'Create Application for Google Workspace and {{companyName}}.\n\n![Create Application](/img/google-apps/google-apps-create-application.png)',
          },
        },
        {
          key: 'google-apps-create-application-2',
          type: 'google_apps_authorized_javascript_origins_component',
        },
        {
          key: 'google-apps-create-application-3',
          type: 'google_apps_authorized_redirect_uri_component',
        },
        {
          key: 'google-apps-create-application-4',
          type: 'markdown_component',
          markdown_component: {
            text: 'Create Application: step 2 for Google Workspace.',
          },
        },
      ],
    },
    {
      key: 'google-apps-configure-connection',
      title: 'Configure Connection',
      exit_condition: 'connection_exists',
      contents: [
        {
          key: 'google-apps-configure-connection-1',
          type: 'markdown_component',
          markdown_component: {
            text: 'Configure Connection for Google Workspace and {{companyName}}.\n\n![Configure Connection](/img/google-apps/google-apps-configure-connection.png)',
          },
        },
        {
          key: 'google-apps-configure-connection-2',
          type: 'google_apps_configure_connection_component',
          google_apps_configure_connection_component: {
            find_google_workspace_domain_url: 'https://support.google.com/domains/answer/7278940',
          },
        },
      ],
    },
    {
      key: 'google-apps-assign-access',
      title: 'Assign Access',
      contents: [
        {
          key: 'google-apps-assign-access-1',
          type: 'markdown_component',
          markdown_component: {
            text: 'Assign Access for Google Workspace and {{companyName}}.\n\n![Assign Access](/img/google-apps/google-apps-assign-access.png)',
          },
        },
      ],
    },
    {
      key: 'google-apps-test-connection',
      title: 'Test SSO',
      exit_condition: 'connection_testing_suggested',
      contents: [
        {
          key: 'google-apps-test-connection-1',
          type: 'test_connection_component',
        },
      ],
    },
  ],
  adfs: [
    {
      key: 'adfs-create-application',
      title: 'Create Application',
      contents: [
        {
          key: 'adfs-create-application-1',
          type: 'markdown_component',
          markdown_component: {
            text: 'Create Application for ADFS and {{companyName}}.\n\n![Create Application](/img/adfs/adfs-create-application.png)',
          },
        },
        {
          key: 'adfs-create-application-2',
          type: 'adfs_relying_party_ws_federation_passive_protocol_url_component',
        },
        {
          key: 'adfs-create-application-3',
          type: 'markdown_component',
          markdown_component: {
            text: 'Create Application: step 2 for ADFS.',
          },
        },
        {
          key: 'adfs-create-application-4',
          type: 'adfs_relying_party_trust_identifier_component',
        },
        {
          key: 'adfs-create-application-5',
          type: 'markdown_component',
          markdown_component: {
            text: 'Create Application: step 3 for ADFS.',
          },
        },
      ],
    },
    {
      key: 'adfs-configure-claims-issuance-policy',
      title: 'Configure Claims Issuance Policy',
      entry_condition: 'if_mapping_present',
      contents: [
        {
          key: 'adfs-configure-claims-issuance-policy-1',
          type: 'markdown_component',
          markdown_component: {
            text: 'Configure Claims Issuance Policy for ADFS and {{companyName}}.\n\n![Configure Claims Issuance Policy](/img/adfs/adfs-configure-claims-issuance-policy.png)',
          },
        },
        {
          key: 'adfs-configure-claims-issuance-policy-2',
          type: 'attribute_mapping_list_component',
        },
        {
          key: 'adfs-configure-claims-issuance-policy-3',
          type: 'markdown_component',
          markdown_component: {
            text: 'Configure Claims Issuance Policy: step 2 for ADFS.',
          },
        },
      ],
    },
    {
      key: 'adfs-configure-connection-tabs-adfs',
      title: 'Configure Connection',
      exit_condition: 'connection_exists',
      contents: [
        {
          key: 'adfs-configure-connection-tabs-adfs-1',
          type: 'markdown_component',
          markdown_component: {
            text: 'Configure Connection for ADFS and {{companyName}}.\n\n![Configure Connection](/img/adfs/adfs-configure-connection-tabs-adfs.png)',
          },
        },
        {
          key: 'adfs-configure-connection-tabs-adfs-2',
          type: 'adfs_configure_connection_component',
          adfs_configure_connection_component: {
            metadata_location_instructions:
              'Replace HOSTNAME with your ADFS host to get the metadata URL.',
          },
        },
      ],
    },
    {
      key: 'adfs-test-connection',
      title: 'Test SSO',
      exit_condition: 'connection_testing_suggested',
      contents: [
        {
          key: 'adfs-test-connection-1',
          type: 'test_connection_component',
        },
      ],
    },
  ],
  pingfederate: [
    {
      key: 'pingfederate-create-application',
      title: 'Create SP Connection',
      contents: [
        {
          key: 'pingfederate-create-application-1',
          type: 'markdown_component',
          markdown_component: {
            text: 'Create SP Connection for PingFederate and {{companyName}}.\n\n![Create SP Connection](/img/pingfederate/pingfederate-create-application.png)',
          },
        },
        {
          key: 'pingfederate-create-application-2',
          type: 'pingfederate_partners_entity_id_component',
        },
        {
          key: 'pingfederate-create-application-3',
          type: 'markdown_component',
          markdown_component: {
            text: 'Create SP Connection: step 2 for PingFederate.',
          },
        },
      ],
    },
    {
      key: 'pingfederate-browser-sso-settings-ping',
      title: 'Browser SSO',
      contents: [
        {
          key: 'pingfederate-browser-sso-settings-ping-1',
          type: 'markdown_component',
          markdown_component: {
            text: 'Browser SSO for PingFederate and {{companyName}}.\n\n![Browser SSO](/img/pingfederate/pingfederate-browser-sso-settings-ping.png)',
          },
        },
      ],
    },
    {
      key: 'pingfederate-attribute-mapping',
      title: 'Assertion Creation',
      contents: [
        {
          key: 'pingfederate-attribute-mapping-1',
          type: 'markdown_component',
          markdown_component: {
            text: 'Assertion Creation for PingFederate and {{companyName}}.\n\n![Assertion Creation](/img/pingfederate/pingfederate-attribute-mapping.png)',
          },
        },
        {
          key: 'pingfederate-attribute-mapping-2',
          type: 'attribute_mapping_list_component',
        },
        {
          key: 'pingfederate-attribute-mapping-3',
          type: 'markdown_component',
          markdown_component: {
            text: 'Assertion Creation: step 2 for PingFederate.',
          },
        },
      ],
    },
    {
      key: 'pingfederate-protocols-ping',
      title: 'Protocols',
      contents: [
        {
          key: 'pingfederate-protocols-ping-1',
          type: 'markdown_component',
          markdown_component: {
            text: 'Protocols for PingFederate and {{companyName}}.\n\n![Protocols](/img/pingfederate/pingfederate-protocols-ping.png)',
          },
        },
        {
          key: 'pingfederate-protocols-ping-2',
          type: 'pingfederate_endpoint_url_component',
        },
        {
          key: 'pingfederate-protocols-ping-3',
          type: 'markdown_component',
          markdown_component: {
            text: 'Protocols: step 2 for PingFederate.',
          },
        },
      ],
    },
    {
      key: 'pingfederate-credentials-ping',
      title: 'Credentials',
      contents: [
        {
          key: 'pingfederate-credentials-ping-1',
          type: 'markdown_component',
          markdown_component: {
            text: 'Credentials for PingFederate and {{companyName}}.\n\n![Credentials](/img/pingfederate/pingfederate-credentials-ping.png)',
          },
        },
      ],
    },
    {
      key: 'pingfederate-configure-connection-tabs',
      title: 'Configure Connection',
      exit_condition: 'connection_exists',
      contents: [
        {
          key: 'pingfederate-configure-connection-tabs-1',
          type: 'markdown_component',
          markdown_component: {
            text: 'Configure Connection for PingFederate and {{companyName}}.\n\n![Configure Connection](/img/pingfederate/pingfederate-configure-connection-tabs.png)',
          },
        },
        {
          key: 'pingfederate-configure-connection-tabs-2',
          type: 'pingfederate_configure_connection_component',
        },
      ],
    },
    {
      key: 'pingfederate-test-connection',
      title: 'Test SSO',
      exit_condition: 'connection_testing_suggested',
      contents: [
        {
          key: 'pingfederate-test-connection-1',
          type: 'test_connection_component',
        },
      ],
    },
  ],
};

/**
 * Creation instructions response for a strategy.
 * @param strategy - The IdP strategy.
 * @param overrides - Fields to override on the response.
 * @returns A mock instructions response.
 */
export const createMockIdpInstructions = (
  strategy: IdpStrategy = 'okta',
  overrides?: Partial<IdpInstructionsResponse>,
): IdpInstructionsResponse => ({
  base_url: BASE_URL,
  tenant: TENANT,
  version_info: { ...VERSION_INFO },
  pages: pages[strategy],
  ...overrides,
});

const provisioningPages: Record<IdpStrategy, IdpProvisioningInstructionsPage[]> = {
  okta: [
    {
      key: 'okta-create-application',
      title: 'Add SCIM Template App',
      contents: [
        {
          key: 'okta-create-application-1',
          type: 'markdown_component',
          markdown_component: {
            text: 'Add SCIM Template App for Okta and {{companyName}}.\n\n![Add SCIM Template App](/img/okta/okta-create-application.png)',
          },
        },
        {
          key: 'okta-create-application-2',
          type: 'markdown_component',
          markdown_component: {
            text: 'Add SCIM Template App: step 2 for Okta.',
          },
        },
      ],
    },
    {
      key: 'okta-configure-scim',
      title: 'Configure SCIM',
      exit_condition: 'token_generation_suggested',
      contents: [
        {
          key: 'okta-configure-scim-1',
          type: 'markdown_component',
          markdown_component: {
            text: 'Configure SCIM for Okta and {{companyName}}.\n\n![Configure SCIM](/img/okta/okta-configure-scim.png)',
          },
        },
        {
          key: 'okta-configure-scim-2',
          type: 'scim_endpoint_url_component',
        },
        {
          key: 'okta-configure-scim-3',
          type: 'markdown_component',
          markdown_component: {
            text: 'Configure SCIM: step 2 for Okta.',
          },
        },
        {
          key: 'okta-configure-scim-4',
          type: 'bearer_token_component',
        },
        {
          key: 'okta-configure-scim-5',
          type: 'markdown_component',
          markdown_component: {
            text: 'Configure SCIM: step 3 for Okta.',
          },
        },
        {
          key: 'okta-configure-scim-6',
          type: 'markdown_component',
          markdown_component: {
            variant: 'notice',
            text: 'Note for configure scim.',
          },
        },
      ],
    },
    {
      key: 'okta-mapping',
      title: 'SCIM Mapping',
      contents: [
        {
          key: 'okta-mapping-1',
          type: 'markdown_component',
          markdown_component: {
            text: 'SCIM Mapping for Okta and {{companyName}}.\n\n![SCIM Mapping](/img/okta/okta-mapping.png)',
          },
        },
        {
          key: 'okta-mapping-2',
          type: 'markdown_component',
          markdown_component: {
            text: 'SCIM Mapping: step 2 for Okta.',
          },
        },
        {
          key: 'okta-mapping-3',
          type: 'markdown_component',
          markdown_component: {
            text: 'SCIM Mapping: step 3 for Okta.',
          },
        },
        {
          key: 'okta-mapping-4',
          type: 'okta_schema_urn_component',
        },
        {
          key: 'okta-mapping-5',
          type: 'attribute_mapping_list_component',
        },
        {
          key: 'okta-mapping-6',
          type: 'markdown_component',
          markdown_component: {
            text: 'SCIM Mapping: step 4 for Okta.',
          },
        },
      ],
    },
    {
      key: 'okta-sync-groups',
      title: 'Sync Groups',
      entry_condition: 'if_group_provisioning_enabled',
      contents: [
        {
          key: 'okta-sync-groups-1',
          type: 'markdown_component',
          markdown_component: {
            text: 'Sync Groups for Okta and {{companyName}}.\n\n![Sync Groups](/img/okta/okta-sync-groups.png)',
          },
        },
        {
          key: 'okta-sync-groups-2',
          type: 'markdown_component',
          markdown_component: {
            text: 'Sync Groups: step 2 for Okta.',
          },
        },
      ],
    },
  ],
  oidc: [
    {
      key: 'oidc-configure-provisioning',
      title: 'Configure Provisioning',
      exit_condition: 'token_generation_suggested',
      contents: [
        {
          key: 'oidc-configure-provisioning-1',
          type: 'markdown_component',
          markdown_component: {
            text: 'Configure Provisioning for your identity provider and {{companyName}}.\n\n![Configure Provisioning](/img/oidc/oidc-configure-provisioning.png)',
          },
        },
        {
          key: 'oidc-configure-provisioning-2',
          type: 'bearer_token_component',
        },
        {
          key: 'oidc-configure-provisioning-3',
          type: 'scim_endpoint_url_component',
        },
        {
          key: 'oidc-configure-provisioning-4',
          type: 'markdown_component',
          markdown_component: {
            variant: 'notice',
            text: 'Note for configure provisioning.',
          },
        },
        {
          key: 'oidc-configure-provisioning-5',
          type: 'attribute_mapping_list_component',
        },
      ],
    },
  ],
  samlp: [
    {
      key: 'samlp-configure-provisioning',
      title: 'Configure Provisioning',
      exit_condition: 'token_generation_suggested',
      contents: [
        {
          key: 'samlp-configure-provisioning-1',
          type: 'markdown_component',
          markdown_component: {
            text: 'Configure Provisioning for your identity provider and {{companyName}}.\n\n![Configure Provisioning](/img/samlp/samlp-configure-provisioning.png)',
          },
        },
        {
          key: 'samlp-configure-provisioning-2',
          type: 'bearer_token_component',
        },
        {
          key: 'samlp-configure-provisioning-3',
          type: 'scim_endpoint_url_component',
        },
        {
          key: 'samlp-configure-provisioning-4',
          type: 'markdown_component',
          markdown_component: {
            variant: 'notice',
            text: 'Note for configure provisioning.',
          },
        },
        {
          key: 'samlp-configure-provisioning-5',
          type: 'attribute_mapping_list_component',
        },
      ],
    },
  ],
  waad: [
    {
      key: 'waad-create-application',
      title: 'Create Application',
      contents: [
        {
          key: 'waad-create-application-1',
          type: 'markdown_component',
          markdown_component: {
            text: 'Create Application for Entra ID and {{companyName}}.\n\n![Create Application](/img/waad/waad-create-application.png)',
          },
        },
      ],
    },
    {
      key: 'waad-configure-scim',
      title: 'Configure SCIM',
      exit_condition: 'token_generation_suggested',
      contents: [
        {
          key: 'waad-configure-scim-1',
          type: 'markdown_component',
          markdown_component: {
            text: 'Configure SCIM for Entra ID and {{companyName}}.\n\n![Configure SCIM](/img/waad/waad-configure-scim.png)',
          },
        },
        {
          key: 'waad-configure-scim-2',
          type: 'scim_endpoint_url_component',
        },
        {
          key: 'waad-configure-scim-3',
          type: 'markdown_component',
          markdown_component: {
            text: 'Configure SCIM: step 2 for Entra ID.',
          },
        },
        {
          key: 'waad-configure-scim-4',
          type: 'bearer_token_component',
        },
        {
          key: 'waad-configure-scim-5',
          type: 'markdown_component',
          markdown_component: {
            text: 'Configure SCIM: step 3 for Entra ID.',
          },
        },
      ],
    },
    {
      key: 'waad-scim-mapping',
      title: 'SCIM Mapping',
      contents: [
        {
          key: 'waad-scim-mapping-1',
          type: 'markdown_component',
          markdown_component: {
            text: 'SCIM Mapping for Entra ID and {{companyName}}.\n\n![SCIM Mapping](/img/waad/waad-scim-mapping.png)',
          },
        },
        {
          key: 'waad-scim-mapping-2',
          type: 'attribute_mapping_list_component',
        },
        {
          key: 'waad-scim-mapping-3',
          type: 'markdown_component',
          markdown_component: {
            text: 'SCIM Mapping: step 2 for Entra ID.',
          },
        },
      ],
    },
  ],
  'google-apps': [
    {
      key: 'google-apps-grant-access',
      title: 'Grant Access',
      exit_condition: 'google_workspace_setup_complete',
      contents: [
        {
          key: 'google-apps-grant-access-1',
          type: 'markdown_component',
          markdown_component: {
            text: 'Grant Access for Google Workspace and {{companyName}}.\n\n![Grant Access](/img/google-apps/google-apps-grant-access.png)',
          },
        },
        {
          key: 'google-apps-grant-access-2',
          type: 'google_workspace_setup_component',
        },
        {
          key: 'google-apps-grant-access-3',
          type: 'markdown_component',
          markdown_component: {
            text: 'Grant Access: step 2 for Google Workspace.',
          },
        },
      ],
    },
  ],
  adfs: [],
  pingfederate: [],
};

/**
 * Provisioning instructions response for a strategy. adfs and pingfederate return no pages.
 * @param strategy - The IdP strategy.
 * @param overrides - Fields to override on the response.
 * @returns A mock provisioning instructions response.
 */
export const createMockIdpProvisioningInstructions = (
  strategy: IdpStrategy = 'okta',
  overrides?: Partial<IdpProvisioningInstructionsResponse>,
): IdpProvisioningInstructionsResponse => ({
  base_url: BASE_URL,
  tenant: TENANT,
  version_info: { ...VERSION_INFO },
  pages: provisioningPages[strategy],
  ...overrides,
});
