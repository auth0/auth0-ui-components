import ora from "ora"

import { auth0ApiCall } from "./auth0-api.mjs"
import { ChangeAction, createChangeItem } from "./change-plan.mjs"

// Constants
// The Management API calls Organization Profiles "organization templates".
export const DEMO_ORGANIZATION_TEMPLATE_NAME = "Universal-Components-Org-Profile"
// Members other than the caller block deletion; the UI shows the "has other members" error.
const DEMO_ORGANIZATION_DELETION_BEHAVIOR = "allow_if_empty"

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

/**
 * IDs of the organizations a template is assigned to.
 * Returns null when they can't be read, so the caller assigns again (which is idempotent).
 * Only the first page is read, which is plenty for a demo tenant.
 */
async function fetchAssignedOrganizationIds(templateId) {
  try {
    const response = await auth0ApiCall("get", `organization-templates/${templateId}/organizations`)
    if (!response) return null
    const organizations = Array.isArray(response) ? response : response.organizations || []
    return organizations.map((org) => org.id)
  } catch {
    return null
  }
}

// ============================================================================
// CHECK FUNCTIONS - Determine what changes are needed
// ============================================================================

/**
 * Describe how another tenant's default profile differs from what the demo needs.
 * It is never changed, so these are only reported.
 */
function describeForeignDefaultIssues(template) {
  const issues = []
  if (!template.admin_roles_assignment?.length) {
    issues.push("it assigns no admin role (creating an organization needs one)")
  }
  if (template.organization_deletion_behavior !== DEMO_ORGANIZATION_DELETION_BEHAVIOR) {
    issues.push(
      `its organization_deletion_behavior is "${template.organization_deletion_behavior ?? "unset"}" rather than "${DEMO_ORGANIZATION_DELETION_BEHAVIOR}"`
    )
  }
  return issues
}

/**
 * Check if the default organization template (Organization Profile) needs to be created or has drifted.
 * Creating organizations from My Account (OrganizationCreate) requires a default profile.
 *
 * Drift is checked on the settings the organization components rely on: the default flag, the
 * deletion behavior, the admin role, the connection and user attribute profile links, and the
 * demo organization's assignment. An ID that is undefined has not been created yet, so it counts as drift.
 * @param {Array|null} existingTemplates - Result of fetchOrganizationTemplates
 * @param {object} refs - IDs that should be linked: connectionProfileId, userAttributeProfileId, adminRoleId, orgId
 */
export async function checkOrganizationTemplateChanges(existingTemplates, refs) {
  const { connectionProfileId, userAttributeProfileId, adminRoleId, orgId } = refs

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

  // Never replace a default profile the tenant already uses; the script only adds what's missing.
  const otherDefault = existingTemplates.find(
    (t) => t.is_default && t.name !== DEMO_ORGANIZATION_TEMPLATE_NAME
  )
  if (otherDefault && !existing?.is_default) {
    const issues = describeForeignDefaultIssues(otherDefault)
    return createChangeItem(ChangeAction.SKIP, {
      resource: "Organization Profile",
      name: DEMO_ORGANIZATION_TEMPLATE_NAME,
      note: true,
      reason: `"${otherDefault.name}" is already the default Organization Profile and was left unchanged${
        issues.length > 0 ? `, but ${issues.join(" and ")}` : ""
      }`,
    })
  }

  if (!existing) {
    return createChangeItem(ChangeAction.CREATE, {
      resource: "Organization Profile",
      name: DEMO_ORGANIZATION_TEMPLATE_NAME,
    })
  }

  const updates = {}
  const changes = []

  if (!existing.is_default) {
    updates.makeDefault = true
    changes.push("Make it the default Organization Profile")
  }
  if (existing.organization_deletion_behavior !== DEMO_ORGANIZATION_DELETION_BEHAVIOR) {
    updates.deletionBehavior = true
    changes.push(
      `Set organization_deletion_behavior to "${DEMO_ORGANIZATION_DELETION_BEHAVIOR}" (currently "${existing.organization_deletion_behavior ?? "unset"}")`
    )
  }
  // Creating an organization needs a profile that assigns an admin role.
  if (!adminRoleId || !existing.admin_roles_assignment?.includes(adminRoleId)) {
    updates.adminRole = true
    changes.push("Assign the admin role")
  }
  if (!connectionProfileId || existing.connection_profile_id !== connectionProfileId) {
    updates.connectionProfile = true
    changes.push("Link the connection profile")
  }
  if (!userAttributeProfileId || existing.user_attribute_profile_id !== userAttributeProfileId) {
    updates.userAttributeProfile = true
    changes.push("Link the user attribute profile")
  }
  const assignedOrgIds = orgId ? await fetchAssignedOrganizationIds(existing.id) : null
  if (!assignedOrgIds?.includes(orgId)) {
    updates.orgAssignment = true
    changes.push("Assign it to the demo organization")
  }

  if (changes.length === 0) {
    return createChangeItem(ChangeAction.SKIP, {
      resource: "Organization Profile",
      name: DEMO_ORGANIZATION_TEMPLATE_NAME,
      existing,
    })
  }

  return createChangeItem(ChangeAction.UPDATE, {
    resource: "Organization Profile",
    name: DEMO_ORGANIZATION_TEMPLATE_NAME,
    existing,
    updates: { ...updates, changes },
    summary: changes.join(", "),
  })
}

// ============================================================================
// APPLY FUNCTIONS - Execute changes based on cached plan
// ============================================================================

/**
 * Build the PATCH body that fixes the drift found by checkOrganizationTemplateChanges.
 */
function buildTemplatePatch(updates, existing, refs) {
  const patch = {}
  if (updates.makeDefault) patch.is_default = true
  if (updates.deletionBehavior) {
    patch.organization_deletion_behavior = DEMO_ORGANIZATION_DELETION_BEHAVIOR
  }
  if (updates.adminRole && refs.adminRoleId) {
    // Keep any roles that were added to the profile by hand.
    patch.admin_roles_assignment = [...(existing.admin_roles_assignment ?? []), refs.adminRoleId]
  }
  if (updates.connectionProfile && refs.connectionProfileId) {
    patch.connection_profile_id = refs.connectionProfileId
  }
  if (updates.userAttributeProfile && refs.userAttributeProfileId) {
    patch.user_attribute_profile_id = refs.userAttributeProfileId
  }
  return patch
}

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

  if (changePlan.action === ChangeAction.SKIP) {
    const spinner = ora({ text: `Organization Profile is up to date` }).start()
    spinner.succeed()
    return changePlan.existing
  }

  const spinner = ora({ text: `Configuring default Organization Profile` }).start()

  try {
    let template = changePlan.existing
    // A new profile always needs the demo org assigned; an existing one only when it has drifted.
    let assignOrg = true

    if (changePlan.action === ChangeAction.CREATE) {
      template = await auth0ApiCall("post", "organization-templates", {
        name: DEMO_ORGANIZATION_TEMPLATE_NAME,
        is_default: true,
        organization_deletion_behavior: DEMO_ORGANIZATION_DELETION_BEHAVIOR,
        enforce_permission_ceiling: false,
        enforce_self_assignment_restriction: false,
        connection_profile_id: connectionProfileId ?? null,
        user_attribute_profile_id: userAttributeProfileId ?? null,
        // Roles given to the user who creates an organization from My Account.
        admin_roles_assignment: adminRoleId ? [adminRoleId] : null,
      })
      if (!template) throw new Error("Missing scope create:organization_templates")
    } else if (changePlan.action === ChangeAction.UPDATE) {
      const patch = buildTemplatePatch(changePlan.updates, template, refs)
      if (Object.keys(patch).length > 0) {
        template = await auth0ApiCall("patch", `organization-templates/${template.id}`, patch)
        if (!template) throw new Error("Missing scope update:organization_templates")
      }
      assignOrg = changePlan.updates.orgAssignment
    }

    if (orgId && assignOrg) {
      await auth0ApiCall("put", `organizations/${orgId}/organization-templates/${template.id}`)
    }

    spinner.succeed(`Configured default Organization Profile`)
    return template
  } catch (e) {
    spinner.warn(`Could not configure Organization Profile: ${e.message}`)
    return null
  }
}
