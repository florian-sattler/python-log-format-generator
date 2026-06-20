/**
 * Pure render tests for behaviour not covered by the oracle matrix.
 */

import { describe, expect, it } from 'vitest';
import { parseFormat } from '../parse';
import { renderRecord } from '../render';
import { FormatValueError } from '../types';

describe('renderRecord — missing field', () => {
  for (const style of ['%', '{', '$'] as const) {
    it(`raises for a field absent from the record (${style} style)`, () => {
      const items = parseFormat(style === '%' ? '%(name)s' : style === '{' ? '{name}' : '$name', style);
      // Python raises KeyError for `fmt % {}` / `fmt.format()` / Template.substitute({}).
      expect(() => renderRecord(items, {}, style)).toThrow(FormatValueError);
    });
  }

  it('still renders when the field is present', () => {
    const items = parseFormat('%(name)s', '%');
    expect(renderRecord(items, { name: 'root' }, '%')).toBe('root');
  });
});
