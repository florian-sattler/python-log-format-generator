import { describe, expect, it } from 'vitest';
import { sanitizeSpec } from '../sanitize';
import type { FieldSpec } from '../types';

describe('sanitizeSpec', () => {
  it('drops everything for $-style', () => {
    const spec: FieldSpec = { width: 8, conv: 'd', align: '<', fill: '*' };
    expect(sanitizeSpec(spec, '$')).toEqual({});
  });

  it('strips fill/grouping/convert and non-% conversions for %-style', () => {
    const spec: FieldSpec = { width: 8, precision: 2, conv: 'b', fill: '*', grouping: ',', convert: 'r' };
    expect(sanitizeSpec(spec, '%')).toEqual({ width: 8, precision: 2 });
  });

  it('keeps left-justify but drops other alignments for %-style', () => {
    expect(sanitizeSpec({ align: '<', width: 4 }, '%')).toEqual({ align: '<', width: 4 });
    expect(sanitizeSpec({ align: '^', width: 4 }, '%')).toEqual({ width: 4 });
    expect(sanitizeSpec({ align: '=', width: 4 }, '%')).toEqual({ width: 4 });
  });

  it('preserves valid %-style formatting unchanged', () => {
    const spec: FieldSpec = { sign: '+', zero: true, alt: true, width: 8, precision: 3, conv: 'f' };
    expect(sanitizeSpec(spec, '%')).toEqual(spec);
  });

  it('drops %-only conversions (r/a) when moving to {}-style', () => {
    expect(sanitizeSpec({ conv: 'r', width: 10 }, '{')).toEqual({ width: 10 });
    expect(sanitizeSpec({ conv: 'a' }, '{')).toEqual({});
  });

  it('keeps {}-style-only features when staying in {}-style', () => {
    const spec: FieldSpec = { fill: '*', align: '^', grouping: '_', convert: 'r', width: 12, conv: 'd' };
    expect(sanitizeSpec(spec, '{')).toEqual(spec);
  });
});
