/**
 * MFA step-up customization types.
 * @module mfa-step-up-types
 */

import type {
  MfaFlowConfig,
  MfaStepUpMachine,
  MfaStepUpSnapshot,
} from '@auth0/universal-components-core';
import type { ComponentType } from 'react';

export interface MfaStepScreenProps {
  snapshot: MfaStepUpSnapshot;
  machine: MfaStepUpMachine;
}

export type MfaStepScreen = ComponentType<MfaStepScreenProps>;

export interface MfaStepUpClasses {
  'MfaStepUp-dialogContent'?: string;
  'MfaStepUp-header'?: string;
  'MfaStepUp-title'?: string;
  'MfaStepUp-description'?: string;
  'MfaStepUp-actions'?: string;
  'MfaStepUp-primaryButton'?: string;
  'MfaStepUp-secondaryButton'?: string;
  'MfaStepUp-link'?: string;
  'MfaStepUp-field'?: string;
  'MfaStepUp-methodGroup'?: string;
  'MfaStepUp-methodGroupTitle'?: string;
  'MfaStepUp-card'?: string;
  'MfaStepUp-qrCode'?: string;
  'MfaStepUp-storeCard'?: string;
  'MfaStepUp-recoveryCode'?: string;
  'MfaStepUp-statusIcon'?: string;
  'MfaStepUp-pushStatus'?: string;
  'MfaStepUp-message'?: string;
  'MfaStepUp-loading'?: string;
}

export type MfaActionsAlign = 'left' | 'center' | 'right';

/** Hide or add steps of the MFA step-up flow, and bring the screens for them. */
export interface MfaStepUpSettings {
  flow?: MfaFlowConfig;
  /** Screens for added steps by id, or replacements for built-in steps by path. */
  screens?: Partial<Record<string, MfaStepScreen>>;
  /** Where the buttons at the bottom of the built-in screens sit. Defaults to `right`. */
  actionsAlign?: MfaActionsAlign;
  classes?: MfaStepUpClasses;
}
