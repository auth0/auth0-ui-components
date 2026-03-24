import type { OrganizationDetailsFormValues } from '@auth0/universal-components-core';
import { screen, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { BrandingDetails } from '@/components/auth0/my-organization/shared/organization-management/organization-details/branding-details';
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
      it('should set a form error on branding.logo_url', async () => {
        const { result } = renderHook(() =>
          useForm<OrganizationDetailsFormValues>({
            defaultValues: {
              name: '',
              display_name: '',
              branding: {
                logo_url: '',
                colors: { primary: '#000000', page_background: '#FFFFFF' },
              },
            },
          }),
        );

        const props = createMockBrandingDetails({ form: result.current });
        const { container } = renderWithFormProvider(
          <BrandingDetails {...props} />,
          result.current,
        );

        const logoInput = container.querySelector(
          'input[name="branding.logo_url"]',
        ) as HTMLInputElement;
        const user = userEvent.setup();

        await user.type(logoInput, 'https://invalid.example.com/broken.png');

        await waitFor(() => {
          const img = container.querySelector('img');
          if (img) {
            img.dispatchEvent(new Event('error'));
          }
        });

        await waitFor(() => {
          expect(result.current.formState.errors.branding?.logo_url).toBeDefined();
        });
      });
    });

    describe('when the logo url is cleared', () => {
      it('should clear the form error', async () => {
        const { result } = renderHook(() =>
          useForm<OrganizationDetailsFormValues>({
            defaultValues: {
              name: '',
              display_name: '',
              branding: {
                logo_url: 'https://broken.example.com/img.png',
                colors: { primary: '#000000', page_background: '#FFFFFF' },
              },
            },
          }),
        );

        const props = createMockBrandingDetails({ form: result.current });
        const { container } = renderWithFormProvider(
          <BrandingDetails {...props} />,
          result.current,
        );

        act(() => {
          result.current.setError('branding.logo_url', {
            type: 'manual',
            message: 'Invalid logo',
          });
        });

        await waitFor(() => {
          expect(result.current.formState.errors.branding?.logo_url).toBeDefined();
        });

        const logoInput = container.querySelector(
          'input[name="branding.logo_url"]',
        ) as HTMLInputElement;
        const user = userEvent.setup();

        await user.clear(logoInput);

        await waitFor(() => {
          expect(result.current.formState.errors.branding?.logo_url).toBeUndefined();
        });
      });
    });

    describe('when an image loads successfully', () => {
      it('should clear the form error', async () => {
        const { result } = renderHook(() =>
          useForm<OrganizationDetailsFormValues>({
            defaultValues: {
              name: '',
              display_name: '',
              branding: {
                logo_url: '',
                colors: { primary: '#000000', page_background: '#FFFFFF' },
              },
            },
          }),
        );

        const props = createMockBrandingDetails({ form: result.current });
        const { container } = renderWithFormProvider(
          <BrandingDetails {...props} />,
          result.current,
        );

        act(() => {
          result.current.setError('branding.logo_url', {
            type: 'manual',
            message: 'Invalid logo',
          });
        });

        const logoInput = container.querySelector(
          'input[name="branding.logo_url"]',
        ) as HTMLInputElement;
        const user = userEvent.setup();

        await user.type(logoInput, 'https://example.com/logo.png');

        await waitFor(() => {
          const img = container.querySelector('img');
          if (img) {
            img.dispatchEvent(new Event('load'));
          }
        });

        await waitFor(() => {
          expect(result.current.formState.errors.branding?.logo_url).toBeUndefined();
        });
      });
    });
  });
});
