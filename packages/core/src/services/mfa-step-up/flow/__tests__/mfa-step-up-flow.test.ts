import { describe, expect, it } from 'vitest';

import { createMfaFlow } from '../mfa-step-up-flow';
import type { MfaFlowFacts } from '../mfa-step-up-flow-types';

const facts = (patch: Partial<MfaFlowFacts> = {}): MfaFlowFacts => ({
  optionCount: 1,
  enrollment: { hasRecoveryCodes: false },
  isVerified: false,
  round: 1,
  hasNewRecoveryCode: false,
  ...patch,
});

const visiblePaths = (flow: ReturnType<typeof createMfaFlow>, f: MfaFlowFacts) =>
  flow.filter((s) => s.isVisible(f)).map((s) => s.path);

describe('createMfaFlow', () => {
  describe('default flow', () => {
    it.each([
      ['otp', ['list', 'enroll.qr', 'enroll.verify']],
      ['push', ['list', 'enroll.install', 'enroll.qr']],
      ['sms', ['list', 'enroll.contact', 'enroll.verify']],
      ['email', ['list', 'enroll.contact', 'enroll.verify']],
    ])('enroll %s', (factor, expected) => {
      expect(visiblePaths(createMfaFlow(), facts({ mode: 'enroll', factor }))).toEqual(expected);
    });

    it('adds recovery when the enrollment returned codes', () => {
      const f = facts({ mode: 'enroll', factor: 'otp', enrollment: { hasRecoveryCodes: true } });
      expect(visiblePaths(createMfaFlow(), f)).toEqual([
        'list',
        'enroll.qr',
        'enroll.verify',
        'enroll.recovery',
      ]);
    });

    it('challenge: pick, confirm, then answer', () => {
      expect(visiblePaths(createMfaFlow(), facts({ mode: 'challenge', factor: 'otp' }))).toEqual([
        'list',
        'challenge.confirm',
        'challenge',
      ]);
    });
  });

  describe('the new recovery code', () => {
    it('is shown after a challenge once a new code came back, and only then', () => {
      const flow = createMfaFlow();

      expect(visiblePaths(flow, facts({ mode: 'challenge', factor: 'recovery-code' }))).toEqual([
        'list',
        'challenge.confirm',
        'challenge',
      ]);
      expect(
        visiblePaths(
          flow,
          facts({ mode: 'challenge', factor: 'recovery-code', hasNewRecoveryCode: true }),
        ),
      ).toEqual(['list', 'challenge.confirm', 'challenge', 'challenge.newRecoveryCode']);
    });

    it('cannot be hidden, because the user has to see the code', () => {
      expect(() => createMfaFlow({ hide: { 'challenge.newRecoveryCode': true } as never })).toThrow(
        /cannot be hidden/,
      );
    });
  });

  describe('hide', () => {
    it('hides a step with a boolean', () => {
      const flow = createMfaFlow({ hide: { 'enroll.install': true } });
      expect(visiblePaths(flow, facts({ mode: 'enroll', factor: 'push' }))).toEqual([
        'list',
        'enroll.qr',
      ]);
    });

    it('hides a step with a condition', () => {
      const flow = createMfaFlow({ hide: { 'enroll.install': (f) => f.factor === 'push' } });
      const push = facts({ mode: 'enroll', factor: 'push' });
      expect(visiblePaths(flow, push)).not.toContain('enroll.install');
    });

    it('skips the confirm step when it is hidden', () => {
      const flow = createMfaFlow({ hide: { 'challenge.confirm': true } });

      expect(visiblePaths(flow, facts({ mode: 'challenge', factor: 'otp' }))).toEqual([
        'list',
        'challenge',
      ]);
    });

    it('skips the list only with one option, and only when asked', () => {
      const skipping = createMfaFlow({ skipListForSingleOption: true });
      expect(visiblePaths(skipping, facts({ optionCount: 1 }))).not.toContain('list');
      expect(visiblePaths(skipping, facts({ optionCount: 2 }))).toContain('list');
      expect(visiblePaths(createMfaFlow(), facts({ optionCount: 1 }))).toContain('list');
    });

    it.each(['enroll.qr', 'challenge', 'enroll.verify', 'list'])('refuses to hide %s', (path) => {
      expect(() => createMfaFlow({ hide: { [path]: true } as never })).toThrow(/cannot be hidden/);
    });
  });

  describe('add', () => {
    const paths = (config: Parameters<typeof createMfaFlow>[0]) =>
      createMfaFlow(config).map((s) => s.path);

    it('runs added steps last, in the order they were added', () => {
      expect(paths({ add: [{ id: 'consent' }, { id: 'survey' }] }).slice(-2)).toEqual([
        'consent',
        'survey',
      ]);
    });

    it('shows an added step on every path once an option is picked, but not before', () => {
      const flow = createMfaFlow({ add: [{ id: 'consent' }] });
      expect(visiblePaths(flow, facts({ mode: 'enroll', factor: 'otp' }))).toContain('consent');
      expect(visiblePaths(flow, facts({ mode: 'challenge', factor: 'otp' }))).toContain('consent');
      expect(visiblePaths(flow, facts())).not.toContain('consent');
    });

    it('applies the step condition', () => {
      const flow = createMfaFlow({ add: [{ id: 'extra', when: (f) => f.factor === 'sms' }] });
      expect(visiblePaths(flow, facts({ mode: 'enroll', factor: 'otp' }))).not.toContain('extra');
      expect(visiblePaths(flow, facts({ mode: 'enroll', factor: 'sms' }))).toContain('extra');
    });

    it('accepts an id with a dot', () => {
      expect(paths({ add: [{ id: 'billing.consent' }] }).at(-1)).toBe('billing.consent');
    });

    it.each([
      ['an empty id', { add: [{ id: '' }] }],
      ['a duplicate id', { add: [{ id: 'a' }, { id: 'a' }] }],
      ['the id of a built-in step', { add: [{ id: 'challenge' }] }],
    ])('throws for %s', (_name, config) => {
      expect(() => createMfaFlow(config)).toThrow(/MFA flow/);
    });
  });
});
