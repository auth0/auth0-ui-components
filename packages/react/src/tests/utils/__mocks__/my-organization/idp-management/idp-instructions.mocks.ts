import type {
  IdpInstructionsPage,
  IdpInstructionsPageContent,
  IdpInstructionsResponse,
  IdpProvisioningInstructionsPage,
  IdpProvisioningInstructionsResponse,
  IdpStrategy,
} from '@auth0/universal-components-core';

/**
 * Instruction fixtures modelled on the page order in the RFC "Identity Provider
 * Creation Instructions" (697780235) and "Provisioning Instructions" (697781233).
 * Text is shortened; structure (page order, conditions, content types) matches.
 */

const BASE_URL = 'https://acme.auth0.com/my-org/public/instructions';
const TENANT = 'acme';
const VERSION_INFO = { version: '1', lifecycle_status: 'latest' } as const;

const markdown = (key: string, text: string): IdpInstructionsPageContent => ({
  key,
  type: 'markdown_component',
  markdown_component: { text },
});

const component = (
  key: string,
  type: IdpInstructionsPageContent['type'],
): IdpInstructionsPageContent => ({ key, type });

const testPage = (strategy: string): IdpInstructionsPage => ({
  key: `${strategy}-test-connection`,
  title: 'Test SSO',
  exit_condition: 'connection_testing_suggested',
  contents: [
    markdown(`${strategy}-test-1`, 'Test the provider to ensure SSO setup is successful.'),
    component(`${strategy}-test-2`, 'test_connection_component'),
  ],
});

const claimsMappingPage = (strategy: string): IdpInstructionsPage => ({
  key: `${strategy}-claims-mapping`,
  title: 'Claims Mapping',
  entry_condition: 'if_mapping_present',
  contents: [
    markdown(
      `${strategy}-mapping-1`,
      'Claims mapping ensures that the correct user attributes are passed from the identity provider to {{companyName}}.',
    ),
    component(`${strategy}-mapping-2`, 'attribute_mapping_list_component'),
  ],
});

const pages: Record<IdpStrategy, IdpInstructionsPage[]> = {
  okta: [
    {
      key: 'okta-create-application',
      title: 'Create Application',
      contents: [
        markdown(
          'okta-create-1',
          'To connect your Okta tenant as an identity provider, you must create an OIDC application.\n\nSelect **Applications > Applications**, and **Create App Integration**.\n\n![Okta applications](/img/okta/1.png)',
        ),
        markdown('okta-create-2', 'Add the Callback URL in the **Sign-in redirect URIs** field.'),
        component('okta-create-3', 'callback_url_component'),
      ],
    },
    {
      key: 'okta-configure-connection',
      title: 'Configure Provider',
      exit_condition: 'connection_exists',
      contents: [
        {
          key: 'okta-configure-1',
          type: 'okta_configure_connection_component',
          okta_configure_connection_component: {
            find_okta_domain_url: 'https://developer.okta.com/docs/guides/find-your-domain/',
            find_client_id_url: 'https://developer.okta.com/docs/guides/find-your-app-credentials/',
            find_client_secret_url:
              'https://developer.okta.com/docs/guides/find-your-app-credentials/',
          },
        },
      ],
    },
    claimsMappingPage('okta'),
    {
      key: 'okta-assign-access',
      title: 'Assign Access',
      contents: [
        markdown(
          'okta-assign-1',
          'Grant users or groups access to {{companyName}}.\n\nSelect **Assign**, then **Assign to Groups**.',
        ),
      ],
    },
    testPage('okta'),
  ],
  oidc: [
    {
      key: 'oidc-create-application',
      title: 'Create Application',
      contents: [
        markdown('oidc-create-1', 'Register a new web application with your OIDC provider.'),
        component('oidc-create-2', 'callback_url_component'),
      ],
    },
    {
      key: 'oidc-configure-connection',
      title: 'Configure Provider',
      exit_condition: 'connection_exists',
      contents: [component('oidc-configure-1', 'oidc_configure_connection_component')],
    },
    claimsMappingPage('oidc'),
    testPage('oidc'),
  ],
  samlp: [
    {
      key: 'samlp-create-application',
      title: 'Create Application',
      contents: [
        markdown('samlp-create-1', 'Create a SAML application in your identity provider.'),
        component('samlp-create-2', 'sso_url_component'),
        component('samlp-create-3', 'service_provider_entity_id_component'),
      ],
    },
    {
      key: 'samlp-configure-connection',
      title: 'Configure Provider',
      exit_condition: 'connection_exists',
      contents: [component('samlp-configure-1', 'samlp_configure_connection_component')],
    },
    claimsMappingPage('samlp'),
    testPage('samlp'),
  ],
  adfs: [
    {
      key: 'adfs-relying-party-trust',
      title: 'Add a Relying Party Trust',
      contents: [
        markdown('adfs-rpt-1', 'In AD FS Management, select **Add Relying Party Trust**.'),
        component('adfs-rpt-2', 'adfs_relying_party_ws_federation_passive_protocol_url_component'),
        component('adfs-rpt-3', 'adfs_relying_party_trust_identifier_component'),
      ],
    },
    {
      key: 'adfs-claims-issuance-policy',
      title: 'Configure Claims Issuance Policy',
      entry_condition: 'if_mapping_present',
      contents: [
        markdown('adfs-claims-1', 'Add a rule to send LDAP attributes as claims.'),
        component('adfs-claims-2', 'attribute_mapping_list_component'),
      ],
    },
    {
      key: 'adfs-configure-connection',
      title: 'Configure Provider',
      exit_condition: 'connection_exists',
      contents: [
        {
          key: 'adfs-configure-1',
          type: 'adfs_configure_connection_component',
          adfs_configure_connection_component: {
            metadata_location_instructions:
              'Use `https://HOSTNAME/FederationMetadata/2007-06/FederationMetadata.xml`, replacing **HOSTNAME** with your AD FS host.',
          },
        },
      ],
    },
    testPage('adfs'),
  ],
  waad: [
    {
      key: 'waad-create-application',
      title: 'Create Application',
      contents: [
        markdown('waad-create-1', 'Register a new application in Microsoft Entra ID.'),
        component('waad-create-2', 'callback_url_component'),
      ],
    },
    {
      key: 'waad-configure-connection',
      title: 'Configure Provider',
      exit_condition: 'connection_exists',
      contents: [component('waad-configure-1', 'waad_configure_connection_component')],
    },
    claimsMappingPage('waad'),
    {
      key: 'waad-assign-access',
      title: 'Assign Access',
      contents: [
        {
          key: 'waad-assign-1',
          type: 'tabs_component',
          tabs_component: {
            default_tab: 0,
            tabs: [
              {
                title: 'Specific Users or Groups',
                contents: [
                  {
                    key: 'waad-assign-specific-1',
                    type: 'markdown_component',
                    markdown_component: {
                      text: 'Set **Assignment required** to **Yes**, then add users or groups.',
                    },
                  },
                ],
              },
              {
                title: 'All Users',
                contents: [
                  {
                    key: 'waad-assign-all-1',
                    type: 'markdown_component',
                    markdown_component: { text: 'Set **Assignment required** to **No**.' },
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    testPage('waad'),
  ],
  'google-apps': [
    {
      key: 'google-apps-create-application',
      title: 'Create Application',
      contents: [
        markdown('google-apps-create-1', 'Create an OAuth client in Google Cloud Console.'),
        component('google-apps-create-2', 'google_apps_authorized_javascript_origins_component'),
        component('google-apps-create-3', 'google_apps_authorized_redirect_uri_component'),
      ],
    },
    {
      key: 'google-apps-configure-connection',
      title: 'Configure Provider',
      exit_condition: 'connection_exists',
      contents: [
        {
          key: 'google-apps-configure-1',
          type: 'google_apps_configure_connection_component',
          google_apps_configure_connection_component: {
            find_google_workspace_domain_url: 'https://support.google.com/a/answer/7502379',
          },
        },
      ],
    },
    {
      key: 'google-apps-assign-access',
      title: 'Assign Access',
      contents: [markdown('google-apps-assign-1', 'Turn the app on for everyone or for an OU.')],
    },
    testPage('google-apps'),
  ],
  pingfederate: [
    {
      key: 'pingfederate-create-sp-connection',
      title: 'Create SP Connection',
      contents: [
        markdown('pingfederate-sp-1', 'Create a new SP connection in PingFederate.'),
        component('pingfederate-sp-2', 'pingfederate_partners_entity_id_component'),
      ],
    },
    {
      key: 'pingfederate-browser-sso',
      title: 'Browser SSO',
      contents: [markdown('pingfederate-sso-1', 'Enable **SP-Initiated SSO**.')],
    },
    {
      key: 'pingfederate-assertion-creation',
      title: 'Assertion Creation',
      contents: [
        markdown('pingfederate-assertion-1', 'Map these attributes in the assertion.'),
        component('pingfederate-assertion-2', 'attribute_mapping_list_component'),
      ],
    },
    {
      key: 'pingfederate-protocols',
      title: 'Protocols',
      contents: [
        markdown('pingfederate-protocols-1', 'Add the endpoint URL with binding **POST**.'),
        component('pingfederate-protocols-2', 'pingfederate_endpoint_url_component'),
      ],
    },
    {
      key: 'pingfederate-credentials',
      title: 'Credentials Setup',
      contents: [markdown('pingfederate-credentials-1', 'Select your signing certificate.')],
    },
    {
      key: 'pingfederate-configure-connection',
      title: 'Configure Provider',
      exit_condition: 'connection_exists',
      contents: [
        component('pingfederate-configure-1', 'pingfederate_configure_connection_component'),
      ],
    },
    testPage('pingfederate'),
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
      key: 'okta-scim-create-application',
      title: 'Add SCIM Template App',
      contents: [
        {
          key: 'okta-scim-create-1',
          type: 'markdown_component',
          markdown_component: {
            text: 'To provision users to {{companyName}}, you must create a SWA application.',
          },
        },
        {
          key: 'okta-scim-create-2',
          type: 'markdown_component',
          markdown_component: {
            variant: 'notice',
            text: 'This is a separate application from the one used for SSO.',
          },
        },
      ],
    },
    {
      key: 'okta-scim-configure',
      title: 'Configure SCIM',
      exit_condition: 'token_generation_suggested',
      contents: [
        {
          key: 'okta-scim-configure-1',
          type: 'markdown_component',
          markdown_component: { text: 'Add the following URL to the **Base URL** field.' },
        },
        { key: 'okta-scim-configure-2', type: 'scim_endpoint_url_component' },
        { key: 'okta-scim-configure-3', type: 'bearer_token_component' },
      ],
    },
    {
      key: 'okta-scim-mapping',
      title: 'SCIM Mapping',
      contents: [
        { key: 'okta-scim-mapping-1', type: 'okta_schema_urn_component' },
        { key: 'okta-scim-mapping-2', type: 'attribute_mapping_list_component' },
      ],
    },
  ],
  waad: [
    {
      key: 'waad-scim-create-application',
      title: 'Create Application',
      contents: [
        {
          key: 'waad-scim-create-1',
          type: 'markdown_component',
          markdown_component: { text: 'Create a non-gallery enterprise application.' },
        },
      ],
    },
    {
      key: 'waad-scim-configure',
      title: 'Configure SCIM',
      exit_condition: 'token_generation_suggested',
      contents: [
        {
          key: 'waad-scim-configure-1',
          type: 'markdown_component',
          markdown_component: { text: 'Append `?aadOptscim062020` to the Tenant URL.' },
        },
        { key: 'waad-scim-configure-2', type: 'scim_endpoint_url_component' },
        { key: 'waad-scim-configure-3', type: 'bearer_token_component' },
      ],
    },
    {
      key: 'waad-scim-mapping',
      title: 'SCIM Mapping',
      contents: [{ key: 'waad-scim-mapping-1', type: 'attribute_mapping_list_component' }],
    },
  ],
  oidc: [
    {
      key: 'oidc-scim-mapping',
      title: 'SCIM mapping',
      contents: [
        {
          key: 'oidc-scim-1',
          type: 'markdown_component',
          markdown_component: { text: 'Configure to provision users to {{companyName}}.' },
        },
        { key: 'oidc-scim-2', type: 'bearer_token_component' },
        { key: 'oidc-scim-3', type: 'scim_endpoint_url_component' },
        {
          key: 'oidc-scim-4',
          type: 'markdown_component',
          markdown_component: {
            variant: 'notice',
            text: 'We use standard SCIM syntax (e.g., `emails[type eq "work"].value`) but support varies by identity provider.',
          },
        },
        { key: 'oidc-scim-5', type: 'attribute_mapping_list_component' },
      ],
    },
  ],
  samlp: [
    {
      key: 'samlp-scim-mapping',
      title: 'SCIM mapping',
      contents: [
        { key: 'samlp-scim-1', type: 'bearer_token_component' },
        { key: 'samlp-scim-2', type: 'scim_endpoint_url_component' },
        { key: 'samlp-scim-3', type: 'attribute_mapping_list_component' },
      ],
    },
  ],
  'google-apps': [
    {
      key: 'google-apps-setup',
      title: 'Setup',
      exit_condition: 'google_workspace_setup_complete',
      contents: [{ key: 'google-apps-setup-1', type: 'google_workspace_setup_component' }],
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
