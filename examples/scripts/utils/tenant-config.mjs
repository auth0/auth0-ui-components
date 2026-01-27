import { $ } from "execa"
import ora from "ora"

import { auth0ApiCall } from "./auth0-api.mjs"
import { ChangeAction, createChangeItem } from "./change-plan.mjs"

// ============================================================================
// CHECK FUNCTIONS - Determine what changes are needed
// ============================================================================

/**
 * Check if Tenant Settings need changes
 */
export async function checkTenantSettingsChanges() {
  const current = await auth0ApiCall("get", "tenants/settings")

  const desiredSettings = {
    customize_mfa_in_postlogin_action: true,
    flags: { enable_client_connections: false },
    friendly_name: "Universal Components Demo",
    picture_url: "https://cdn.auth0.com/blog/auth0_by_okta_logo_black.png",
  }

  const needsUpdate =
    current?.customize_mfa_in_postlogin_action !==
      desiredSettings.customize_mfa_in_postlogin_action ||
    current?.flags?.enable_client_connections !==
      desiredSettings.flags.enable_client_connections ||
    current?.friendly_name !== desiredSettings.friendly_name ||
    current?.picture_url !== desiredSettings.picture_url

  if (needsUpdate) {
    const changes = []
    if (
      current?.flags?.enable_client_connections !==
      desiredSettings.flags.enable_client_connections
    ) {
      changes.push("Disable client connections")
    }
    if (current?.friendly_name !== desiredSettings.friendly_name) {
      changes.push("Set friendly name")
    }
    if (current?.picture_url !== desiredSettings.picture_url) {
      changes.push("Set picture URL")
    }

    return createChangeItem(ChangeAction.UPDATE, {
      resource: "Tenant Settings",
      updates: desiredSettings,
      summary: changes.join(", "),
    })
  }

  return createChangeItem(ChangeAction.SKIP, {
    resource: "Tenant Settings",
  })
}

/**
 * Check if Prompt Settings need changes
 */
export async function checkPromptSettingsChanges() {
  const current = await auth0ApiCall("get", "prompts")

  const needsUpdate = current?.identifier_first !== true

  if (needsUpdate) {
    return createChangeItem(ChangeAction.UPDATE, {
      resource: "Prompt Settings",
      updates: { identifier_first: true },
      summary: "Enable identifier_first",
    })
  }

  return createChangeItem(ChangeAction.SKIP, {
    resource: "Prompt Settings",
  })
}

// ============================================================================
// APPLY FUNCTIONS - Execute changes based on cached plan
// ============================================================================

/**
 * Apply Tenant Settings changes
 */
export async function applyTenantSettingsChanges(changePlan) {
  if (changePlan.action === ChangeAction.SKIP) {
    const spinner = ora({
      text: `Tenant settings are up to date`,
    }).start()
    spinner.succeed()
    return
  }

  if (changePlan.action === ChangeAction.UPDATE) {
    const spinner = ora({
      text: `Updating tenant settings`,
    }).start()

    try {
      // prettier-ignore
      const tenantSettingsArgs = [
        "api", "patch", "tenants/settings",
        "--data", JSON.stringify(changePlan.updates),
      ];

      await $`auth0 ${tenantSettingsArgs}`
      spinner.succeed("Updated tenant settings")
    } catch (e) {
      spinner.fail(`Failed to configure tenant settings`)
      throw e
    }
  }
}

/**
 * Apply Prompt Settings changes
 */
export async function applyPromptSettingsChanges(changePlan) {
  if (changePlan.action === ChangeAction.SKIP) {
    const spinner = ora({
      text: `Prompt settings are up to date`,
    }).start()
    spinner.succeed()
    return
  }

  if (changePlan.action === ChangeAction.UPDATE) {
    const spinner = ora({
      text: `Updating prompt settings`,
    }).start()

    try {
      // prettier-ignore
      const promptSettingsArgs = [
        "api", "patch", "prompts",
        "--data", JSON.stringify(changePlan.updates),
      ];

      await $`auth0 ${promptSettingsArgs}`
      spinner.succeed("Updated prompt settings")
    } catch (e) {
      spinner.fail(`Failed to configure prompt settings`)
      throw e
    }
  }
}
