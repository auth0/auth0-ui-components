import { $ } from "execa"
import ora from "ora"

import { auth0ApiCall } from "./auth0-api.mjs"
import { ChangeAction, createChangeItem } from "./change-plan.mjs"

// Constants
export const DEMO_ORG_NAME = "demo-org"
export const DEFAULT_CONNECTION_NAME = "Universal-Components-Demo"

// ============================================================================
// CHECK FUNCTIONS - Determine what changes are needed
// ============================================================================

/**
 * Check if an org has to be created or updated
 */
export async function checkOrgChanges(
  existingOrgs,
  existingConnections,
) {
  const existingOrg = existingOrgs.find((r) => r.name === DEMO_ORG_NAME)
  const connection = existingConnections.find(
    (c) => c.name === DEFAULT_CONNECTION_NAME
  )
  const connectionId = connection ? connection.id : null

  if (!existingOrg) {
    return createChangeItem(ChangeAction.CREATE, {
      resource: "Org",
      name: "Demo Org",
    })
  }

  // if connection doesnt exist as yet but org does, we need to add the connection to the org
  if (!connectionId) {
    return createChangeItem(ChangeAction.UPDATE, {
      resource: "Org",
      name: "Demo Org",
      existing: existingOrg,
      updates: {
        addConnection: true,
      },
      summary: `Connection "${DEFAULT_CONNECTION_NAME}" not found to add to Org`,
    })
  }

  // Check if connection is already enabled for org
  const result = await auth0ApiCall(
    "get",
    `organizations/${existingOrg.id}/enabled_connections/${connectionId}`
  )

  if (!result || !result.connection || result.length === 0) {
    return createChangeItem(ChangeAction.UPDATE, {
      resource: "Org",
      name: "Demo Org",
      existing: existingOrg,
      updates: {
        addConnection: true,
      },
      summary: "Add connection to Org",
    })
  }

  return createChangeItem(ChangeAction.SKIP, {
    resource: "Org",
    name: "Demo Org",
    existing: existingOrg,
  })
}

// ============================================================================
// APPLY FUNCTIONS - Execute changes based on cached plan
// ============================================================================

/**
 * Apply Orgs changes
 */
export async function applyOrgsChanges(changePlan, connection) {
  if (changePlan.action === ChangeAction.SKIP) {
    const spinner = ora({
      text: `Org is up to date`,
    }).start()
    spinner.succeed()
    return changePlan.existing
  }

  if (changePlan.action === ChangeAction.CREATE) {
    const spinner = ora({
      text: `Creating Org`,
    }).start()

    try {
      // prettier-ignore
      const createOrgArgs = [
        "orgs", "create",
        "--name", DEMO_ORG_NAME,
        "--display", "Universal Components Demo Org",
        "--json", "--no-input",
      ];

      const { stdout } = await $`auth0 ${createOrgArgs}`
      const org = JSON.parse(stdout)

      // Set up connection for org
      const result = await auth0ApiCall(
        "post",
        `organizations/${org.id}/enabled_connections`,
        {
          "connection_id": connection,
          "assign_membership_on_login": false,
          "is_signup_enabled": false,
        }
      )

      if (!result) {
        throw new Error("Failed to set up connection for Org")
      }

      spinner.succeed(`Created demo Org`)

      return org
    } catch (e) {
      spinner.fail(`Failed to create demo Org`)
      throw e
    }
  }

  if (changePlan.action === ChangeAction.UPDATE) {
    const spinner = ora({
      text: `Updating Org configuration`,
    }).start()

    try {
      const { existing, updates } = changePlan

      if (updates.addConnection) {
        await auth0ApiCall(
          "post",
          `organizations/${existing.id}/enabled_connections`,
          {
            "connection_id": connection,
            "assign_membership_on_login": false,
            "is_signup_enabled": false,
          }
        )
      }

      spinner.succeed("Updated Org configuration")
      return existing
    } catch (e) {
      spinner.fail(`Failed to update Org configuration`)
      throw e
    }
  }
}
