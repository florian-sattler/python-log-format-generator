/**
 * Serialize {@link FormattedItem}s back into a format string for a given
 * {@link Style}. Each style down-projects the style-neutral {@link FieldSpec}
 * to the syntax that style supports; it is the inverse of `parse`.
 */

import type { FieldSpec, FormattedItem, Style } from './types';
import { defaultPercentConv } from './spec/printf';
import { braceSpecToString } from './spec/formatspec';

function percentField(item: FormattedItem): string {
  const spec = item.spec;
  let flags = '';
  if (spec.align === '<') flags += '-';
  if (spec.sign === '+') flags += '+';
  else if (spec.sign === ' ') flags += ' ';
  if (spec.alt) flags += '#';
  if (spec.zero && spec.align !== '<') flags += '0';

  const width = spec.width ? String(spec.width) : '';
  const precision = spec.precision !== undefined ? '.' + spec.precision : '';
  const conv = spec.conv || defaultPercentConv(item.kind);
  return `%(${item.value})${flags}${width}${precision}${conv}`;
}

function serializePercent(items: FormattedItem[]): string {
  return items
    .map((item) => (item.isText ? item.value.replace(/%/g, '%%') : percentField(item)))
    .join('');
}

function braceField(item: FormattedItem): string {
  const convert = item.spec.convert ? `!${item.spec.convert}` : '';
  const specStr = braceSpecToString(item.spec);
  return `{${item.value}${convert}${specStr ? ':' + specStr : ''}}`;
}

function serializeBrace(items: FormattedItem[]): string {
  return items
    .map((item) => (item.isText ? item.value.replace(/\{/g, '{{').replace(/\}/g, '}}') : braceField(item)))
    .join('');
}

function serializeTemplate(items: FormattedItem[]): string {
  // The braced form `${name}` is always safe regardless of following characters.
  return items
    .map((item) => (item.isText ? item.value.split('$').join('$$') : `\${${item.value}}`))
    .join('');
}

/** Serialize items into a format string of the given style. */
export function serialize(items: FormattedItem[], style: Style = '%'): string {
  switch (style) {
    case '%':
      return serializePercent(items);
    case '{':
      return serializeBrace(items);
    case '$':
      return serializeTemplate(items);
    default:
      throw new Error(`Style '${style}' serialization not yet implemented`);
  }
}

export type { FieldSpec };
