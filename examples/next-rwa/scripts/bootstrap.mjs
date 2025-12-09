#!/usr/bin/env node
import {
  applyDashboardClientChanges,
  applyMyOrgClientGrantChanges,
} from "./utils/clients.mjs"
import {
  applyConnectionProfileChanges,
  applyDatabaseConnectionChanges,
} from "./utils/connections.mjs"
import {
  buildChangePlan,
  discoverExistingResources,
  displayChangePlan,
} from "./utils/discovery.mjs"
import { writeEnvFile } from "./utils/env-writer.mjs"
import { confirmWithUser } from "./utils/helpers.mjs"
import { applyUserAttributeProfileChanges } from "./utils/profiles.mjs"
import { applyMyOrgResourceServerChanges } from "./utils/resource-servers.mjs"
import {
  applyAdminRoleChanges,
} from "./utils/roles.mjs"
import { applyOrgsChanges} from "./utils/orgs.mjs"
import { applyOrgMemberChanges} from "./utils/members.mjs"
import {
  applyPromptSettingsChanges,
  applyTenantSettingsChanges,
} from "./utils/tenant-config.mjs"
import {
  checkAuth0CLI,
  checkNodeVersion,
  validateTenant,
} from "./utils/validation.mjs"

// ============================================================================
// Main Bootstrap Flow
// ============================================================================

async function main() {
  console.log("\n🚀 Auth0 Universal Components - Bootstrap Script\n")

  // Parse command-line arguments
  const args = process.argv.slice(2)

  if (args.includes("--help") || args.includes("-h")) {
    console.log("Usage: node scripts/bootstrap.mjs <tenant-domain>")
    console.log("\nArguments:")
    console.log(
      "  tenant-domain  Required. The Auth0 tenant domain to configure."
    )
    console.log("                 Must match your Auth0 CLI active tenant.")
    console.log("\nExample:")
    console.log("  node scripts/bootstrap.mjs my-tenant.us.auth0.com")
    console.log("\nPrerequisites:")
    console.log("  1. Login to Auth0 CLI: auth0 login")
    console.log("  2. Select your tenant: auth0 tenants use <tenant-domain>")
    console.log(
      "\nNote: Tenant name is required as a safety measure to prevent accidentally"
    )
    console.log("      configuring the wrong tenant.")
    process.exit(0)
  }

  const tenantName = args[0] // Required: tenant domain to verify against CLI

  // Step 1: Validation
  console.log("📋 Step 1: Pre-flight Checks")
  checkNodeVersion()
  await checkAuth0CLI()
  const domain = await validateTenant(tenantName)
  console.log("")

  // Step 2: Discovery
  console.log("🔍 Step 2: Resource Discovery")
  const resources = await discoverExistingResources(domain)
  console.log("")

  // Step 3: Build Change Plan
  console.log("📝 Step 3: Analyzing Changes")
  const plan = await buildChangePlan(resources, domain)
  console.log("")

  // Step 4: Display Plan
  displayChangePlan(plan)

  // Check if there are any changes to apply
  const hasChanges =
    plan.clients.dashboard.action !== "skip" ||
    plan.clientGrants.myOrg.action !== "skip" ||
    plan.connection.action !== "skip" ||
    plan.connectionProfile.action !== "skip" ||
    plan.userAttributeProfile.action !== "skip" ||
    plan.resourceServer.action !== "skip" ||
    plan.roles.admin.action !== "skip" ||
    plan.orgs.action !== "skip" ||
    plan.orgMembers.action !== "skip" ||
    plan.tenantConfig.settings.action !== "skip" ||
    plan.tenantConfig.prompts.action !== "skip" 

  if (!hasChanges) {
    console.log(
      "✅ Bootstrap complete! Tenant is already properly configured.\n"
    )
    process.exit(0)
  }

  // Step 5: User Confirmation
  const confirmed = await confirmWithUser(
    "Do you want to proceed with these changes? (yes/no): "
  )
  if (!confirmed) {
    console.log("\n❌ Bootstrap cancelled by user.\n")
    process.exit(0)
  }
  console.log("")

  // Step 6: Apply Changes
  console.log("⚙️  Step 6: Applying Changes\n")

  // 6a. Tenant Configuration
  console.log("Configuring Tenant...")
  await applyTenantSettingsChanges(plan.tenantConfig.settings)
  await applyPromptSettingsChanges(plan.tenantConfig.prompts)
  console.log("")

  // 6b. Profiles (needed for Dashboard Client)
  console.log("Configuring Profiles...")
  const connectionProfile = await applyConnectionProfileChanges(
    plan.connectionProfile
  )
  const userAttributeProfile = await applyUserAttributeProfileChanges(
    plan.userAttributeProfile
  )
  console.log("")

  // 6c. Resource Server (My Organization API)
  console.log("Configuring My Organization API...")
  const myOrgResourceServer = await applyMyOrgResourceServerChanges(
    plan.resourceServer,
    domain
  )
  console.log("")

  // 6d. Dashboard Client
  console.log("Configuring Dashboard Client...")
  const dashboardClient = await applyDashboardClientChanges(
    plan.clients.dashboard,
    connectionProfile.id,
    userAttributeProfile.id
  )
  console.log("")

  // 6e. Grant Dashboard Client access to My Organization API
  console.log("Configuring Client Grants...")
  await applyMyOrgClientGrantChanges(
    plan.clientGrants.myOrg,
    domain,
    dashboardClient.client_id
  )
  console.log("")

  // 6f. Database Connection
  console.log("Configuring Database Connection...")
  const connection = await applyDatabaseConnectionChanges(
    plan.connection,
    dashboardClient.client_id
  )
  console.log("")

  // 6g. Roles
  console.log("Configuring Roles...")
  const adminRole = await applyAdminRoleChanges(plan.roles.admin)
  console.log("")

  // 6h. Orgs
  console.log("Creating Org...")
  const org = await applyOrgsChanges(plan.orgs, connection.id)
  console.log("")

  // 6i. Org Members
  console.log("Adding Org Members...")
  // eslint-disable-next-line no-unused-vars
  const orgMember = await applyOrgMemberChanges(plan.orgMembers, org.id, connection.id,adminRole.id)
  console.log("")
  
  // Step 7: Generate .env.local
  console.log("📝 Step 7: Generating .env.local file\n")
  await writeEnvFile(
    domain,
    dashboardClient.client_id,
    dashboardClient.client_secret
  )

  // Done!
  console.log("\n✅ Bootstrap complete!\n")
  console.log("Next steps:")
  console.log("  1. Review the generated .env.local file")
  console.log("  2. Run 'pnpm run dev' to start the development server")
  console.log("  3. Navigate to http://localhost:5173\n")
}

// Run the main function
main().catch((error) => {
  console.error("\n❌ Bootstrap failed:", error.message)
  process.exit(1)
})
