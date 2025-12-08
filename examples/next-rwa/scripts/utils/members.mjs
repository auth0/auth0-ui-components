import { $ } from "execa"
import ora from "ora"

import { auth0ApiCall } from "./auth0-api.mjs"
import { ChangeAction, createChangeItem } from "./change-plan.mjs"
import { getInputFromUser, getPasswordFromUser } from "./helpers.mjs"

// Constants
export const DEMO_ORG_NAME = "demo-org"
export const DEFAULT_CONNECTION_NAME = "Universal-Components-Demo"

// ============================================================================
// CHECK FUNCTIONS - Determine what changes are needed
// ============================================================================

/**
 * Check if an org has a member to be created
 */
export async function checkOrgMembers(
  existingOrgs,
) {
  const existingOrg = existingOrgs.find((r) => r.name === DEMO_ORG_NAME)
  if (!existingOrg) {

    const email = await getInputFromUser('Please provide email for org admin: ');

    return createChangeItem(ChangeAction.CREATE, {
      resource: "Org Member",
      name: "Demo Org",
      summary: `Org "${DEMO_ORG_NAME}" does not exist`,
      email: email,
    })
  }
  
  const { stdout } = await $`auth0 orgs members list ${existingOrg.id} --json`
  const members = JSON.parse(stdout) || []
  
  if (!members || members.length === 0) {

    const email = await getInputFromUser('Please provide email for org admin: ');

    return createChangeItem(ChangeAction.CREATE, {
      resource: "Org Member",
      name: "Demo Org",
      email: email,
    })
  }

  return createChangeItem(ChangeAction.SKIP, {
    resource: "Org Member",
    name: "Demo Org",
    existing: members,
  })

}

// ============================================================================
// APPLY FUNCTIONS - Execute changes based on cached plan
// ============================================================================

/**
 * Apply OrgMember changes
 */
export async function applyOrgMemberChanges(changePlan, org, connection, role) {
  if (changePlan.action === ChangeAction.SKIP) {
    const spinner = ora({
      text: `No change for org member required`,
    }).start()
    spinner.succeed()
    return changePlan.existing
  }

  if (changePlan.action === ChangeAction.CREATE) {
    const spinner = ora({
      text: `Creating Org Member`,
    }).start()

    try {
      // prettier-ignore

      spinner.stop();
      // Check if a user with this email already exists on the demo connection
      // Use search-by-email to find users with this email (across connections)
      const { stdout: usersStdout } = await $`auth0 users search-by-email ${changePlan.email} --json`
      const users = JSON.parse(usersStdout) || []
      const existingUser = users.find(
        (u) =>
          u.email === changePlan.email &&
          Array.isArray(u.identities) &&
          u.identities.some((i) => i.connection === DEFAULT_CONNECTION_NAME)
      )

      let targetUser
      if (existingUser) {
        // If user exists, fetch the user by id later instead of creating
        targetUser = existingUser
        spinner.succeed(`User already exists on connection: ${changePlan.email}`)
      } else {
        const pass = await getPasswordFromUser('Please set password for org admin to test login: ')
        const createUserArgs = [
          "users", "create",
          "--connection-name", DEFAULT_CONNECTION_NAME,
          "--email", changePlan.email,
          "--password", pass,
          "--json", "--no-input",
        ]
        try {
          const { stdout: userStdout } = await $`auth0 ${createUserArgs}`
          targetUser = JSON.parse(userStdout)
        } catch (e) {
          //Likely a case of private cloud where CLI client ID is not authorized to create users on this connection
          //extract client_id from error message and add to connection's enabled clients and retry
          const msg = (e.stderr || e.message || String(e) || "")
          const clientId = msg.match(/client_id:\s*([^\s)]+)/i)[1]
          if (clientId) {
            // use clientId as needed
            await auth0ApiCall(
              "patch",
              `connections/${connection}/clients`,
              [{
                "client_id": clientId,
                "status": true
              }]
            )
            // Retry user creation
            try { 
              const { stdout: userStdout } = await $`auth0 ${createUserArgs}`
              targetUser = JSON.parse(userStdout)
            } catch (e2) {
              throw new Error(`Unable to create org admin: ${e2.message || e2}`)
            }
            spinner.succeed(`Created user after updating connection: ${changePlan.email}`)  
          } else {
            throw new Error("Unable to create org admin") 
          }
        }
      }

      // Now add user as member to org

      // Use Management API to add user as member to the organization
      // Find organization by name
      if (!org) {
        throw new Error(`Organization not found: ${DEMO_ORG_NAME}`)
      }
     
      await auth0ApiCall("post", `organizations/${org}/members`, {
        members: [ targetUser.user_id ],
      })

      // Add role to Member
      const escapedUserId = targetUser.user_id.replace(/\|/g, '|')
      await auth0ApiCall("post", `organizations/${org}/members/${escapedUserId}/roles`, {
        roles: [ role ]
      })
      
      spinner.succeed(`Created Org Member: ${changePlan.email}`)
      return targetUser
    } catch (e) {
      spinner.fail(`Failed to create Org Member: ${changePlan.email}`)
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
