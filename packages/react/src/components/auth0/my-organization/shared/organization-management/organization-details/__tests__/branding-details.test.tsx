import type { OrganizationDetailsFormValues } from '@auth0/universal-components-core';
import { screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { BrandingDetails } from '../branding-details';

import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import { mockCore, renderWithFormProvider } from '@/tests/utils';
import type { BrandingDetailsProps } from '@/types/my-organization/organization-management/organization-details-types';

// ===== Mock packages =====
const { initMockCoreClient } = mockCore();

// ===== Local mock creators =====
const createMockBrandingDetails = (
  overrides?: Partial<BrandingDetailsProps>,
): BrandingDetailsProps => {
  const { result } = renderHook(() => useForm<OrganizationDetailsFormValues>());

  return {
    form: result.current,
    ...overrides,
  };
};

// ===== Tests =====
describe('BrandingDetails', () => {
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
            branding: {
              title: 'New section',
            },
          },
        };

        const props = createMockBrandingDetails({ customMessages });

        renderWithFormProvider(<BrandingDetails {...props} />, props.form);

        expect(screen.getByText('New section')).toBeInTheDocument();
      });
    });
  });

  describe('fields', () => {
    describe('when the component is rendered', () => {
      it('should appear all the fields on screen', () => {
        const props = createMockBrandingDetails();

        const { container } = renderWithFormProvider(<BrandingDetails {...props} />, props.form);

        const logoInput = container.querySelector('input[name="branding.logo_url"]');
        const primaryInput = container.querySelector('input[name="branding.colors.primary"]');
        const backgroundInput = container.querySelector(
          'input[name="branding.colors.page_background"]',
        );

        expect(logoInput).toBeInTheDocument();
        expect(primaryInput).toBeInTheDocument();
        expect(backgroundInput).toBeInTheDocument();
      });
    });
  });
});
