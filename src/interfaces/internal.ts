export type ItemType = 'string' | 'float' | 'integer' | 'usertext';

export interface FormatItem {
  description: string;
  type: string;
}

export interface FormatInfo {
  value: string;
  padding: number;
}

export interface FormatItemFormatted extends FormatItem, FormatInfo {}

export enum EditType {
  Cancle = 1,
  Submit,
  Delete,
}

export interface EditResult {
  type: EditType;
  payload: FormatItemFormatted | null;
}
