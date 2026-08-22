/**
 * Custom message type definitions for the shared `common` namespace.
 * @module shared-types
 * @internal
 */

export type CustomMessageType = {
  error?: {
    forbidden?: string;
  };
};

export interface SharedMessages {
  common?: CustomMessageType;
}
