import { screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { SsoThirdPartyAccessSection } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-third-party-access-section';
import {
  createMockThirdPartyAccessSectionProps,
  createMockThirdPartyAccessMessages,
  mockUseTranslatorReturn,
  mockUseThemeReturn,
} from '@/tests/utils/__mocks__/my-organization/idp-management/sso-provider-edit/third-party-access-section.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';

vi.mock('@/hooks/shared/use-translator', () => ({
  useTranslator: () => mockUseTranslatorReturn,
}));

vi.mock('@/hooks/shared/use-theme', () => ({
  useTheme: () => mockUseThemeReturn,
}));

describe('SsoThirdPartyAccessSection', () => {
  const mockOnChange = vi.fn();

  const defaultProps = createMockThirdPartyAccessSectionProps({
    onChange: mockOnChange,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render with title, label, and helper text', () => {
      renderWithProviders(<SsoThirdPartyAccessSection {...defaultProps} />);

      expect(screen.getByText('title')).toBeInTheDocument();
      expect(screen.getByText('label')).toBeInTheDocument();
      expect(screen.getByText('helper_text')).toBeInTheDocument();
    });

    describe('when checked is false', () => {
      it('should render checkbox unchecked', () => {
        renderWithProviders(<SsoThirdPartyAccessSection {...defaultProps} checked={false} />);

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).not.toBeChecked();
      });
    });

    describe('when checked is true', () => {
      it('should render checkbox checked', () => {
        renderWithProviders(<SsoThirdPartyAccessSection {...defaultProps} checked={true} />);

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeChecked();
      });
    });
  });

  describe('interactions', () => {
    describe('when checkbox is clicked and was unchecked', () => {
      it('should call onChange with true', () => {
        renderWithProviders(<SsoThirdPartyAccessSection {...defaultProps} checked={false} />);

        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);

        expect(mockOnChange).toHaveBeenCalledWith(true);
      });
    });

    describe('when checkbox is clicked and was checked', () => {
      it('should call onChange with false', () => {
        renderWithProviders(<SsoThirdPartyAccessSection {...defaultProps} checked={true} />);

        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);

        expect(mockOnChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('readOnly mode', () => {
    describe('when readOnly is true', () => {
      it('should disable checkbox', () => {
        renderWithProviders(<SsoThirdPartyAccessSection {...defaultProps} readOnly={true} />);

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeDisabled();
      });

      it('should not call onChange when checkbox is clicked', () => {
        renderWithProviders(<SsoThirdPartyAccessSection {...defaultProps} readOnly={true} />);

        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);

        expect(mockOnChange).not.toHaveBeenCalled();
      });

      it('should set aria-disabled attribute', () => {
        renderWithProviders(<SsoThirdPartyAccessSection {...defaultProps} readOnly={true} />);

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toHaveAttribute('aria-disabled', 'true');
      });
    });

    describe('when readOnly is false', () => {
      it('should enable checkbox', () => {
        renderWithProviders(<SsoThirdPartyAccessSection {...defaultProps} readOnly={false} />);

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).not.toBeDisabled();
      });
    });
  });

  describe('accessibility', () => {
    it('should have checkbox properly labeled', () => {
      renderWithProviders(<SsoThirdPartyAccessSection {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox', {
        name: 'label',
      });
      expect(checkbox).toBeInTheDocument();
    });

    it('should have checkbox associated with description via aria-describedby', () => {
      renderWithProviders(<SsoThirdPartyAccessSection {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      const describedById = checkbox.getAttribute('aria-describedby');
      expect(describedById).toBeTruthy();

      const description = screen.getByText('helper_text');
      expect(description).toHaveAttribute('id', describedById);
    });

    it('should render title as heading', () => {
      renderWithProviders(<SsoThirdPartyAccessSection {...defaultProps} />);

      const title = screen.getByRole('heading', { level: 6 });
      expect(title).toHaveTextContent('title');
    });
  });

  describe('custom messages', () => {
    it('should apply custom className when provided', () => {
      const { container } = renderWithProviders(
        <SsoThirdPartyAccessSection {...defaultProps} className="custom-class" />,
      );

      const section = container.querySelector('.custom-class');
      expect(section).toBeInTheDocument();
    });

    it('should accept custom messages prop', () => {
      const customMessages = createMockThirdPartyAccessMessages({
        title: 'Custom Title',
      });

      renderWithProviders(
        <SsoThirdPartyAccessSection {...defaultProps} customMessages={customMessages} />,
      );

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('should render with proper structure including separator', () => {
      const { container } = renderWithProviders(<SsoThirdPartyAccessSection {...defaultProps} />);

      expect(screen.getByText('title')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(container.querySelector('[data-slot="separator"]')).toBeInTheDocument();
    });
  });
});
