import { screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { SsoCrossAppAccessSection } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-cross-app-access-section';
import {
  createMockCrossAppAccessSectionProps,
  createMockCrossAppAccessMessages,
  mockUseTranslatorReturn,
  mockUseThemeReturn,
} from '@/tests/utils/__mocks__/my-organization/idp-management/sso-provider-edit/cross-app-access-section.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';

vi.mock('@/hooks/shared/use-translator', () => ({
  useTranslator: () => mockUseTranslatorReturn,
}));

vi.mock('@/hooks/shared/use-theme', () => ({
  useTheme: () => mockUseThemeReturn,
}));

describe('SsoCrossAppAccessSection', () => {
  const mockOnChange = vi.fn();
  const mockOnDiscoveryUrlChange = vi.fn();

  const defaultProps = createMockCrossAppAccessSectionProps({
    onChange: mockOnChange,
    onDiscoveryUrlChange: mockOnDiscoveryUrlChange,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('OIDC/Okta strategy', () => {
    describe('rendering', () => {
      it('should render title, label, helper text, and domain verification text', () => {
        renderWithProviders(<SsoCrossAppAccessSection {...defaultProps} strategy="oidc" />);

        expect(screen.getByText('title')).toBeInTheDocument();
        expect(screen.getByText('label')).toBeInTheDocument();
        expect(screen.getByText('helper_text')).toBeInTheDocument();
        expect(screen.getByText('domain_verification_text')).toBeInTheDocument();
      });

      it('should not render SAML-specific fields', () => {
        renderWithProviders(<SsoCrossAppAccessSection {...defaultProps} strategy="oidc" />);

        expect(screen.queryByText('saml_description')).not.toBeInTheDocument();
        expect(screen.queryByText('saml_discovery_url_label')).not.toBeInTheDocument();
      });

      it('should render checkbox unchecked when checked is false', () => {
        renderWithProviders(
          <SsoCrossAppAccessSection {...defaultProps} strategy="oidc" checked={false} />,
        );

        expect(screen.getByRole('checkbox')).not.toBeChecked();
      });

      it('should render checkbox checked when checked is true', () => {
        renderWithProviders(
          <SsoCrossAppAccessSection {...defaultProps} strategy="oidc" checked={true} />,
        );

        expect(screen.getByRole('checkbox')).toBeChecked();
      });
    });

    describe('interactions', () => {
      it('should call onChange with true when clicking unchecked checkbox', () => {
        renderWithProviders(
          <SsoCrossAppAccessSection {...defaultProps} strategy="oidc" checked={false} />,
        );

        fireEvent.click(screen.getByRole('checkbox'));

        expect(mockOnChange).toHaveBeenCalledWith(true);
      });

      it('should call onChange with false when clicking checked checkbox', () => {
        renderWithProviders(
          <SsoCrossAppAccessSection {...defaultProps} strategy="oidc" checked={true} />,
        );

        fireEvent.click(screen.getByRole('checkbox'));

        expect(mockOnChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('SAML strategy', () => {
    describe('rendering', () => {
      it('should render title and SAML-specific description', () => {
        renderWithProviders(<SsoCrossAppAccessSection {...defaultProps} strategy="samlp" />);

        expect(screen.getByText('title')).toBeInTheDocument();
        expect(screen.getByText('saml_description')).toBeInTheDocument();
      });

      it('should render discovery URL input field', () => {
        renderWithProviders(<SsoCrossAppAccessSection {...defaultProps} strategy="samlp" />);

        expect(screen.getByText('saml_discovery_url_label')).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toBeInTheDocument();
        expect(screen.getByText('saml_discovery_url_helper')).toBeInTheDocument();
      });

      it('should render checkbox with label and helper text', () => {
        renderWithProviders(<SsoCrossAppAccessSection {...defaultProps} strategy="samlp" />);

        expect(screen.getByRole('checkbox')).toBeInTheDocument();
        expect(screen.getByText('label')).toBeInTheDocument();
        expect(screen.getByText('helper_text')).toBeInTheDocument();
      });

      it('should display discovery URL value', () => {
        renderWithProviders(
          <SsoCrossAppAccessSection
            {...defaultProps}
            strategy="samlp"
            discoveryUrl="https://example.com/.well-known"
          />,
        );

        expect(screen.getByRole('textbox')).toHaveValue('https://example.com/.well-known');
      });
    });

    describe('checkbox disabled state', () => {
      it('should disable checkbox when discovery URL is empty', () => {
        renderWithProviders(
          <SsoCrossAppAccessSection {...defaultProps} strategy="samlp" discoveryUrl="" />,
        );

        expect(screen.getByRole('checkbox')).toBeDisabled();
      });

      it('should disable checkbox when discovery URL is whitespace only', () => {
        renderWithProviders(
          <SsoCrossAppAccessSection {...defaultProps} strategy="samlp" discoveryUrl="   " />,
        );

        expect(screen.getByRole('checkbox')).toBeDisabled();
      });

      it('should enable checkbox when discovery URL has value', () => {
        renderWithProviders(
          <SsoCrossAppAccessSection
            {...defaultProps}
            strategy="samlp"
            discoveryUrl="https://example.com"
          />,
        );

        expect(screen.getByRole('checkbox')).not.toBeDisabled();
      });
    });

    describe('interactions', () => {
      it('should call onDiscoveryUrlChange when typing in URL field', () => {
        renderWithProviders(<SsoCrossAppAccessSection {...defaultProps} strategy="samlp" />);

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'https://new-url.com' } });

        expect(mockOnDiscoveryUrlChange).toHaveBeenCalledWith('https://new-url.com');
      });

      it('should call onChange when clicking checkbox with valid URL', () => {
        renderWithProviders(
          <SsoCrossAppAccessSection
            {...defaultProps}
            strategy="samlp"
            discoveryUrl="https://example.com"
            checked={false}
          />,
        );

        fireEvent.click(screen.getByRole('checkbox'));

        expect(mockOnChange).toHaveBeenCalledWith(true);
      });

      it('should not call onChange when clicking disabled checkbox', () => {
        renderWithProviders(
          <SsoCrossAppAccessSection {...defaultProps} strategy="samlp" discoveryUrl="" />,
        );

        fireEvent.click(screen.getByRole('checkbox'));

        expect(mockOnChange).not.toHaveBeenCalled();
      });
    });
  });

  describe('readOnly mode', () => {
    it('should disable checkbox when readOnly is true for OIDC', () => {
      renderWithProviders(
        <SsoCrossAppAccessSection {...defaultProps} strategy="oidc" readOnly={true} />,
      );

      expect(screen.getByRole('checkbox')).toBeDisabled();
    });

    it('should disable checkbox when readOnly is true for SAML with URL', () => {
      renderWithProviders(
        <SsoCrossAppAccessSection
          {...defaultProps}
          strategy="samlp"
          readOnly={true}
          discoveryUrl="https://example.com"
        />,
      );

      expect(screen.getByRole('checkbox')).toBeDisabled();
    });

    it('should disable URL input when readOnly is true for SAML', () => {
      renderWithProviders(
        <SsoCrossAppAccessSection {...defaultProps} strategy="samlp" readOnly={true} />,
      );

      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('should not call onChange when clicking disabled checkbox', () => {
      renderWithProviders(
        <SsoCrossAppAccessSection {...defaultProps} strategy="oidc" readOnly={true} />,
      );

      fireEvent.click(screen.getByRole('checkbox'));

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('should set aria-disabled attribute on checkbox', () => {
      renderWithProviders(
        <SsoCrossAppAccessSection {...defaultProps} strategy="oidc" readOnly={true} />,
      );

      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('accessibility', () => {
    it('should have checkbox properly labeled', () => {
      renderWithProviders(<SsoCrossAppAccessSection {...defaultProps} strategy="oidc" />);

      expect(screen.getByRole('checkbox', { name: 'label' })).toBeInTheDocument();
    });

    it('should have checkbox associated with description via aria-describedby', () => {
      renderWithProviders(<SsoCrossAppAccessSection {...defaultProps} strategy="oidc" />);

      const checkbox = screen.getByRole('checkbox');
      const describedById = checkbox.getAttribute('aria-describedby');
      expect(describedById).toBeTruthy();

      const description = screen.getByText('helper_text');
      expect(description).toHaveAttribute('id', describedById);
    });

    it('should render title as heading', () => {
      renderWithProviders(<SsoCrossAppAccessSection {...defaultProps} strategy="oidc" />);

      const title = screen.getByRole('heading', { level: 6 });
      expect(title).toHaveTextContent('title');
    });

    it('should have URL input associated with helper text for SAML', () => {
      renderWithProviders(<SsoCrossAppAccessSection {...defaultProps} strategy="samlp" />);

      const input = screen.getByRole('textbox');
      const describedById = input.getAttribute('aria-describedby');
      expect(describedById).toBeTruthy();

      const helperText = screen.getByText('saml_discovery_url_helper');
      expect(helperText).toHaveAttribute('id', describedById);
    });
  });

  describe('custom styling', () => {
    it('should apply custom className when provided', () => {
      const { container } = renderWithProviders(
        <SsoCrossAppAccessSection {...defaultProps} strategy="oidc" className="custom-class" />,
      );

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('should render with separator', () => {
      const { container } = renderWithProviders(
        <SsoCrossAppAccessSection {...defaultProps} strategy="oidc" />,
      );

      expect(container.querySelector('[data-slot="separator"]')).toBeInTheDocument();
    });
  });

  describe('custom messages', () => {
    it('should accept custom messages prop', () => {
      const customMessages = createMockCrossAppAccessMessages({
        title: 'Custom Title',
      });

      renderWithProviders(
        <SsoCrossAppAccessSection
          {...defaultProps}
          strategy="oidc"
          customMessages={customMessages}
        />,
      );

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });
  });
});
