import { screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { SsoProviderAttributeMappings } from '../sso-provider-attribute-mappings';

import { mockCore, renderWithProviders } from '@/tests/utils';
import type { SsoProviderAttributeMappingsProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-edit-types';

const { initMockCoreClient } = mockCore();

vi.mock('@/hooks/shared/use-theme', () => ({
  useTheme: () => ({
    isDarkMode: false,
  }),
}));

describe('SsoProviderAttributeMappings', () => {
  const mockRequiredAttribute = {
    label: 'Email',
    user_attribute: 'email',
    sso_field: ['email'],
    is_required: true,
    is_extra: false,
    is_missing: false,
    description: 'User email address',
  };

  const mockOptionalAttribute = {
    label: 'Phone',
    user_attribute: 'phone_number',
    sso_field: ['phone'],
    is_required: false,
    is_extra: false,
    is_missing: false,
    description: 'User phone number',
  };

  const defaultProps: SsoProviderAttributeMappingsProps = {
    userAttributeMap: [mockRequiredAttribute, mockOptionalAttribute],
    strategy: 'oidc',
    isProvisioning: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    initMockCoreClient();
  });

  describe('rendering', () => {
    it('should render the component with title', () => {
      renderWithProviders(<SsoProviderAttributeMappings {...defaultProps} />);

      expect(screen.getByText('mappings.title')).toBeInTheDocument();
    });

    it('should render required attributes section', () => {
      renderWithProviders(<SsoProviderAttributeMappings {...defaultProps} />);

      expect(screen.getByText('mappings.required.title')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('should render optional attributes section when optional items exist', () => {
      renderWithProviders(<SsoProviderAttributeMappings {...defaultProps} />);

      expect(screen.getByText('mappings.optional.title')).toBeInTheDocument();
      expect(screen.getByText('Phone')).toBeInTheDocument();
    });

    it('should not render optional attributes section when no optional items exist', () => {
      const props = {
        ...defaultProps,
        userAttributeMap: [mockRequiredAttribute],
      };
      renderWithProviders(<SsoProviderAttributeMappings {...props} />);

      expect(screen.queryByText('mappings.optional.title')).not.toBeInTheDocument();
    });
  });

  describe('isProvisioning mode', () => {
    it('should render SCIM namespace field when isProvisioning is true', () => {
      const props = {
        ...defaultProps,
        isProvisioning: true,
      };
      renderWithProviders(<SsoProviderAttributeMappings {...props} />);

      expect(screen.getByText('mappings.external_namespace.label')).toBeInTheDocument();
      expect(
        screen.getByDisplayValue('urn:ietf:params:scim:schemas:core:2.0:User'),
      ).toBeInTheDocument();
    });

    it('should not render SCIM namespace field when isProvisioning is false', () => {
      renderWithProviders(<SsoProviderAttributeMappings {...defaultProps} />);

      expect(screen.queryByText('mappings.external_namespace.label')).not.toBeInTheDocument();
    });

    it('should use provisioning description when isProvisioning is true', () => {
      const props = {
        ...defaultProps,
        isProvisioning: true,
      };
      renderWithProviders(<SsoProviderAttributeMappings {...props} />);

      expect(screen.getByText('mappings.description')).toBeInTheDocument();
    });

    it('should use provider tab description when isProvisioning is false', () => {
      renderWithProviders(<SsoProviderAttributeMappings {...defaultProps} />);

      expect(screen.getByText('mappings.description_provider_tab')).toBeInTheDocument();
    });
  });

  describe('change status badges', () => {
    it('should display "Changed" badge when item is both extra and missing', () => {
      const changedAttribute = {
        ...mockRequiredAttribute,
        is_extra: true,
        is_missing: true,
      };
      const props = {
        ...defaultProps,
        userAttributeMap: [changedAttribute],
      };
      renderWithProviders(<SsoProviderAttributeMappings {...props} />);

      expect(screen.getByText('mappings.required.table.tags.updated.label')).toBeInTheDocument();
    });

    it('should display "Removed" badge when item is extra only', () => {
      const removedAttribute = {
        ...mockRequiredAttribute,
        is_extra: true,
        is_missing: false,
      };
      const props = {
        ...defaultProps,
        userAttributeMap: [removedAttribute],
      };
      renderWithProviders(<SsoProviderAttributeMappings {...props} />);

      expect(screen.getByText('mappings.required.table.tags.removed.label')).toBeInTheDocument();
    });

    it('should display "New" badge when item is missing only', () => {
      const newAttribute = {
        ...mockRequiredAttribute,
        is_extra: false,
        is_missing: true,
      };
      const props = {
        ...defaultProps,
        userAttributeMap: [newAttribute],
      };
      renderWithProviders(<SsoProviderAttributeMappings {...props} />);

      expect(screen.getByText('mappings.required.table.tags.new.label')).toBeInTheDocument();
    });

    it('should not display any badge when item has no changes', () => {
      renderWithProviders(<SsoProviderAttributeMappings {...defaultProps} />);

      expect(
        screen.queryByText('mappings.required.table.tags.updated.label'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('mappings.required.table.tags.removed.label'),
      ).not.toBeInTheDocument();
      expect(screen.queryByText('mappings.required.table.tags.new.label')).not.toBeInTheDocument();
    });
  });

  describe('strategy display', () => {
    it('should display strategy name in required section description', () => {
      renderWithProviders(<SsoProviderAttributeMappings {...defaultProps} />);

      expect(screen.getByText('mappings.required.description')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('should handle null userAttributeMap', () => {
      const props = {
        ...defaultProps,
        userAttributeMap: null,
      };
      renderWithProviders(<SsoProviderAttributeMappings {...props} />);

      expect(screen.getByText('mappings.title')).toBeInTheDocument();
    });

    it('should handle empty userAttributeMap array', () => {
      const props = {
        ...defaultProps,
        userAttributeMap: [],
      };
      renderWithProviders(<SsoProviderAttributeMappings {...props} />);

      expect(screen.getByText('mappings.title')).toBeInTheDocument();
      expect(screen.queryByText('mappings.optional.title')).not.toBeInTheDocument();
    });
  });

  describe('custom styling', () => {
    it('should apply custom className', () => {
      const { container } = renderWithProviders(
        <SsoProviderAttributeMappings {...defaultProps} className="custom-class" />,
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});
