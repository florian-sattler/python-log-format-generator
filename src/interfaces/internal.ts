import type { ValueKind } from '@/engine/types';

export type { FieldSpec, FormattedItem, Style, ValueKind, LogRecord } from '@/engine/types';

/** A supported log-record token: its description and intrinsic value kind. */
export interface TemplateItem {
  description: string;
  kind: ValueKind;
}

/** A quick-insert literal-text snippet shown in the UI. */
export interface TextItem {
  description: string;
  text: string;
}

export enum EditType {
  Cancle = 1,
  Submit,
  Delete,
}

export interface EditResult {
  type: EditType;
  payload: import('@/engine/types').FormattedItem | null;
}
