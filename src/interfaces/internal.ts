export type ItemType = 'string' | 'float' | 'integer' | 'usertext';

export interface TemplateItem {
  description: string;
  type: string;
}

export interface TextItem {
  description: string;
  text: string;
}

export interface FormattedItem extends TemplateItem {
  value: string;
  padding: number;
}

export enum EditType {
  Cancle = 1,
  Submit,
  Delete,
}

export interface EditResult {
  type: EditType;
  payload: FormattedItem | null;
}
