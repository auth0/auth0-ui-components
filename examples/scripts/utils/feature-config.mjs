import { selectOptionFromList } from "./helpers.mjs"

/**
 * Feature configuration type
 * @typedef {Object} FeatureConfig
 * @property {boolean} enableMyOrg - Whether to configure My Organization API
 * @property {boolean} enableMyAccount - Whether to configure My Account API
 */

/**
 * Feature selection options
 */
export const FeatureOptions = {
  FULL: "full",
  MY_ORG_ONLY: "my-org-only",
  MY_ACCOUNT_ONLY: "my-account-only",
}

/**
 * Create a feature configuration object
 * @param {boolean} enableMyOrg - Enable My Organization features
 * @param {boolean} enableMyAccount - Enable My Account features
 * @returns {FeatureConfig}
 */
export function createFeatureConfig(enableMyOrg = true, enableMyAccount = true) {
  return {
    enableMyOrg,
    enableMyAccount,
  }
}

/**
 * Interactively select which features to set up
 * @returns {Promise<FeatureConfig>}
 */
export async function selectFeaturesInteractively() {
  const options = [
    {
      name: "Full Example App Experience",
      value: FeatureOptions.FULL,
      description:
        "Configure both My Organization and My Account APIs for the complete demo showcasing all Universal Components features.",
    },
    {
      name: "Organization Management Only",
      value: FeatureOptions.MY_ORG_ONLY,
      description:
        "Configure only My Organization API. Best for building admin dashboards that manage SSO connections, domains, and organization settings.",
    },
    {
      name: "User Self-Service Only",
      value: FeatureOptions.MY_ACCOUNT_ONLY,
      description:
        "Configure only My Account API. Best for building user account pages where users can manage their own MFA methods.",
    },
  ]

  const selection = await selectOptionFromList(
    "What would you like to set up?",
    options
  )

  switch (selection) {
    case FeatureOptions.FULL:
      return createFeatureConfig(true, true)
    case FeatureOptions.MY_ORG_ONLY:
      return createFeatureConfig(true, false)
    case FeatureOptions.MY_ACCOUNT_ONLY:
      return createFeatureConfig(false, true)
    default:
      return createFeatureConfig(true, true)
  }
}

/**
 * Get a human-readable description of the feature configuration
 * @param {FeatureConfig} featureConfig
 * @returns {string}
 */
export function getFeatureDescription(featureConfig) {
  if (featureConfig.enableMyOrg && featureConfig.enableMyAccount) {
    return "Full Example App Experience (My Organization + My Account)"
  } else if (featureConfig.enableMyOrg) {
    return "Organization Management Only"
  } else if (featureConfig.enableMyAccount) {
    return "User Self-Service Only"
  }
  return "No features selected"
}
