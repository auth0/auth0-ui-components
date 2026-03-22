import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { useGateKeeperContext } from '@/providers/gate-keeper-context';

describe('useGateKeeperContext', () => {
  it('should throw when used outside a GateKeeperProvider', () => {
    expect(() => {
      renderHook(() => useGateKeeperContext());
    }).toThrow('useGateKeeperContext must be used within a GateKeeperProvider');
  });
});
