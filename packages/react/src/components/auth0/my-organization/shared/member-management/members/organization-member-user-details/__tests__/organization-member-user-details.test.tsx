import { screen } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';

import { OrganizationMemberUserDetails } from '@/components/auth0/my-organization/shared/member-management/members/organization-member-user-details/organization-member-user-details';
import { renderWithProviders } from '@/tests/utils';
import {
  createMockUserDetailsProps,
  createMockMember,
} from '@/tests/utils/__mocks__/my-organization/member-management/member.mocks';

describe('OrganizationMemberUserDetails', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the user details card', () => {
      renderWithProviders(<OrganizationMemberUserDetails {...createMockUserDetailsProps()} />);

      expect(screen.getByText('member.detail.user_details.title')).toBeInTheDocument();
    });

    it('should render all field labels', () => {
      renderWithProviders(<OrganizationMemberUserDetails {...createMockUserDetailsProps()} />);

      expect(screen.getByText('member.detail.user_details.name')).toBeInTheDocument();
      expect(screen.getByText('member.detail.user_details.email')).toBeInTheDocument();
      expect(screen.getByText('member.detail.user_details.phone_number')).toBeInTheDocument();
      expect(screen.getByText('member.detail.user_details.provider')).toBeInTheDocument();
      expect(screen.getByText('member.detail.user_details.created_at')).toBeInTheDocument();
      expect(screen.getByText('member.detail.user_details.last_login')).toBeInTheDocument();
    });
  });

  describe('member name', () => {
    it('should display the member name', () => {
      const member = createMockMember({ name: 'Jane Doe' });

      renderWithProviders(
        <OrganizationMemberUserDetails {...createMockUserDetailsProps({ member })} />,
      );

      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    it('should display "—" when name is missing', () => {
      const member = createMockMember({ name: undefined });

      renderWithProviders(
        <OrganizationMemberUserDetails {...createMockUserDetailsProps({ member })} />,
      );

      expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('email field', () => {
    it('should display the email as a copyable field when present', () => {
      const member = createMockMember({ email: 'user@example.com' });

      renderWithProviders(
        <OrganizationMemberUserDetails {...createMockUserDetailsProps({ member })} />,
      );

      expect(screen.getByDisplayValue('user@example.com')).toBeInTheDocument();
    });

    it('should display "—" when email is missing', () => {
      const member = createMockMember({ email: undefined });

      renderWithProviders(
        <OrganizationMemberUserDetails {...createMockUserDetailsProps({ member })} />,
      );

      expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('phone number field', () => {
    it('should display phone number as copyable when present', () => {
      const member = {
        ...createMockMember(),
        phone_number: '+1234567890',
      } as Parameters<typeof OrganizationMemberUserDetails>[0]['member'];

      renderWithProviders(
        <OrganizationMemberUserDetails {...createMockUserDetailsProps({ member })} />,
      );

      expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument();
    });

    it('should display "—" when phone number is absent', () => {
      const member = createMockMember();

      renderWithProviders(
        <OrganizationMemberUserDetails {...createMockUserDetailsProps({ member })} />,
      );

      expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('provider field', () => {
    it('should display provider when present', () => {
      const member = {
        ...createMockMember(),
        connection: 'google-oauth2',
      } as Parameters<typeof OrganizationMemberUserDetails>[0]['member'];

      renderWithProviders(
        <OrganizationMemberUserDetails {...createMockUserDetailsProps({ member })} />,
      );

      expect(screen.getByText('google-oauth2')).toBeInTheDocument();
    });

    it('should display "—" when provider is absent', () => {
      const member = createMockMember();

      renderWithProviders(
        <OrganizationMemberUserDetails {...createMockUserDetailsProps({ member })} />,
      );

      expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('date fields', () => {
    it('should render created_at label', () => {
      renderWithProviders(<OrganizationMemberUserDetails {...createMockUserDetailsProps()} />);

      expect(screen.getByText('member.detail.user_details.created_at')).toBeInTheDocument();
    });

    it('should render last_login label', () => {
      renderWithProviders(<OrganizationMemberUserDetails {...createMockUserDetailsProps()} />);

      expect(screen.getByText('member.detail.user_details.last_login')).toBeInTheDocument();
    });

    it('should display "—" when created_at is missing', () => {
      const member = createMockMember({ created_at: undefined });

      renderWithProviders(
        <OrganizationMemberUserDetails {...createMockUserDetailsProps({ member })} />,
      );

      expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
    });
  });
});
