import { $ } from "execa"
import ora from "ora"

import { auth0ApiCall } from "./auth0-api.mjs"
import { ChangeAction, createChangeItem } from "./change-plan.mjs"

// Constants
export const APP_BASE_URL = "http://localhost:5173"

/**
 * Get the dashboard client name based on example type
 * Each example type gets its own dedicated client
 * @param {string} exampleType - The example type (next-rwa, react-spa-shadcn, react-spa-npm)
 * @returns {string} The client name
 */
export function getDashboardClientName(exampleType) {
  const exampleNames = {
    'next-rwa': 'Universal Components Demo (Next.js)',
    'react-spa-shadcn': 'Universal Components Demo (React SPA - shadcn)',
    'react-spa-npm': 'Universal Components Demo (React SPA - npm)',
  }
  return exampleNames[exampleType] || 'Universal Components Demo'
}

// ============================================================================
// CHECK FUNCTIONS - Determine what changes are needed
// ============================================================================

/**
 * Check if Dashboard Client needs changes
 * @param {object} featureConfig - Feature configuration { enableMyOrg, enableMyAccount }
 */
export async function checkDashboardClientChanges(
  existingClients,
  connectionProfileId,
  userAttributeProfileId,
  exampleType,
  domain,
  myOrgApiScopes,
  myAccountApiScopes,
  featureConfig = { enableMyOrg: true, enableMyAccount: true }
) {
  const clientName = getDashboardClientName(exampleType)
  const existingClient = existingClients.find(
    (c) => c.name === clientName
  )

  const desiredCallbacks = (exampleType === 'next-rwa') ? [`${APP_BASE_URL}/auth/callback`] : [APP_BASE_URL]
  const desiredLogoutUrls = [APP_BASE_URL]
  const desiredAllowedWebOrigins = (exampleType === 'next-rwa') ? [] : [APP_BASE_URL]

  if (!existingClient) {
    return createChangeItem(ChangeAction.CREATE, {
      resource: "Dashboard Client",
      name: clientName,
      connectionProfileId,
      userAttributeProfileId,
      featureConfig,
      exampleType,
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

  // Check if my_org config needs update (only if MyOrg is enabled)
  // Keep my_organization_configuration on client even if MyOrg disabled (harmless, future-proofs)
  const myOrgConfigNeedsUpdate = featureConfig.enableMyOrg && (
    connectionProfileId === "TO_BE_CREATED" ||
    userAttributeProfileId === "TO_BE_CREATED" ||
    !clientToCheck.my_organization_configuration ||
    clientToCheck.my_organization_configuration.connection_profile_id !==
      connectionProfileId ||
    clientToCheck.my_organization_configuration.user_attribute_profile_id !==
      userAttributeProfileId
  )

  // Organization settings only needed if MyOrg is enabled
  const organizationSettingsNeedUpdate = featureConfig.enableMyOrg && (
    clientToCheck.organization_require_behavior !== "post_login_prompt" ||
    clientToCheck.organization_usage !== "require"
  )

  // Check refresh token policies based on enabled features
  let refreshTokenPoliciesNeedUpdate = false

  // Check if My Org API policy exists with correct scopes (only if enabled)
  if (featureConfig.enableMyOrg && myOrgApiScopes.length > 0) {
    const hasMyOrgPolicy = clientToCheck.refresh_token?.policies?.some(
      policy => (
        policy.audience === `https://${domain}/my-org/` &&
        policy.scope?.slice().sort().toString() === myOrgApiScopes.slice().sort().toString()
      )
    )
    if (!hasMyOrgPolicy) {
      refreshTokenPoliciesNeedUpdate = true
    }
  }

  // Check if My Account API policy exists with correct scopes (only if enabled)
  if (featureConfig.enableMyAccount && myAccountApiScopes.length > 0) {
    const hasMyAccountPolicy = clientToCheck.refresh_token?.policies?.some(
      policy => (
        policy.audience === `https://${domain}/me/` &&
        policy.scope?.slice().sort().toString() === myAccountApiScopes.slice().sort().toString()
      )
    )
    if (!hasMyAccountPolicy) {
      refreshTokenPoliciesNeedUpdate = true
    }
  }

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
      resource: "Dashboard Client",
      name: clientName,
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
      featureConfig,
      exampleType,
      summary: `\n     - ${changes.join("\n     - ")}`,
    })
  }

  return createChangeItem(ChangeAction.SKIP, {
    resource: "Dashboard Client",
    name: clientName,
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

/**
 * Check if My Account API Client Grant needs changes
 */
export function checkMyAccountClientGrantChanges(
  clientId,
  existingGrants,
  domain,
  myAccountApiScopes
) {
  const existingGrant = existingGrants.find(
    (g) =>
      g.client_id === clientId && g.audience === `https://${domain}/me/`
  )

  if (!existingGrant) {
    return createChangeItem(ChangeAction.CREATE, {
      resource: "My Account API Client Grant",
      clientId,
      scopes: myAccountApiScopes,
    })
  }

  // Check if we need to add any missing scopes
  const existingScopes = existingGrant.scope || []
  const missingScopes = myAccountApiScopes.filter(
    (scope) => !existingScopes.includes(scope)
  )

  if (missingScopes.length > 0) {
    return createChangeItem(ChangeAction.UPDATE, {
      resource: "My Account API Client Grant",
      existing: existingGrant,
      updates: {
        missingScopes,
      },
      summary: `Add ${missingScopes.length} scope(s)`,
    })
  }

  return createChangeItem(ChangeAction.SKIP, {
    resource: "My Account API Client Grant",
    existing: existingGrant,
  })
}

// ============================================================================
// APPLY FUNCTIONS - Execute changes based on cached plan
// ============================================================================

/**
 * Build refresh token policies based on feature configuration
 * @param {string} domain - The tenant domain
 * @param {object} featureConfig - Feature configuration { enableMyOrg, enableMyAccount }
 * @param {string[]} myOrgApiScopes - My Org API scopes
 * @param {string[]} myAccountApiScopes - My Account API scopes
 * @returns {object[]} Array of refresh token policies
 */
function buildRefreshTokenPolicies(domain, featureConfig, myOrgApiScopes, myAccountApiScopes) {
  const policies = []

  if (featureConfig.enableMyOrg && myOrgApiScopes.length > 0) {
    policies.push({
      audience: `https://${domain}/my-org/`,
      scope: myOrgApiScopes
    })
  }

  if (featureConfig.enableMyAccount && myAccountApiScopes.length > 0) {
    policies.push({
      audience: `https://${domain}/me/`,
      scope: myAccountApiScopes
    })
  }

  return policies
}

/**
 * Apply Dashboard Client changes
 * @param {object} featureConfig - Feature configuration { enableMyOrg, enableMyAccount }
 */
export async function applyDashboardClientChanges(
  changePlan,
  connectionProfileId,
  userAttributeProfileId,
  exampleType,
  domain,
  myOrgApiScopes,
  myAccountApiScopes,
  featureConfig = { enableMyOrg: true, enableMyAccount: true }
) {
  const clientName = getDashboardClientName(exampleType)

  if (changePlan.action === ChangeAction.SKIP) {
    const spinner = ora({
      text: `${clientName} client is up to date`,
    }).start()
    spinner.succeed()
    return changePlan.existing
  }

  // Use featureConfig from changePlan if available (for consistency)
  const effectiveFeatureConfig = changePlan.featureConfig || featureConfig

  if (changePlan.action === ChangeAction.CREATE) {
    const spinner = ora({
      text: `Creating ${clientName} client`,
    }).start()

    try {
      const desiredCallbacks = (exampleType === 'next-rwa') ? [`${APP_BASE_URL}/auth/callback`] : [APP_BASE_URL]
      const desiredLogoutUrls = [APP_BASE_URL]
      const desiredAppType = (exampleType === 'next-rwa') ? "regular_web" : "spa"
      const desiredTokenEndpointAuthMethod = (exampleType === 'next-rwa') ? "client_secret_post" : "none"
      const desiredAllowedWebOrigins = desiredAppType === 'spa' ? [APP_BASE_URL] : []

      // Build refresh token policies based on enabled features
      const refreshTokenPolicies = buildRefreshTokenPolicies(
        domain,
        effectiveFeatureConfig,
        myOrgApiScopes,
        myAccountApiScopes
      )

      // Build client data conditionally based on features
      const clientData = {
        name: clientName,
        description: "The client to facilitate login to the dashboard in the context of an organization.",
        callbacks: desiredCallbacks,
        allowed_logout_urls: desiredLogoutUrls,
        web_origins: desiredAllowedWebOrigins,
        app_type: desiredAppType,
        oidc_conformant: true,
        is_first_party: true,
        grant_types: ["authorization_code", "refresh_token"],
        token_endpoint_auth_method: desiredTokenEndpointAuthMethod,
        jwt_configuration: {
          alg: "RS256",
          lifetime_in_seconds: 36000,
          secret_encoded: false,
        },
        refresh_token: {
          expiration_type: "expiring",
          rotation_type: "rotating",
          token_lifetime: 31557600,
          idle_token_lifetime: 2592000,
          leeway: 0,
          infinite_token_lifetime: false,
          infinite_idle_token_lifetime: false,
          policies: refreshTokenPolicies
        }
      }

      // Add organization settings only if MyOrg is enabled
      if (effectiveFeatureConfig.enableMyOrg) {
        clientData.organization_require_behavior = "post_login_prompt"
        clientData.organization_usage = "require"
        clientData.my_organization_configuration = {
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

      // prettier-ignore
      const createClientArgs = [
        "api", "post", "clients",
        "--data", JSON.stringify(clientData),
      ];

      const { stdout } = await $`auth0 ${createClientArgs}`
      const client = JSON.parse(stdout)

      // Fetch full client details including client_secret
      const { stdout: fullClientStdout } =
        await $`auth0 api get clients/${client.client_id}?fields=client_id,name,client_secret,app_type,callbacks,allowed_logout_urls,my_organization_configuration,organization_require_behavior,organization_usage,refresh_token`
      const fullClient = JSON.parse(fullClientStdout)

      spinner.succeed(`Created ${clientName} client`)
      return fullClient
    } catch (e) {
      spinner.fail(`Failed to create the ${clientName} client`)
      if (effectiveFeatureConfig.enableMyOrg) {
        spinner.fail(`Ensure your tenant supports My Organization feature.`)
      }
      throw e
    }
  }

  if (changePlan.action === ChangeAction.UPDATE) {
    const spinner = ora({
      text: `Updating ${clientName} client configuration`,
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
        const existingPolicies = existing.refresh_token?.policies || []
        let newPolicies = [...existingPolicies]

        // Handle My Org policy (only if enabled)
        if (effectiveFeatureConfig.enableMyOrg && myOrgApiScopes.length > 0) {
          const desiredMyOrgPolicy = {
            audience: `https://${domain}/my-org/`,
            scope: myOrgApiScopes,
          }

          const hasMyOrgPolicy = existingPolicies.some(
            (policy) =>
              policy.audience === desiredMyOrgPolicy.audience &&
              policy.scope?.slice().sort().toString() ===
                myOrgApiScopes.slice().sort().toString()
          )

          if (!hasMyOrgPolicy) {
            // Remove any existing My Org policy with wrong scopes
            newPolicies = newPolicies.filter(p => p.audience !== desiredMyOrgPolicy.audience)
            newPolicies.push(desiredMyOrgPolicy)
          }
        }

        // Handle My Account policy (only if enabled)
        if (effectiveFeatureConfig.enableMyAccount && myAccountApiScopes.length > 0) {
          const desiredMyAccountPolicy = {
            audience: `https://${domain}/me/`,
            scope: myAccountApiScopes,
          }

          const hasMyAccountPolicy = existingPolicies.some(
            (policy) =>
              policy.audience === desiredMyAccountPolicy.audience &&
              policy.scope?.slice().sort().toString() ===
                myAccountApiScopes.slice().sort().toString()
          )

          if (!hasMyAccountPolicy) {
            // Remove any existing My Account policy with wrong scopes
            newPolicies = newPolicies.filter(p => p.audience !== desiredMyAccountPolicy.audience)
            newPolicies.push(desiredMyAccountPolicy)
          }
        }

        updateData.refresh_token = {
          ...(existing.refresh_token || {}),
          rotation_type: "rotating",
          policies: newPolicies,
        }
      }

      await auth0ApiCall("patch", `clients/${existing.client_id}`, updateData)
      spinner.succeed(`Updated ${clientName} client`)

      // Fetch updated client with client_secret to return
      const { stdout } =
        await $`auth0 api get clients/${existing.client_id}?fields=client_id,name,client_secret,app_type,callbacks,allowed_logout_urls,my_organization_configuration,organization_require_behavior,organization_usage`
      const updated = JSON.parse(stdout)
      return updated
    } catch (e) {
      spinner.fail(`Failed to update ${clientName} client`)
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
      text: `Creating client grant for My Org API`,
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
      spinner.fail(`Failed to create client grant for My Organization API`)
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

/**
 * Apply My Account API Client Grant changes
 */
export async function applyMyAccountClientGrantChanges(
  changePlan,
  domain,
  clientId
) {
  if (changePlan.action === ChangeAction.SKIP) {
    const spinner = ora({
      text: `My Account API Client Grant is up to date`,
    }).start()
    spinner.succeed()
    return changePlan.existing
  }

  if (changePlan.action === ChangeAction.CREATE) {
    const spinner = ora({
      text: `Creating client grant for My Account API`,
    }).start()

    try {
      // prettier-ignore
      const createClientGrantArgs = [
        "api", "post", "client-grants",
        "--data", JSON.stringify({
          client_id: clientId,
          audience: `https://${domain}/me/`,
          scope: changePlan.scopes,
          subject_type: "user"
        }),
      ];

      await $`auth0 ${createClientGrantArgs}`
      spinner.succeed(`Created My Account API Client Grant`)
    } catch (e) {
      spinner.fail(`Failed to create client grant for My Account API`)
      throw e
    }
  }

  if (changePlan.action === ChangeAction.UPDATE) {
    const spinner = ora({
      text: `Adding missing scopes to My Account API Client Grant`,
    }).start()

    try {
      const { existing, updates } = changePlan
      const existingScopes = existing.scope || []
      const updatedScopes = [...existingScopes, ...updates.missingScopes]

      await auth0ApiCall("patch", `client-grants/${existing.id}`, {
        scope: updatedScopes,
      })
      spinner.succeed(
        `Updated My Account API Client Grant with ${updates.missingScopes.length} new scope(s)`
      )
      return existing
    } catch (e) {
      spinner.fail(`Failed to update My Account API Client Grant`)
      throw e
    }
  }
}
