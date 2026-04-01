import { screen } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';

import { MemberDetailUserDetails } from '@/components/auth0/my-organization/shared/member-management/members/member-user-details/member-detail-user-details';
import { renderWithProviders } from '@/tests/utils';
import {
  createMockUserDetailsProps,
  createMockMember,
} from '@/tests/utils/__mocks__/my-organization/member-management/member.mocks';

describe('MemberDetailUserDetails', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the user details card', () => {
      renderWithProviders(<MemberDetailUserDetails {...createMockUserDetailsProps()} />);

      expect(screen.getByText('member.detail.user_details.title')).toBeInTheDocument();
    });

    it('should render all field labels', () => {
      renderWithProviders(<MemberDetailUserDetails {...createMockUserDetailsProps()} />);

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

      renderWithProviders(<MemberDetailUserDetails {...createMockUserDetailsProps({ member })} />);

      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    it('should display "—" when name is missing', () => {
      const member = createMockMember({ name: undefined });

      renderWithProviders(<MemberDetailUserDetails {...createMockUserDetailsProps({ member })} />);

      expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('email field', () => {
    it('should display the email as a copyable field when present', () => {
      const member = createMockMember({ email: 'user@example.com' });

      renderWithProviders(<MemberDetailUserDetails {...createMockUserDetailsProps({ member })} />);

      expect(screen.getByDisplayValue('user@example.com')).toBeInTheDocument();
    });

    it('should display "—" when email is missing', () => {
      const member = createMockMember({ email: undefined });

      renderWithProviders(<MemberDetailUserDetails {...createMockUserDetailsProps({ member })} />);

      expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('phone number field', () => {
    it('should display phone number as copyable when present', () => {
      const member = {
        ...createMockMember(),
        phone_number: '+1234567890',
      } as Parameters<typeof MemberDetailUserDetails>[0]['member'];

      renderWithProviders(<MemberDetailUserDetails {...createMockUserDetailsProps({ member })} />);

      expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument();
    });

    it('should display "—" when phone number is absent', () => {
      const member = createMockMember();

      renderWithProviders(<MemberDetailUserDetails {...createMockUserDetailsProps({ member })} />);

      expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('provider field', () => {
    it('should display provider when present', () => {
      const member = {
        ...createMockMember(),
        connection: 'google-oauth2',
      } as Parameters<typeof MemberDetailUserDetails>[0]['member'];

      renderWithProviders(<MemberDetailUserDetails {...createMockUserDetailsProps({ member })} />);

      expect(screen.getByText('google-oauth2')).toBeInTheDocument();
    });

    it('should display "—" when provider is absent', () => {
      const member = createMockMember();

      renderWithProviders(<MemberDetailUserDetails {...createMockUserDetailsProps({ member })} />);

      expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('date fields', () => {
    it('should render created_at label', () => {
      renderWithProviders(<MemberDetailUserDetails {...createMockUserDetailsProps()} />);

      expect(screen.getByText('member.detail.user_details.created_at')).toBeInTheDocument();
    });

    it('should render last_login label', () => {
      renderWithProviders(<MemberDetailUserDetails {...createMockUserDetailsProps()} />);

      expect(screen.getByText('member.detail.user_details.last_login')).toBeInTheDocument();
    });

    it('should display "—" when created_at is missing', () => {
      const member = createMockMember({ created_at: undefined });

      renderWithProviders(<MemberDetailUserDetails {...createMockUserDetailsProps({ member })} />);

      expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
    });
  });
});
