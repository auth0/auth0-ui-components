import { $ } from "execa"
import ora from "ora"

import { auth0ApiCall } from "./auth0-api.mjs"
import { ChangeAction, createChangeItem } from "./change-plan.mjs"

// Constants
export const MYORG_API_SCOPES = [
"read:my_org:details",
"update:my_org:details",
"create:my_org:identity_providers",
"read:my_org:identity_providers",
"update:my_org:identity_providers",
"delete:my_org:identity_providers",
"update:my_org:identity_providers_detach",
"read:my_org:domains",
"delete:my_org:domains",
"create:my_org:domains",
"update:my_org:domains",
"create:my_org:identity_providers_domains",
"delete:my_org:identity_providers_domains",
"read:my_org:identity_providers_scim_tokens",
"create:my_org:identity_providers_scim_tokens",
"delete:my_org:identity_providers_scim_tokens",
"create:my_org:identity_providers_provisioning",
"read:my_org:identity_providers_provisioning",
"delete:my_org:identity_providers_provisioning",
"read:my_org:configuration",
]

// My Account API Scopes (for MFA management)
export const MYACCOUNT_API_SCOPES = [
  "create:me:authentication_methods",
  "read:me:authentication_methods",
  "delete:me:authentication_methods",
  "update:me:authentication_methods",
  "read:me:factors",
]

// ============================================================================
// CHECK FUNCTIONS - Determine what changes are needed
// ============================================================================

/**
 * Check if My Organization Resource Server needs changes
 */
export function checkMyOrgResourceServerChanges(
  existingResourceServers,
  domain
) {
  const existingRS = existingResourceServers.find(
    (rs) => rs.identifier === `https://${domain}/my-org/`
  )

  if (!existingRS) {
    return createChangeItem(ChangeAction.CREATE, {
      resource: "My Organization API",
      identifier: `https://${domain}/my-org/`,
    })
  }

  // Check if skip_consent_for_verifiable_first_party_clients needs updating
  const needsUpdate =
    existingRS.skip_consent_for_verifiable_first_party_clients !== true

  if (needsUpdate) {
    return createChangeItem(ChangeAction.UPDATE, {
      resource: "My Organization API",
      existing: existingRS,
      updates: {
        skip_consent_for_verifiable_first_party_clients: true,
      },
      summary: "Set skip_consent_for_verifiable_first_party_clients to true",
    })
  }

  return createChangeItem(ChangeAction.SKIP, {
    resource: "My Organization API",
    existing: existingRS,
  })
}

/**
 * Check if My Account Resource Server needs changes
 */
export function checkMyAccountResourceServerChanges(
  existingResourceServers,
  domain
) {
  const existingRS = existingResourceServers.find(
    (rs) => rs.identifier === `https://${domain}/me/`
  )

  if (!existingRS) {
    return createChangeItem(ChangeAction.CREATE, {
      resource: "My Account API",
      identifier: `https://${domain}/me/`,
    })
  }

  // Check if skip_consent_for_verifiable_first_party_clients needs updating
  const needsUpdate =
    existingRS.skip_consent_for_verifiable_first_party_clients !== true

  if (needsUpdate) {
    return createChangeItem(ChangeAction.UPDATE, {
      resource: "My Account API",
      existing: existingRS,
      updates: {
        skip_consent_for_verifiable_first_party_clients: true,
      },
      summary: "Set skip_consent_for_verifiable_first_party_clients to true",
    })
  }

  return createChangeItem(ChangeAction.SKIP, {
    resource: "My Account API",
    existing: existingRS,
  })
}

// ============================================================================
// APPLY FUNCTIONS - Execute changes based on cached plan
// ============================================================================

/**
 * Apply My Organization Resource Server changes
 */
export async function applyMyOrgResourceServerChanges(changePlan, domain) {
  if (changePlan.action === ChangeAction.SKIP) {
    const spinner = ora({
      text: `My Organization API is up to date`,
    }).start()
    spinner.succeed()
    return changePlan.existing
  }

  if (changePlan.action === ChangeAction.CREATE) {
    const spinner = ora({
      text: `Enabling My Organization API`,
    }).start()

    try {
      // prettier-ignore
      const createMyOrgResourceServerArgs = [
        "api", "post", "resource-servers",
        "--data", JSON.stringify({
          identifier: `https://${domain}/my-org/`,
          name: "Auth0 My Organization API",
          skip_consent_for_verifiable_first_party_clients: true,
          token_dialect: "rfc9068_profile",
        }),
      ];

      const { stdout } = await $`auth0 ${createMyOrgResourceServerArgs}`
      const { error, rs } = JSON.parse(stdout)
      if (error) {
        throw new Error("Failed to enable My Organization API")
      }
      spinner.succeed("Enabled My Organization API")
      return rs
    } catch (e) {
      spinner.fail(`Failed to enable My Organization API on Tenant. Please ensure your tenant supports My Organization feature.`)
      throw e
    }
  }

  if (changePlan.action === ChangeAction.UPDATE) {
    const spinner = ora({
      text: `Updating My Organization API configuration`,
    }).start()

    try {
      const { existing, updates } = changePlan

      await auth0ApiCall("patch", `resource-servers/${existing.id}`, updates)
      spinner.succeed(`Updated My Organization API configuration`)

      // Fetch updated resource server
      const updated = await auth0ApiCall(
        "get",
        `resource-servers/${existing.id}`
      )
      return updated || existing
    } catch (e) {
      spinner.fail(`Failed to update My Organization API configuration`)
      throw e
    }
  }
}

/**
 * Apply My Account Resource Server changes
 */
export async function applyMyAccountResourceServerChanges(changePlan, domain) {
  if (changePlan.action === ChangeAction.SKIP) {
    const spinner = ora({
      text: `My Account API is up to date`,
    }).start()
    spinner.succeed()
    return changePlan.existing
  }

  if (changePlan.action === ChangeAction.CREATE) {
    const spinner = ora({
      text: `Enabling My Account API`,
    }).start()

    try {
      // prettier-ignore
      const createMyAccountResourceServerArgs = [
        "api", "post", "resource-servers",
        "--data", JSON.stringify({
          identifier: `https://${domain}/me/`,
          name: "Auth0 My Account API",
          skip_consent_for_verifiable_first_party_clients: true,
          token_dialect: "rfc9068_profile",
        }),
      ];

      const { stdout } = await $`auth0 ${createMyAccountResourceServerArgs}`
      const { error, rs } = JSON.parse(stdout)
      if (error) {
        throw new Error("Failed to enable My Account API")
      }
      spinner.succeed("Enabled My Account API")
      return rs
    } catch (e) {
      spinner.fail(`Failed to enable My Account API on Tenant. Please ensure your tenant supports My Account feature.`)
      throw e
    }
  }

  if (changePlan.action === ChangeAction.UPDATE) {
    const spinner = ora({
      text: `Updating My Account API configuration`,
    }).start()

    try {
      const { existing, updates } = changePlan

      await auth0ApiCall("patch", `resource-servers/${existing.id}`, updates)
      spinner.succeed(`Updated My Account API configuration`)

      // Fetch updated resource server
      const updated = await auth0ApiCall(
        "get",
        `resource-servers/${existing.id}`
      )
      return updated || existing
    } catch (e) {
      spinner.fail(`Failed to update My Account API configuration`)
      throw e
    }
  }
}
