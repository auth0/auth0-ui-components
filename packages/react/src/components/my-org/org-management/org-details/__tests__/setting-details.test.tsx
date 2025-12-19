import type { OrganizationDetailsFormValues } from '@auth0/universal-components-core';
import { screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import * as useCoreClientModule from '../../../../../hooks/use-core-client';
import { mockCore, renderWithFormProvider } from '../../../../../internals';
import type { SettingsDetailsProps } from '../../../../../types/my-org/org-management/org-details-types';
import { SettingsDetails } from '../settings-details';

// ===== Mock packages =====
const { initMockCoreClient } = mockCore();

// ===== Local mock creators =====
const createMockSettingDetails = (
  overrides?: Partial<SettingsDetailsProps>,
): SettingsDetailsProps => {
  const { result } = renderHook(() => useForm<OrganizationDetailsFormValues>());

  return {
    form: result.current,
    ...overrides,
  };
};

// ===== Tests =====
describe('SettingsDetails', () => {
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Initialize fresh mock client for each test
    mockCoreClient = initMockCoreClient();

    // Mock hooks
    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('customMessages', () => {
    describe('when using a custom message on section title', () => {
      it('shouls override section title', () => {
        const customMessages = {
          sections: {
            settings: {
              title: 'New section',
            },
          },
        };

        const props = createMockSettingDetails({ customMessages });

        renderWithFormProvider(<SettingsDetails {...props} />, props.form);

        expect(screen.getByText('New section')).toBeInTheDocument();
      });
    });
  });

  describe('readOnly', () => {
    describe('when is true', () => {
      it('should disable form inputs', () => {
        const props = createMockSettingDetails({ readOnly: true });

        renderWithFormProvider(<SettingsDetails {...props} />, props.form);

        const displayNameInput = screen.getByLabelText(/display_name\.label/i);
        const nameInput = screen.getByLabelText(/fields\.name\.label/i);

        expect(displayNameInput).toHaveAttribute('readonly');
        expect(nameInput).toHaveAttribute('readonly');
      });
    });

    describe('when is false', () => {
      it('should enable form inputs', () => {
        const props = createMockSettingDetails({ readOnly: true });

        renderWithFormProvider(<SettingsDetails {...props} />, props.form);

        const displayNameInput = screen.getByLabelText(/display_name\.label/i);
        const nameInput = screen.getByLabelText(/fields\.name\.label/i);

        expect(displayNameInput).not.toBeDisabled();
        expect(nameInput).not.toBeDisabled();
      });
    });
  });

  describe('fields', () => {
    describe('when the component is rendered', () => {
      it('should appear all the fields on screen', () => {
        const props = createMockSettingDetails();

        renderWithFormProvider(<SettingsDetails {...props} />, props.form);

        const displayNameInput = screen.getByLabelText(/display_name\.label/i);
        const nameInput = screen.getByLabelText(/fields\.name\.label/i);

        expect(displayNameInput).toBeInTheDocument();
        expect(nameInput).toBeInTheDocument();
      });
    });
  });
});
