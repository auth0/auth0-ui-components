/**
 * Identity provider instructions type definitions (re-exported from the SDK).
 * @module instructions-types
 * @internal
 */
import type { MyOrganization } from '@auth0/myorganization-js';

// Creation instructions
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

// Provisioning instructions
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

export type InstructionsKind = 'creation' | 'provisioning';
export type InstructionsEntryCondition =
  | IdpInstructionsEntryCondition
  | IdpProvisioningInstructionsEntryCondition;
export type InstructionsExitCondition =
  | IdpInstructionsExitCondition
  | IdpProvisioningInstructionsExitCondition;
export interface InstructionsFlowPage {
  key: string;
  entry_condition?: string;
  exit_condition?: string;
}
export interface InstructionsEntryContext {
  hasMappings: boolean;
  groupProvisioningEnabled: boolean;
}
export interface InstructionsExitState {
  connectionExists: boolean;
  googleWorkspaceSetupComplete: boolean;
}
export type ExitConditionPolicy = 'blocking' | 'suggested';
