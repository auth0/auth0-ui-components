import { $ } from "execa"
import ora from "ora"

import { auth0ApiCall } from "./auth0-api.mjs"
import { ChangeAction, createChangeItem } from "./change-plan.mjs"

// Constants
export const DEFAULT_CONNECTION_NAME = "Universal-Components-Demo"
export const CONNECTION_PROFILE_NAME = "Universal-Components-Profile"

const ONE_HOUR_IN_SECONDS = 3600
const SEVEN_DAYS_IN_SECONDS = 604800
const THIRTY_DAYS_IN_SECONDS = 2592000

// SCIM token limits applied to every strategy
const SCIM_TOKEN_LIMITS = {
  scopes: ["get:users", "post:users", "patch:users", "delete:users", "put:users"],
  default_expiry: ONE_HOUR_IN_SECONDS,
  max_allowed_expiry: THIRTY_DAYS_IN_SECONDS,
}

// Stricter limits for one strategy, so the demo shows a strategy override
const SCIM_TOKEN_LIMITS_BY_STRATEGY = {
  okta: {
    scopes: ["get:users", "patch:users"],
    default_expiry: ONE_HOUR_IN_SECONDS,
    max_allowed_expiry: SEVEN_DAYS_IN_SECONDS,
  },
}

/**
 * Compare arrays without regard to order
 */
function arraysEqual(arr1, arr2) {
  if (!arr1 || !arr2) return false
  if (arr1.length !== arr2.length) return false
  const sorted1 = [...arr1].sort()
  const sorted2 = [...arr2].sort()
  return sorted1.every((val, idx) => val === sorted2[idx])
}

/**
 * Compare SCIM token limits (scopes in any order)
 */
function scimTokenLimitsMatch(existing, desired) {
  return (
    arraysEqual(existing?.scopes, desired.scopes) &&
    existing?.default_expiry === desired.default_expiry &&
    existing?.max_allowed_expiry === desired.max_allowed_expiry
  )
}

/**
 * Seed the strategy overrides we manage, keeping any others already on the profile
 */
function withSeededStrategyOverrides(existingOverrides = {}) {
  const overrides = { ...existingOverrides }
  for (const [strategy, tokens] of Object.entries(
    SCIM_TOKEN_LIMITS_BY_STRATEGY
  )) {
    overrides[strategy] = {
      ...overrides[strategy],
      provisioning: { scim: { tokens } },
    }
  }
  return overrides
}

// ============================================================================
// CHECK FUNCTIONS - Determine what changes are needed
// ============================================================================

/**
 * Check if Database Connection needs changes
 */
export function checkDatabaseConnectionChanges(
  existingConnections,
  dashboardClientId,
) {
  const existingConnection = existingConnections.find(
    (c) => c.name === DEFAULT_CONNECTION_NAME
  )

  const desiredEnabledClients = [dashboardClientId]

  if (!existingConnection) {
    return createChangeItem(ChangeAction.CREATE, {
      resource: "Database Connection",
      name: DEFAULT_CONNECTION_NAME,
      enabledClients: desiredEnabledClients,
    })
  }

  // Check if we need to add any missing enabled clients
  const existingEnabledClients = existingConnection.enabled_clients || []
  const missingClients = desiredEnabledClients.filter(
    (clientId) => !existingEnabledClients.includes(clientId)
  )

  if (missingClients.length > 0) {
    return createChangeItem(ChangeAction.UPDATE, {
      resource: "Database Connection",
      name: DEFAULT_CONNECTION_NAME,
      existing: existingConnection,
      updates: {
        missingClients,
      },
      summary: `Add ${missingClients.length} enabled client(s)`,
    })
  }

  return createChangeItem(ChangeAction.SKIP, {
    resource: "Database Connection",
    name: DEFAULT_CONNECTION_NAME,
    existing: existingConnection,
  })
}

/**
 * Check if Connection Profile needs changes
 */
export function checkConnectionProfileChanges(existingConnectionProfiles) {
  const existingProfile = existingConnectionProfiles.find(
    (cp) => cp.name === CONNECTION_PROFILE_NAME
  )

  const desiredConfig = {
    organization: {
      show_as_button: "optional",
      assign_membership_on_login: "optional",
    },
    connection_name_prefix_template: "con-{org_id}-",
    enabled_features: ["scim", "universal_logout"],
    cross_app_access_resource_app: {
      status: {
        default_value: "disabled",
        allowed_values: ["disabled", "enabled"],
      },
    },
    domain_aliases_config: {
      domain_verification: "optional",
    },
    provisioning: {
      scim: { tokens: SCIM_TOKEN_LIMITS },
    },
    strategy_overrides: withSeededStrategyOverrides(),
  }

  if (!existingProfile) {
    return createChangeItem(ChangeAction.CREATE, {
      resource: "Connection Profile",
      name: CONNECTION_PROFILE_NAME,
      summary: "With SCIM and Universal Logout enabled",
      config: desiredConfig,
    })
  }

  // Check if cross_app_access_resource_app needs update
  const crossAppAccessNeedsUpdate =
    !existingProfile.cross_app_access_resource_app ||
    existingProfile.cross_app_access_resource_app?.status?.default_value !==
      desiredConfig.cross_app_access_resource_app.status.default_value ||
    !arraysEqual(
      existingProfile.cross_app_access_resource_app?.status?.allowed_values || [],
      desiredConfig.cross_app_access_resource_app.status.allowed_values
    )

  // Check if domain_aliases_config needs update
  const domainAliasesConfigNeedsUpdate =
    existingProfile.domain_aliases_config?.domain_verification !==
    desiredConfig.domain_aliases_config.domain_verification

  const provisioningNeedsUpdate = !scimTokenLimitsMatch(
    existingProfile.provisioning?.scim?.tokens,
    SCIM_TOKEN_LIMITS
  )

  const strategyOverridesNeedUpdate = Object.entries(
    SCIM_TOKEN_LIMITS_BY_STRATEGY
  ).some(
    ([strategy, tokens]) =>
      !scimTokenLimitsMatch(
        existingProfile.strategy_overrides?.[strategy]?.provisioning?.scim
          ?.tokens,
        tokens
      )
  )

  // Check if the profile needs updates
  const needsUpdate =
    existingProfile.organization?.show_as_button !==
      desiredConfig.organization.show_as_button ||
    existingProfile.organization?.assign_membership_on_login !==
      desiredConfig.organization.assign_membership_on_login ||
    existingProfile.connection_name_prefix_template !==
      desiredConfig.connection_name_prefix_template ||
    !arraysEqual(
      existingProfile.enabled_features || [],
      desiredConfig.enabled_features
    ) ||
    crossAppAccessNeedsUpdate ||
    domainAliasesConfigNeedsUpdate ||
    provisioningNeedsUpdate ||
    strategyOverridesNeedUpdate

  if (needsUpdate) {
    const changes = []
    if (
      existingProfile.organization?.show_as_button !==
      desiredConfig.organization.show_as_button
    ) {
      changes.push("Update show_as_button")
    }
    if (
      existingProfile.organization?.assign_membership_on_login !==
      desiredConfig.organization.assign_membership_on_login
    ) {
      changes.push("Update assign_membership_on_login")
    }
    if (
      existingProfile.connection_name_prefix_template !==
      desiredConfig.connection_name_prefix_template
    ) {
      changes.push("Update connection_name_prefix_template")
    }
    if (
      !arraysEqual(
        existingProfile.enabled_features || [],
        desiredConfig.enabled_features
      )
    ) {
      changes.push("Update enabled_features")
    }
    if (crossAppAccessNeedsUpdate) {
      changes.push("Update cross_app_access_resource_app")
    }
    if (domainAliasesConfigNeedsUpdate) {
      changes.push("Update domain_aliases_config")
    }
    if (provisioningNeedsUpdate) {
      changes.push("Update provisioning")
    }
    if (strategyOverridesNeedUpdate) {
      changes.push("Update strategy_overrides")
    }

    return createChangeItem(ChangeAction.UPDATE, {
      resource: "Connection Profile",
      name: existingProfile.name,
      existing: existingProfile,
      updates: {
        config: {
          ...desiredConfig,
          provisioning: {
            ...existingProfile.provisioning,
            ...desiredConfig.provisioning,
          },
          strategy_overrides: withSeededStrategyOverrides(
            existingProfile.strategy_overrides
          ),
        },
      },
      summary: changes.join(", "),
    })
  }

  return createChangeItem(ChangeAction.SKIP, {
    resource: "Connection Profile",
    name: existingProfile.name,
    existing: existingProfile,
  })
}

// ============================================================================
// APPLY FUNCTIONS - Execute changes based on cached plan
// ============================================================================

/**
 * Apply Database Connection changes
 */
export async function applyDatabaseConnectionChanges(
  changePlan,
  dashboardClientId
) {
  if (changePlan.action === ChangeAction.SKIP) {
    const spinner = ora({
      text: `${DEFAULT_CONNECTION_NAME} connection is up to date`,
    }).start()
    spinner.succeed()
    return changePlan.existing
  }

  if (changePlan.action === ChangeAction.CREATE) {
    const spinner = ora({
      text: `Creating ${DEFAULT_CONNECTION_NAME} connection`,
    }).start()

    try {
      // prettier-ignore
      const createConnectionArgs = [
        "api", "post", "connections",
        "--data", JSON.stringify({
          strategy: "auth0",
          name: DEFAULT_CONNECTION_NAME,
          display_name: "Universal-Components",
          enabled_clients: [dashboardClientId],
        }),
      ];

      const { stdout } = await $`auth0 ${createConnectionArgs}`
      const connection = JSON.parse(stdout)
      spinner.succeed(`Created ${DEFAULT_CONNECTION_NAME} connection`)
      return connection
    } catch (e) {
      spinner.fail(`Failed to create the ${DEFAULT_CONNECTION_NAME} connection`)
      throw e
    }
  }

  if (changePlan.action === ChangeAction.UPDATE) {
    const spinner = ora({
      text: `Adding missing enabled clients to ${DEFAULT_CONNECTION_NAME} connection`,
    }).start()

    try {
      const { existing } = changePlan
      const existingEnabledClients = existing.enabled_clients || []

      // Use the actual client IDs instead of the ones from the change plan
      const clientsToAdd = []
      if (!existingEnabledClients.includes(dashboardClientId)) {
        clientsToAdd.push(dashboardClientId)
      }

      if (clientsToAdd.length === 0) {
        spinner.succeed(
          `${DEFAULT_CONNECTION_NAME} connection already has all clients enabled`
        )
        return existing
      }

      const updatedClients = [...existingEnabledClients, ...clientsToAdd]

      await auth0ApiCall("patch", `connections/${existing.id}`, {
        enabled_clients: updatedClients,
      })
      spinner.succeed(
        `Updated ${DEFAULT_CONNECTION_NAME} connection with ${clientsToAdd.length} new enabled client(s)`
      )

      // Fetch updated connection
      const updated = await auth0ApiCall("get", `connections/${existing.id}`)
      return updated || existing
    } catch (e) {
      spinner.fail(`Failed to update ${DEFAULT_CONNECTION_NAME} connection`)
      throw e
    }
  }
}

/**
 * Apply Connection Profile changes
 */
export async function applyConnectionProfileChanges(changePlan) {
  if (changePlan.action === ChangeAction.SKIP) {
    const spinner = ora({
      text: `Connection Profile is up to date: ${changePlan.name}`,
    }).start()
    spinner.succeed()
    return changePlan.existing
  }

  if (changePlan.action === ChangeAction.CREATE) {
    const spinner = ora({
      text: `Creating Connection Profile`,
    }).start()

    try {
      const profileData = {
        name: CONNECTION_PROFILE_NAME,
        ...changePlan.config,
      }

      const result = await auth0ApiCall(
        "post",
        "connection-profiles",
        profileData
      )

      if (!result) {
        throw new Error("Failed to create connection profile")
      }

      spinner.succeed("Created Connection Profile")
      return result
    } catch (e) {
      spinner.fail(`Failed to create Connection Profile`)
      throw e
    }
  }

  if (changePlan.action === ChangeAction.UPDATE) {
    const spinner = ora({
      text: `Updating Connection Profile: ${changePlan.name}`,
    }).start()

    try {
      const { existing, updates } = changePlan

      await auth0ApiCall(
        "patch",
        `connection-profiles/${existing.id}`,
        updates.config
      )
      spinner.succeed(`Updated Connection Profile`)

      // Fetch updated profile
      const updated = await auth0ApiCall(
        "get",
        `connection-profiles/${existing.id}`
      )
      return updated || existing
    } catch (e) {
      spinner.fail(`Failed to update Connection Profile`)
      throw e
    }
  }
}
