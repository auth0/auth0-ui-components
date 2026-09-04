import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { DomainTable } from '@/components/auth0/my-organization/domain-table.composable';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import {
  createMockDomain,
  createMockVerifiedDomain,
  createMockDomainTableProps,
} from '@/tests/utils/__mocks__/my-organization/domain-management/domain.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';

mockToast();
const { initMockCoreClient } = mockCore();

const waitForComponentToLoad = async () =>
  waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

describe('DomainTable — composability', () => {
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

  describe('Tier 1 — default (backwards compatible)', () => {
    it('renders the table and create button when called directly', async () => {
      renderWithProviders(<DomainTable {...createMockDomainTableProps()} />);
      await waitForComponentToLoad();

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
    });
  });

  describe('Tier 2 — narrow replacement via render prop', () => {
    it('renders the host element and chains its onClick into the create command', async () => {
      const user = userEvent.setup();
      const hostOnClick = vi.fn();

      renderWithProviders(
        <DomainTable.Root {...createMockDomainTableProps()}>
          <DomainTable.DefaultLayout>
            <DomainTable.CreateAction
              render={
                <button type="button" onClick={hostOnClick}>
                  Add domain
                </button>
              }
            />
          </DomainTable.DefaultLayout>
        </DomainTable.Root>,
      );
      await waitForComponentToLoad();

      const hostButton = screen.getByRole('button', { name: /add domain/i });
      expect(hostButton).toBeInTheDocument();

      await user.click(hostButton);
      expect(hostOnClick).toHaveBeenCalledTimes(1);
      // handleCreateClick opens the create modal.
      await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
    });

    it('skips the create command when the host cancels the event', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <DomainTable.Root {...createMockDomainTableProps()}>
          <DomainTable.DefaultLayout>
            <DomainTable.CreateAction
              render={
                <button type="button" onClick={(e) => e.preventDefault()}>
                  Add domain
                </button>
              }
            />
          </DomainTable.DefaultLayout>
        </DomainTable.Root>,
      );
      await waitForComponentToLoad();

      await user.click(screen.getByRole('button', { name: /add domain/i }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Tier 3 — structural composition', () => {
    it('omits the refresh region and renders host UI interleaved', async () => {
      renderWithProviders(
        <DomainTable.Root {...createMockDomainTableProps()}>
          <DomainTable.Header />
          <div data-testid="host-panel">Host guidance</div>
          <DomainTable.Content />
        </DomainTable.Root>,
      );
      await waitForComponentToLoad();

      expect(screen.getByTestId('host-panel')).toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
      // No Refresh part rendered => no refresh control present.
      expect(screen.queryByRole('button', { name: /refresh/i })).not.toBeInTheDocument();
    });

    it('renders a single table (parts share one model, no duplication)', async () => {
      renderWithProviders(
        <DomainTable.Root {...createMockDomainTableProps()}>
          <DomainTable.Header />
          <DomainTable.Refresh />
          <DomainTable.Content />
        </DomainTable.Root>,
      );
      await waitForComponentToLoad();

      expect(screen.getAllByRole('table')).toHaveLength(1);
      await waitFor(() => expect(screen.getAllByText(mockDomain.domain).length).toBeGreaterThan(0));
    });
  });

  describe('context safety', () => {
    it('throws when a compound part is rendered outside Root', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<DomainTable.Content />)).toThrow(
        /must be rendered inside <DomainTable.Root>/,
      );
      consoleError.mockRestore();
    });
  });
});
