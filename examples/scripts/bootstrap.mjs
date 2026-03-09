#!/usr/bin/env node
import {
  applyDashboardClientChanges,
  applyMyOrgClientGrantChanges,
  applyMyAccountClientGrantChanges,
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
import {
  selectFeaturesInteractively,
  getFeatureDescription,
} from "./utils/feature-config.mjs"
import { confirmWithUser, selectOptionFromList } from "./utils/helpers.mjs"
import { applyUserAttributeProfileChanges } from "./utils/profiles.mjs"
import {
  applyMyOrgResourceServerChanges,
  applyMyAccountResourceServerChanges,
  MYORG_API_SCOPES,
} from "./utils/resource-servers.mjs"
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
  validateAuth0Session,
  validateTenant,
  validateRequiredScopes,
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

  // Step 1: Pre-flight Checks
  console.log("📋 Step 1: Pre-flight Checks")
  checkNodeVersion()
  await checkAuth0CLI()
  await validateAuth0Session()
  const domain = await validateTenant(tenantName)
  console.log("")

  // Step 2: Feature Selection
  console.log("🎯 Step 2: Feature Selection")
  let featureConfig = await selectFeaturesInteractively()
  console.log(`   Selected: ${getFeatureDescription(featureConfig)}`)
  console.log("")

  // Step 3: Select example type
  console.log("💻 Step 3: Example Type")
  const options = [{
      name: 'Next.js',
      value: 'next-rwa',
      description: 'Next.js example as a Regular Web App using npm for Universal Components',
    },
    {
      name: 'React with shadcn',
      value: 'react-spa-shadcn',
      description: 'React SPA example using Shadcn for Universal Components',
    },
    {
      name: 'React with npm',
      value: 'react-spa-npm',
      description: 'React SPA example using npm for Universal Components',
    }];
  const exampleType = await selectOptionFromList(
    "Select the example you are bootstrapping:",options
  )
  console.log("")

  // Step 4: Discovery
  console.log("🔍 Step 4: Resource Discovery")
  const resources = await discoverExistingResources(domain)
  console.log("")

  // Step 4b: Validate required scopes (with graceful degradation)
  console.log("🔐 Step 4b: Validating API Scopes")
  featureConfig = await validateRequiredScopes(resources, domain, featureConfig)
  console.log("")

  // Step 5: Build Change Plan
  console.log("📝 Step 5: Analyzing Changes")
  const plan = await buildChangePlan(resources, domain, exampleType, featureConfig)
  console.log("")

  // Step 6: Display Plan
  displayChangePlan(plan)

  // Check if there are any changes to apply (only check enabled features)
  const hasChanges = checkForChanges(plan)

  if (!hasChanges) {
    console.log(
      "✅ Bootstrap complete! Tenant is already properly configured.\n"
    )
    // Confirm if env file should still be generated
    const confirmed = await confirmWithUser("Do you want to generate the .env.local file?")
    if (confirmed) {
      await writeEnvFile(
        domain,
        plan.clients.dashboard.existing?.client_id,
        plan.clients.dashboard.existing?.client_secret,
        exampleType,
        featureConfig
      )
      console.log("\n✅ .env.local file generated!\n")
    }

    process.exit(0)
  }

  // Step 7: User Confirmation
  const confirmed = await confirmWithUser(
    "Do you want to proceed with these changes? "
  )
  if (!confirmed) {
    console.log("\n❌ Bootstrap cancelled by user.\n")
    process.exit(0)
  }
  console.log("")

  // Step 8: Apply Changes
  console.log("⚙️  Step 7: Applying Changes\n")

  // 8a. Tenant Configuration
  console.log("Configuring Tenant...")
  await applyTenantSettingsChanges(plan.tenantConfig.settings)
  await applyPromptSettingsChanges(plan.tenantConfig.prompts)
  console.log("")

  // 8b. Profiles (needed for Dashboard Client)
  console.log("Configuring Profiles...")
  const connectionProfile = await applyConnectionProfileChanges(
    plan.connectionProfile
  )
  const userAttributeProfile = await applyUserAttributeProfileChanges(
    plan.userAttributeProfile
  )
  console.log("")

  // 8c. Resource Servers (conditionally based on enabled features)
  if (featureConfig.enableMyOrg) {
    console.log("Configuring My Organization API...")
    await applyMyOrgResourceServerChanges(
      plan.resourceServer,
      domain
    )
    console.log("")
  }

  if (featureConfig.enableMyAccount) {
    console.log("Configuring My Account API...")
    await applyMyAccountResourceServerChanges(
      plan.myAccountResourceServer,
      domain
    )
    console.log("")
  }

  // 8d. Dashboard Client
  console.log("Configuring Dashboard Client...")
  const dashboardClient = await applyDashboardClientChanges(
    plan.clients.dashboard,
    connectionProfile.id,
    userAttributeProfile.id,
    exampleType,
    domain,
    featureConfig.enableMyOrg ? MYORG_API_SCOPES : [],
    plan.myAccountApiScopes,
    featureConfig
  )
  console.log("")

  // 8e. Grant Dashboard Client access to APIs (conditionally based on enabled features)
  console.log("Configuring Client Grants...")
  if (featureConfig.enableMyOrg) {
    await applyMyOrgClientGrantChanges(
      plan.clientGrants.myOrg,
      domain,
      dashboardClient.client_id
    )
  }
  if (featureConfig.enableMyAccount) {
    await applyMyAccountClientGrantChanges(
      plan.clientGrants.myAccount,
      domain,
      dashboardClient.client_id
    )
  }
  console.log("")

  // 8f. Database Connection
  console.log("Configuring Database Connection...")
  const connection = await applyDatabaseConnectionChanges(
    plan.connection,
    dashboardClient.client_id
  )
  console.log("")

  // 8g-8i. Organization resources (only if MyOrg is enabled)
  let adminRole = null
  let org = null

  if (featureConfig.enableMyOrg) {
    // 8g. Roles
    console.log("Configuring Roles...")
    adminRole = await applyAdminRoleChanges(plan.roles.admin)
    console.log("")

    // 8h. Orgs
    console.log("Creating Organization...")
    org = await applyOrgsChanges(plan.orgs, connection.id)
    console.log("")

    // 8i. Org Members
    console.log("Adding Organization Members...")
    // eslint-disable-next-line no-unused-vars
    const orgMember = await applyOrgMemberChanges(plan.orgMembers, org.id, connection.id, adminRole.id)
    console.log("")
  }

  // Step 9: Generate .env.local
  console.log("📝 Step 8: Generating .env.local file\n")
  await writeEnvFile(
    domain,
    dashboardClient.client_id,
    dashboardClient.client_secret,
    exampleType,
    featureConfig
  )

  // Done!
  console.log("\n✅ Bootstrap complete!\n")
  console.log("Next steps:")
  console.log(`  1. Navigate to the example directory: cd ../${exampleType}`)
  console.log("  2. Review the generated .env.local file")
  console.log("  3. Run 'pnpm run dev' to start the development server")
  console.log("  4. Navigate to http://localhost:5173\n")
}

/**
 * Check if there are any changes to apply based on enabled features
 * @param {object} plan - The change plan
 * @returns {boolean} True if there are changes to apply
 */
function checkForChanges(plan) {
  const { features } = plan

  // Always check core resources
  let hasChanges =
    plan.clients.dashboard.action !== "skip" ||
    plan.connection.action !== "skip" ||
    plan.connectionProfile.action !== "skip" ||
    plan.userAttributeProfile.action !== "skip" ||
    plan.tenantConfig.settings.action !== "skip" ||
    plan.tenantConfig.prompts.action !== "skip"

  // Check MyOrg resources only if enabled
  if (features.enableMyOrg) {
    hasChanges = hasChanges ||
      plan.clientGrants.myOrg.action !== "skip" ||
      plan.resourceServer.action !== "skip" ||
      plan.roles.admin.action !== "skip" ||
      plan.orgs.action !== "skip" ||
      plan.orgMembers.action !== "skip"
  }

  // Check MyAccount resources only if enabled
  if (features.enableMyAccount) {
    hasChanges = hasChanges ||
      plan.clientGrants.myAccount.action !== "skip" ||
      plan.myAccountResourceServer.action !== "skip"
  }

  return hasChanges
}

// Run the main function
main().catch((error) => {
  console.error("\n❌ Bootstrap failed:", error.message)
  process.exit(1)
})
