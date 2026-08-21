/**
 * Generic scope-to-permission resolution shared by all gated modules.
 * @module permission-map
 * @internal
 */
import type { OauthScope } from './permission-types';
import { hasAllPermissions, hasAnyPermission } from './permission-utils';

export type ScopeRule = readonly OauthScope[] | { readonly any: readonly OauthScope[] };

export type PermissionSpec = Readonly<Record<string, ScopeRule>>;

export type ResolvedPermissions<TSpec extends PermissionSpec> = {
  readonly [K in keyof TSpec]: boolean;
};

export interface PermissionOptions {
  readOnly?: boolean;
}

export type PermissionResolver<TSpec extends PermissionSpec> = (
  userPermissions: readonly string[],
  options?: PermissionOptions,
) => ResolvedPermissions<TSpec>;

/**
 * Evaluate whether a single rule is satisfied.
 * @param rule - The rule to evaluate.
 * @param userPermissions - Granted scopes.
 * @param options - {@link PermissionOptions}
 * @returns `true` when the rule is satisfied.
 */
function evaluateRule(
  rule: ScopeRule,
  userPermissions: readonly string[],
  options: PermissionOptions,
): boolean {
  if (options.readOnly) return false;

  return 'any' in rule
    ? hasAnyPermission(userPermissions, rule.any)
    : hasAllPermissions(userPermissions, rule);
}

/**
 * Builds a resolver that turns granted scopes into a module's permission flags.
 * An array rule requires every scope; `{ any }` requires at least one.
 * @param spec - The module's permission declarations.
 * @returns A resolver over granted scopes and {@link PermissionOptions}.
 * @internal
 */
export function createPermissionResolver<TSpec extends PermissionSpec>(
  spec: TSpec,
): PermissionResolver<TSpec> {
  const rules = Object.entries(spec);

  return (userPermissions, options = {}) =>
    Object.fromEntries(
      rules.map(([permission, rule]) => [permission, evaluateRule(rule, userPermissions, options)]),
    ) as ResolvedPermissions<TSpec>;
}
