import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { DomainTable } from '@/components/auth0/my-organization/domain-table';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import {
  createMockDomain,
  createMockVerifiedDomain,
  createMockDomainTableProps,
  createMockCreateAction,
  createMockVerifyAction,
  createMockDeleteAction,
} from '@/tests/utils/__mocks__/my-organization/domain-management/domain.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';
import type { DomainTableProps } from '@/types/my-organization/domain-management/domain-table-types';

mockToast();
const { initMockCoreClient } = mockCore();

const waitForComponentToLoad = async () => {
  return await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
};

describe('DomainTable', () => {
  const mockDomain = createMockDomain();
  const mockVerifiedDomain = createMockVerifiedDomain();
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCoreClient = initMockCoreClient();

    const apiService = mockCoreClient.getMyOrganizationApiClient();
    (apiService.organization.domains.list as ReturnType<typeof vi.fn>).mockResolvedValue({
      response: { organization_domains: [mockDomain, mockVerifiedDomain] },
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
      it('should not render the create button', async () => {
        renderWithProviders(<DomainTable {...createMockDomainTableProps({ readOnly: true })} />);

        await waitForComponentToLoad();

        expect(screen.queryByRole('button', { name: /create/i })).not.toBeInTheDocument();
      });

      it('should not render the row menu', async () => {
        renderWithProviders(<DomainTable {...createMockDomainTableProps({ readOnly: true })} />);

        await waitForComponentToLoad();

        const badge = await screen.findByText(/shared\.domain_statuses\.verified/i);
        const row = badge.closest('tr') as HTMLElement;
        expect(within(row).queryByRole('button')).not.toBeInTheDocument();
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

            const apiService = mockCoreClient.getMyOrganizationApiClient();
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
          const apiService = mockCoreClient.getMyOrganizationApiClient();
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
                mockCoreClient.getMyOrganizationApiClient().organization.domains.verify.create,
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
              mockCoreClient.getMyOrganizationApiClient().organization.domains.verify.create,
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
                mockCoreClient.getMyOrganizationApiClient().organization.domains.delete,
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
              mockCoreClient.getMyOrganizationApiClient().organization.domains.delete,
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

          expect(
            mockCoreClient.getMyOrganizationApiClient().organization.domains.delete,
          ).toHaveBeenCalled();
          expect(mockDeleteAction.onAfter).toHaveBeenCalledWith(mockDomain);
        });
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

  describe('table rendering', () => {
    describe('when domains are loaded', () => {
      it('should display domain column', async () => {
        renderWithProviders(<DomainTable {...createMockDomainTableProps()} />);

        await waitForComponentToLoad();

        expect(screen.getByText(/table.columns.domain/i)).toBeInTheDocument();
      });

      it('should display status column', async () => {
        renderWithProviders(<DomainTable {...createMockDomainTableProps()} />);

        await waitForComponentToLoad();

        expect(screen.getByText(/table.columns.status/i)).toBeInTheDocument();
      });

      it('should display domain name in table row', async () => {
        renderWithProviders(<DomainTable {...createMockDomainTableProps()} />);

        await waitForComponentToLoad();

        expect(screen.getAllByText(mockDomain.domain).length).toBeGreaterThan(0);
      });

      it('should display verified domain with verified badge', async () => {
        renderWithProviders(<DomainTable {...createMockDomainTableProps()} />);

        await waitForComponentToLoad();

        expect(screen.getByText(/shared\.domain_statuses\.verified/i)).toBeInTheDocument();
      });

      it('should display pending domain with pending badge', async () => {
        renderWithProviders(<DomainTable {...createMockDomainTableProps()} />);

        await waitForComponentToLoad();

        expect(screen.getByText(/shared\.domain_statuses\.pending/i)).toBeInTheDocument();
      });
    });

    describe('when no domains exist', () => {
      it('should display empty message', async () => {
        const apiService = mockCoreClient.getMyOrganizationApiClient();
        (apiService.organization.domains.list as ReturnType<typeof vi.fn>).mockResolvedValue({
          response: { organization_domains: [] },
        });

        renderWithProviders(<DomainTable {...createMockDomainTableProps()} />);

        await waitForComponentToLoad();

        expect(screen.getByText(/table.empty_message/i)).toBeInTheDocument();
      });
    });
  });

  describe('pagination', () => {
    describe('when domains are paginated', () => {
      it('should render table with domain data', async () => {
        renderWithProviders(<DomainTable {...createMockDomainTableProps()} />);

        await waitForComponentToLoad();

        const table = screen.getByRole('table');
        expect(table).toBeInTheDocument();
        expect(screen.getAllByText(mockDomain.domain).length).toBeGreaterThan(0);
      });
    });
  });

  describe('customMessages', () => {
    describe('when custom header title is provided', () => {
      it('should override header title', async () => {
        const customMessages: DomainTableProps['customMessages'] = {
          domain_table: {
            header: {
              title: 'Custom Domain Title',
            },
          },
        };

        renderWithProviders(<DomainTable {...createMockDomainTableProps({ customMessages })} />);

        await waitForComponentToLoad();

        expect(screen.getByText('Custom Domain Title')).toBeInTheDocument();
      });
    });

    it('should show the last updated label once domains data is loaded', async () => {
      renderWithProviders(<DomainTable {...createMockDomainTableProps()} />);
      await waitForComponentToLoad();
      expect(screen.getByText('last_updated', { exact: false })).toBeInTheDocument();
    });

    it('should disable the refresh button while a refetch is in flight, then re-enable it', async () => {
      const user = userEvent.setup();
      const apiService = mockCoreClient.getMyOrganizationApiClient();
      const listDomains = apiService.organization.domains.list as ReturnType<typeof vi.fn>;

      renderWithProviders(<DomainTable {...createMockDomainTableProps()} />);

      await waitForComponentToLoad();

      const refreshButton = screen.getByRole('button', { name: 'refresh' });
      expect(refreshButton).toBeEnabled();

      let resolveRefetch: (value: unknown) => void = () => {};
      listDomains.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveRefetch = resolve;
          }),
      );

      await user.click(refreshButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'refresh' })).toBeDisabled();
      });

      resolveRefetch({
        response: { organization_domains: [mockDomain, mockVerifiedDomain] },
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'refresh' })).toBeEnabled();
      });
    });
  });

  describe('row click', () => {
    const findVerifiedRow = async () => {
      const badge = await screen.findByText(/shared\.domain_statuses\.verified/i);
      return badge.closest('tr') as HTMLElement;
    };

    it('should expose each row as a focusable, labelled control', async () => {
      renderWithProviders(<DomainTable {...createMockDomainTableProps()} />);

      await waitForComponentToLoad();

      const row = await findVerifiedRow();
      expect(row).toHaveAttribute('tabindex', '0');
      expect(row).toHaveAttribute('aria-label', 'data_table.view_row');
    });

    it('should open the configure modal when a row is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<DomainTable {...createMockDomainTableProps()} />);

      await waitForComponentToLoad();

      await user.click(await findVerifiedRow());

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('should open the configure modal when the focused row is activated with Enter', async () => {
      const user = userEvent.setup();
      renderWithProviders(<DomainTable {...createMockDomainTableProps()} />);

      await waitForComponentToLoad();

      const row = await findVerifiedRow();
      row.focus();
      await user.keyboard('{Enter}');

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('should stay available to viewers, whose row menu is gated away', async () => {
      const user = userEvent.setup();
      renderWithProviders(<DomainTable {...createMockDomainTableProps()} />, {
        permissions: ['read:my_org:domains'],
      });

      await waitForComponentToLoad();

      const row = await findVerifiedRow();
      expect(within(row).queryByRole('button')).not.toBeInTheDocument();

      await user.click(row);

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Granted permissions', () => {
    describe('when create:my_org:domains is granted', () => {
      it('should enable the create button', async () => {
        renderWithProviders(<DomainTable {...createMockDomainTableProps()} />, {
          permissions: ['read:my_org:domains', 'create:my_org:domains'],
        });

        await waitForComponentToLoad();

        expect(screen.getByRole('button', { name: /create/i })).toBeEnabled();
      });
    });

    describe('when create:my_org:domains is not granted', () => {
      it('should keep the create button visible but disabled', async () => {
        renderWithProviders(<DomainTable {...createMockDomainTableProps()} />, {
          permissions: ['read:my_org:domains', 'delete:my_org:domains'],
        });

        await waitForComponentToLoad();

        expect(screen.getByRole('button', { name: /create/i })).toBeDisabled();
      });
    });

    describe('when only read permissions are granted', () => {
      it('should keep the create button visible but disabled', async () => {
        renderWithProviders(<DomainTable {...createMockDomainTableProps()} />, {
          permissions: ['read:my_org:domains'],
        });

        await waitForComponentToLoad();

        expect(screen.getByRole('button', { name: /create/i })).toBeDisabled();
      });
    });
  });
});
