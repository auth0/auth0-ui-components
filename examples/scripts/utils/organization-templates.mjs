import ora from "ora"

import { auth0ApiCall } from "./auth0-api.mjs"
import { ChangeAction, createChangeItem } from "./change-plan.mjs"

// Constants
// The Management API calls Organization Profiles "organization templates".
export const DEMO_ORGANIZATION_TEMPLATE_NAME = "Universal-Components-Org-Profile"

/**
 * Normalize the organization templates list response.
 * Returns null when templates are unavailable (feature flag off or missing scope).
 */
export async function fetchOrganizationTemplates() {
  try {
    const response = await auth0ApiCall("get", "organization-templates")
    if (!response) return null
    return Array.isArray(response) ? response : response.organization_templates || []
  } catch {
    return null
  }
}

// ============================================================================
// CHECK FUNCTIONS - Determine what changes are needed
// ============================================================================

/**
 * Check if the default organization template (Organization Profile) needs to be created.
 * Creating organizations from My Account (OrganizationCreate) requires a default profile.
 */
export function checkOrganizationTemplateChanges(existingTemplates) {
  if (existingTemplates === null) {
    return createChangeItem(ChangeAction.SKIP, {
      resource: "Organization Profile",
      name: DEMO_ORGANIZATION_TEMPLATE_NAME,
      note: true,
      reason:
        "Organization Profiles are unavailable on this tenant (they must be enabled, and the bootstrap needs the read/create:organization_templates scopes)",
    })
  }

  const existing = existingTemplates.find((t) => t.name === DEMO_ORGANIZATION_TEMPLATE_NAME)
  if (existing?.is_default) {
    return createChangeItem(ChangeAction.SKIP, {
      resource: "Organization Profile",
      name: DEMO_ORGANIZATION_TEMPLATE_NAME,
      existing,
    })
  }

  // Never replace a default profile the tenant already uses; the script only adds what's missing.
  const otherDefault = existingTemplates.find((t) => t.is_default)
  if (otherDefault) {
    return createChangeItem(ChangeAction.SKIP, {
      resource: "Organization Profile",
      name: DEMO_ORGANIZATION_TEMPLATE_NAME,
      note: true,
      reason: `"${otherDefault.name}" is already the default Organization Profile and was left unchanged. Organizations created from My Account use the default profile, so make sure it assigns an admin role`,
    })
  }

  if (!existing) {
    return createChangeItem(ChangeAction.CREATE, {
      resource: "Organization Profile",
      name: DEMO_ORGANIZATION_TEMPLATE_NAME,
    })
  }

  // Creating an organization needs a profile that assigns an admin role, so fill that in if it is missing.
  const needsAdminRole = !existing.admin_roles_assignment?.length
  return createChangeItem(ChangeAction.UPDATE, {
    resource: "Organization Profile",
    name: DEMO_ORGANIZATION_TEMPLATE_NAME,
    existing,
    updates: { is_default: true, needsAdminRole },
    summary: needsAdminRole
      ? "Make it the default Organization Profile and assign the admin role"
      : "Make it the default Organization Profile",
  })
}

// ============================================================================
// APPLY FUNCTIONS - Execute changes based on cached plan
// ============================================================================

/**
 * Apply organization template changes and assign the template to the demo org.
 * Failures are reported as warnings so the rest of the bootstrap still completes.
 * @param {object} changePlan - Change item from checkOrganizationTemplateChanges
 * @param {object} refs - IDs to link: connectionProfileId, userAttributeProfileId, adminRoleId, orgId
 * @returns {Promise<object|null>} The organization template, or null when unavailable
 */
export async function applyOrganizationTemplateChanges(changePlan, refs) {
  const { connectionProfileId, userAttributeProfileId, adminRoleId, orgId } = refs

  if (changePlan.action === ChangeAction.SKIP && !changePlan.existing) {
    const spinner = ora({ text: `Organization Profile` }).start()
    spinner.warn(`Skipped Organization Profile: ${changePlan.reason}`)
    return null
  }

  const spinner = ora({ text: `Configuring default Organization Profile` }).start()

  try {
    let template = changePlan.existing

    if (changePlan.action === ChangeAction.CREATE) {
      template = await auth0ApiCall("post", "organization-templates", {
        name: DEMO_ORGANIZATION_TEMPLATE_NAME,
        is_default: true,
        // Members other than the caller block deletion; the UI shows the "has other members" error.
        organization_deletion_behavior: "allow_if_empty",
        enforce_permission_ceiling: false,
        enforce_self_assignment_restriction: false,
        connection_profile_id: connectionProfileId ?? null,
        user_attribute_profile_id: userAttributeProfileId ?? null,
        // Roles given to the user who creates an organization from My Account.
        admin_roles_assignment: adminRoleId ? [adminRoleId] : null,
      })
      if (!template) throw new Error("Missing scope create:organization_templates")
    } else if (changePlan.action === ChangeAction.UPDATE) {
      const patch = { is_default: true }
      if (adminRoleId && changePlan.updates?.needsAdminRole) {
        patch.admin_roles_assignment = [adminRoleId]
      }
      template = await auth0ApiCall("patch", `organization-templates/${template.id}`, patch)
      if (!template) throw new Error("Missing scope update:organization_templates")
    }

    if (orgId) {
      await auth0ApiCall("put", `organizations/${orgId}/organization-templates/${template.id}`)
    }

    spinner.succeed(
      changePlan.action === ChangeAction.SKIP
        ? `Organization Profile is up to date`
        : `Configured default Organization Profile`
    )
    return template
  } catch (e) {
    spinner.warn(`Could not configure Organization Profile: ${e.message}`)
    return null
  }
}
