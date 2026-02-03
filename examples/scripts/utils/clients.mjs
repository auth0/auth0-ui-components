import { $ } from "execa"
import ora from "ora"

import { auth0ApiCall } from "./auth0-api.mjs"
import { ChangeAction, createChangeItem } from "./change-plan.mjs"

// Constants
export const APP_BASE_URL = "http://localhost:5173"
export const DASHBOARD_CLIENT_NAME = "Universal Components Demo"

// ============================================================================
// CHECK FUNCTIONS - Determine what changes are needed
// ============================================================================

/**
 * Check if Dashboard Client needs changes
 */
export async function checkDashboardClientChanges(
  existingClients,
  connectionProfileId,
  userAttributeProfileId,
  exampleType,
  domain,
  myOrgApiScopes
) {
  const existingClient = existingClients.find(
    (c) => c.name === DASHBOARD_CLIENT_NAME
  )

  const desiredCallbacks = (exampleType === 'next-rwa') ? [`${APP_BASE_URL}/auth/callback`] : [APP_BASE_URL]
  const desiredLogoutUrls = [APP_BASE_URL]
  const desiredAllowedWebOrigins = (exampleType === 'next-rwa') ? [] : [APP_BASE_URL]

  if (!existingClient) {
    return createChangeItem(ChangeAction.CREATE, {
      resource: "Dashboard Client",
      name: DASHBOARD_CLIENT_NAME,
      connectionProfileId,
      userAttributeProfileId,
    })
  }

  // Fetch full client details to get my_organization_configuration
  // (not included in the list response)
  const fullClient = await auth0ApiCall(
    "get",
    `clients/${existingClient.client_id}`
  )
  const clientToCheck = fullClient || existingClient

  // Check if updates are needed
  const missingCallbacks = desiredCallbacks.filter(
    (cb) => !clientToCheck.callbacks?.includes(cb)
  )
  const missingLogoutUrls = desiredLogoutUrls.filter(
    (url) => !clientToCheck.allowed_logout_urls?.includes(url)
  )
  const missingAllowedWebOrigins = desiredAllowedWebOrigins.filter(
    (o) => !clientToCheck.allowed_web_origins?.includes(o)
  )
  const checkAppType = {
    wrongAppType: (exampleType === 'next-rwa' ? clientToCheck.app_type !== "regular_web" : clientToCheck.app_type !== "spa"),
    requiredAppType: (exampleType === 'next-rwa' ? "regular_web" : "spa")
  }

  // Check if my_org config needs update
  // If profiles are TO_BE_CREATED, we'll need to update after creating them
  // Otherwise, check if current config matches desired IDs
  const myOrgConfigNeedsUpdate =
    connectionProfileId === "TO_BE_CREATED" ||
    userAttributeProfileId === "TO_BE_CREATED" ||
    !clientToCheck.my_organization_configuration ||
    clientToCheck.my_organization_configuration.connection_profile_id !==
      connectionProfileId ||
    clientToCheck.my_organization_configuration.user_attribute_profile_id !==
      userAttributeProfileId

  const organizationSettingsNeedUpdate =
    clientToCheck.organization_require_behavior !== "post_login_prompt" ||
    clientToCheck.organization_usage !== "require"

  const refreshTokenPoliciesNeedUpdate = 
    !clientToCheck.refresh_token?.policies?.some(
      policy => (
        policy.audience === `https://${domain}/my-org/` &&
        policy.scope.slice().sort().toString() === myOrgApiScopes.slice().sort().toString()
      )
    )

  const refreshTokenRotationNeedsUpdate =
    clientToCheck.refresh_token?.rotation_type !== "rotating"

  const refreshTokenNeedsUpdate =
    refreshTokenPoliciesNeedUpdate || refreshTokenRotationNeedsUpdate

  const needsUpdate =
    missingCallbacks.length > 0 ||
    missingLogoutUrls.length > 0 ||
    missingAllowedWebOrigins.length > 0 ||
    checkAppType.wrongAppType ||
    myOrgConfigNeedsUpdate ||
    organizationSettingsNeedUpdate ||
    refreshTokenNeedsUpdate

  if (needsUpdate) {
    const changes = []
    if (missingCallbacks.length > 0)
      changes.push(`Add ${missingCallbacks.length} callback(s)`)
    if (missingLogoutUrls.length > 0)
      changes.push(`Add ${missingLogoutUrls.length} logout URL(s)`)
    if (missingAllowedWebOrigins.length > 0)
      changes.push(`Add ${missingAllowedWebOrigins.length} allowed web origin(s)`)
    if (checkAppType.wrongAppType) changes.push(`Set app_type to ${checkAppType.requiredAppType}`)
    if (myOrgConfigNeedsUpdate) changes.push("Update My Org configuration")
    if (organizationSettingsNeedUpdate)
      changes.push("Update organization settings")
    if (refreshTokenNeedsUpdate)
      changes.push("Update refresh token settings")

    return createChangeItem(ChangeAction.UPDATE, {
      resource: "Universal Components Demo Client",
      name: DASHBOARD_CLIENT_NAME,
      existing: clientToCheck,
      updates: {
        missingCallbacks,
        missingLogoutUrls,
        missingAllowedWebOrigins,
        checkAppType,
        myOrgConfigNeedsUpdate,
        organizationSettingsNeedUpdate,
        connectionProfileId,
        userAttributeProfileId,
        refreshTokenNeedsUpdate
      },
      summary: changes.join(", "),
    })
  }

  return createChangeItem(ChangeAction.SKIP, {
    resource: "Universal Components Demo Client",
    name: DASHBOARD_CLIENT_NAME,
    existing: clientToCheck,
  })
}

/**
 * Check if My Org API Client Grant needs changes
 */
export function checkMyOrgClientGrantChanges(
  clientId,
  existingGrants,
  domain,
  myOrgApiScopes
) {
  const existingGrant = existingGrants.find(
    (g) =>
      g.client_id === clientId && g.audience === `https://${domain}/my-org/`
  )

  if (!existingGrant) {
    return createChangeItem(ChangeAction.CREATE, {
      resource: "My Org API Client Grant",
      clientId,
      scopes: myOrgApiScopes,
    })
  }

  // Check if we need to add any missing scopes
  const existingScopes = existingGrant.scope || []
  const missingScopes = myOrgApiScopes.filter(
    (scope) => !existingScopes.includes(scope)
  )

  if (missingScopes.length > 0) {
    return createChangeItem(ChangeAction.UPDATE, {
      resource: "My Org API Client Grant",
      existing: existingGrant,
      updates: {
        missingScopes,
      },
      summary: `Add ${missingScopes.length} scope(s)`,
    })
  }

  return createChangeItem(ChangeAction.SKIP, {
    resource: "My Org API Client Grant",
    existing: existingGrant,
  })
}

// ============================================================================
// APPLY FUNCTIONS - Execute changes based on cached plan
// ============================================================================

/**
 * Apply Dashboard Client changes
 */
export async function applyDashboardClientChanges(
  changePlan,
  connectionProfileId,
  userAttributeProfileId,
  exampleType,
  domain,
  myOrgApiScopes
) {
  if (changePlan.action === ChangeAction.SKIP) {
    const spinner = ora({
      text: `${DASHBOARD_CLIENT_NAME} client is up to date`,
    }).start()
    spinner.succeed()
    return changePlan.existing
  }

  if (changePlan.action === ChangeAction.CREATE) {
    const spinner = ora({
      text: `Creating ${DASHBOARD_CLIENT_NAME} client`,
    }).start()

    try {
      const desiredCallbacks = (exampleType === 'next-rwa') ? [`${APP_BASE_URL}/auth/callback`] : [APP_BASE_URL]
      const desiredLogoutUrls = [APP_BASE_URL]
      const desiredAppType = (exampleType === 'next-rwa') ? "regular_web" : "spa" 
      const desiredTokenEndpointAuthMethod = (exampleType === 'next-rwa') ? "client_secret_post" : "none"
      const desiredAllowedWebOrigins = desiredAppType === 'spa' ? [APP_BASE_URL] : []

      // prettier-ignore
      const createClientArgs = [
        "api", "post", "clients",
        "--data", JSON.stringify({
          name: DASHBOARD_CLIENT_NAME,
          description: "The client to facilitate login to the dashboard in the context of an organization.",
          callbacks: desiredCallbacks,
          allowed_logout_urls: desiredLogoutUrls,
          web_origins: desiredAllowedWebOrigins,
          app_type: desiredAppType,
          oidc_conformant: true,
          is_first_party: true,
          grant_types: ["authorization_code", "refresh_token"],
          token_endpoint_auth_method: desiredTokenEndpointAuthMethod,
          organization_require_behavior: "post_login_prompt",
          organization_usage: "require",
          jwt_configuration: {
            alg: "RS256",
            lifetime_in_seconds: 36000,
            secret_encoded: false,
          },
          my_organization_configuration: {
            connection_profile_id: connectionProfileId,
            user_attribute_profile_id: userAttributeProfileId,
            connection_deletion_behavior: "allow_if_empty",
            allowed_strategies: [
              "pingfederate",
              "adfs",
              "waad",
              "google-apps",
              "okta",
              "oidc",
              "samlp",
            ],
          },
          refresh_token: {
            expiration_type: "expiring",
            rotation_type: "rotating",
            token_lifetime: 31557600,
            idle_token_lifetime: 2592000,
            leeway: 0,
            infinite_token_lifetime: false,
            infinite_idle_token_lifetime: false,
            policies: [{
              audience: `https://${domain}/my-org/`,
              scope: myOrgApiScopes
            }] 
          }
        }),
      ];

      const { stdout } = await $`auth0 ${createClientArgs}`
      const client = JSON.parse(stdout)

      // Fetch full client details including client_secret
      const { stdout: fullClientStdout } =
        await $`auth0 api get clients/${client.client_id}?fields=client_id,name,client_secret,app_type,callbacks,allowed_logout_urls,my_organization_configuration,organization_require_behavior,organization_usage,refresh_token`
      const fullClient = JSON.parse(fullClientStdout)

      spinner.succeed(`Created ${DASHBOARD_CLIENT_NAME} client`)
      return fullClient
    } catch (e) {
      spinner.fail(`Failed to create the ${DASHBOARD_CLIENT_NAME} client`)
      spinner.fail(`Ensure your tenant supports My Organization feature.`)
      throw e
    }
  }

  if (changePlan.action === ChangeAction.UPDATE) {
    const spinner = ora({
      text: `Updating ${DASHBOARD_CLIENT_NAME} client configuration`,
    }).start()

    try {
      const { existing, updates } = changePlan
      const updateData = {}

      if (updates.missingCallbacks.length > 0) {
        updateData.callbacks = [
          ...(existing.callbacks || []),
          ...updates.missingCallbacks,
        ]
      }

      if (updates.missingLogoutUrls.length > 0) {
        updateData.allowed_logout_urls = [
          ...(existing.allowed_logout_urls || []),
          ...updates.missingLogoutUrls,
        ]
      }

      if (updates.missingAllowedWebOrigins && updates.missingAllowedWebOrigins.length > 0) {
        updateData.web_origins = [
          ...(existing.allowed_web_origins || []),
          ...updates.missingAllowedWebOrigins,
        ]
      }

      if (updates.checkAppType.wrongAppType) {
        updateData.app_type = updates.checkAppType.requiredAppType
        updateData.token_endpoint_auth_method = (updates.checkAppType.requiredAppType === 'regular_web') ? "client_secret_post" : "none"
      }

      if (updates.organizationSettingsNeedUpdate) {
        updateData.organization_require_behavior = "post_login_prompt"
        updateData.organization_usage = "require"
      }

      if (updates.myOrgConfigNeedsUpdate) {
        updateData.my_organization_configuration = {
          connection_profile_id: connectionProfileId,
          user_attribute_profile_id: userAttributeProfileId,
          connection_deletion_behavior: "allow_if_empty",
          allowed_strategies: [
            "pingfederate",
            "adfs",
            "waad",
            "google-apps",
            "okta",
            "oidc",
            "samlp",
          ],
        }
      }

      if (updates.refreshTokenNeedsUpdate) {
        const desiredPolicy = {
          audience: `https://${domain}/my-org/`,
          scope: myOrgApiScopes,
        }

        const existingPolicies = existing.refresh_token?.policies || []
        const hasPolicy = existingPolicies.some(
          (policy) =>
            policy.audience === desiredPolicy.audience &&
            policy.scope?.slice().sort().toString() ===
              myOrgApiScopes.slice().sort().toString()
        )

        const newPolicies = hasPolicy
          ? existingPolicies
          : [...existingPolicies, desiredPolicy]

        updateData.refresh_token = {
          ...(existing.refresh_token || {}),
          rotation_type: "rotating",
          policies: newPolicies,
        }
      }

      await auth0ApiCall("patch", `clients/${existing.client_id}`, updateData)
      spinner.succeed(`Updated ${DASHBOARD_CLIENT_NAME} client`)

      // Fetch updated client with client_secret to return
      const { stdout } =
        await $`auth0 api get clients/${existing.client_id}?fields=client_id,name,client_secret,app_type,callbacks,allowed_logout_urls,my_organization_configuration,organization_require_behavior,organization_usage`
      const updated = JSON.parse(stdout)
      return updated
    } catch (e) {
      spinner.fail(`Failed to update ${DASHBOARD_CLIENT_NAME} client`)
      throw e
    }
  }
}

/**
 * Apply My Org API Client Grant changes
 */
export async function applyMyOrgClientGrantChanges(
  changePlan,
  domain,
  clientId
) {
  if (changePlan.action === ChangeAction.SKIP) {
    const spinner = ora({
      text: `My Org API Client Grant is up to date`,
    }).start()
    spinner.succeed()
    return changePlan.existing
  }

  if (changePlan.action === ChangeAction.CREATE) {
    const spinner = ora({
      text: `Creating ${DASHBOARD_CLIENT_NAME} client grants for My Org API`,
    }).start()

    try {
      // prettier-ignore
      const createClientGrantArgs = [
        "api", "post", "client-grants",
        "--data", JSON.stringify({
          client_id: clientId,
          audience: `https://${domain}/my-org/`,
          scope: changePlan.scopes,
          subject_type: "user"
        }),
      ];

      await $`auth0 ${createClientGrantArgs}`
      spinner.succeed(`Created My Org API Client Grant`)
    } catch (e) {
      spinner.fail(
        `Failed to create the ${DASHBOARD_CLIENT_NAME} client grants for My Organization API`
      )
      throw e
    }
  }

  if (changePlan.action === ChangeAction.UPDATE) {
    const spinner = ora({
      text: `Adding missing scopes to My Org API Client Grant`,
    }).start()

    try {
      const { existing, updates } = changePlan
      const existingScopes = existing.scope || []
      const updatedScopes = [...existingScopes, ...updates.missingScopes]

      await auth0ApiCall("patch", `client-grants/${existing.id}`, {
        scope: updatedScopes,
      })
      spinner.succeed(
        `Updated My Org API Client Grant with ${updates.missingScopes.length} new scope(s)`
      )
      return existing
    } catch (e) {
      spinner.fail(`Failed to update My Org API Client Grant`)
      throw e
    }
  }
}
