import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DomainDiscoverySwitch } from '@/components/auth0/my-organization/shared/domain-management/domain-table/domain-discovery-switch';
import { createMockDomain } from '@/tests/utils/__mocks__/my-organization/domain-management/domain.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import type { DomainDiscoverySwitchProps } from '@/types/my-organization/domain-management/domain-table-types';

const createProps = (
  overrides: Partial<DomainDiscoverySwitchProps> = {},
): DomainDiscoverySwitchProps => ({
  domain: createMockDomain({ status: 'verified' }),
  checked: false,
  isLocked: false,
  canChange: true,
  isUpdating: false,
  onToggle: vi.fn(),
  ...overrides,
});

describe('DomainDiscoverySwitch', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('reflects the current value', () => {
    const { rerender } = renderWithProviders(<DomainDiscoverySwitch {...createProps()} />);
    expect(screen.getByRole('switch')).not.toBeChecked();

    rerender(<DomainDiscoverySwitch {...createProps({ checked: true })} />);
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('reports the new value for the domain when flipped', async () => {
    const user = userEvent.setup();
    const props = createProps();
    renderWithProviders(<DomainDiscoverySwitch {...props} />);

    await user.click(screen.getByRole('switch'));

    expect(props.onToggle).toHaveBeenCalledWith(props.domain, true);
  });

  it('does not trigger the row click when used', async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    renderWithProviders(
      <div onClick={onRowClick}>
        <DomainDiscoverySwitch {...createProps()} />
      </div>,
    );

    await user.click(screen.getByRole('switch'));

    expect(onRowClick).not.toHaveBeenCalled();
  });

  it('is disabled for a domain that is not verified yet', async () => {
    const user = userEvent.setup();
    const props = createProps({ domain: createMockDomain({ status: 'pending' }) });
    renderWithProviders(<DomainDiscoverySwitch {...props} />);

    expect(screen.getByRole('switch')).toBeDisabled();

    await user.hover(screen.getByRole('switch').parentElement!);
    await waitFor(() => {
      expect(screen.getByRole('tooltip', { hidden: true })).toHaveTextContent(
        'domain_table.table.discovery.unverified_tooltip',
      );
    });
  });

  it('is disabled when the policy locks the value', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DomainDiscoverySwitch {...createProps({ isLocked: true })} />);

    expect(screen.getByRole('switch')).toBeDisabled();

    await user.hover(screen.getByRole('switch').parentElement!);
    await waitFor(() => {
      expect(screen.getByRole('tooltip', { hidden: true })).toHaveTextContent(
        'domain_table.table.discovery.locked_tooltip',
      );
    });
  });

  it('is disabled without permission and says so', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DomainDiscoverySwitch {...createProps({ canChange: false })} />);

    expect(screen.getByRole('switch')).toBeDisabled();

    await user.hover(screen.getByRole('switch').parentElement!);
    await waitFor(() => {
      expect(screen.getByRole('tooltip', { hidden: true })).toHaveTextContent(
        'domain_table.table.discovery.permission_tooltip',
      );
    });
  });

  it('shows a spinner instead of the switch while the row is updating', () => {
    renderWithProviders(<DomainDiscoverySwitch {...createProps({ isUpdating: true })} />);

    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  });

  describe('accessibility', () => {
    it('names the switch after the domain it controls', () => {
      renderWithProviders(<DomainDiscoverySwitch {...createProps()} />);

      expect(
        screen.getByRole('switch', { name: 'domain_table.table.discovery.switch_label' }),
      ).toBeInTheDocument();
    });

    it.each([
      ['locked', { isLocked: true }, 'domain_table.table.discovery.locked_tooltip'],
      ['not permitted', { canChange: false }, 'domain_table.table.discovery.permission_tooltip'],
      [
        'unverified',
        { domain: createMockDomain({ status: 'pending' }) },
        'domain_table.table.discovery.unverified_tooltip',
      ],
    ])('describes why the switch is disabled when %s', (_case, overrides, reason) => {
      renderWithProviders(<DomainDiscoverySwitch {...createProps(overrides)} />);

      expect(screen.getByRole('switch')).toHaveAccessibleDescription(reason);
    });

    it('lets keyboard users reach and see the reason a switch is disabled', async () => {
      const user = userEvent.setup();
      renderWithProviders(<DomainDiscoverySwitch {...createProps({ isLocked: true })} />);

      await user.tab();

      const trigger = screen.getByRole('switch').parentElement!;
      expect(trigger).toHaveFocus();
      expect(trigger).toHaveClass('focus-visible:ring-4');
      expect(
        await screen.findAllByText('domain_table.table.discovery.locked_tooltip'),
      ).not.toHaveLength(0);
    });

    it('adds no tab stop around a usable switch', async () => {
      const user = userEvent.setup();
      renderWithProviders(<DomainDiscoverySwitch {...createProps()} />);

      expect(screen.getByRole('switch').parentElement).not.toHaveAttribute('tabindex');
      await user.tab();
      expect(screen.getByRole('switch')).toHaveFocus();
    });

    it('has no description when the switch is usable', () => {
      renderWithProviders(<DomainDiscoverySwitch {...createProps()} />);

      expect(screen.getByRole('switch')).not.toHaveAttribute('aria-describedby');
    });

    it('announces the updating state', () => {
      renderWithProviders(<DomainDiscoverySwitch {...createProps({ isUpdating: true })} />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });
});
