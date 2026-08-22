/**
 * Custom message type definitions for the shared `common` namespace.
 * @module common-types
 * @internal
 */

export interface CommonNamespaceMessages {
  error?: {
    forbidden?: string;
  };
}

export interface CommonMessages {
  common?: Partial<CommonNamespaceMessages>;
}
