import { describe, expect, it } from 'vitest';

import { getClientInfo, SDK_VERSION, TELEMETRY_NAME } from '../telemetry';

describe('telemetry', () => {
  describe('getClientInfo', () => {
    it('should return correct client info for proxy mode', () => {
      const result = getClientInfo(true);

      expect(result).toEqual({
        name: TELEMETRY_NAME,
        version: SDK_VERSION,
        env: {
          is_proxy_mode: 'true',
        },
      });
    });

    it('should return correct client info for SPA mode', () => {
      const result = getClientInfo(false);

      expect(result).toEqual({
        name: TELEMETRY_NAME,
        version: SDK_VERSION,
        env: {
          is_proxy_mode: 'false',
        },
      });
    });
  });

  describe('constants', () => {
    it('should have correct telemetry name', () => {
      expect(TELEMETRY_NAME).toBe('auth0-ui-components');
    });

    it('should have a valid version format', () => {
      expect(SDK_VERSION).toMatch(/^\d+\.\d+\.\d+/);
    });
  });
});
