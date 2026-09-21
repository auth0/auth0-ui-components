/**
 * Custom message type definitions for the shared `common` namespace.
 * @module shared-types
 * @internal
 */

export type CustomMessageType = {
  last_updated?: string;
  refresh?: string;
  time?: {
    never?: string;
    just_now?: string;
    ago_template?: string;
    second?: string;
    seconds?: string;
    minute?: string;
    minutes?: string;
    hour?: string;
    hours?: string;
    day?: string;
    days?: string;
    week?: string;
    weeks?: string;
    month?: string;
    months?: string;
    year?: string;
    years?: string;
  };
  error?: {
    forbidden?: string;
  };
};

export interface SharedMessages {
  common?: CustomMessageType;
}
