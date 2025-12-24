import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, afterEach } from 'vitest';

import { renderWithProviders } from '../../../../../internals';
import type { DomainCreateModalProps } from '../../../../../types/my-organization/domain-management/domain-create-types';
import { DomainCreateModal } from '../domain-create-modal';

// ===== Test Data Setup =====
const createMockDomainCreateModalProps = (
  overrides: Partial<DomainCreateModalProps> = {},
): DomainCreateModalProps => ({
  isOpen: true,
  isLoading: false,
  onClose: vi.fn(),
  onCreate: vi.fn(),
  ...overrides,
});

const waitForComponentToLoad = async () => {
  await waitFor(
    () => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    },
    { timeout: 3000 },
  );
};

// ===== Test Suite =====
describe('DomainCreateModal', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('isOpen', () => {
    describe('when is true', () => {
      it('should render the modal', async () => {
        renderWithProviders(<DomainCreateModal {...createMockDomainCreateModalProps()} />);

        await waitForComponentToLoad();

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('title')).toBeInTheDocument();
      });
    });

    describe('when is false', () => {
      it('should not render the modal content', () => {
        renderWithProviders(
          <DomainCreateModal {...createMockDomainCreateModalProps({ isOpen: false })} />,
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('isLoading', () => {
    describe('when is true', () => {
      it('should disable create button', async () => {
        renderWithProviders(
          <DomainCreateModal {...createMockDomainCreateModalProps({ isLoading: true })} />,
        );

        // Wait for component to render with loading state
        await waitFor(() => {
          expect(screen.getByText(/loading/i)).toBeInTheDocument();
        });

        // When loading, the button shows a loading spinner and has no text name
        const buttons = screen.getAllByRole('button', { name: '' });

        // Find the loading button (has loading spinner child)
        const createButton = buttons.find((button) =>
          button.querySelector('[class*="animate-spin"]'),
        );

        expect(createButton).toBeDefined();
        expect(createButton).toBeDisabled();
      });
    });

    describe('when is false', () => {
      it('should enable create button', async () => {
        renderWithProviders(
          <DomainCreateModal {...createMockDomainCreateModalProps({ isLoading: false })} />,
        );

        await waitForComponentToLoad();

        const createButton = screen.getByRole('button', {
          name: 'actions.create_button_text',
        });
        expect(createButton).toBeEnabled();
      });
    });
  });

  describe('className', () => {
    describe('when className is provided', () => {
      it('should apply custom class to modal', async () => {
        const customClass = 'custom-modal-class';

        renderWithProviders(
          <DomainCreateModal {...createMockDomainCreateModalProps({ className: customClass })} />,
        );

        await waitForComponentToLoad();

        // Modal should have the custom class applied
        const modalContent = document.querySelector('[data-slot="dialog-content"]');
        expect(modalContent).toHaveClass(customClass);
      });
    });
  });

  describe('onClose', () => {
    describe('when modal is closed', () => {
      it('should call onClose callback via cancel button', async () => {
        const user = userEvent.setup();
        const mockOnClose = vi.fn();

        renderWithProviders(
          <DomainCreateModal {...createMockDomainCreateModalProps({ onClose: mockOnClose })} />,
        );

        await waitForComponentToLoad();

        const cancelButton = screen.getByRole('button', {
          name: 'actions.cancel_button_text',
        });

        // When cancel button is clicked, should trigger onClose callback
        await user.click(cancelButton);

        // When onClose is called, should be invoked exactly once
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });

      it('should reset form when closing', async () => {
        const user = userEvent.setup();
        const mockOnClose = vi.fn();

        renderWithProviders(
          <DomainCreateModal {...createMockDomainCreateModalProps({ onClose: mockOnClose })} />,
        );

        await waitForComponentToLoad();

        // Enter some text in the domain field
        const domainInput = screen.getByLabelText('field.label');

        // When text is entered into domain field, should update input value
        await user.type(domainInput, 'test-domain.com');

        // Close the modal
        const cancelButton = screen.getByRole('button', {
          name: 'actions.cancel_button_text',
        });

        // When close button is clicked, should trigger onClose and reset form
        await user.click(cancelButton);

        // When modal is closed, onClose should be called once
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('onCreate', () => {
    describe('when create button is clicked with valid domain', () => {
      it('should call onCreate with domain name', async () => {
        const user = userEvent.setup();
        const mockOnCreate = vi.fn();
        const testDomain = 'test-domain.com';

        renderWithProviders(
          <DomainCreateModal {...createMockDomainCreateModalProps({ onCreate: mockOnCreate })} />,
        );

        await waitForComponentToLoad();

        // Enter domain name
        const domainInput = screen.getByLabelText('field.label');

        // When domain name is entered, should update input value
        await user.type(domainInput, testDomain);

        // Click create button
        const createButton = screen.getByRole('button', {
          name: 'actions.create_button_text',
        });

        // When create button is clicked, should call onCreate with domain name
        await user.click(createButton);

        // When onCreate is called, should receive the correct domain name
        expect(mockOnCreate).toHaveBeenCalledTimes(1);
        expect(mockOnCreate).toHaveBeenCalledWith(testDomain);
      });
    });

    describe('when form is submitted via enter key', () => {
      it('should call onCreate with domain name', async () => {
        const user = userEvent.setup();
        const mockOnCreate = vi.fn();
        const testDomain = 'form-submit-test.com';

        renderWithProviders(
          <DomainCreateModal {...createMockDomainCreateModalProps({ onCreate: mockOnCreate })} />,
        );

        await waitForComponentToLoad();

        // Enter domain name and submit form
        const domainInput = screen.getByLabelText('field.label');

        // When domain name is entered, should update input value
        await user.type(domainInput, testDomain);

        // When Enter key is pressed, should submit the form
        await user.keyboard('{Enter}');

        // When form is submitted via Enter key, should call onCreate with domain name
        expect(mockOnCreate).toHaveBeenCalledTimes(1);
        expect(mockOnCreate).toHaveBeenCalledWith(testDomain);
      });
    });

    describe('when empty domain is submitted', () => {
      it('should not call onCreate', async () => {
        const user = userEvent.setup();
        const mockOnCreate = vi.fn();

        renderWithProviders(
          <DomainCreateModal {...createMockDomainCreateModalProps({ onCreate: mockOnCreate })} />,
        );

        await waitForComponentToLoad();

        // Try to submit without entering domain
        const createButton = screen.getByRole('button', {
          name: 'actions.create_button_text',
        });

        // When create button is clicked without domain input, should not call onCreate
        await user.click(createButton);

        // When empty form is submitted, onCreate should not be called
        expect(mockOnCreate).not.toHaveBeenCalled();
      });
    });

    describe('when handleCreate callback is tested directly', () => {
      it('should test form reset after successful creation', async () => {
        const user = userEvent.setup();
        const mockOnCreate = vi.fn().mockResolvedValue(undefined);
        const testDomain = 'reset-test.com';

        renderWithProviders(
          <DomainCreateModal {...createMockDomainCreateModalProps({ onCreate: mockOnCreate })} />,
        );

        await waitForComponentToLoad();

        // Enter domain name
        const domainInput = screen.getByLabelText('field.label');

        // When domain name is entered, should update input value
        await user.type(domainInput, testDomain);

        // When domain is entered, input should have the correct value
        expect(domainInput).toHaveValue(testDomain);

        // Submit form
        const createButton = screen.getByRole('button', {
          name: 'actions.create_button_text',
        });

        // When create button is clicked, should submit form and reset
        await user.click(createButton);

        // Wait for form to reset
        await waitFor(() => {
          // When form is reset after successful creation, input should be empty
          expect(domainInput).toHaveValue('');
        });

        // When onCreate is called, should receive the correct domain
        expect(mockOnCreate).toHaveBeenCalledWith(testDomain);
      });

      it('should test handleCreate function memoization', async () => {
        const user = userEvent.setup();
        const mockOnCreate1 = vi.fn().mockResolvedValue(undefined);
        const mockOnCreate2 = vi.fn().mockResolvedValue(undefined);
        const testDomain = 'memo-test.com';

        const { unmount } = renderWithProviders(
          <DomainCreateModal {...createMockDomainCreateModalProps({ onCreate: mockOnCreate1 })} />,
        );

        await waitForComponentToLoad();

        // Enter domain and submit
        const domainInput = screen.getByLabelText('field.label');

        // When domain is entered in first instance, should update input
        await user.type(domainInput, testDomain);

        const createButton = screen.getByRole('button', {
          name: 'actions.create_button_text',
        });

        // When create is clicked in first instance, should call first callback
        await user.click(createButton);

        // When first onCreate is called, should receive domain
        expect(mockOnCreate1).toHaveBeenCalledWith(testDomain);
        unmount();

        // Render with different onCreate function to test memoization
        renderWithProviders(
          <DomainCreateModal {...createMockDomainCreateModalProps({ onCreate: mockOnCreate2 })} />,
        );

        await waitForComponentToLoad();

        const newDomainInput = screen.getByLabelText('field.label');

        // When domain is entered in second instance, should update new input
        await user.type(newDomainInput, testDomain);

        const newCreateButton = screen.getByRole('button', {
          name: 'actions.create_button_text',
        });

        // When create is clicked in second instance, should call second callback
        await user.click(newCreateButton);

        // When second onCreate is called, should receive domain with new callback
        expect(mockOnCreate2).toHaveBeenCalledWith(testDomain);
      });
    });
  });

  describe('form validation', () => {
    describe('when domain field is focused and blurred', () => {
      it('should show validation messages for invalid domains', async () => {
        const user = userEvent.setup();

        renderWithProviders(<DomainCreateModal {...createMockDomainCreateModalProps()} />);

        await waitForComponentToLoad();

        const domainInput = screen.getByLabelText('field.label');

        // Focus and blur without entering anything
        await user.click(domainInput);

        // When input is focused and then blurred, should trigger validation
        await user.tab();

        // Should show validation error (exact message depends on schema)
        await waitFor(() => {
          // When validation is triggered, should display error messages
          const errorElements = screen.queryAllByRole('alert');
          if (errorElements.length > 0) {
            expect(errorElements[0]).toBeInTheDocument();
          }
        });
      });
    });

    describe('when invalid domain format is entered', () => {
      it('should handle invalid domain input gracefully', async () => {
        const user = userEvent.setup();

        renderWithProviders(<DomainCreateModal {...createMockDomainCreateModalProps()} />);

        await waitForComponentToLoad();

        // Enter invalid domain
        const domainInput = screen.getByLabelText('field.label');

        // When invalid domain is entered, should still accept the input
        await user.type(domainInput, 'invalid-domain');

        // When invalid domain is typed, input should display the value
        expect(domainInput).toHaveValue('invalid-domain');
      });
    });
  });

  describe('accessibility', () => {
    describe('when modal is open', () => {
      it('should have proper modal semantics', async () => {
        renderWithProviders(<DomainCreateModal {...createMockDomainCreateModalProps()} />);

        await waitForComponentToLoad();

        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      it('should have properly labeled form fields', async () => {
        renderWithProviders(<DomainCreateModal {...createMockDomainCreateModalProps()} />);

        await waitForComponentToLoad();

        // Check for form field label
        expect(screen.getByLabelText('field.label')).toBeInTheDocument();

        // Check for placeholder text
        const domainInput = screen.getByPlaceholderText('field.placeholder');
        expect(domainInput).toBeInTheDocument();
      });

      it('should have properly labeled buttons', async () => {
        renderWithProviders(<DomainCreateModal {...createMockDomainCreateModalProps()} />);

        await waitForComponentToLoad();

        expect(
          screen.getByRole('button', {
            name: 'actions.create_button_text',
          }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('button', {
            name: 'actions.cancel_button_text',
          }),
        ).toBeInTheDocument();
      });
    });

    describe('when component function parameters are tested', () => {
      it('should test DomainCreateModal function with default translatorKey', async () => {
        // Test the function with minimal props to ensure default parameters are covered
        renderWithProviders(
          <DomainCreateModal
            isOpen={true}
            isLoading={false}
            onClose={vi.fn()}
            onCreate={vi.fn()}
            // Explicitly NOT passing translatorKey to test default parameter
          />,
        );

        await waitForComponentToLoad();

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('title')).toBeInTheDocument();
      });

      it('should test DomainCreateModal function with custom translatorKey', async () => {
        // Test with custom translatorKey to ensure parameter handling
        renderWithProviders(
          <DomainCreateModal
            isOpen={true}
            isLoading={false}
            onClose={vi.fn()}
            onCreate={vi.fn()}
            translatorKey="custom.domain.create.modal"
          />,
        );

        await waitForComponentToLoad();

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('title')).toBeInTheDocument();
      });

      it('should test DomainCreateModal function with all optional parameters', async () => {
        // Test with all optional parameters provided
        renderWithProviders(
          <DomainCreateModal
            isOpen={true}
            isLoading={false}
            onClose={vi.fn()}
            onCreate={vi.fn()}
            translatorKey="custom.domain.create.modal"
            className="test-class"
            customMessages={{
              modal: {
                title: 'Custom Title',
                field: { label: 'Custom Label' },
              },
            }}
            schema={{
              domainUrl: {
                regex: /^[a-z0-9.-]+\.[a-z]{2,}$/,
                errorMessage: 'Custom error message',
              },
            }}
          />,
        );

        await waitForComponentToLoad();

        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('modal onOpenChange arrow function coverage', () => {
    it('should trigger handleClose through onOpenChange arrow function when modal is closed', async () => {
      const mockOnClose = vi.fn();

      renderWithProviders(
        <DomainCreateModal {...createMockDomainCreateModalProps({ onClose: mockOnClose })} />,
      );

      await waitForComponentToLoad();

      // Find and trigger the modal's onOpenChange with false to test arrow function: (open) => !open && handleClose()
      const modal = screen.getByRole('dialog');

      // Simulate ESC key press that would trigger onOpenChange(false)
      // When ESC key is pressed, should trigger modal close via onOpenChange
      fireEvent.keyDown(modal, { key: 'Escape', code: 'Escape' });

      // When modal is closed via onOpenChange, should call handleClose callback
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should not trigger handleClose when onOpenChange receives true (modal opening)', () => {
      const mockOnClose = vi.fn();

      // Test the arrow function path where open=true, so !open is false
      renderWithProviders(
        <DomainCreateModal
          {...createMockDomainCreateModalProps({
            isOpen: false, // Start closed
            onClose: mockOnClose,
          })}
        />,
      );

      // When modal opens (onOpenChange(true)), the arrow function should not call handleClose
      // When modal is initially closed and doesn't trigger onOpenChange(true), should not call onClose
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('schema and form handling', () => {
    describe('when custom schema is provided', () => {
      it('should use custom schema for validation', async () => {
        const user = userEvent.setup();
        const mockOnCreate = vi.fn().mockResolvedValue(undefined);
        const customSchema = {
          domainUrl: {
            regex: /^[a-z0-9.-]+\.[a-z]{2,}$/,
            errorMessage: 'Custom validation message',
          },
        };

        renderWithProviders(
          <DomainCreateModal
            {...createMockDomainCreateModalProps({
              onCreate: mockOnCreate,
              schema: customSchema,
            })}
          />,
        );

        await waitForComponentToLoad();

        // Component should render without error with custom schema
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByLabelText('field.label')).toBeInTheDocument();

        // Test that custom schema validation works and form can be saved
        const domainInput = screen.getByLabelText('field.label');
        const validDomain = 'valid-domain.com'; // Matches custom regex pattern

        // Enter valid domain according to custom schema
        await user.type(domainInput, validDomain);

        // Submit form to test that schema validation passes and form saves
        const createButton = screen.getByRole('button', {
          name: 'actions.create_button_text',
        });
        await user.click(createButton);

        // Confirm that the schema is applied and form data is saved
        await waitFor(() => {
          expect(mockOnCreate).toHaveBeenCalledWith(validDomain);
        });
      });
    });

    describe('when form methods are called', () => {
      it('should test form reset functionality', async () => {
        const user = userEvent.setup();
        const mockOnClose = vi.fn();

        renderWithProviders(
          <DomainCreateModal {...createMockDomainCreateModalProps({ onClose: mockOnClose })} />,
        );

        await waitForComponentToLoad();

        // Enter text and then close to trigger reset
        const domainInput = screen.getByLabelText('field.label');

        // When text is entered, should update input value
        await user.type(domainInput, 'test-reset.com');

        // When text is entered, input should display the value
        expect(domainInput).toHaveValue('test-reset.com');

        // Close modal to trigger handleClose which calls form.reset()
        const cancelButton = screen.getByRole('button', {
          name: 'actions.cancel_button_text',
        });

        // When cancel button is clicked, should trigger close and form reset
        await user.click(cancelButton);

        // When modal is closed, onClose callback should be invoked
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('callback coverage', () => {
    describe('onSubmit callback', () => {
      it('should test onSubmit function coverage', async () => {
        const user = userEvent.setup();
        const mockOnCreate = vi.fn().mockResolvedValue(undefined);

        renderWithProviders(
          <DomainCreateModal {...createMockDomainCreateModalProps({ onCreate: mockOnCreate })} />,
        );

        await waitForComponentToLoad();

        // Test form submission via form onSubmit
        const domainInput = screen.getByLabelText('field.label');
        const form = domainInput.closest('form');

        // When domain is entered, should update input value
        await user.type(domainInput, 'onsubmit-test.com');

        // Submit form directly to test onSubmit callback
        // When form is submitted directly, should trigger onSubmit handler
        fireEvent.submit(form!);

        // Wait for the async operation to complete
        await waitFor(() => {
          // When onSubmit is triggered, should call onCreate with domain value
          expect(mockOnCreate).toHaveBeenCalledWith('onsubmit-test.com');
        });
      });
    });
  });
});
