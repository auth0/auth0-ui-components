import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  errorReasonForStatus,
  getPopupFeatures,
  isHttpsUrl,
} from '@/lib/utils/my-organization/idp-management/sso-provider-test-utils';

describe('sso-provider-test-utils', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getPopupFeatures', () => {
    it('should center the popup on the parent window', () => {
      vi.stubGlobal('screenX', 100);
      vi.stubGlobal('screenY', 50);
      vi.stubGlobal('outerWidth', 1500);
      vi.stubGlobal('outerHeight', 1000);

      expect(getPopupFeatures()).toBe('popup=yes,width=500,height=700,left=600,top=200');
    });

    it('should not position the popup off screen', () => {
      vi.stubGlobal('screenX', 0);
      vi.stubGlobal('screenY', 0);
      vi.stubGlobal('outerWidth', 300);
      vi.stubGlobal('outerHeight', 300);

      expect(getPopupFeatures()).toBe('popup=yes,width=500,height=700,left=0,top=0');
    });
  });

  describe('errorReasonForStatus', () => {
    it.each([
      [403, 'forbidden'],
      [404, 'expired'],
      [500, 'provider'],
      [undefined, 'provider'],
    ])('should map %s to %s', (status, reason) => {
      expect(errorReasonForStatus(status)).toBe(reason);
    });
  });

  describe('isHttpsUrl', () => {
    it('should accept https URLs', () => {
      expect(isHttpsUrl('https://example.auth0.com/try?token=abc')).toBe(true);
    });

    it.each(['http://example.com', 'javascript:alert(1)', 'not a url', ''])(
      'should reject %s',
      (url) => {
        expect(isHttpsUrl(url)).toBe(false);
      },
    );
  });
});
