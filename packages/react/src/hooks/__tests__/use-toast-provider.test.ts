import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useToastProvider } from '@/hooks/shared/use-toast-provider';
import { DEFAULT_TOAST_SETTINGS, type ToastSettings } from '@/types/toast-types';

// ===== Mock packages =====

const { mockSetGlobalToastSettings } = vi.hoisted(() => ({
  mockSetGlobalToastSettings: vi.fn(),
}));

vi.mock('@/components/ui/toast', () => ({
  setGlobalToastSettings: mockSetGlobalToastSettings,
}));

// ===== Tests =====

describe('useToastProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when no toast settings are provided', () => {
    it('should return default toast settings with sonner provider', () => {
      const { result } = renderHook(() => useToastProvider());

      expect(result.current).toEqual(DEFAULT_TOAST_SETTINGS);
    });

    it('should call setGlobalToastSettings with default settings on mount', () => {
      renderHook(() => useToastProvider());

      expect(mockSetGlobalToastSettings).toHaveBeenCalledWith(DEFAULT_TOAST_SETTINGS);
    });
  });

  describe('when sonner toast settings are provided', () => {
    it('should merge custom sonner settings with defaults', () => {
      const customSettings: ToastSettings = {
        provider: 'sonner',
        settings: {
          position: 'bottom-left',
          duration: 5000,
        },
      };

      const { result } = renderHook(() => useToastProvider(customSettings));

      expect(result.current).toEqual({
        provider: 'sonner',
        settings: {
          position: 'bottom-left',
          duration: 5000,
          closeButton: true, // Default gets merged in
        },
      });
    });

    it('should call setGlobalToastSettings with the merged sonner settings', () => {
      const customSettings: ToastSettings = {
        provider: 'sonner',
        settings: {
          position: 'top-center',
          closeButton: true,
        },
      };

      renderHook(() => useToastProvider(customSettings));

      expect(mockSetGlobalToastSettings).toHaveBeenCalledWith(customSettings);
    });
  });

  describe('when custom provider settings are provided', () => {
    it('should handle custom provider with custom methods', () => {
      const mockSuccess = vi.fn((_message: string) => {});
      const mockError = vi.fn((_message: string) => {});

      const customSettings: ToastSettings = {
        provider: 'custom',
        methods: {
          success: mockSuccess,
          error: mockError,
        },
      };

      const { result } = renderHook(() => useToastProvider(customSettings));

      expect(result.current.provider).toBe('custom');
      expect((result.current as Extract<ToastSettings, { provider: 'custom' }>).methods).toEqual(
        customSettings.methods,
      );
    });
  });

  describe('memoization behavior', () => {
    it('should memoize settings and only update when dependencies change', () => {
      const customSettings: ToastSettings = {
        provider: 'sonner',
        settings: {
          position: 'top-left',
        },
      };

      const { result, rerender } = renderHook(
        ({ settings }: { settings?: ToastSettings }) => useToastProvider(settings),
        {
          initialProps: { settings: customSettings },
        },
      );

      const firstResult = result.current;

      // Rerender with same props
      rerender({ settings: customSettings });

      // Result should be the same object (referential equality)
      expect(result.current).toBe(firstResult);
    });

    it('should create new merged settings object when toast settings change', () => {
      const initialSettings: ToastSettings = {
        provider: 'sonner',
        settings: {
          position: 'top-left',
        },
      };

      const { result, rerender } = renderHook(
        ({ settings }: { settings?: ToastSettings }) => useToastProvider(settings),
        {
          initialProps: { settings: initialSettings },
        },
      );

      const firstResult = result.current;

      // Update settings
      const newSettings: ToastSettings = {
        provider: 'sonner',
        settings: {
          position: 'bottom-right',
        },
      };

      rerender({ settings: newSettings });

      // Result should be different
      expect(result.current).not.toBe(firstResult);
      if (result.current.provider === 'sonner') {
        expect(result.current.settings?.position).toBe('bottom-right');
      }
    });
  });

  describe('global state updates', () => {
    it('should update global state when settings change', () => {
      const initialSettings: ToastSettings = {
        provider: 'sonner',
        settings: {
          position: 'top-left',
        },
      };

      const { rerender } = renderHook(
        ({ settings }: { settings?: ToastSettings }) => useToastProvider(settings),
        {
          initialProps: { settings: initialSettings },
        },
      );

      expect(mockSetGlobalToastSettings).toHaveBeenCalledTimes(1);

      // Update settings
      const newSettings: ToastSettings = {
        provider: 'sonner',
        settings: {
          position: 'bottom-center',
        },
      };

      rerender({ settings: newSettings });

      expect(mockSetGlobalToastSettings).toHaveBeenCalledTimes(2);
      expect(mockSetGlobalToastSettings).toHaveBeenCalledWith({
        provider: 'sonner',
        settings: {
          position: 'bottom-center',
          closeButton: true, // Default gets merged in
        },
      });
    });

    it('should not update global state when settings remain the same', () => {
      const settings: ToastSettings = {
        provider: 'sonner',
        settings: {
          position: 'top-right',
        },
      };

      const { rerender } = renderHook(
        ({ settings }: { settings?: ToastSettings }) => useToastProvider(settings),
        {
          initialProps: { settings },
        },
      );

      expect(mockSetGlobalToastSettings).toHaveBeenCalledTimes(1);

      // Rerender with same settings
      rerender({ settings });

      // Should still only be called once because memoized value didn't change
      expect(mockSetGlobalToastSettings).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases', () => {
    it('should handle undefined toast settings gracefully', () => {
      const { result } = renderHook(() => useToastProvider(undefined));

      expect(result.current).toEqual(DEFAULT_TOAST_SETTINGS);
    });

    it('should handle empty sonner settings by merging with defaults', () => {
      const settings: ToastSettings = {
        provider: 'sonner',
        settings: {},
      };

      const { result } = renderHook(() => useToastProvider(settings));

      expect(result.current).toEqual({
        provider: 'sonner',
        settings: {
          position: 'top-right', // Default position gets merged in
          closeButton: true, // Default close button gets merged in
        },
      });
    });

    it('should preserve default values when only one sonner property is overridden', () => {
      const settings: ToastSettings = {
        provider: 'sonner',
        settings: {
          duration: 3000,
        },
      };

      const { result } = renderHook(() => useToastProvider(settings));

      expect(result.current).toEqual({
        provider: 'sonner',
        settings: {
          duration: 3000,
          position: 'top-right', // Default position gets merged in
          closeButton: true, // Default close button gets merged in
        },
      });
    });
  });

  describe('default settings verification', () => {
    it('should use top-right as default position for sonner provider', () => {
      const { result } = renderHook(() => useToastProvider());

      if (result.current.provider === 'sonner') {
        expect(result.current.settings?.position).toBe('top-right');
      }
    });

    it('should enable close button by default for better UX', () => {
      const { result } = renderHook(() => useToastProvider());

      if (result.current.provider === 'sonner') {
        expect(result.current.settings?.closeButton).toBe(true);
      }
    });

    it('should use sonner as default provider', () => {
      const { result } = renderHook(() => useToastProvider());

      expect(result.current.provider).toBe('sonner');
    });
  });
});
