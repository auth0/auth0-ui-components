import { $ } from "execa"

// Default timeout for API calls (30 seconds)
const DEFAULT_API_TIMEOUT = 30000

/**
 * Check if an error indicates an authentication/authorization issue
 * @param {Error} e - The error to check
 * @returns {boolean} True if it's an auth error
 */
function isAuthError(e) {
  const stderr = e.stderr?.toLowerCase() || ""
  const message = e.message?.toLowerCase() || ""

  // Check for clear authentication failures
  if (stderr.includes("unauthorized") || stderr.includes("401")) {
    return true
  }

  // Check for token expiration messages
  if (stderr.includes("token") && (stderr.includes("expired") || stderr.includes("invalid"))) {
    return true
  }

  // Check for "please login" type messages (but not "during login" which is scope advice)
  if (stderr.includes("please login") || stderr.includes("not logged in")) {
    return true
  }

  return false
}

/**
 * Make a generic API call using auth0 CLI
 * @param {string} method - HTTP method (get, post, patch, delete)
 * @param {string} endpoint - API endpoint
 * @param {object} data - Optional data payload
 * @param {number} timeout - Optional timeout in ms (default 30s)
 */
export async function auth0ApiCall(method, endpoint, data = null, timeout = DEFAULT_API_TIMEOUT) {
  const args = ["api", method, endpoint, "--no-input"]

  if (data) {
    args.push("--data", JSON.stringify(data))
  }

  try {
    const { stdout } = await $({ timeout })`auth0 ${args}`
    return stdout ? JSON.parse(stdout) : null
  } catch (e) {
    // Check if it's a timeout error
    if (e.timedOut) {
      throw new Error(`API call timed out after ${timeout}ms. Your Auth0 session may have expired.`)
    }
    // Check for authentication errors
    if (isAuthError(e)) {
      throw new Error(`Authentication failed. Your Auth0 session may have expired.`)
    }
    // For scope errors, return null gracefully (the feature may not be available)
    if (e.stderr?.includes("lacks scope") || e.stderr?.includes("insufficient_scope")) {
      console.warn(`⚠️  Warning: Missing required scope for ${endpoint}. Some features may not be available.`)
      return null
    }
    console.warn(`⚠️  Warning: API Call failed: ${e.message}`)
    throw e
  }
}

/**
 * Check if the Auth0 CLI session is valid by making a simple API call
 * @param {number} timeout - Timeout in ms (default 10s for quick check)
 * @returns {Promise<boolean>} True if session is valid
 */
export async function isSessionValid(timeout = 10000) {
  try {
    // Try a lightweight API call to check if session is valid
    const { stdout } = await $({ timeout })`auth0 api get users --no-input`
    return true
  } catch (e) {
    return false
  }
}
