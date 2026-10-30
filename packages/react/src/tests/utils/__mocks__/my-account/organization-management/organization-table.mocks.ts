import type {
  ListUserOrganizationsResponse,
  UserOrganization,
} from '@auth0/universal-components-core';

export const createMockUserOrganization = (
  overrides: Partial<UserOrganization> = {},
): UserOrganization => ({
  id: 'org_abc123',
  name: 'acme',
  display_name: 'Acme Corp.',
  ...overrides,
});

export const createMockUserOrganizations = (): UserOrganization[] => [
  createMockUserOrganization(),
  createMockUserOrganization({ id: 'org_def456', name: 'fabrikam', display_name: 'Fabrikam Inc.' }),
  createMockUserOrganization({ id: 'org_ghi789', name: 'contoso', display_name: undefined }),
];

/**
 * Mirrors the shape of the SDK `Page` returned by `organizations.list()`.
 * @param organizations - Organizations on the page.
 * @param next - Checkpoint token for the next page, if any.
 * @returns A page-like object exposing `response`.
 */
export const createMockUserOrganizationsPage = (
  organizations: UserOrganization[],
  next?: string,
): { data: UserOrganization[]; response: ListUserOrganizationsResponse } => ({
  data: organizations,
  response: { organizations, next },
});
