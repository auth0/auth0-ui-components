/**
 * Organization configuration type definitions.
 * @module config-types
 * @internal
 */
import type { MyOrganization } from '@auth0/myorganization-js';

export type GetConfigurationResponseContent = MyOrganization.GetConfigurationResponseContent;

export type GetIdpConfigurationResponseContent = MyOrganization.GetIdpConfigurationResponseContent;
export type IdentityProvidersConfigStrategyBase =
  MyOrganization.IdentityProvidersConfigStrategyBase;
export type CrossAppAccessResourceAppConfig = MyOrganization.CrossAppAccessResourceAppConfig;
export type IdentityProviderConfigOidc = MyOrganization.IdentityProviderConfigOidc;
export type IdentityProviderConfigOkta = MyOrganization.IdentityProviderConfigOkta;
export type IdentityProviderConfigSamlp = MyOrganization.IdentityProviderConfigSamlp;

export type StrategyWithCrossAppAccess =
  | IdentityProviderConfigOidc
  | IdentityProviderConfigOkta
  | IdentityProviderConfigSamlp;

// Identity provider creation instructions
export type IdpInstructionsResponse = MyOrganization.GetIdentityProviderInstructionsResponseContent;
export type IdpInstructionsPage = MyOrganization.IdpInstructionsPage;
export type IdpInstructionsPageContent = MyOrganization.IdpInstructionsPageContent;
export type IdpInstructionsContentType = MyOrganization.IdpInstructionsPageContentTypeEnum;
export type IdpInstructionsEntryCondition = MyOrganization.IdpInstructionsPageEntryConditionEnum;
export type IdpInstructionsExitCondition = MyOrganization.IdpInstructionsPageExitConditionEnum;
export type IdpInstructionsMarkdownComponent = MyOrganization.IdpInstructionsMarkdownComponent;
export type IdpInstructionsTabsComponent = MyOrganization.IdpInstructionsTabsComponent;
export type IdpInstructionsTab = MyOrganization.IdpInstructionsTab;
export type IdpInstructionsTabContent = MyOrganization.IdpInstructionsTabContent;
export type IdpInstructionsOktaConfigureConnectionComponent =
  MyOrganization.IdpInstructionsOktaConfigureConnectionComponent;
export type IdpInstructionsAdfsConfigureConnectionComponent =
  MyOrganization.IdpInstructionsAdfsConfigureConnectionComponent;
export type IdpInstructionsGoogleAppsConfigureConnectionComponent =
  MyOrganization.IdpInstructionsGoogleAppsConfigureConnectionComponent;
export type IdpInstructionsVersionInfo = MyOrganization.IdpInstructionsVersionInfo;
export type IdpInstructionsLifecycleStatus = MyOrganization.IdpInstructionsLifecycleStatusEnum;
export type IdpInstructionsLocale = MyOrganization.IdpInstructionsLocaleEnum;

// Identity provider provisioning instructions
export type IdpProvisioningInstructionsResponse =
  MyOrganization.GetIdentityProviderProvisioningInstructionsResponseContent;
export type IdpProvisioningInstructionsPage = MyOrganization.IdpProvisioningInstructionsPage;
export type IdpProvisioningInstructionsPageContent =
  MyOrganization.IdpProvisioningInstructionsPageContent;
export type IdpProvisioningInstructionsContentType =
  MyOrganization.IdpProvisioningInstructionsPageContentTypeEnum;
export type IdpProvisioningInstructionsEntryCondition =
  MyOrganization.IdpProvisioningInstructionsPageEntryConditionEnum;
export type IdpProvisioningInstructionsExitCondition =
  MyOrganization.IdpProvisioningInstructionsPageExitConditionEnum;
export type IdpProvisioningInstructionsMarkdownComponent =
  MyOrganization.IdpProvisioningInstructionsMarkdownComponent;
