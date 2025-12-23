import { $ } from "execa"
import ora from "ora"

import { auth0ApiCall } from "./auth0-api.mjs"
import { createChangePlan } from "./change-plan.mjs"
import {
  checkDashboardClientChanges,
  checkMyOrgClientGrantChanges,
} from "./clients.mjs"
import {
  checkConnectionProfileChanges,
  checkDatabaseConnectionChanges,
} from "./connections.mjs"
import { checkUserAttributeProfileChanges } from "./profiles.mjs"
import {
  checkMyOrgResourceServerChanges,
  MYORG_API_SCOPES,
} from "./resource-servers.mjs"
import { checkAdminRoleChanges } from "./roles.mjs"
import { checkOrgChanges } from "./orgs.mjs"
import { checkOrgMembers } from "./members.mjs"
import {
  checkPromptSettingsChanges,
  checkTenantSettingsChanges,
} from "./tenant-config.mjs"

export const DEMO_ORG_NAME = "demo-org"

/**
 * Get existing resources from tenant
 */
export async function discoverExistingResources() {
  const spinner = ora({
    text: `Discovering existing resources in tenant`,
  }).start()

  try {
    const resources = {
      clients: [],
      roles: [],
      connections: [],
      resourceServers: [],
      clientGrants: [],
      connectionProfiles: [],
      userAttributeProfiles: [],
      orgs: [],
      orgMembers: [],
    }

    // Get clients
    const { stdout: clientsStdout } = await $`auth0 apps list --json`
    resources.clients = JSON.parse(clientsStdout) || []

    // Get roles
    const { stdout: rolesStdout } = await $`auth0 roles list --json`
    resources.roles = JSON.parse(rolesStdout) || []

    // Get connections
    const { stdout: connectionsStdout } = await $`auth0 api get connections`
    resources.connections = JSON.parse(connectionsStdout) || []

    // Get resource servers
    const { stdout: rsStdout } = await $`auth0 apis list --json`
    resources.resourceServers = JSON.parse(rsStdout) || []

    // Get client grants
    const { stdout: grantsStdout } = await $`auth0 api get client-grants`
    resources.clientGrants = JSON.parse(grantsStdout) || []

    // Get connection profiles (using generic API)
    const connectionProfiles = await auth0ApiCall("get", "connection-profiles")
    resources.connectionProfiles = connectionProfiles?.connection_profiles || []

    // Get user attribute profiles (using generic API)
    const userAttributeProfiles = await auth0ApiCall(
      "get",
      "user-attribute-profiles"
    )
    resources.userAttributeProfiles =
      userAttributeProfiles?.user_attribute_profiles || []

    // Get Orgs
    const { stdout: orgsStdout } = await $`auth0 orgs list --json`
    resources.orgs = JSON.parse(orgsStdout) || []

    // Get Org Members (if Demo Org exists)
    const demoOrg = resources.orgs.find((o) => o.name === DEMO_ORG_NAME)
    if (demoOrg) {
      const { stdout: membersStdout } = await $`auth0 orgs members list ${demoOrg.id} --json`
      resources.orgMembers = JSON.parse(membersStdout) || []
    } else {
      resources.orgMembers = []
    }
    spinner.stop()
    if (resources.orgMembers && resources.orgMembers.length > 0) {
      console.log("")
      console.log("Following org members can be used for testing:");
      resources.orgMembers.forEach((member) => {
        const email = member.email || "unknown email";
        console.log("- ",email);
      });
      console.log("");
    } else {
      console.log("Found no org members");
    }

    spinner.succeed("Resource discovery complete")
    return resources
  } catch (e) {
    spinner.fail("Failed to discover existing resources")
    console.error(e)
    process.exit(1)
  }
}

/**
 * Check all resources and build comprehensive change plan
 */
export async function buildChangePlan(resources, domain, exampleType) {
  const spinner = ora({
    text: `Analyzing required changes`,
  }).start()

  try {
    const plan = createChangePlan()

    // Profiles (needed first for Dashboard Client)
    plan.connectionProfile = checkConnectionProfileChanges(
      resources.connectionProfiles
    )
    plan.userAttributeProfile = checkUserAttributeProfileChanges(
      resources.userAttributeProfiles
    )

    // Get profile IDs (either existing or will be created)
    const connectionProfileId =
      plan.connectionProfile.existing?.id || "TO_BE_CREATED"
    const userAttributeProfileId =
      plan.userAttributeProfile.existing?.id || "TO_BE_CREATED"

    // Clients (both fetch full details including secrets)
    plan.clients.dashboard = await checkDashboardClientChanges(
      resources.clients,
      connectionProfileId,
      userAttributeProfileId,
      exampleType,
      domain,
      MYORG_API_SCOPES
    )

    // Get client IDs (either existing or will be created)
    const dashboardClientId =
      plan.clients.dashboard.existing?.client_id || "TO_BE_CREATED"

    // Resource Server
    plan.resourceServer = checkMyOrgResourceServerChanges(
      resources.resourceServers,
      domain
    )

    // My Org Client Grant (Dashboard to My Org API)
    plan.clientGrants.myOrg = checkMyOrgClientGrantChanges(
      dashboardClientId,
      resources.clientGrants,
      domain,
      MYORG_API_SCOPES
    )

    // Connection
    plan.connection = checkDatabaseConnectionChanges(
      resources.connections,
      dashboardClientId,
    )

    // Roles (admin role check makes API call to get current permissions)
    plan.roles.admin = await checkAdminRoleChanges(
      resources.roles,
      domain,
      MYORG_API_SCOPES
    )

    // Orgs 
    plan.orgs = await checkOrgChanges(
      resources.orgs,
      resources.connections,
    )

    // Org Members
    spinner.stop('Analyzing required changes for Org Members');
    plan.orgMembers = await checkOrgMembers(
      resources.orgs,
      resources.orgMembers,
    )
    spinner.start();

    // Tenant Configuration (these make API calls to check current state)
    plan.tenantConfig.settings = await checkTenantSettingsChanges()
    plan.tenantConfig.prompts = await checkPromptSettingsChanges()

    spinner.succeed("Change analysis complete")
    return plan
  } catch (e) {
    spinner.fail("Failed to analyze changes")
    console.error(e)
    throw e
  }
}

/**
 * Display the comprehensive change plan to the user
 */
export function displayChangePlan(plan) {
  const creates = []
  const updates = []
  const skips = []

  // Helper to categorize changes
  function categorize(item) {
    if (!item) return
    if (item.action === "create") {
      const nameStr = item.name ? ` (${item.name})` : ""
      const summaryStr = item.summary ? `: ${item.summary}` : ""
      creates.push(`${item.resource}${nameStr}${summaryStr}`)
    } else if (item.action === "update") {
      const nameStr = item.name ? ` (${item.name})` : ""
      const summaryStr = item.summary ? `: ${item.summary}` : ""
      updates.push(`${item.resource}${nameStr}${summaryStr}`)
    } else if (item.action === "skip") {
      skips.push(`${item.resource}${item.name ? ` (${item.name})` : ""}`)
    }
  }

  // Categorize all plan items
  categorize(plan.clients.dashboard)
  categorize(plan.clientGrants.myOrg)
  categorize(plan.connection)
  categorize(plan.connectionProfile)
  categorize(plan.userAttributeProfile)
  categorize(plan.resourceServer)
  categorize(plan.roles.admin)
  categorize(plan.roles.member)
  categorize(plan.orgs)
  categorize(plan.orgMembers)
  categorize(plan.tenantConfig.settings)
  categorize(plan.tenantConfig.prompts)

  console.log("\n" + "=".repeat(80))
  console.log("BOOTSTRAP PLAN")
  console.log("=".repeat(80))

  // Check if there are no changes needed
  if (creates.length === 0 && updates.length === 0) {
    console.log(
      "\n✅ No changes needed! All resources are already configured correctly."
    )
    console.log("\n" + "=".repeat(80))
    console.log("")
    return
  }

  if (creates.length > 0) {
    console.log("\n📝 Resources to CREATE:")
    creates.forEach((item) => console.log(`   • ${item}`))
  }

  if (updates.length > 0) {
    console.log("\n🔄 Resources to UPDATE:")
    updates.forEach((item) => console.log(`   • ${item}`))
  }

  if (skips.length > 0) {
    console.log("\n✓ Resources already up to date:")
    skips.forEach((item) => console.log(`   • ${item}`))
  }

  console.log("\n" + "=".repeat(80))

  // Show detailed breakdown if there are updates
  if (updates.length > 0) {
    console.log("\nDetailed Changes:")
    console.log("-".repeat(80))

    const showDetails = (item, label) => {
      if (!item || item.action !== "update") return

      let hasDetails = false

      if (item.updates) {
        // Dashboard Client
        if (item.updates.missingCallbacks?.length > 0) {
          if (!hasDetails) {
            console.log(`\n${label}:`)
            hasDetails = true
          }
          console.log(
            `  • Add callback URLs: ${item.updates.missingCallbacks.join(", ")}`
          )
        }
        if (item.updates.missingLogoutUrls?.length > 0) {
          if (!hasDetails) {
            console.log(`\n${label}:`)
            hasDetails = true
          }
          console.log(
            `  • Add logout URLs: ${item.updates.missingLogoutUrls.join(", ")}`
          )
        }
        if (item.updates.wrongAppType) {
          if (!hasDetails) {
            console.log(`\n${label}:`)
            hasDetails = true
          }
          console.log(`  • Set app_type to: regular_web`)
        }
        if (item.updates.myOrgConfigNeedsUpdate) {
          if (!hasDetails) {
            console.log(`\n${label}:`)
            hasDetails = true
          }
          // Show what specifically needs updating in my_org_configuration
          const details = []
          if (item.updates.connectionProfileId === "TO_BE_CREATED") {
            details.push("set connection_profile_id (will be created)")
          } else if (item.updates.connectionProfileId) {
            details.push(
              `update connection_profile_id to ${item.updates.connectionProfileId}`
            )
          }
          if (item.updates.userAttributeProfileId === "TO_BE_CREATED") {
            details.push("set user_attribute_profile_id (will be created)")
          } else if (item.updates.userAttributeProfileId) {
            details.push(
              `update user_attribute_profile_id to ${item.updates.userAttributeProfileId}`
            )
          }
          if (details.length > 0) {
            console.log(
              `  • Update My Org configuration: ${details.join(", ")}`
            )
          } else {
            console.log(`  • Update My Org configuration`)
          }
        }
        if (item.updates.organizationSettingsNeedUpdate) {
          if (!hasDetails) {
            console.log(`\n${label}:`)
            hasDetails = true
          }
          console.log(
            `  • Update organization settings (organization_usage: require, organization_require_behavior: post_login_prompt)`
          )
        }

        // Client Grants
        if (item.updates.missingScopes?.length > 0) {
          if (!hasDetails) {
            console.log(`\n${label}:`)
            hasDetails = true
          }
          console.log(
            `  • Add scopes: ${item.updates.missingScopes.join(", ")}`
          )
        }

        // Roles
        if (item.updates.missingPermissions?.length > 0) {
          if (!hasDetails) {
            console.log(`\n${label}:`)
            hasDetails = true
          }
          console.log(
            `  • Add permissions: ${item.updates.missingPermissions.join(", ")}`
          )
        }

        // Connection
        if (item.updates.missingEnabledClients?.length > 0) {
          if (!hasDetails) {
            console.log(`\n${label}:`)
            hasDetails = true
          }
          console.log(
            `  • Enable for ${item.updates.missingEnabledClients.length} additional client(s)`
          )
        }

        // Connection Profile
        if (item.updates.changes?.length > 0) {
          if (!hasDetails) {
            console.log(`\n${label}:`)
            hasDetails = true
          }
          item.updates.changes.forEach((change) => console.log(`  • ${change}`))
        }
      }
    }

    showDetails(plan.clients.management, "Management Client")
    showDetails(plan.clients.dashboard, "Dashboard Client")
    showDetails(plan.clientGrants.management, "Management API Client Grant")
    showDetails(plan.clientGrants.myOrg, "My Org API Client Grant")
    showDetails(plan.connection, "Database Connection")
    showDetails(plan.connectionProfile, "Connection Profile")
    showDetails(plan.resourceServer, "My Organization API")
    showDetails(plan.roles.admin, "Admin Role")
    showDetails(plan.roles.member, "Member Role")
    showDetails(plan.orgs, "Organization")
    showDetails(plan.orgMembers, "Organization Members")
    console.log("\n" + "=".repeat(80))
  }

  console.log("")
}
