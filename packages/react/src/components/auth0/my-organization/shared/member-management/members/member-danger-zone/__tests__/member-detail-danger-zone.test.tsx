import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, afterEach, vi } from 'vitest';

import { MemberDetailDangerZone } from '@/components/auth0/my-organization/shared/member-management/members/member-danger-zone/member-detail-danger-zone';
import { renderWithProviders } from '@/tests/utils';
import { createMockDangerZoneProps } from '@/tests/utils/__mocks__/my-organization/member-management/member.mocks';

describe('MemberDetailDangerZone', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the remove from org card', () => {
      renderWithProviders(<MemberDetailDangerZone {...createMockDangerZoneProps()} />);

      expect(
        screen.getByText('member.detail.danger_zone.remove_from_org.title'),
      ).toBeInTheDocument();
    });

    it('should render the remove from org button', () => {
      renderWithProviders(<MemberDetailDangerZone {...createMockDangerZoneProps()} />);

      expect(
        screen.getByRole('button', { name: 'member.detail.danger_zone.remove_from_org.button' }),
      ).toBeInTheDocument();
    });
  });

  describe('readOnly', () => {
    it('should disable the button when readOnly is true', () => {
      renderWithProviders(
        <MemberDetailDangerZone {...createMockDangerZoneProps({ readOnly: true })} />,
      );

      expect(
        screen.getByRole('button', { name: 'member.detail.danger_zone.remove_from_org.button' }),
      ).toBeDisabled();
    });

    it('should enable the button when readOnly is false', () => {
      renderWithProviders(
        <MemberDetailDangerZone {...createMockDangerZoneProps({ readOnly: false })} />,
      );

      expect(
        screen.getByRole('button', { name: 'member.detail.danger_zone.remove_from_org.button' }),
      ).toBeEnabled();
    });
  });

  describe('loading states', () => {
    it('should disable button when isRemovingFromOrg is true', () => {
      renderWithProviders(
        <MemberDetailDangerZone {...createMockDangerZoneProps({ isRemovingFromOrg: true })} />,
      );

      expect(screen.getByRole('button', { name: 'Loading...' })).toBeDisabled();
    });

    it('should show spinner when isRemovingFromOrg is true', () => {
      renderWithProviders(
        <MemberDetailDangerZone {...createMockDangerZoneProps({ isRemovingFromOrg: true })} />,
      );

      expect(screen.getByRole('button', { name: 'Loading...' })).toBeInTheDocument();
    });
  });

  describe('callbacks', () => {
    it('should call onRemoveFromOrgClick when remove button is clicked', async () => {
      const user = userEvent.setup();
      const onRemoveFromOrgClick = vi.fn();

      renderWithProviders(
        <MemberDetailDangerZone {...createMockDangerZoneProps({ onRemoveFromOrgClick })} />,
      );

      await user.click(
        screen.getByRole('button', { name: 'member.detail.danger_zone.remove_from_org.button' }),
      );

      expect(onRemoveFromOrgClick).toHaveBeenCalledTimes(1);
    });
  });
});
