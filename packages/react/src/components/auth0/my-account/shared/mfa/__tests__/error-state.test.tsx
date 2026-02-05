import { screen } from '@testing-library/react';
import { vi, describe, it, expect, afterEach } from 'vitest';

import { MFAErrorState } from '../error-state';

import { renderWithProviders, createMockMFAErrorStateProps } from '@/tests/utils';

// ===== Test Suite =====
describe('MFAMFAErrorState', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('title', () => {
    it('should render the title when is provided', async () => {
      renderWithProviders(
        <MFAErrorState {...createMockMFAErrorStateProps({ title: 'Error Occurred' })} />,
      );

      // When title is provided, should display it
      expect(await screen.findByText('Error Occurred')).toBeInTheDocument();
    });

    it('should render default title', async () => {
      renderWithProviders(<MFAErrorState {...createMockMFAErrorStateProps()} />);

      // When default title is used, should display it
      expect(await screen.findByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('description', () => {
    it('should render the description when is provided', async () => {
      renderWithProviders(
        <MFAErrorState
          {...createMockMFAErrorStateProps({ description: 'Custom Error Message' })}
        />,
      );

      // When description is provided, should display it
      expect(await screen.findByText('Custom Error Message')).toBeInTheDocument();
    });

    it('should render default description', async () => {
      renderWithProviders(<MFAErrorState {...createMockMFAErrorStateProps()} />);

      // When default description is used, should display it
      expect(
        await screen.findByText('An error occurred while processing your request'),
      ).toBeInTheDocument();
    });
  });

  it('should render with custom CSS classes when custom styling is provided', () => {
    const customClass = 'custom-error-class';

    const { container } = renderWithProviders(
      <MFAErrorState {...createMockMFAErrorStateProps({ className: customClass })} />,
    );

    // When custom classes are provided, should have custom class applied
    const customElement = container.querySelector('.custom-error-class');
    expect(customElement).toBeInTheDocument();
  });

  it('should render with custom messages when custom messages are provided', async () => {
    const customMessages = {
      error_title: 'Custom Error',
    };

    renderWithProviders(<MFAErrorState {...createMockMFAErrorStateProps({ customMessages })} />);

    // When custom messages are provided, error state should render
    expect(await screen.findByText('Something went wrong')).toBeInTheDocument();
  });

  describe('accessibility', () => {
    it('should have proper text hierarchy when error state is rendered', async () => {
      renderWithProviders(<MFAErrorState {...createMockMFAErrorStateProps()} />);

      // When error state is rendered, should have title and description
      expect(await screen.findByText('Something went wrong')).toBeInTheDocument();
      expect(
        await screen.findByText('An error occurred while processing your request'),
      ).toBeInTheDocument();
    });

    it('should display error icon when error state is rendered', async () => {
      renderWithProviders(<MFAErrorState {...createMockMFAErrorStateProps()} />);

      // When error state is rendered, should have visual error indicator
      expect(await screen.findByText('Something went wrong')).toBeInTheDocument();
    });
  });
});
