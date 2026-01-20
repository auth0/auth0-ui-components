import { screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { renderWithProviders } from '../../../../../internals';
import type { SsoProviderAttributeMappingsProps } from '../../../../../types/my-organization/idp-management/sso-provider/sso-provider-edit-types';
import { SsoProviderAttributeMappings } from '../sso-provider-attribute-mappings';

// Mock hooks
vi.mock('../../../../../hooks/use-translator', () => ({
  useTranslator: () => ({
    t: (key: string, params?: Record<string, string>) => {
      const translations: Record<string, string> = {
        'mappings.title': 'User Attribute Mapping',
        'mappings.description': 'Configure user attribute mappings for provisioning.',
        'mappings.description_provider_tab': 'Configure user attribute mappings for the provider.',
        'mappings.required.title': 'Required Attributes',
        'mappings.required.description': `Map required attributes from ${params?.strategy || 'provider'}.`,
        'mappings.optional.title': 'Optional Attributes',
        'mappings.optional.description': 'Map optional attributes.',
        'mappings.required.table.columns.attribute_name_label': 'Attribute Name',
        'mappings.required.table.columns.external_field_label': 'External Field',
        'mappings.optional.table.columns.attribute_name_label': 'Attribute Name',
        'mappings.optional.table.columns.external_field_label': 'External Field',
        'mappings.required.table.tags.updated': 'Changed',
        'mappings.required.table.tags.removed': 'Removed',
        'mappings.required.table.tags.new': 'New',
        'mappings.optional.table.tags.updated': 'Changed',
        'mappings.optional.table.tags.removed': 'Removed',
        'mappings.optional.table.tags.new': 'New',
        'mappings.external_namespace.label': 'SCIM Namespace',
      };
      return translations[key] || key;
    },
  }),
}));

vi.mock('../../../../../hooks/use-theme', () => ({
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
  });

  describe('rendering', () => {
    it('should render the component with title', () => {
      renderWithProviders(<SsoProviderAttributeMappings {...defaultProps} />);

      expect(screen.getByText('User Attribute Mapping')).toBeInTheDocument();
    });

    it('should render required attributes section', () => {
      renderWithProviders(<SsoProviderAttributeMappings {...defaultProps} />);

      expect(screen.getByText('Required Attributes')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('should render optional attributes section when optional items exist', () => {
      renderWithProviders(<SsoProviderAttributeMappings {...defaultProps} />);

      expect(screen.getByText('Optional Attributes')).toBeInTheDocument();
      expect(screen.getByText('Phone')).toBeInTheDocument();
    });

    it('should not render optional attributes section when no optional items exist', () => {
      const props = {
        ...defaultProps,
        userAttributeMap: [mockRequiredAttribute],
      };
      renderWithProviders(<SsoProviderAttributeMappings {...props} />);

      expect(screen.queryByText('Optional Attributes')).not.toBeInTheDocument();
    });
  });

  describe('isProvisioning mode', () => {
    it('should render SCIM namespace field when isProvisioning is true', () => {
      const props = {
        ...defaultProps,
        isProvisioning: true,
      };
      renderWithProviders(<SsoProviderAttributeMappings {...props} />);

      expect(screen.getByText('SCIM Namespace')).toBeInTheDocument();
      expect(
        screen.getByDisplayValue('urn:ietf:params:scim:schemas:core:2.0:User'),
      ).toBeInTheDocument();
    });

    it('should not render SCIM namespace field when isProvisioning is false', () => {
      renderWithProviders(<SsoProviderAttributeMappings {...defaultProps} />);

      expect(screen.queryByText('SCIM Namespace')).not.toBeInTheDocument();
    });

    it('should use provisioning description when isProvisioning is true', () => {
      const props = {
        ...defaultProps,
        isProvisioning: true,
      };
      renderWithProviders(<SsoProviderAttributeMappings {...props} />);

      expect(
        screen.getByText('Configure user attribute mappings for provisioning.'),
      ).toBeInTheDocument();
    });

    it('should use provider tab description when isProvisioning is false', () => {
      renderWithProviders(<SsoProviderAttributeMappings {...defaultProps} />);

      expect(
        screen.getByText('Configure user attribute mappings for the provider.'),
      ).toBeInTheDocument();
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

      expect(screen.getByText('Changed')).toBeInTheDocument();
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

      expect(screen.getByText('Removed')).toBeInTheDocument();
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

      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('should not display any badge when item has no changes', () => {
      renderWithProviders(<SsoProviderAttributeMappings {...defaultProps} />);

      expect(screen.queryByText('Changed')).not.toBeInTheDocument();
      expect(screen.queryByText('Removed')).not.toBeInTheDocument();
      expect(screen.queryByText('New')).not.toBeInTheDocument();
    });
  });

  describe('strategy display', () => {
    it('should display strategy name in required section description', () => {
      renderWithProviders(<SsoProviderAttributeMappings {...defaultProps} />);

      expect(screen.getByText(/Map required attributes from/)).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('should handle null userAttributeMap', () => {
      const props = {
        ...defaultProps,
        userAttributeMap: null,
      };
      renderWithProviders(<SsoProviderAttributeMappings {...props} />);

      expect(screen.getByText('User Attribute Mapping')).toBeInTheDocument();
    });

    it('should handle empty userAttributeMap array', () => {
      const props = {
        ...defaultProps,
        userAttributeMap: [],
      };
      renderWithProviders(<SsoProviderAttributeMappings {...props} />);

      expect(screen.getByText('User Attribute Mapping')).toBeInTheDocument();
      expect(screen.queryByText('Optional Attributes')).not.toBeInTheDocument();
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
