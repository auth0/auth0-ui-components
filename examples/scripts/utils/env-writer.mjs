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
  exampleType
) {
  const spinner = ora({
    text: `Writing .env.local file`,
  }).start()

  try {
    // Build bootstrap-managed configuration
    const envContent = getEnvContent(domain, dashboardClientId, dashboardClientSecret, exampleType)

    // Check if .env.local.user exists and merge it
    let finalContent = envContent
    if (existsSync(`../${exampleType}/.env.local.user`)) {
      const userEnvContent = readFileSync(`../${exampleType}/.env.local.user`, "utf8")
      finalContent = `${envContent}
# User-specific configuration (from .env.local.user)
${userEnvContent}
`
      spinner.text = "Writing .env.local file (merged with .env.local.user)"
    }
    writeFileSync(`../${exampleType}/.env.local`, finalContent)
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

function getEnvContent(domain, dashboardClientId, dashboardClientSecret, exampleType) {
  var envContent = ``;
  if (exampleType === 'next-rwa') {
    envContent = `# Auth0 Configuration (managed by bootstrap script)
AUTH0_SECRET='${generateRandomSecret()}'
APP_BASE_URL='http://localhost:5173'
AUTH0_DOMAIN='https://${domain}'
AUTH0_CLIENT_ID='${dashboardClientId}'
AUTH0_CLIENT_SECRET='${dashboardClientSecret}'
AUTH0_SCOPE='openid profile email offline_access read:my_org:details update:my_org:details read:my_org:identity_providers create:my_org:identity_providers update:my_org:identity_providers delete:my_org:identity_providers update:my_org:identity_providers_detach read:my_org:configuration read:my_org:identity_providers_provisioning create:my_org:identity_providers_provisioning delete:my_org:identity_providers_provisioning create:my_org:identity_providers_domains delete:my_org:identity_providers_domains read:my_org:identity_providers_scim_tokens create:my_org:identity_providers_scim_tokens delete:my_org:identity_providers_scim_tokens read:my_org:domains delete:my_org:domains create:my_org:domains update:my_org:domains create:me:authentication_methods read:me:authentication_methods delete:me:authentication_methods update:me:authentication_methods read:me:factors'
# Auth0 Configuration - Public and exposed to the Browser
NEXT_PUBLIC_AUTH0_DOMAIN='${domain}'
# Feature Flags - Public and exposed to the Browser
NEXT_PUBLIC_ENABLE_MY_ACCOUNT='false'
`
  } else {
    // Default to SPA env vars
    envContent = `# Auth0 Configuration (managed by bootstrap script)
VITE_AUTH0_DOMAIN='${domain}'
VITE_AUTH0_CLIENT_ID='${dashboardClientId}'`
  }
  return envContent;
}
