import { describe, expect, it } from 'vitest';

import { memberListResponseSchema, memberSchema } from '../member-schema';

describe('Member Schema', () => {
  describe('memberSchema', () => {
    it('should accept a member with only the required user_id field', () => {
      const result = memberSchema.safeParse({ user_id: 'auth0|123' });

      expect(result.success).toBe(true);
    });

    it('should accept a member with all supported fields', () => {
      const result = memberSchema.safeParse({
        user_id: 'auth0|123',
        roles: [
          { id: 'rol_admin', name: 'Admin' },
          { id: 'rol_viewer', name: 'Viewer' },
        ],
        email: 'member@example.com',
        name: 'Ada Lovelace',
        given_name: 'Ada',
        family_name: 'Lovelace',
        nickname: 'ada',
        updated_at: '2026-05-18T10:00:00.000Z',
        created_at: '2026-05-10T10:00:00.000Z',
        last_login: '2026-05-17T10:00:00.000Z',
      });

      expect(result.success).toBe(true);
    });

    it('should reject a member when user_id is missing', () => {
      const result = memberSchema.safeParse({
        email: 'member@example.com',
      });

      expect(result.success).toBe(false);
      if (!result.success && result.error?.errors[0]) {
        expect(result.error.errors[0].path).toEqual(['user_id']);
      }
    });

    it('should reject a member when user_id is not a string', () => {
      const result = memberSchema.safeParse({ user_id: 12345 });

      expect(result.success).toBe(false);
      if (!result.success && result.error?.errors[0]) {
        expect(result.error.errors[0].path).toEqual(['user_id']);
      }
    });

    describe.each([
      { input: 'member@example.com', shouldPass: true, description: 'valid email' },
      { input: 'user+tag@example.com', shouldPass: true, description: 'email with plus tag' },
      { input: undefined, shouldPass: true, description: 'undefined optional email' },
      { input: '', shouldPass: false, description: 'empty string' },
      { input: 'invalid-email', shouldPass: false, description: 'invalid email format' },
      { input: 'user@', shouldPass: false, description: 'missing domain' },
    ])('when email is $input ($description)', ({ input, shouldPass }) => {
      it(`should ${shouldPass ? 'accept' : 'reject'} the member`, () => {
        const result = memberSchema.safeParse({
          user_id: 'auth0|123',
          email: input,
        });

        expect(result.success).toBe(shouldPass);
      });
    });

    it('should accept a member when roles are omitted', () => {
      const result = memberSchema.safeParse({ user_id: 'auth0|123' });

      expect(result.success).toBe(true);
    });

    it('should accept a member with an empty roles array', () => {
      const result = memberSchema.safeParse({
        user_id: 'auth0|123',
        roles: [],
      });

      expect(result.success).toBe(true);
    });

    it('should reject a member when a role is missing id', () => {
      const result = memberSchema.safeParse({
        user_id: 'auth0|123',
        roles: [{ name: 'Admin' }],
      });

      expect(result.success).toBe(false);
      if (!result.success && result.error?.errors[0]) {
        expect(result.error.errors[0].path).toEqual(['roles', 0, 'id']);
      }
    });

    it('should reject a member when a role is missing name', () => {
      const result = memberSchema.safeParse({
        user_id: 'auth0|123',
        roles: [{ id: 'rol_admin' }],
      });

      expect(result.success).toBe(false);
      if (!result.success && result.error?.errors[0]) {
        expect(result.error.errors[0].path).toEqual(['roles', 0, 'name']);
      }
    });

    it('should reject a member when roles is not an array', () => {
      const result = memberSchema.safeParse({
        user_id: 'auth0|123',
        roles: { id: 'rol_admin', name: 'Admin' },
      });

      expect(result.success).toBe(false);
      if (!result.success && result.error?.errors[0]) {
        expect(result.error.errors[0].path).toEqual(['roles']);
      }
    });
  });

  describe('memberListResponseSchema', () => {
    it('should accept a valid member list response', () => {
      const result = memberListResponseSchema.safeParse({
        members: [
          {
            user_id: 'auth0|123',
            email: 'member@example.com',
            roles: [{ id: 'rol_admin', name: 'Admin' }],
          },
          {
            user_id: 'auth0|456',
            name: 'Grace Hopper',
          },
        ],
        total: 2,
        start: 0,
        limit: 10,
      });

      expect(result.success).toBe(true);
    });

    it('should accept a response with only members', () => {
      const result = memberListResponseSchema.safeParse({
        members: [{ user_id: 'auth0|123' }],
      });

      expect(result.success).toBe(true);
    });

    it('should reject a response when members is missing', () => {
      const result = memberListResponseSchema.safeParse({
        total: 1,
      });

      expect(result.success).toBe(false);
      if (!result.success && result.error?.errors[0]) {
        expect(result.error.errors[0].path).toEqual(['members']);
      }
    });

    it('should reject a response when members is not an array', () => {
      const result = memberListResponseSchema.safeParse({
        members: { user_id: 'auth0|123' },
      });

      expect(result.success).toBe(false);
      if (!result.success && result.error?.errors[0]) {
        expect(result.error.errors[0].path).toEqual(['members']);
      }
    });

    it('should reject a response when a member entry is invalid', () => {
      const result = memberListResponseSchema.safeParse({
        members: [{ user_id: 'auth0|123' }, { email: 'missing-user-id@example.com' }],
      });

      expect(result.success).toBe(false);
      if (!result.success && result.error?.errors[0]) {
        expect(result.error.errors[0].path).toEqual(['members', 1, 'user_id']);
      }
    });

    describe.each([
      { field: 'total', value: '2' },
      { field: 'start', value: '0' },
      { field: 'limit', value: '10' },
    ])('when $field is not a number', ({ field, value }) => {
      it('should reject the response', () => {
        const result = memberListResponseSchema.safeParse({
          members: [{ user_id: 'auth0|123' }],
          [field]: value,
        });

        expect(result.success).toBe(false);
      });
    });
  });
});
