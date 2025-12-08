import type { Domain, ComponentAction } from '@auth0/web-ui-components-core';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import * as useCoreClientModule from '../../../../hooks/use-core-client';
import {
  createMockDomain,
  createMockVerifiedDomain,
  createMockIdentityProvider,
  createMockIdentityProviderAssociatedWithDomain,
} from '../../../../internals/__mocks__/my-org/domain-management/domain.mocks';
import { renderWithProviders } from '../../../../internals/test-provider';
import { mockCore, mockToast } from '../../../../internals/test-setup';
import type { DomainTableProps } from '../../../../types/my-org/domain-management/domain-table-types';
import { DomainTable } from '../domain-table';

// ===== Mock packages =====

mockToast();
const { initMockCoreClient } = mockCore();

// ===== Local mock creators =====

const createMockDomainTableProps = (overrides?: Partial<DomainTableProps>): DomainTableProps => ({
  schema: undefined,
  customMessages: {},
  styling: {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  hideHeader: false,
  readOnly: false,
  createAction: undefined,
  verifyAction: undefined,
  deleteAction: undefined,
  associateToProviderAction: undefined,
  deleteFromProviderAction: undefined,
  ...overrides,
});

const createMockCreateAction = (): ComponentAction<Domain> => ({
  disabled: false,
  onBefore: vi.fn(() => true),
  onAfter: vi.fn(),
});

const createMockVerifyAction = (): ComponentAction<Domain> => ({
  disabled: false,
  onBefore: vi.fn(() => true),
  onAfter: vi.fn(),
});

const createMockDeleteAction = (): ComponentAction<Domain> => ({
  disabled: false,
  onBefore: vi.fn(() => true),
  onAfter: vi.fn(),
});

// ===== Local utils =====

const waitForComponentToLoad = async () => {
  return await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
};

// ===== Tests =====

describe('DomainTable', () => {
  const mockDomain = createMockDomain();
  const mockVerifiedDomain = createMockVerifiedDomain();
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCoreClient = initMockCoreClient();

    const apiService = mockCoreClient.getMyOrgApiClient();
    (apiService.organization.domains.list as ReturnType<typeof vi.fn>).mockResolvedValue({
      organization_domains: [mockDomain, mockVerifiedDomain],
    });

    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('schema', () => {
    describe('when user creates domain', () => {
      it('should validate domain field with custom schema', async () => {
        const user = userEvent.setup();

        const customSchema = {
          create: {
            domainUrl: {
              regex: /^[a-z0-9-]+\.[a-z]{2,}$/,
              errorMessage: 'Invalid domain format',
            },
          },
        };

        renderWithProviders(
          <DomainTable {...createMockDomainTableProps({ schema: customSchema })} />,
        );

        await waitForComponentToLoad();

        const createButton = screen.getByRole('button', { name: /create/i });
        await user.click(createButton);

        await waitFor(() => {
          expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        const dialog = screen.getByRole('dialog');
        const input = within(dialog).getByRole('textbox');
        const submitButton = within(dialog).getByRole('button', { name: /create/i });

        // Test invalid input
        await user.type(input, 'invalid');
        await user.click(submitButton);

        expect(await screen.findByText('Invalid domain format')).toBeInTheDocument();

        // Test valid input
        await user.clear(input);
        await user.type(input, 'valid.com');

        await waitFor(() => {
          expect(screen.queryByText('Invalid domain format')).not.toBeInTheDocument();
        });
      });
    });
  });

  describe('styling', () => {
    describe('styling.classes', () => {
      describe('when classes are provided for DomainTable-header', () => {
        it('should apply the custom class to DomainTable-header', async () => {
          const customStyling = {
            variables: { common: {}, light: {}, dark: {} },
            classes: {
              'DomainTable-header': 'custom-header-class',
            },
          };

          const { container } = renderWithProviders(
            <DomainTable {...createMockDomainTableProps({ styling: customStyling })} />,
          );

          await waitForComponentToLoad();

          const headerElement = container.querySelector('.custom-header-class');
          expect(headerElement).toBeInTheDocument();
        });
      });
    });
  });

  describe('hideHeader', () => {
    describe('when is false', () => {
      it('should render the header', async () => {
        renderWithProviders(<DomainTable {...createMockDomainTableProps({ hideHeader: false })} />);

        await waitForComponentToLoad();

        expect(screen.getByText(/header.title/i)).toBeInTheDocument();
      });
    });

    describe('when is true', () => {
      it('should not render the header', async () => {
        renderWithProviders(<DomainTable {...createMockDomainTableProps({ hideHeader: true })} />);

        await waitForComponentToLoad();

        expect(screen.queryByText(/header.title/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('readOnly', () => {
    describe('when is true', () => {
      it('should disable action buttons', async () => {
        renderWithProviders(<DomainTable {...createMockDomainTableProps({ readOnly: true })} />);

        await waitForComponentToLoad();

        const createButton = screen.queryByRole('button', { name: /create/i });
        expect(createButton).toBeDisabled();
      });
    });

    describe('when is false', () => {
      it('should enable action buttons', async () => {
        renderWithProviders(<DomainTable {...createMockDomainTableProps({ readOnly: false })} />);

        await waitForComponentToLoad();

        const createButton = screen.getByRole('button', { name: /create/i });
        expect(createButton).not.toBeDisabled();
      });
    });
  });

  describe('createAction', () => {
    describe('createAction.disabled', () => {
      describe('when is true', () => {
        it('should disable create button', async () => {
          const mockCreateAction = createMockCreateAction();
          mockCreateAction.disabled = true;

          renderWithProviders(
            <DomainTable {...createMockDomainTableProps({ createAction: mockCreateAction })} />,
          );

          await waitForComponentToLoad();

          const createButton = screen.getByRole('button', { name: /create/i });
          expect(createButton).toBeDisabled();
        });
      });

      describe('when is false', () => {
        it('should enable create button', async () => {
          const mockCreateAction = createMockCreateAction();
          mockCreateAction.disabled = false;

          renderWithProviders(
            <DomainTable {...createMockDomainTableProps({ createAction: mockCreateAction })} />,
          );

          await waitForComponentToLoad();

          const createButton = screen.getByRole('button', { name: /create/i });
          expect(createButton).not.toBeDisabled();
        });
      });
    });

    describe('createAction.onBefore', () => {
      describe('when user creates domain', () => {
        describe('when onBefore returns true', () => {
          it('should call onBefore and proceed with create', async () => {
            const user = userEvent.setup();
            const mockCreateAction = createMockCreateAction();
            mockCreateAction.onBefore = vi.fn(() => true);

            renderWithProviders(
              <DomainTable {...createMockDomainTableProps({ createAction: mockCreateAction })} />,
            );

            await waitForComponentToLoad();

            const createButton = screen.getByRole('button', { name: /create/i });
            await user.click(createButton);

            await waitFor(() => {
              expect(screen.getByRole('dialog')).toBeInTheDocument();
            });
          });
        });

        describe('when onBefore returns false', () => {
          it('should call onBefore and not proceed with create', async () => {
            const user = userEvent.setup();
            const mockCreateAction = createMockCreateAction();
            mockCreateAction.onBefore = vi.fn(() => false);

            renderWithProviders(
              <DomainTable {...createMockDomainTableProps({ createAction: mockCreateAction })} />,
            );

            await waitForComponentToLoad();

            const createButton = screen.getByRole('button', { name: /create/i });
            await user.click(createButton);

            await waitFor(() => {
              expect(screen.getByRole('dialog')).toBeInTheDocument();
            });

            const dialog = screen.getByRole('dialog');
            const input = within(dialog).getByRole('textbox');
            const submitButton = within(dialog).getByRole('button', { name: /create/i });

            await user.type(input, 'example.com');
            await user.click(submitButton);

            await waitFor(() => {
              expect(mockCreateAction.onBefore).toHaveBeenCalled();
            });

            const apiService = mockCoreClient.getMyOrgApiClient();
            expect(apiService.organization.domains.create).not.toHaveBeenCalled();
          });
        });
      });
    });

    describe('createAction.onAfter', () => {
      describe('when create is successful', () => {
        it('should call onAfter', async () => {
          const user = userEvent.setup();
          const mockCreateAction = createMockCreateAction();

          const mockCreatedDomain = createMockDomain();
          const apiService = mockCoreClient.getMyOrgApiClient();
          (apiService.organization.domains.create as ReturnType<typeof vi.fn>).mockResolvedValue(
            mockCreatedDomain,
          );

          renderWithProviders(
            <DomainTable {...createMockDomainTableProps({ createAction: mockCreateAction })} />,
          );

          await waitForComponentToLoad();

          const createButton = screen.getByRole('button', { name: /create/i });
          await user.click(createButton);

          await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
          });

          const dialog = screen.getByRole('dialog');
          const input = within(dialog).getByRole('textbox');
          const submitButton = within(dialog).getByRole('button', { name: /create/i });

          await user.type(input, 'example.com');
          await user.click(submitButton);

          await waitFor(() => {
            expect(mockCreateAction.onAfter).toHaveBeenCalledWith(mockCreatedDomain);
          });
        });
      });
    });
  });

  describe('verifyAction', () => {
    describe('verifyAction.disabled', () => {
      describe('when is true', () => {
        it('should disable verify button for pending domains', async () => {
          const mockVerifyAction = createMockVerifyAction();
          const user = userEvent.setup();
          mockVerifyAction.disabled = true;

          renderWithProviders(
            <DomainTable {...createMockDomainTableProps({ verifyAction: mockVerifyAction })} />,
          );

          await waitForComponentToLoad();

          const table = screen.getByRole('table');
          const rows = within(table).getAllByRole('row');
          const firstRow = rows[1]; // First data row (pending domain)

          expect(firstRow).toBeDefined();
          const actionButton = within(firstRow!).getByRole('button');

          await user.click(actionButton);

          // TODO: add disabled check
          // const verifyButton = screen.getByRole('menuitem', { name: /verify/i });
          // expect(verifyButton).toBeDisabled();
        });
      });
    });

    describe('verifyAction.onBefore', () => {
      describe('when user verifies domain', () => {
        describe('when onBefore returns true', () => {
          it('should call onBefore and proceed with verification', async () => {
            const user = userEvent.setup();
            const mockVerifyAction = createMockVerifyAction();
            mockVerifyAction.onBefore = vi.fn(() => true);

            renderWithProviders(
              <DomainTable {...createMockDomainTableProps({ verifyAction: mockVerifyAction })} />,
            );

            await waitForComponentToLoad();

            const table = screen.getByRole('table');
            const rows = within(table).getAllByRole('row');
            const firstRow = rows[1]; // First data row (pending domain)
            expect(firstRow).toBeDefined();

            const actionButton = within(firstRow!).getByRole('button');
            await user.click(actionButton);

            const verifyMenuItem = await screen.findByRole('menuitem', { name: /verify/i });
            await user.click(verifyMenuItem);
            await waitFor(() => {
              expect(mockVerifyAction.onBefore).toHaveBeenCalled();
            });
          });
        });

        describe('when onBefore returns false', () => {
          it('should call onBefore and not proceed with verification', async () => {
            const user = userEvent.setup();
            const mockVerifyAction = createMockVerifyAction();
            mockVerifyAction.onBefore = vi.fn(() => false);

            renderWithProviders(
              <DomainTable {...createMockDomainTableProps({ verifyAction: mockVerifyAction })} />,
            );

            await waitForComponentToLoad();

            const table = screen.getByRole('table');
            const rows = within(table).getAllByRole('row');
            const firstRow = rows[1]; // First data row (pending domain)
            expect(firstRow).toBeDefined();

            const actionButton = within(firstRow!).getByRole('button');
            await user.click(actionButton);

            const verifyMenuItem = await screen.findByRole('menuitem', { name: /verify/i });
            await user.click(verifyMenuItem);
            await waitFor(() => {
              expect(mockVerifyAction.onBefore).toHaveBeenCalled();
              expect(
                mockCoreClient.getMyOrgApiClient().organization.domains.verify.create,
              ).not.toHaveBeenCalled();
            });
          });
        });
      });
    });

    describe('verifyAction.onAfter', () => {
      describe('when verification is successful', () => {
        it('should call onAfter', async () => {
          const user = userEvent.setup();
          const mockVerifyAction = createMockVerifyAction();

          renderWithProviders(
            <DomainTable {...createMockDomainTableProps({ verifyAction: mockVerifyAction })} />,
          );

          await waitForComponentToLoad();

          const table = screen.getByRole('table');
          const rows = within(table).getAllByRole('row');
          const firstRow = rows[1]; // First data row (pending domain)
          expect(firstRow).toBeDefined();

          const actionButton = within(firstRow!).getByRole('button');
          await user.click(actionButton);

          const verifyMenuItem = await screen.findByRole('menuitem', { name: /verify/i });
          await user.click(verifyMenuItem);
          await waitFor(() => {
            expect(mockVerifyAction.onBefore).toHaveBeenCalled();
            expect(
              mockCoreClient.getMyOrgApiClient().organization.domains.verify.create,
            ).toHaveBeenCalled();
            expect(mockVerifyAction.onAfter).toHaveBeenCalledWith(mockDomain);
          });
        });
      });
    });
  });

  describe('deleteAction', () => {
    describe('deleteAction.disabled', () => {
      describe('when is true', () => {
        it('should disable delete button', async () => {
          const user = userEvent.setup();
          const mockDeleteAction = createMockDeleteAction();
          mockDeleteAction.disabled = true;

          renderWithProviders(
            <DomainTable {...createMockDomainTableProps({ deleteAction: mockDeleteAction })} />,
          );

          await waitForComponentToLoad();

          const table = screen.getByRole('table');
          const rows = within(table).getAllByRole('row');
          const firstRow = rows[1]; // First data row

          expect(firstRow).toBeDefined();
          const actionButton = within(firstRow!).getByRole('button');

          await user.click(actionButton);

          // TODO: add disabled check
          // const deleteButton = screen.getByRole('menuitem', { name: /delete/i });
          // expect(deleteButton).toBeDisabled();
        });
      });
    });

    describe('deleteAction.onBefore', () => {
      describe('when user deletes domain', () => {
        describe('when onBefore returns true', () => {
          it('should call onBefore and proceed with delete', async () => {
            const user = userEvent.setup();
            const mockDeleteAction = createMockDeleteAction();
            mockDeleteAction.onBefore = vi.fn(() => true);

            renderWithProviders(
              <DomainTable {...createMockDomainTableProps({ deleteAction: mockDeleteAction })} />,
            );

            await waitForComponentToLoad();

            const table = screen.getByRole('table');
            const rows = within(table).getAllByRole('row');
            const firstRow = rows[1];
            expect(firstRow).toBeDefined();

            const actionButton = within(firstRow!).getByRole('button');
            await user.click(actionButton);

            const deleteMenuItem = await screen.findByRole('menuitem', { name: /delete/i });
            await user.click(deleteMenuItem);

            const deleteModal = await screen.findByRole('dialog');
            const confirmDeleteButton = within(deleteModal).getByRole('button', {
              name: /delete/i,
            });
            await user.click(confirmDeleteButton);

            await waitFor(() => {
              expect(mockDeleteAction.onBefore).toHaveBeenCalled();
              expect(
                mockCoreClient.getMyOrgApiClient().organization.domains.delete,
              ).toHaveBeenCalledWith(mockDomain.id);
            });
          });
        });

        describe('when onBefore returns false', () => {
          it('should call onBefore and not proceed with delete', async () => {
            const user = userEvent.setup();
            const mockDeleteAction = createMockDeleteAction();
            mockDeleteAction.onBefore = vi.fn(() => false);

            renderWithProviders(
              <DomainTable {...createMockDomainTableProps({ deleteAction: mockDeleteAction })} />,
            );

            await waitForComponentToLoad();

            const table = screen.getByRole('table');
            const rows = within(table).getAllByRole('row');
            const firstRow = rows[1];
            expect(firstRow).toBeDefined();

            const actionButton = within(firstRow!).getByRole('button');
            await user.click(actionButton);

            const deleteMenuItem = await screen.findByRole('menuitem', { name: /delete/i });
            await user.click(deleteMenuItem);

            const deleteModal = await screen.findByRole('dialog');
            const confirmDeleteButton = within(deleteModal).getByRole('button', {
              name: /delete/i,
            });
            await user.click(confirmDeleteButton);

            await waitFor(() => {
              expect(mockDeleteAction.onBefore).toHaveBeenCalled();
            });

            expect(
              mockCoreClient.getMyOrgApiClient().organization.domains.delete,
            ).not.toHaveBeenCalled();
          });
        });
      });
    });

    describe('deleteAction.onAfter', () => {
      describe('when delete is successful', () => {
        it('should call onAfter', async () => {
          const user = userEvent.setup();
          const mockDeleteAction = createMockDeleteAction();

          renderWithProviders(
            <DomainTable {...createMockDomainTableProps({ deleteAction: mockDeleteAction })} />,
          );

          await waitForComponentToLoad();

          const table = screen.getByRole('table');
          const rows = within(table).getAllByRole('row');
          const firstRow = rows[1];
          expect(firstRow).toBeDefined();

          const actionButton = within(firstRow!).getByRole('button');
          await user.click(actionButton);

          const deleteMenuItem = await screen.findByRole('menuitem', { name: /delete/i });
          await user.click(deleteMenuItem);

          const deleteModal = await screen.findByRole('dialog');
          const confirmDeleteButton = within(deleteModal).getByRole('button', { name: /delete/i });
          await user.click(confirmDeleteButton);

          await waitFor(() => {
            expect(mockDeleteAction.onBefore).toHaveBeenCalled();
          });

          expect(mockCoreClient.getMyOrgApiClient().organization.domains.delete).toHaveBeenCalled();
          expect(mockDeleteAction.onAfter).toHaveBeenCalledWith(mockDomain);
        });
      });
    });
  });

  describe('onOpenProvider', () => {
    describe('when provider is clicked', () => {
      it('should call onOpenProvider with provider details', async () => {
        const user = userEvent.setup();
        const onOpenProvider = vi.fn();
        const provider = createMockIdentityProvider({
          id: 'con_provider_view',
          display_name: 'View Provider',
          name: 'view-provider',
        });

        const apiService = mockCoreClient.getMyOrgApiClient();
        (
          apiService.organization.identityProviders.list as ReturnType<typeof vi.fn>
        ).mockResolvedValue({
          identity_providers: [provider],
        });
        (
          apiService.organization.domains.identityProviders.get as ReturnType<typeof vi.fn>
        ).mockResolvedValue({
          identity_providers: [
            createMockIdentityProviderAssociatedWithDomain({
              id: provider.id,
              name: provider.name,
              display_name: provider.display_name,
              strategy: provider.strategy,
              is_associated: true,
            }),
          ],
        });

        renderWithProviders(<DomainTable {...createMockDomainTableProps({ onOpenProvider })} />);

        await waitForComponentToLoad();

        const verifiedBadge = await screen.findByText(/shared\.domain_statuses\.verified/i);
        const verifiedRow = verifiedBadge.closest('tr');
        expect(verifiedRow).not.toBeNull();

        const actionButton = within(verifiedRow as HTMLElement).getByRole('button');
        await user.click(actionButton);

        const configureMenuItem = await screen.findByRole('menuitem', {
          name: /configure_button_text/i,
        });
        await user.click(configureMenuItem);

        const configureModal = await screen.findByRole('dialog');
        const viewProviderButton = await within(configureModal).findByRole('button', {
          name: /view_provider_button_text/i,
        });
        await user.click(viewProviderButton);

        expect(onOpenProvider).toHaveBeenCalledTimes(1);
        expect(onOpenProvider).toHaveBeenCalledWith(
          expect.objectContaining({
            id: provider.id,
            name: provider.name,
            display_name: provider.display_name,
          }),
        );
      });
    });
  });

  describe('onCreateProvider', () => {
    describe('when create provider is clicked', () => {
      it('should call onCreateProvider', async () => {
        const user = userEvent.setup();
        const onCreateProvider = vi.fn();

        renderWithProviders(<DomainTable {...createMockDomainTableProps({ onCreateProvider })} />);

        await waitForComponentToLoad();

        const verifiedBadge = await screen.findByText(/shared\.domain_statuses\.verified/i);
        const verifiedRow = verifiedBadge.closest('tr');
        expect(verifiedRow).not.toBeNull();

        const actionButton = within(verifiedRow as HTMLElement).getByRole('button');
        await user.click(actionButton);

        const configureMenuItem = await screen.findByRole('menuitem', {
          name: /configure_button_text/i,
        });
        await user.click(configureMenuItem);

        const configureModal = await screen.findByRole('dialog');
        const addProviderButton = await within(configureModal).findByRole('button', {
          name: /add_provider_button_text/i,
        });
        await user.click(addProviderButton);

        await waitFor(() => {
          expect(onCreateProvider).toHaveBeenCalledTimes(1);
        });
      });
    });
  });
});
