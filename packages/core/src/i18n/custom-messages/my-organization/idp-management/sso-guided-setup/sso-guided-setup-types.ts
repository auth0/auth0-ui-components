/**
 * Custom message type definitions for the SSO guided setup.
 * @module sso-guided-setup-types
 * @internal
 */

interface LabelMessages {
  label?: string;
  helper_text?: string;
}

export interface SsoGuidedSetupCreateModalMessages {
  title?: string;
  description?: string;
  cancel?: string;
  proceed?: string;
}

export interface SsoGuidedSetupCopyValueMessages {
  callback_url?: LabelMessages;
  sso_url?: LabelMessages;
  service_provider_entity_id?: LabelMessages;
  adfs_ws_federation_url?: LabelMessages;
  adfs_relying_party_identifier?: LabelMessages;
  google_javascript_origin?: LabelMessages;
  google_redirect_uri?: LabelMessages;
  pingfederate_partner_entity_id?: LabelMessages;
  pingfederate_endpoint_url?: LabelMessages;
  scim_endpoint_url?: LabelMessages;
  external_namespace?: LabelMessages;
}

export interface SsoGuidedSetupLifecycleMessages {
  out_of_date?: string;
  dismiss?: string;
  deprecated?: string;
}

export interface SsoGuidedSetupTestConnectionMessages {
  instructions?: string;
  keep_open?: string;
}

export interface SsoGuidedSetupMessages {
  stepper_label?: string;
  back?: string;
  next?: string;
  create_provider?: string;
  done?: string;
  unavailable?: string;
  load_error?: string;
  company_fallback?: string;
  create_modal?: SsoGuidedSetupCreateModalMessages;
  copy_values?: SsoGuidedSetupCopyValueMessages;
  attribute_mapping_pending?: string;
  attribute_mapping_unavailable?: string;
  lifecycle?: SsoGuidedSetupLifecycleMessages;
  test_connection?: SsoGuidedSetupTestConnectionMessages;
}

export interface SsoProvisioningSetupMessages {
  title?: string;
  back_button_text?: string;
  guided_setup?: SsoGuidedSetupMessages;
}
