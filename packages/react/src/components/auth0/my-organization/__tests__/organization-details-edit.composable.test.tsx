import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { OrganizationDetailsEdit } from '@/components/auth0/my-organization/organization-details-edit.composable';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import { createMockOrganization } from '@/tests/utils/__mocks__/my-organization/organization-management/organization-details.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';
import type { OrganizationDetailsEditProps } from '@/types/my-organization/organization-management/organization-details-edit-types';

mockToast();
const { initMockCoreClient } = mockCore();

const createMockOrganizationDetailsEditProps = (
  overrides?: Partial<OrganizationDetailsEditProps>,
): OrganizationDetailsEditProps => ({
  schema: undefined,
  customMessages: {},
  styling: {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  readOnly: false,
  hideHeader: false,
  saveAction: undefined,
  cancelAction: undefined,
  backButton: undefined,
  ...overrides,
});

const waitForComponentToLoad = async () => {
  return await screen.findByDisplayValue('Auth0 Corporation');
};

describe('OrganizationDetailsEdit — composability', () => {
  const mockOrganization = createMockOrganization();
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCoreClient = initMockCoreClient();

    const apiService = mockCoreClient.getMyOrganizationApiClient();
    (apiService.organizationDetails.get as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockOrganization,
    );
    (apiService.organizationDetails.update as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockOrganization,
    );

    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Tier 1 — default (backwards compatible)', () => {
    it('renders the form with submit and cancel actions when called directly', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <OrganizationDetailsEdit {...createMockOrganizationDetailsEditProps()} />,
      );

      const displayNameInput = await waitForComponentToLoad();
      expect(displayNameInput).toHaveValue('Auth0 Corporation');

      expect(screen.getByRole('button', { name: /submit_button_label/i })).toBeInTheDocument();

      // The cancel action surfaces once the form is dirty.
      await user.clear(displayNameInput);
      await user.type(displayNameInput, 'Modified Corporation');
      expect(screen.getByRole('button', { name: /cancel_button_label/i })).toBeInTheDocument();
    });
  });

  describe('Tier 3 — structural composition', () => {
    it('renders host UI interleaved with a single form instance', async () => {
      renderWithProviders(
        <OrganizationDetailsEdit.Root {...createMockOrganizationDetailsEditProps()}>
          <OrganizationDetailsEdit.Header />
          <div data-testid="host-panel">Host guidance</div>
          <OrganizationDetailsEdit.Content />
        </OrganizationDetailsEdit.Root>,
      );

      await waitForComponentToLoad();

      expect(screen.getByTestId('host-panel')).toBeInTheDocument();
      // A duplicated model would render a second form/submit button. Parts read
      // the single model provided by Root via context.
      expect(screen.getAllByRole('button', { name: /submit_button_label/i })).toHaveLength(1);
    });
  });

  describe('context safety', () => {
    it('throws when a compound part is rendered outside Root', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<OrganizationDetailsEdit.Content />)).toThrow(
        /must be rendered inside <OrganizationDetailsEdit.Root>/,
      );
      consoleError.mockRestore();
    });
  });
});
