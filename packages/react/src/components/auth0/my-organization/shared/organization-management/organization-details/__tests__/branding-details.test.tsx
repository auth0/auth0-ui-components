import type { OrganizationDetailsFormValues } from '@auth0/universal-components-core';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { BrandingDetails } from '@/components/auth0/my-organization/shared/organization-management/organization-details/branding-details';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import { renderWithFormProvider } from '@/tests/utils/test-provider';
import { mockCore } from '@/tests/utils/test-setup';
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
      it('should override section title', () => {
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

  describe('logo_url validation', () => {
    describe('when an image fails to load', () => {
      it('should show an error message', async () => {
        const props = createMockBrandingDetails();
        const { container } = renderWithFormProvider(<BrandingDetails {...props} />, props.form);

        const logoInput = container.querySelector(
          'input[name="branding.logo_url"]',
        ) as HTMLInputElement;
        const user = userEvent.setup();

        await user.type(logoInput, 'https://invalid.example.com/broken.png');

        const img = await waitFor(() => {
          const imgEl = container.querySelector('img');
          expect(imgEl).toBeInTheDocument();
          return imgEl!;
        });

        fireEvent.error(img);

        await waitFor(() => {
          expect(screen.getByRole('alert')).toHaveTextContent(
            'sections.branding.fields.logo.error',
          );
        });
      });
    });

    describe('when the logo url is cleared', () => {
      it('should clear the error message', async () => {
        const props = createMockBrandingDetails();
        const { container } = renderWithFormProvider(<BrandingDetails {...props} />, props.form);

        const logoInput = container.querySelector(
          'input[name="branding.logo_url"]',
        ) as HTMLInputElement;
        const user = userEvent.setup();

        await user.type(logoInput, 'https://invalid.example.com/broken.png');

        const img = await waitFor(() => {
          const imgEl = container.querySelector('img');
          expect(imgEl).toBeInTheDocument();
          return imgEl!;
        });

        fireEvent.error(img);

        await waitFor(() => {
          expect(screen.getByRole('alert')).toHaveTextContent(
            'sections.branding.fields.logo.error',
          );
        });

        await user.clear(logoInput);

        await waitFor(() => {
          expect(screen.queryByText('sections.branding.fields.logo.error')).not.toBeInTheDocument();
        });
      });
    });

    describe('when an image loads successfully', () => {
      it('should clear the error message', async () => {
        const props = createMockBrandingDetails();
        const { container } = renderWithFormProvider(<BrandingDetails {...props} />, props.form);

        const logoInput = container.querySelector(
          'input[name="branding.logo_url"]',
        ) as HTMLInputElement;
        const user = userEvent.setup();

        await user.type(logoInput, 'https://example.com/logo.png');

        let img = await waitFor(() => {
          const imgEl = container.querySelector('img');
          expect(imgEl).toBeInTheDocument();
          return imgEl!;
        });

        fireEvent.error(img);

        await waitFor(() => {
          expect(screen.getByRole('alert')).toHaveTextContent(
            'sections.branding.fields.logo.error',
          );
        });

        await user.clear(logoInput);
        await user.type(logoInput, 'https://example.com/logo.png');

        img = await waitFor(() => {
          const imgEl = container.querySelector('img');
          expect(imgEl).toBeInTheDocument();
          return imgEl!;
        });

        fireEvent.load(img);

        await waitFor(() => {
          expect(screen.queryByText('sections.branding.fields.logo.error')).not.toBeInTheDocument();
        });
      });
    });
  });
});
