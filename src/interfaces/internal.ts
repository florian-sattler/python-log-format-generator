export type ItemType = 'string' | 'float' | 'integer' | 'usertext';

export interface FormatItem {
  value: string;
  description: string;
  type: ItemType;
}

export interface FormatInfo {
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
