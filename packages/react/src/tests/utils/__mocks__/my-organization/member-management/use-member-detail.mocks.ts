import { vi } from 'vitest';

import {
  createMockMember,
  createMockMemberRoles,
  createMockAvailableRoles,
} from '@/tests/utils/__mocks__/my-organization/member-management/member.mocks';
import type { MemberDetailServiceResult } from '@/types/my-organization/member-management/organization-member-detail-types';

export type MockService = {
  memberQuery: Pick<
    MemberDetailServiceResult['memberQuery'],
    'data' | 'isLoading' | 'isFetching' | 'isError' | 'isSuccess' | 'error'
  >;
  memberRolesQuery: Pick<
    MemberDetailServiceResult['memberRolesQuery'],
    'data' | 'isLoading' | 'isFetching' | 'isError' | 'error'
  >;
  rolesQuery: Pick<MemberDetailServiceResult['rolesQuery'], 'data' | 'isLoading' | 'isFetching'>;
  organizationQuery: Pick<MemberDetailServiceResult['organizationQuery'], 'data'>;
  removeFromOrganizationMutation: Pick<
    MemberDetailServiceResult['removeFromOrganizationMutation'],
    'mutate' | 'isPending'
  >;
  assignRolesMutation: Pick<
    MemberDetailServiceResult['assignRolesMutation'],
    'mutate' | 'isPending'
  >;
  removeRolesMutation: Pick<
    MemberDetailServiceResult['removeRolesMutation'],
    'mutate' | 'isPending'
  >;
};

export const makeMockService = (overrides?: Partial<MockService>): MockService => ({
  memberQuery: {
    data: createMockMember(),
    isLoading: false,
    isFetching: false,
    isError: false,
    isSuccess: true,
    error: null,
  },
  memberRolesQuery: {
    data: createMockMemberRoles(),
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
  },
  rolesQuery: {
    data: createMockAvailableRoles(),
    isLoading: false,
    isFetching: false,
  },
  organizationQuery: {
    data: { display_name: 'Test Org' } as MemberDetailServiceResult['organizationQuery']['data'],
  },
  removeFromOrganizationMutation: { mutate: vi.fn(), isPending: false },
  assignRolesMutation: { mutate: vi.fn(), isPending: false },
  removeRolesMutation: { mutate: vi.fn(), isPending: false },
  ...overrides,
});
