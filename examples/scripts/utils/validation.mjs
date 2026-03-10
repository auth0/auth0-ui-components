import { $, execaSync } from "execa"
import ora from "ora"

import { isSessionValid } from "./auth0-api.mjs"
import { confirmWithUser } from "./helpers.mjs"
import {
  MYORG_API_SCOPES,
  MYACCOUNT_API_SCOPES_DESIRED,
} from "./resource-servers.mjs"

// Timeout for CLI commands (15 seconds)
const CLI_TIMEOUT = 15000

// All scopes needed for bootstrap operations
const BOOTSTRAP_SCOPES = [
  "read:connection_profiles",
  "create:connection_profiles",
  "update:connection_profiles",
  "read:user_attribute_profiles",
  "create:user_attribute_profiles",
  "update:user_attribute_profiles",
  "read:client_grants",
  "create:client_grants",
  "update:client_grants",
  "delete:client_grants",
  "read:connections",
  "create:connections",
  "update:connections",
  "create:organization_connections",
  "create:organization_members",
  "create:organization_member_roles",
  "read:clients",
  "create:clients",
  "update:clients",
  "read:client_keys",
  "read:roles",
  "create:roles",
  "update:roles",
  "read:resource_servers",
  "create:resource_servers",
  "update:resource_servers",
  "update:tenant_settings",
]

/**
 * Check Node.js version
 */
export function checkNodeVersion() {
  if (process.version.replace("v", "").split(".")[0] < 20) {
    console.error(
      "❌ Node.js version 20 or later is required to run this script."
    )
    process.exit(1)
  }
}

/**
 * Check Auth0 CLI is installed
 */
export async function checkAuth0CLI() {
  const cliCheck = ora({
    text: `Checking that the Auth0 CLI has been installed`,
  }).start()

  try {
    await $({ timeout: CLI_TIMEOUT })`auth0 --version`
    cliCheck.succeed()
  } catch {
    cliCheck.fail(
      "The Auth0 CLI must be installed: https://github.com/auth0/auth0-cli"
    )
    process.exit(1)
  }
}

/**
 * Run Auth0 CLI login interactively with required scopes
 * @param {string} domain - Optional tenant domain to login to
 * @returns {Promise<boolean>} True if login was successful
 */
async function runAuth0Login(domain = null) {
  console.log("\n🔐 Starting Auth0 CLI login...\n")
  console.log("   A browser window will open for authentication.")
  console.log("   Please complete the login process.\n")

  try {
    // Build login args with required scopes
    const scopesArg = BOOTSTRAP_SCOPES.join(",")
    const args = ['login', '--scopes', scopesArg]

    // Add domain if specified
    if (domain) {
      args.push('--domain', domain)
    }

    // Run login in interactive mode (no --no-input flag)
    // Use stdio: 'inherit' to allow interactive browser-based login
    execaSync('auth0', args, {
      stdio: 'inherit',
      timeout: 120000, // 2 minute timeout for login process
    })
    return true
  } catch (e) {
    if (e.timedOut) {
      console.error("\n❌ Login timed out. Please try again.")
    } else {
      console.error(`\n❌ Login failed: ${e.message}`)
    }
    return false
  }
}

/**
 * Validate Auth0 CLI session and offer to login if expired
 * @returns {Promise<void>}
 */
export async function validateAuth0Session() {
  const spinner = ora({
    text: `Validating Auth0 CLI session`,
  }).start()

  const sessionValid = await isSessionValid()

  if (sessionValid) {
    spinner.succeed("Auth0 CLI session is valid")
    return
  }

  spinner.warn("Auth0 CLI session appears to be expired or invalid")

  const shouldLogin = await confirmWithUser(
    "Would you like to login to Auth0 CLI now?"
  )

  if (!shouldLogin) {
    console.error("\n❌ Cannot proceed without a valid Auth0 CLI session.")
    console.error("   Please run 'auth0 login' manually and try again.\n")
    process.exit(1)
  }

  const loginSuccess = await runAuth0Login()

  if (!loginSuccess) {
    console.error("\n❌ Login was not successful. Please try again.\n")
    process.exit(1)
  }

  // Verify the session is now valid
  const postLoginValid = await isSessionValid()
  if (!postLoginValid) {
    console.error("\n❌ Session validation failed after login.")
    console.error("   Please check your Auth0 CLI configuration and try again.\n")
    process.exit(1)
  }

  console.log("\n✅ Successfully logged in to Auth0 CLI\n")
}

/**
 * Switch to a different tenant using auth0 tenants use
 * @param {string} tenantName - Tenant domain to switch to
 * @returns {Promise<boolean>} True if switch was successful
 */
async function switchToTenant(tenantName) {
  const spinner = ora({
    text: `Switching to tenant: ${tenantName}`,
  }).start()

  try {
    await $({ timeout: CLI_TIMEOUT })`auth0 tenants use ${tenantName} --no-input`
    spinner.succeed(`Switched to tenant: ${tenantName}`)
    return true
  } catch (e) {
    spinner.fail(`Failed to switch to tenant: ${tenantName}`)
    return false
  }
}

/**
 * Validate tenant configuration
 * @param {string} tenantName - Required tenant name from command line argument
 */
export async function validateTenant(tenantName) {
  if (!tenantName) {
    console.error("\n❌ Error: Tenant name is required")
    console.error("\nUsage: node scripts/bootstrap.mjs <tenant-domain>")
    console.error("\nExample:")
    console.error("   node scripts/bootstrap.mjs my-tenant.us.auth0.com")
    console.error(
      "\nThis is a safety measure to prevent accidentally configuring the wrong tenant."
    )
    process.exit(1)
  }

  const spinner = ora({
    text: `Validating tenant: ${tenantName}`,
  }).start()

  try {
    // Get current tenant from CLI
    // NOTE: we're outputting as CSV here due to a bug in the Auth0 CLI that doesn't respect the --json flag
    // https://github.com/auth0/auth0-cli/pull/1002
    const tenantSettingsArgs = ["tenants", "list", "--csv", "--no-input"]
    const { stdout } = await $({ timeout: CLI_TIMEOUT })`auth0 ${tenantSettingsArgs}`

    // Parse all available tenants and find the active one
    const tenantLines = stdout.split("\n").slice(1).filter(line => line.trim())
    const availableTenants = tenantLines.map(line => line.split(",")[1]?.trim()).filter(Boolean)

    // Get the active tenant (marked with →)
    const cliDomain = tenantLines
      .find((line) => line.includes("→"))
      ?.split(",")[1]
      ?.trim()

    if (!cliDomain) {
      spinner.fail("No active tenant found in Auth0 CLI")
      console.error("\n❌ No active tenant configured.")

      const shouldLogin = await confirmWithUser(
        `Would you like to login to ${tenantName}?`
      )

      if (shouldLogin) {
        const loginSuccess = await runAuth0Login(tenantName)
        if (loginSuccess) {
          // Retry tenant validation after login
          return validateTenant(tenantName)
        }
      }

      console.error("\n❌ Cannot proceed without an active tenant.")
      console.error("   Please run 'auth0 login' and try again.\n")
      process.exit(1)
    }

    // Verify the provided tenant name matches the CLI active tenant
    if (tenantName !== cliDomain) {
      spinner.fail("Tenant mismatch detected")
      console.error(`\n❌ Tenant mismatch:`)
      console.error(`   Requested tenant: ${tenantName}`)
      console.error(`   CLI is using:     ${cliDomain}`)

      // Check if the requested tenant is in the list of available tenants
      const tenantAvailable = availableTenants.includes(tenantName)

      if (tenantAvailable) {
        // Tenant exists, offer to switch
        console.error(`\n   The tenant "${tenantName}" is available in your CLI.`)
        const shouldSwitch = await confirmWithUser(
          `Would you like to switch to ${tenantName}?`
        )

        if (shouldSwitch) {
          const switchSuccess = await switchToTenant(tenantName)
          if (switchSuccess) {
            // Retry tenant validation after switching
            return validateTenant(tenantName)
          }
        }
      } else {
        // Tenant not in list, offer to login
        console.error(`\n   The tenant "${tenantName}" is not in your CLI's tenant list.`)
        console.error(`   You may need to login to this tenant.`)
        const shouldLogin = await confirmWithUser(
          `Would you like to login to ${tenantName}?`
        )

        if (shouldLogin) {
          const loginSuccess = await runAuth0Login(tenantName)
          if (loginSuccess) {
            // Retry tenant validation after login
            return validateTenant(tenantName)
          }
        }
      }

      console.error("\n❌ Cannot proceed with mismatched tenant.")
      console.error(
        "\nThis is a safety measure to prevent accidentally configuring the wrong tenant."
      )
      process.exit(1)
    }

    spinner.succeed(`Validated tenant: ${cliDomain}`)
    return cliDomain
  } catch (e) {
    // Handle timeout errors specifically
    if (e.timedOut) {
      spinner.fail("Auth0 CLI command timed out")
      console.error("\n❌ The Auth0 CLI is not responding.")
      console.error("   This usually means your session has expired.\n")

      const shouldLogin = await confirmWithUser(
        `Would you like to login to ${tenantName}?`
      )

      if (shouldLogin) {
        const loginSuccess = await runAuth0Login(tenantName)
        if (loginSuccess) {
          // Retry tenant validation after login
          return validateTenant(tenantName)
        }
      }

      console.error("\n❌ Cannot proceed without a valid session.")
      console.error("   Please run 'auth0 login' and try again.\n")
      process.exit(1)
    }

    spinner.fail("Failed to validate tenant")
    console.error(e)
    process.exit(1)
  }
}

/**
 * Validate that required API scopes are available on the tenant
 * Changes from hard fail to soft warning - if API is missing, warns user and offers to continue without that feature
 * @param {object} resources - Discovered resources from the tenant
 * @param {string} domain - The tenant domain
 * @param {object} featureConfig - Feature configuration { enableMyOrg, enableMyAccount }
 * @returns {Promise<object>} Updated featureConfig after user decisions
 */
export async function validateRequiredScopes(resources, domain, featureConfig) {
  const spinner = ora({
    text: `Validating required API scopes`,
  }).start()

  const warnings = []
  const updatedConfig = { ...featureConfig }

  // Check My Organization API scopes (only if enabled)
  if (featureConfig.enableMyOrg) {
    const myOrgApi = resources.resourceServers.find(
      (rs) => rs.identifier === `https://${domain}/my-org/`
    )

    if (!myOrgApi) {
      warnings.push({
        api: "My Organization API",
        feature: "enableMyOrg",
        issue: "API not found on tenant",
        suggestion: "Ensure your tenant has the My Organization feature enabled",
        continueMessage: "Continue with User Self-Service only?",
      })
    } else {
      const availableMyOrgScopes = myOrgApi.scopes?.map((s) => s.value) || []
      const missingMyOrgScopes = MYORG_API_SCOPES.filter(
        (scope) => !availableMyOrgScopes.includes(scope)
      )
      if (missingMyOrgScopes.length > 0) {
        warnings.push({
          api: "My Organization API",
          feature: "enableMyOrg",
          issue: `Missing ${missingMyOrgScopes.length} required scope(s)`,
          missing: missingMyOrgScopes,
          suggestion: "Contact Auth0 support to enable these scopes on your tenant",
          continueMessage: "Continue with User Self-Service only?",
        })
      }
    }
  }

  // Check My Account API scopes (only if enabled)
  if (featureConfig.enableMyAccount) {
    const myAccountApi = resources.resourceServers.find(
      (rs) => rs.identifier === `https://${domain}/me/`
    )

    if (!myAccountApi) {
      warnings.push({
        api: "My Account API",
        feature: "enableMyAccount",
        issue: "API not found on tenant",
        suggestion: "Ensure your tenant has the My Account feature enabled (may require beta access)",
        continueMessage: "Continue with Organization Management only?",
      })
    } else {
      const availableMyAccountScopes = myAccountApi.scopes?.map((s) => s.value) || []
      const missingMyAccountScopes = MYACCOUNT_API_SCOPES_DESIRED.filter(
        (scope) => !availableMyAccountScopes.includes(scope)
      )
      if (missingMyAccountScopes.length > 0) {
        warnings.push({
          api: "My Account API",
          feature: "enableMyAccount",
          issue: `Missing ${missingMyAccountScopes.length} required MFA scope(s)`,
          missing: missingMyAccountScopes,
          available: availableMyAccountScopes,
          suggestion: "Contact Auth0 support to enable these scopes on your tenant",
          continueMessage: "Continue with Organization Management only?",
        })
      }
    }
  }

  // Process warnings with graceful degradation
  if (warnings.length > 0) {
    spinner.warn("Some API scope issues detected")

    for (const warning of warnings) {
      console.log("")
      console.log(`⚠️  ${warning.api}`)
      console.log(`   Issue: ${warning.issue}`)
      if (warning.missing) {
        console.log(`   Missing scopes:`)
        warning.missing.forEach((scope) => console.log(`     - ${scope}`))
      }
      if (warning.available && warning.available.length > 0) {
        console.log(`   Available scopes:`)
        warning.available.forEach((scope) => console.log(`     - ${scope}`))
      }
      console.log(`   Suggestion: ${warning.suggestion}`)
      console.log("")

      // Check if we have another feature to fall back to
      const canContinue =
        (warning.feature === "enableMyOrg" && updatedConfig.enableMyAccount) ||
        (warning.feature === "enableMyAccount" && updatedConfig.enableMyOrg)

      if (canContinue) {
        const continueWithout = await confirmWithUser(warning.continueMessage)
        if (continueWithout) {
          updatedConfig[warning.feature] = false
          console.log(`   → Disabled ${warning.api} configuration`)
        } else {
          console.error("\n❌ Bootstrap cancelled. Please resolve the issues above before continuing.\n")
          process.exit(1)
        }
      } else {
        // No fallback available, must exit
        console.error("\n❌ Cannot continue without at least one feature enabled.")
        console.error("   Please resolve the issues above before running the bootstrap script.\n")
        process.exit(1)
      }
    }

    // Verify we still have at least one feature enabled
    if (!updatedConfig.enableMyOrg && !updatedConfig.enableMyAccount) {
      console.error("\n❌ No features are enabled. Cannot proceed with bootstrap.\n")
      process.exit(1)
    }

    return updatedConfig
  }

  spinner.succeed("Required API scopes are available")
  return updatedConfig
}
