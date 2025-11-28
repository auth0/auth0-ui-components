import { existsSync, readFileSync, writeFileSync } from "fs"
import ora from "ora"

/**
 * Write .env.local file with all required environment variables
 * Merges with .env.local.user if it exists
 */
export async function writeEnvFile(
  domain,
  dashboardClientId,
  dashboardClientSecret,
  myOrgResourceServerId,
  adminRoleId,
  memberRoleId,
  connectionId
) {
  const spinner = ora({
    text: `Writing .env.local file`,
  }).start()

  try {
    // Build bootstrap-managed configuration
    const envContent = `# Auth0 Configuration (managed by bootstrap script)
AUTH0_SECRET='${generateRandomSecret()}'
APP_BASE_URL='http://localhost:5173'
AUTH0_DOMAIN='https://${domain}'
AUTH0_CLIENT_ID='${dashboardClientId}'
AUTH0_CLIENT_SECRET='${dashboardClientSecret}'
AUTH0_SCOPE='openid profile email offline_access read:my_org:details update:my_org:details read:my_org:identity_providers create:my_org:identity_providers update:my_org:identity_providers delete:my_org:identity_providers update:my_org:identity_providers_detach read:my_org:configuration read::my_org:identity_providers_provisioning create:my_org:identity_providers_provisioning delete:my_org:identity_providers_provisioning read:my_org:identity_providers_domains create:my_org:identity_providers_domains delete:my_org:identity_providers_domains read:my_org:identity_providers_scim_tokens create:my_org:identity_providers_scim_tokens delete:my_org:identity_providers_scim_tokens read:my_org:domains delete:my_org:domains create:my_org:domains update:my_org:domains'
`
    // Check if .env.local.user exists and merge it
    let finalContent = envContent
    if (existsSync(".env.local.user")) {
      const userEnvContent = readFileSync(".env.local.user", "utf8")
      finalContent = `${envContent}
# User-specific configuration (from .env.local.user)
${userEnvContent}
`
      spinner.text = "Writing .env.local file (merged with .env.local.user)"
    }

    writeFileSync(".env.local", finalContent)
    spinner.succeed()
  } catch (e) {
    spinner.fail(`Failed to write .env.local file`)
    throw e
  }
}

/**
 * Generate a random secret for AUTH0_SECRET
 */
function generateRandomSecret() {
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0")
  ).join("")
}
