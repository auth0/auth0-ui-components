import { act, renderHook } from '@testing-library/react';
import { createElement, type PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { showToast } from '@/components/auth0/shared/toast';
import * as serviceModule from '@/hooks/my-organization/shared/services/use-connection-group-detail-service';
import { useOrganizationConnectionGroupDetail } from '@/hooks/my-organization/use-organization-connection-group-detail';
import * as useErrorHandlerModule from '@/hooks/shared/use-error-handler';
import * as useTranslatorModule from '@/hooks/shared/use-translator';
import { PermissionContext } from '@/providers/permission-provider';
import { createMockConnectionGroupDetailRoles } from '@/tests/utils/__mocks__/my-organization/connection-group-management/connection-group.mocks';
import { setupMockUseErrorHandler } from '@/tests/utils/test-utilities';
import type { UseOrganizationConnectionGroupDetailOptions } from '@/types/my-organization/connection-group-management/organization-connection-group-detail-types';

vi.mock('@/components/auth0/shared/toast', () => ({ showToast: vi.fn() }));
vi.mock('@/hooks/my-organization/shared/services/use-connection-group-detail-service', () => ({
  useConnectionGroupDetailService: vi.fn(),
}));

const GROUP_ID = 'grp_1';
const ALL_SCOPES = [
  'read:my_org:group_roles',
  'create:my_org:group_roles',
  'delete:my_org:group_roles',
];

const roles = createMockConnectionGroupDetailRoles();

const idleMutation = () => ({
  mutateAsync: vi.fn().mockResolvedValue(undefined),
  isPending: false,
});

let assignMutation: ReturnType<typeof idleMutation>;
let removeMutation: ReturnType<typeof idleMutation>;
let handleError: ReturnType<typeof vi.fn>;

const renderDetail = (
  overrides: Partial<UseOrganizationConnectionGroupDetailOptions> = {},
  scopes: string[] = ALL_SCOPES,
) => {
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(
      PermissionContext.Provider,
      { value: { permissions: scopes, isLoading: false } },
      children,
    );
  return renderHook(
    () =>
      useOrganizationConnectionGroupDetail({ groupId: GROUP_ID, onBack: vi.fn(), ...overrides }),
    { wrapper },
  );
};

let setRoleSearchTerm: ReturnType<typeof vi.fn>;
let enableRoleSearch: ReturnType<typeof vi.fn>;
let queryState: {
  rolesQuery: Record<string, unknown>;
};

const mockService = () =>
  vi.mocked(serviceModule.useConnectionGroupDetailService).mockReturnValue({
    ...queryState,
    availableRolesQuery: { data: [{ id: 'r9', name: 'Extra', description: '' }], isFetching: true },
    setRoleSearchTerm,
    enableRoleSearch,
    assignRolesMutation: assignMutation,
    removeRolesMutation: removeMutation,
  } as unknown as ReturnType<typeof serviceModule.useConnectionGroupDetailService>);

beforeEach(() => {
  vi.clearAllMocks();
  setRoleSearchTerm = vi.fn();
  enableRoleSearch = vi.fn();
  queryState = {
    rolesQuery: { data: roles, isLoading: false, isError: false },
  };
  assignMutation = idleMutation();
  removeMutation = idleMutation();
  mockService();
  vi.spyOn(useTranslatorModule, 'useTranslator').mockReturnValue({
    t: Object.assign((key: string) => key, { trans: () => [] }),
    changeLanguage: vi.fn(),
    currentLanguage: 'en',
    fallbackLanguage: 'en',
  });
  handleError = setupMockUseErrorHandler(useErrorHandlerModule);
});

describe('permissions', () => {
  it('maps group_roles scopes to capabilities', () => {
    const { result } = renderDetail({}, ['create:my_org:group_roles']);
    expect(result.current.permissions).toEqual({
      canViewRoles: false,
      canAssignRoles: true,
      canRemoveRoles: false,
    });
  });

  it('denies only write capabilities when readOnly and still enables the roles query', () => {
    const { result } = renderDetail({ readOnly: true });
    expect(result.current.permissions).toEqual({
      canViewRoles: true,
      canAssignRoles: false,
      canRemoveRoles: false,
    });
    expect(serviceModule.useConnectionGroupDetailService).toHaveBeenCalledWith(GROUP_ID, {
      canViewRoles: true,
      canAssignRoles: false,
    });
    expect(result.current.roles).toEqual(roles);
  });

  it('does not open modals without the matching permission', () => {
    const { result } = renderDetail({}, ['read:my_org:group_roles']);
    act(() => result.current.openModal({ type: 'assignRoles' }));
    expect(result.current.modalState).toBeNull();
    act(() => result.current.openModal({ type: 'removeRoles', roles }));
    expect(result.current.modalState).toBeNull();
  });
});

describe('data', () => {
  it('exposes roles and mapped available roles', () => {
    const { result } = renderDetail();
    expect(result.current.roles).toEqual(roles);
    expect(result.current.availableRoles).toEqual([
      { id: 'r9', name: 'Extra', description: '', permissions: [], removable: true },
    ]);
  });

  it('reports mutation loading flags', () => {
    assignMutation.isPending = true;
    const { result } = renderDetail();
    expect(result.current.isAssigningRoles).toBe(true);
    expect(result.current.isRemovingRoles).toBe(false);
  });
});

describe('handleAssignRolesSubmit', () => {
  it('runs onBefore, mutation, onAfter, toast, then closes modal', async () => {
    const order: string[] = [];
    const assignRolesAction = {
      onBefore: vi.fn(() => (order.push('before'), true)),
      onAfter: vi.fn(() => void order.push('after')),
    };
    assignMutation.mutateAsync.mockImplementation(async () => void order.push('mutate'));
    vi.mocked(showToast).mockImplementation(() => void order.push('toast'));
    const { result } = renderDetail({ assignRolesAction });
    act(() => result.current.openModal({ type: 'assignRoles' }));

    await act(async () => result.current.handleAssignRolesSubmit(['r9']));

    expect(order).toEqual(['before', 'mutate', 'after', 'toast']);
    expect(assignMutation.mutateAsync).toHaveBeenCalledWith({ roleIds: ['r9'] });
    expect(assignRolesAction.onAfter).toHaveBeenCalledWith({ groupId: GROUP_ID, roleIds: ['r9'] });
    expect(showToast).toHaveBeenCalledWith({
      type: 'success',
      message: 'notifications.assign_success',
    });
    expect(result.current.modalState).toBeNull();
  });

  it('aborts when onBefore returns false', async () => {
    const assignRolesAction = { onBefore: vi.fn(() => false), onAfter: vi.fn() };
    const { result } = renderDetail({ assignRolesAction });
    act(() => result.current.openModal({ type: 'assignRoles' }));

    await act(async () => result.current.handleAssignRolesSubmit(['r9']));

    expect(assignMutation.mutateAsync).not.toHaveBeenCalled();
    expect(assignRolesAction.onAfter).not.toHaveBeenCalled();
    expect(showToast).not.toHaveBeenCalled();
    expect(result.current.modalState).toEqual({ type: 'assignRoles' });
  });

  it('on error shows error, skips onAfter/success toast, keeps modal open', async () => {
    const error = new Error('boom');
    assignMutation.mutateAsync.mockRejectedValue(error);
    const assignRolesAction = { onAfter: vi.fn() };
    const { result } = renderDetail({ assignRolesAction });
    act(() => result.current.openModal({ type: 'assignRoles' }));

    await act(async () => result.current.handleAssignRolesSubmit(['r9']));

    expect(handleError).toHaveBeenCalledWith(error, {
      fallbackMessage: 'notifications.assign_error',
    });
    expect(assignRolesAction.onAfter).not.toHaveBeenCalled();
    expect(showToast).not.toHaveBeenCalled();
    expect(result.current.modalState).toEqual({ type: 'assignRoles' });
  });

  it('is a no-op without create permission', async () => {
    const { result } = renderDetail({}, ['read:my_org:group_roles']);
    await act(async () => result.current.handleAssignRolesSubmit(['r9']));
    expect(assignMutation.mutateAsync).not.toHaveBeenCalled();
  });
});

describe('handleRemoveRolesConfirm', () => {
  const openRemove = (result: ReturnType<typeof renderDetail>['result']) => {
    act(() => result.current.setSelectedRoles(roles));
    act(() => result.current.openModal({ type: 'removeRoles', roles }));
  };

  it('never sends non-removable role ids', async () => {
    const makeRole = (id: string, removable: boolean) => ({
      id,
      name: id,
      description: '',
      permissions: [],
      removable,
    });
    const { result } = renderDetail();
    act(() =>
      result.current.openModal({
        type: 'removeRoles',
        roles: [makeRole('ok_a', true), makeRole('managed_b', false)],
      }),
    );

    await act(async () => result.current.handleRemoveRolesConfirm());

    expect(removeMutation.mutateAsync).toHaveBeenCalledWith({ roleIds: ['ok_a'] });
  });

  it('does not call the mutation when every role is non-removable', async () => {
    const managed = {
      id: 'managed_b',
      name: 'b',
      description: '',
      permissions: [],
      removable: false,
    };
    const { result } = renderDetail();
    act(() => result.current.openModal({ type: 'removeRoles', roles: [managed] }));

    await act(async () => result.current.handleRemoveRolesConfirm());

    expect(removeMutation.mutateAsync).not.toHaveBeenCalled();
  });

  it('keeps other selected roles when removing a role outside the selection', async () => {
    const makeRole = (id: string) => ({
      id,
      name: id,
      description: '',
      permissions: [],
      removable: true,
    });
    const [roleA, roleB, roleC] = [makeRole('sel_a'), makeRole('sel_b'), makeRole('sel_c')];
    const { result } = renderDetail();
    act(() => result.current.setSelectedRoles([roleA, roleB]));
    act(() => result.current.openModal({ type: 'removeRoles', roles: [roleC] }));

    await act(async () => result.current.handleRemoveRolesConfirm());

    expect(removeMutation.mutateAsync).toHaveBeenCalledWith({ roleIds: ['sel_c'] });
    expect(result.current.selectedRoles).toEqual([roleA, roleB]);
    expect(result.current.modalState).toBeNull();
  });

  it('runs hooks in order, toasts, clears selection and closes modal', async () => {
    const order: string[] = [];
    const removeRolesAction = {
      onBefore: vi.fn(() => (order.push('before'), true)),
      onAfter: vi.fn(() => void order.push('after')),
    };
    removeMutation.mutateAsync.mockImplementation(async () => void order.push('mutate'));
    vi.mocked(showToast).mockImplementation(() => void order.push('toast'));
    const { result } = renderDetail({ removeRolesAction });
    openRemove(result);

    await act(async () => result.current.handleRemoveRolesConfirm());

    const roleIds = roles.filter((r) => r.removable).map((r) => r.id);
    expect(order).toEqual(['before', 'mutate', 'after', 'toast']);
    expect(removeMutation.mutateAsync).toHaveBeenCalledWith({ roleIds });
    expect(removeRolesAction.onAfter).toHaveBeenCalledWith({ groupId: GROUP_ID, roleIds });
    expect(result.current.selectedRoles).toEqual(roles.filter((r) => !r.removable));
    expect(result.current.modalState).toBeNull();
  });

  it('aborts when onBefore returns false, keeping modal and selection', async () => {
    const { result } = renderDetail({ removeRolesAction: { onBefore: () => false } });
    openRemove(result);

    await act(async () => result.current.handleRemoveRolesConfirm());

    expect(removeMutation.mutateAsync).not.toHaveBeenCalled();
    expect(result.current.selectedRoles).toEqual(roles);
    expect(result.current.modalState).toEqual({ type: 'removeRoles', roles });
  });

  it('on error shows error toast, keeps modal and selection', async () => {
    const error = new Error('boom');
    removeMutation.mutateAsync.mockRejectedValue(error);
    const { result } = renderDetail();
    openRemove(result);

    await act(async () => result.current.handleRemoveRolesConfirm());

    expect(handleError).toHaveBeenCalledWith(error, {
      fallbackMessage: 'notifications.remove_error',
    });
    expect(showToast).not.toHaveBeenCalled();
    expect(result.current.selectedRoles).toEqual(roles);
    expect(result.current.modalState).toEqual({ type: 'removeRoles', roles });
  });

  it('is a no-op when no remove modal is open', async () => {
    const { result } = renderDetail();
    await act(async () => result.current.handleRemoveRolesConfirm());
    expect(removeMutation.mutateAsync).not.toHaveBeenCalled();
  });
});

describe('role search', () => {
  it('passes permission flags to the service', () => {
    renderDetail({}, ['create:my_org:group_roles']);
    expect(serviceModule.useConnectionGroupDetailService).toHaveBeenCalledWith(GROUP_ID, {
      canViewRoles: false,
      canAssignRoles: true,
    });
  });

  it('exposes onRoleSearch and isSearchingRoles', () => {
    const { result } = renderDetail();
    act(() => result.current.onRoleSearch('adm'));
    expect(setRoleSearchTerm).toHaveBeenCalledWith('adm');
    expect(result.current.isSearchingRoles).toBe(true);
  });

  it('enables the role search only once the assign modal opens', () => {
    const { result } = renderDetail();
    expect(enableRoleSearch).not.toHaveBeenCalled();
    act(() => result.current.openModal({ type: 'assignRoles' }));
    expect(enableRoleSearch).toHaveBeenCalled();
  });
});

describe('in-flight guard', () => {
  it('ignores assign submit while the mutation is pending', async () => {
    assignMutation.isPending = true;
    const { result } = renderDetail();
    await act(async () => result.current.handleAssignRolesSubmit(['r9']));
    expect(assignMutation.mutateAsync).not.toHaveBeenCalled();
  });

  it('ignores remove confirm while the mutation is pending', async () => {
    removeMutation.isPending = true;
    const { result } = renderDetail();
    act(() => result.current.openModal({ type: 'removeRoles', roles }));
    await act(async () => result.current.handleRemoveRolesConfirm());
    expect(removeMutation.mutateAsync).not.toHaveBeenCalled();
  });
});

describe('fetch errors', () => {
  const failure = new Error('fetch failed');

  it('toasts a roles fetch error once', () => {
    queryState.rolesQuery = { data: undefined, isLoading: false, isError: true, error: failure };
    mockService();
    const { rerender } = renderDetail();
    rerender();

    expect(handleError).toHaveBeenCalledTimes(1);
    expect(handleError).toHaveBeenCalledWith(failure, {
      fallbackMessage: 'notifications.fetch_roles_error',
    });
  });

  it('toasts again for a new error after recovery', () => {
    queryState.rolesQuery = { data: undefined, isLoading: false, isError: true, error: failure };
    mockService();
    const { rerender } = renderDetail();
    expect(handleError).toHaveBeenCalledTimes(1);

    queryState.rolesQuery = { data: roles, isLoading: false, isError: false };
    mockService();
    rerender();
    expect(handleError).toHaveBeenCalledTimes(1);

    queryState.rolesQuery = { data: undefined, isLoading: false, isError: true, error: failure };
    mockService();
    rerender();
    expect(handleError).toHaveBeenCalledTimes(2);
  });
});
