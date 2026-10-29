/**
 * Composition levels of `UserMFAManagement`: narrow (`render`), structural
 * (parts inside `Root`) and headless (`useUserMFAModel`).
 */
import { act, renderHook, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import {
  UserMFAManagement,
  useUserMFAEnrolledFactorContext,
  useUserMFAFactorContext,
} from '@/components/auth0/my-account/user-mfa-management';
import { useUserMFAModel } from '@/hooks/my-account/use-user-mfa';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import {
  createMockAuthenticationMethodsResponse,
  createMockAuthenticator,
  createMockOTPEnrollmentResponse,
} from '@/tests/utils/__mocks__/my-account/user-mfa-management/user-mfa-management.mocks';
import { renderWithProviders, TestProvider } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';

mockToast();
const { initMockCoreClient } = mockCore();

const factorCard = (type: string) =>
  document.querySelector<HTMLElement>(`[aria-label="factors.${type}.title"][aria-disabled]`);

describe('UserMFAManagement composition', () => {
  let api: ReturnType<ReturnType<typeof initMockCoreClient>['getMyAccountApiClient']>;

  beforeEach(() => {
    const mockCoreClient = initMockCoreClient();
    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
    api = mockCoreClient.getMyAccountApiClient();
    api.authenticationMethods.list = vi
      .fn()
      .mockResolvedValue(
        createMockAuthenticationMethodsResponse([
          createMockAuthenticator({ id: 'auth_totp_1', type: 'totp', enrolled: true }),
        ]),
      );
    api.authenticationMethods.create = vi.fn().mockResolvedValue(createMockOTPEnrollmentResponse());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('narrow composition', () => {
    it('replaces every enroll button through DefaultLayout and keeps per-factor behaviour', async () => {
      const user = userEvent.setup();
      const onBefore = vi.fn().mockReturnValue(false);
      renderWithProviders(
        <UserMFAManagement.Root
          enrollAction={{ onBefore }}
          factorConfig={{ email: { enabled: false } }}
        >
          <UserMFAManagement.DefaultLayout
            enrollAction={
              <UserMFAManagement.EnrollAction render={<button className="host-enroll" />} />
            }
          />
        </UserMFAManagement.Root>,
      );

      const totp = await screen.findByRole('button', { name: 'factors.totp.button_text' });
      expect(totp).toHaveClass('host-enroll');
      expect(screen.getByRole('button', { name: 'factors.email.button_text' })).toBeDisabled();

      await user.click(totp);
      expect(onBefore).toHaveBeenCalledWith('totp');
    });

    it('hides replaced enroll buttons when readOnly', async () => {
      renderWithProviders(
        <UserMFAManagement.Root readOnly>
          <UserMFAManagement.DefaultLayout
            enrollAction={<UserMFAManagement.EnrollAction render={<button>Host enroll</button>} />}
          />
        </UserMFAManagement.Root>,
      );
      await waitFor(() => expect(factorCard('totp')).toBeInTheDocument());
      expect(screen.queryByText('Host enroll')).not.toBeInTheDocument();
    });

    it('passes pending state to a function render while enrolling', async () => {
      api.authenticationMethods.create = vi.fn().mockReturnValue(new Promise(() => {}));
      const user = userEvent.setup();
      renderWithProviders(
        <UserMFAManagement.Root>
          <UserMFAManagement.DefaultLayout
            enrollAction={
              <UserMFAManagement.EnrollAction
                render={(props, state) => (
                  <button {...props}>{state.pending ? 'Starting…' : 'Enroll'}</button>
                )}
              />
            }
          />
        </UserMFAManagement.Root>,
      );

      await user.click(await screen.findByRole('button', { name: 'factors.totp.button_text' }));
      const totp = screen.getAllByRole('button', {
        name: 'factors.totp.button_text',
        hidden: true,
      })[0]!;
      await waitFor(() => expect(totp).toHaveTextContent('Starting…'));
      expect(
        screen.getAllByRole('button', { name: 'factors.email.button_text', hidden: true })[0],
      ).toHaveTextContent('Enroll');
    });
  });

  describe('structural composition', () => {
    it('keeps host content inside Root visible while loading', async () => {
      api.authenticationMethods.list = vi.fn().mockReturnValue(new Promise(() => {}));
      renderWithProviders(
        <UserMFAManagement.Root>
          <aside>Host guidance</aside>
          <UserMFAManagement.Header />
          <UserMFAManagement.Factors />
        </UserMFAManagement.Root>,
      );
      expect(await screen.findByText('Host guidance')).toBeInTheDocument();
      expect(screen.getByText('header.title')).toBeInTheDocument();
      expect(factorCard('totp')).not.toBeInTheDocument();
    });

    it('omits and reorders factor parts and renders only selected factors', async () => {
      renderWithProviders(
        <UserMFAManagement.Root>
          <UserMFAManagement.Factors>
            {(factorType) =>
              factorType === 'totp' || factorType === 'email' ? (
                <UserMFAManagement.Factor>
                  <UserMFAManagement.FactorHeader>
                    <UserMFAManagement.FactorActions>
                      <UserMFAManagement.EnrollAction />
                    </UserMFAManagement.FactorActions>
                    <UserMFAManagement.FactorTitle />
                  </UserMFAManagement.FactorHeader>
                </UserMFAManagement.Factor>
              ) : null
            }
          </UserMFAManagement.Factors>
        </UserMFAManagement.Root>,
      );

      await waitFor(() => expect(factorCard('totp')).toBeInTheDocument());
      expect(factorCard('email')).toBeInTheDocument();
      expect(factorCard('phone')).not.toBeInTheDocument();
      expect(screen.queryByText('factors.email.description')).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'actions.menu_aria_label' }),
      ).not.toBeInTheDocument();
    });

    it('opens the enroll dialog from Root when the default factors are replaced', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <UserMFAManagement.Root>
          <UserMFAManagement.Factors>
            {() => <UserMFAManagement.EnrollAction />}
          </UserMFAManagement.Factors>
        </UserMFAManagement.Root>,
      );
      await user.click(await screen.findByRole('button', { name: 'factors.totp.button_text' }));
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
      await waitFor(() => expect(api.authenticationMethods.create).toHaveBeenCalled());
    });

    it('removes an enrolled factor through DeleteAction with confirmation', async () => {
      const user = userEvent.setup();
      function EnrolledName() {
        const { factor } = useUserMFAEnrolledFactorContext();
        return <span>{factor.id}</span>;
      }
      renderWithProviders(
        <UserMFAManagement.Root>
          <UserMFAManagement.Factors>
            {() => (
              <UserMFAManagement.Factor>
                <UserMFAManagement.FactorList>
                  {() => (
                    <div>
                      <EnrolledName />
                      <UserMFAManagement.DeleteAction render={<button>Remove</button>} />
                    </div>
                  )}
                </UserMFAManagement.FactorList>
              </UserMFAManagement.Factor>
            )}
          </UserMFAManagement.Factors>
        </UserMFAManagement.Root>,
      );

      expect(await screen.findByText('auth_totp_1')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Remove' }));
      const dialog = await screen.findByRole('dialog');
      expect(api.authenticationMethods.delete).not.toHaveBeenCalled();
      await user.click(
        within(dialog).getByRole('button', { name: 'actions.confirm_button_label' }),
      );
      await waitFor(() =>
        expect(api.authenticationMethods.delete).toHaveBeenCalledWith('auth_totp_1'),
      );
    });

    it('hides DeleteAction when readOnly and disables it when disableDelete', async () => {
      const layout = (
        <UserMFAManagement.Factors>
          {() => (
            <UserMFAManagement.Factor>
              <UserMFAManagement.FactorList>
                {() => <UserMFAManagement.DeleteAction />}
              </UserMFAManagement.FactorList>
            </UserMFAManagement.Factor>
          )}
        </UserMFAManagement.Factors>
      );
      const { unmount } = renderWithProviders(
        <UserMFAManagement.Root readOnly>{layout}</UserMFAManagement.Root>,
      );
      await waitFor(() => expect(factorCard('totp')).toBeInTheDocument());
      expect(
        screen.queryByRole('button', { name: 'actions.remove_button_label' }),
      ).not.toBeInTheDocument();
      unmount();

      renderWithProviders(<UserMFAManagement.Root disableDelete>{layout}</UserMFAManagement.Root>);
      expect(
        await screen.findByRole('button', { name: 'actions.remove_button_label' }),
      ).toBeDisabled();
    });

    it('renders every EnrollAction that is mounted for a factor', async () => {
      renderWithProviders(
        <UserMFAManagement.Root>
          <UserMFAManagement.Factors>
            {(factorType) =>
              factorType === 'totp' ? (
                <>
                  <UserMFAManagement.EnrollAction />
                  <UserMFAManagement.EnrollAction />
                </>
              ) : null
            }
          </UserMFAManagement.Factors>
        </UserMFAManagement.Root>,
      );
      expect(
        await screen.findAllByRole('button', { name: 'factors.totp.button_text' }),
      ).toHaveLength(2);
    });

    it('lets host components read the current factor', async () => {
      function FactorSummary() {
        const { factorType, activeFactors } = useUserMFAFactorContext();
        return <p>{`${factorType}:${activeFactors.length}`}</p>;
      }
      renderWithProviders(
        <UserMFAManagement.Root>
          <UserMFAManagement.Factors>{() => <FactorSummary />}</UserMFAManagement.Factors>
        </UserMFAManagement.Root>,
      );
      expect(await screen.findByText('totp:1')).toBeInTheDocument();
      expect(screen.getByText('email:0')).toBeInTheDocument();
    });

    it('throws a readable error for a factor part outside Factor', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() =>
        renderWithProviders(
          <UserMFAManagement.Root>
            <UserMFAManagement.EnrollAction />
          </UserMFAManagement.Root>,
        ),
      ).toThrow(
        '<UserMFAManagement.EnrollAction> must be rendered inside <UserMFAManagement.Factor>.',
      );
    });
  });

  describe('headless model', () => {
    function wrapper({ children }: { children: React.ReactNode }) {
      return <TestProvider>{children}</TestProvider>;
    }

    it('exposes readOnly and gated actions per factor', async () => {
      const { result } = renderHook(
        () =>
          useUserMFAModel({
            readOnly: false,
            disableEnroll: true,
            factorConfig: { email: { enabled: false } },
          }),
        { wrapper },
      );
      await waitFor(() => expect(result.current.isLoadingFactors).toBe(false));

      expect(result.current.readOnly).toBe(false);
      expect(result.current.getFactorProps('totp')).toMatchObject({
        hasActiveFactors: true,
        isEnabled: true,
        enrollAction: { hidden: false, disabled: true },
      });
      expect(result.current.getFactorProps('email').isEnabled).toBe(false);
    });

    it('hides every action when readOnly', async () => {
      const { result } = renderHook(() => useUserMFAModel({ readOnly: true }), { wrapper });
      await waitFor(() => expect(result.current.isLoadingFactors).toBe(false));
      const totp = result.current.getFactorProps('totp');
      expect(totp.enrollAction.hidden).toBe(true);
      expect(
        result.current.getEnrolledFactorProps(totp.activeFactors[0]!, 'totp').deleteAction.hidden,
      ).toBe(true);

      totp.enrollAction.onClick();
      expect(api.authenticationMethods.create).not.toHaveBeenCalled();
    });

    it('requires confirmation: delete opens the dialog state instead of deleting', async () => {
      const { result } = renderHook(() => useUserMFAModel({}), { wrapper });
      await waitFor(() => expect(result.current.isLoadingFactors).toBe(false));

      const [factor] = result.current.getFactorProps('totp').activeFactors;
      act(() => result.current.getEnrolledFactorProps(factor!, 'totp').deleteAction.onClick());
      await waitFor(() => expect(result.current.isDeleteDialogOpen).toBe(true));
      expect(result.current.factorToDelete).toEqual({ id: 'auth_totp_1', type: 'totp' });
      expect(api.authenticationMethods.delete).not.toHaveBeenCalled();

      await act(() => result.current.handleConfirmDelete());
      expect(api.authenticationMethods.delete).toHaveBeenCalledWith('auth_totp_1');
    });
  });
});
