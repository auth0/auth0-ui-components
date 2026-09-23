import type { OrganizationDetailsFormValues } from '@auth0/universal-components-core';
import { screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { ThirdPartyAccessDetails } from '@/components/auth0/my-organization/shared/organization-management/organization-details/third-party-access-details';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import { renderWithFormProvider } from '@/tests/utils/test-provider';
import { mockCore } from '@/tests/utils/test-setup';
import type { ThirdPartyAccessDetailsProps } from '@/types/my-organization/organization-management/organization-details-types';

const { initMockCoreClient } = mockCore();

const createMockThirdPartyAccessDetails = (
  overrides?: Partial<ThirdPartyAccessDetailsProps>,
): ThirdPartyAccessDetailsProps => {
  const { result } = renderHook(() =>
    useForm<OrganizationDetailsFormValues>({
      defaultValues: {
        third_party_client_access: 'block',
      },
    }),
  );

  return {
    form: result.current,
    ...overrides,
  };
};

describe('ThirdPartyAccessDetails', () => {
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

  describe('fields', () => {
    describe('when the component is rendered', () => {
      it('should display the section label', () => {
        const props = createMockThirdPartyAccessDetails();

        renderWithFormProvider(<ThirdPartyAccessDetails {...props} />, props.form);

        expect(screen.getByText(/third_party_client_access\.label/i)).toBeInTheDocument();
      });

      it('should display both radio options', () => {
        const props = createMockThirdPartyAccessDetails();

        renderWithFormProvider(<ThirdPartyAccessDetails {...props} />, props.form);

        expect(screen.getByLabelText(/options\.block\.label/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/options\.allow\.label/i)).toBeInTheDocument();
      });

      it('should display helper text for both options', () => {
        const props = createMockThirdPartyAccessDetails();

        renderWithFormProvider(<ThirdPartyAccessDetails {...props} />, props.form);

        expect(screen.getByText(/options\.block\.helper_text/i)).toBeInTheDocument();
        expect(screen.getByText(/options\.allow\.helper_text/i)).toBeInTheDocument();
      });
    });
  });

  describe('readOnly', () => {
    describe('when readOnly is true', () => {
      it('should disable radio buttons', () => {
        const props = createMockThirdPartyAccessDetails({ readOnly: true });

        renderWithFormProvider(<ThirdPartyAccessDetails {...props} />, props.form);

        const blockRadio = screen.getByLabelText(/options\.block\.label/i);
        const allowRadio = screen.getByLabelText(/options\.allow\.label/i);

        expect(blockRadio).toBeDisabled();
        expect(allowRadio).toBeDisabled();
      });
    });

    describe('when isConfigReadOnly is true', () => {
      it('should disable radio buttons', () => {
        const props = createMockThirdPartyAccessDetails({ isConfigReadOnly: true });

        renderWithFormProvider(<ThirdPartyAccessDetails {...props} />, props.form);

        const blockRadio = screen.getByLabelText(/options\.block\.label/i);
        const allowRadio = screen.getByLabelText(/options\.allow\.label/i);

        expect(blockRadio).toBeDisabled();
        expect(allowRadio).toBeDisabled();
      });
    });

    describe('when both readOnly and isConfigReadOnly are false', () => {
      it('should enable radio buttons', () => {
        const props = createMockThirdPartyAccessDetails({
          readOnly: false,
          isConfigReadOnly: false,
        });

        renderWithFormProvider(<ThirdPartyAccessDetails {...props} />, props.form);

        const blockRadio = screen.getByLabelText(/options\.block\.label/i);
        const allowRadio = screen.getByLabelText(/options\.allow\.label/i);

        expect(blockRadio).not.toBeDisabled();
        expect(allowRadio).not.toBeDisabled();
      });
    });
  });

  describe('selection', () => {
    describe('when default value is block', () => {
      it('should have block option selected', () => {
        const props = createMockThirdPartyAccessDetails();

        renderWithFormProvider(<ThirdPartyAccessDetails {...props} />, props.form);

        const blockRadio = screen.getByLabelText(/options\.block\.label/i);

        expect(blockRadio).toBeChecked();
      });
    });

    describe('when user clicks allow option', () => {
      it('should select allow option', async () => {
        const user = userEvent.setup();
        const props = createMockThirdPartyAccessDetails();

        renderWithFormProvider(<ThirdPartyAccessDetails {...props} />, props.form);

        const allowRadio = screen.getByLabelText(/options\.allow\.label/i);
        await user.click(allowRadio);

        expect(allowRadio).toBeChecked();
      });
    });
  });

  describe('customMessages', () => {
    describe('when custom label is provided', () => {
      it('should override the section label', () => {
        const customMessages = {
          sections: {
            settings: {
              fields: {
                third_party_client_access: {
                  label: 'Custom Access Label',
                },
              },
            },
          },
        };

        const props = createMockThirdPartyAccessDetails({ customMessages });

        renderWithFormProvider(<ThirdPartyAccessDetails {...props} />, props.form);

        expect(screen.getByText('Custom Access Label')).toBeInTheDocument();
      });
    });
  });

  describe('accessibility', () => {
    describe('when the component is rendered', () => {
      it('should have aria-label on RadioGroup', () => {
        const props = createMockThirdPartyAccessDetails();

        renderWithFormProvider(<ThirdPartyAccessDetails {...props} />, props.form);

        const radioGroup = screen.getByRole('radiogroup');

        expect(radioGroup).toHaveAttribute('aria-label');
      });

      it('should have aria-describedby linking radio items to helper text', () => {
        const props = createMockThirdPartyAccessDetails();

        renderWithFormProvider(<ThirdPartyAccessDetails {...props} />, props.form);

        const blockRadio = screen.getByLabelText(/options\.block\.label/i);
        const allowRadio = screen.getByLabelText(/options\.allow\.label/i);

        expect(blockRadio).toHaveAttribute('aria-describedby', 'third-party-block-description');
        expect(allowRadio).toHaveAttribute('aria-describedby', 'third-party-allow-description');
      });
    });
  });

  describe('className', () => {
    describe('when className is provided', () => {
      it('should apply custom className to wrapper div', () => {
        const props = createMockThirdPartyAccessDetails({
          className: 'custom-class',
        });

        const { container } = renderWithFormProvider(
          <ThirdPartyAccessDetails {...props} />,
          props.form,
        );

        expect(container.firstChild).toHaveClass('custom-class');
      });
    });
  });
});
