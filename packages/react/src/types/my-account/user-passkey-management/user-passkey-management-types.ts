/**
 * Passkey management types.
 * @module user-passkey-management-types
 */

import type {
  BlockComponentSharedProps,
  ComponentAction,
  UserPasskeyManagementMessages,
  UserPasskeyManagementRevokeModalMessages,
  SharedComponentProps,
} from '@auth0/universal-components-core';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import type * as React from 'react';

import type { ActionPartProps } from '@/types/composability-types';

/**
 * Props of the revoke confirmation dialog.
 * @deprecated The dialog is now `UserPasskeyManagement.RevokeDialog`, composed from public
 * parts and driven by the model. This type is no longer used by the component.
 */
export interface PasskeyActionModalProps
  extends SharedComponentProps<
    UserPasskeyManagementRevokeModalMessages,
    UserPasskeyManagementClasses
  > {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  onConfirm: () => Promise<void>;
  name?: string;
}

export interface Passkey {
  id: string;
  name?: string;
  createdAt?: string;
  lastUsedAt?: string;
  deviceInfo?: string;
}

export interface UserPasskeyManagementClasses {
  'UserPasskeyManagement-root'?: string;
  'UserPasskeyManagement-item'?: string;
  'PasskeyActionModal-modalContent'?: string;
}

export interface UserPasskeyManagementProps
  extends BlockComponentSharedProps<UserPasskeyManagementMessages, UserPasskeyManagementClasses> {
  addAction?: ComponentAction<void>;
  revokeAction?: ComponentAction<Passkey>;
  onFetch?: () => void;
}

export interface UserPasskeyManagementViewProps {
  passkeys: Passkey[];
  isRevoking: boolean;
  isEnrolling: boolean;
  styling: UserPasskeyManagementProps['styling'];
  customMessages: UserPasskeyManagementProps['customMessages'];
  hideHeader: boolean;
  disableAdd: boolean;
  disableRevoke: boolean;
  isRevokeModalOpen: boolean;
  currentPasskey: Passkey | null;
  handleAddPasskey: () => Promise<void>;
  handleRevokePasskey: (passkey: Passkey) => void;
  handleConfirmRevoke: () => Promise<void>;
  setIsRevokeModalOpen: (open: boolean) => void;
}

export interface UseUserPasskeyOptions {
  customMessages?: UserPasskeyManagementProps['customMessages'];
  addAction?: ComponentAction<void>;
  revokeAction?: ComponentAction<Passkey>;
  onFetch?: () => void;
}

export interface UseUserPasskeyReturn {
  passkeys: Passkey[];
  isLoading: boolean;
  isEnrolling: boolean;
  isRevoking: boolean;
  disableAdd: boolean;
  disableRevoke: boolean;
  readOnly: boolean;
  isRevokeModalOpen: boolean;
  currentPasskey: Passkey | null;
  setIsRevokeModalOpen: (open: boolean) => void;
  handleAddPasskey: () => Promise<void>;
  handleRevokePasskey: (passkey: Passkey) => void;
  handleConfirmRevoke: () => Promise<void>;
}

/** State and command of one action, shared by action parts and headless hosts. */
export interface PasskeyActionModel {
  /** The action is not offered and its part renders nothing. */
  hidden: boolean;
  /** The action is shown but cannot be triggered. */
  disabled: boolean;
  /** The action's command is running. */
  pending: boolean;
  /** Runs the action. Does nothing while hidden, disabled or pending. */
  onClick: () => void;
}

/** One passkey row, as rendered by `UserPasskeyManagement.Item`. */
export interface PasskeyItemModel {
  passkey: Passkey;
  revokeAction: PasskeyActionModel;
}

/**
 * Headless model for passkey management.
 *
 * A host that renders its own UI must honour `hidden`/`disabled`/`pending` on each
 * action and render a confirmation from `isRevokeModalOpen` / `currentPasskey`
 * before calling `handleConfirmRevoke`.
 */
export interface UserPasskeyModel extends UseUserPasskeyReturn {
  hasPasskeys: boolean;
  /** Props for the add action. */
  getAddActionProps: () => PasskeyActionModel;
  /** Props for one passkey row. */
  getItemProps: (passkey: Passkey) => PasskeyItemModel;
}

/** Options for `useUserPasskeyModel`. */
export type UseUserPasskeyModelOptions = UseUserPasskeyOptions;

/** Value read by every `UserPasskeyManagement` part. */
export interface UserPasskeyManagementContextValue {
  model: UserPasskeyModel;
  customMessages: NonNullable<UserPasskeyManagementProps['customMessages']>;
  styling: NonNullable<UserPasskeyManagementProps['styling']>;
  classes: UserPasskeyManagementClasses;
  hideHeader: boolean;
}

/** Value read by parts inside `UserPasskeyManagement.Item`. */
export interface UserPasskeyItemContextValue extends PasskeyItemModel {
  /** Id of the rendered name, used to describe the row's actions. */
  nameId: string;
}

/** Props for `UserPasskeyManagement.Root`. */
export interface UserPasskeyManagementRootProps extends UserPasskeyManagementProps {
  children?: React.ReactNode;
  /**
   * Mount the default revoke dialog. Set to `false` to render
   * `UserPasskeyManagement.RevokeDialog` yourself, with the default content or with
   * parts you arrange. Defaults to `true`.
   */
  mountDialogs?: boolean;
}

/** Props for `UserPasskeyManagement.DefaultLayout`. */
export interface UserPasskeyManagementDefaultLayoutProps {
  /** Replaces the add action in the default layout, e.g. an `AddAction` with `render`. */
  addAction?: React.ReactNode;
  /** Replaces the default row, e.g. to swap the menu for inline actions. */
  renderItem?: (passkey: Passkey) => React.ReactNode;
}

/** Props for `UserPasskeyManagement.List`. */
export interface UserPasskeyManagementListProps {
  /** Renders each row. Defaults to `<UserPasskeyManagement.Item />`. */
  children?: (passkey: Passkey) => React.ReactNode;
  className?: string;
}

/** Props for parts that only take content. */
export interface UserPasskeyManagementChildrenProps {
  children?: React.ReactNode;
}

/** Props for parts that only take content and a class name. */
export interface UserPasskeyManagementPartProps {
  children?: React.ReactNode;
  className?: string;
}

/** Props for `UserPasskeyManagement.Header`. */
export interface UserPasskeyManagementHeaderProps extends UserPasskeyManagementPartProps {
  /** Text alignment of the default title and description. */
  align?: 'start' | 'center' | 'end';
}

/** Props for `UserPasskeyManagement.HeaderActions`. */
export interface UserPasskeyManagementHeaderActionsProps extends UserPasskeyManagementPartProps {
  /** Side the actions sit on from the `sm` breakpoint up. */
  align?: 'start' | 'end';
}

/**
 * Props for the action parts: `AddAction`, `RevokeAction`, `ItemMenuRevoke`,
 * `RevokeDialogCancel` and `RevokeDialogConfirm`.
 */
export type UserPasskeyManagementActionProps = ActionPartProps;

export interface UseUserPasskeyServiceResult {
  passkeysQuery: UseQueryResult<Passkey[]>;
  enrollMutation: UseMutationResult<boolean, Error, void>;
  revokeMutation: UseMutationResult<void, Error, string>;
}
