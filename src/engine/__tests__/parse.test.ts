/**
 * Pure (Python-free) engine tests: parser correctness, the
 * parse/serialize round-trip invariant, and error behaviour.
 */

import { describe, expect, it } from 'vitest';
import { parseFormat } from '../parse';
import { serialize } from '../serialize';
import { FormatParseError } from '../types';

const PERCENT_FORMATS = [
  '',
  '%(message)s',
  '[%(asctime)s] [%(levelname)s] %(filename)s::%(lineno)s %(message)s',
  '%(asctime)s [pid %(process)d] %(levelname)-8s %(module)s.%(funcName)s():%(lineno)d %(message)s',
  '%(levelname)s %(asctime)-20s: %(message)s',
  '%(created)#+012.3f%(lineno)05d100%% done',
  'plain literal text only',
];

describe('parse/serialize round-trip (% style)', () => {
  for (const fmt of PERCENT_FORMATS) {
    it(`stabilizes ${JSON.stringify(fmt)}`, () => {
      const items1 = parseFormat(fmt, '%');
      const items2 = parseFormat(serialize(items1, '%'), '%');
      expect(items2).toEqual(items1);
    });
  }
});

const BRACE_FORMATS = [
  '',
  '{message}',
  '{asctime} [pid {process}] {levelname:<8} {module}.{funcName}():{lineno} {message}',
  '{created:+012,.2f} {lineno:#06x} {name!r:>10}',
  'literal {{braces}} and {message}',
];

describe('parse/serialize round-trip ({ style)', () => {
  for (const fmt of BRACE_FORMATS) {
    it(`stabilizes ${JSON.stringify(fmt)}`, () => {
      const items1 = parseFormat(fmt, '{');
      const items2 = parseFormat(serialize(items1, '{'), '{');
      expect(items2).toEqual(items1);
    });
  }
});

describe('parse details ({ style)', () => {
  it('parses fill/align/sign/grouping/precision/type', () => {
    const [item] = parseFormat('{created:*>+012,.3f}', '{');
    expect(item.spec).toMatchObject({
      fill: '*',
      align: '>',
      sign: '+',
      zero: true,
      width: 12,
      grouping: ',',
      precision: 3,
      conv: 'f',
    });
  });

  it('parses the !r conversion', () => {
    const [item] = parseFormat('{name!r:>10}', '{');
    expect(item.spec).toMatchObject({ convert: 'r', align: '>', width: 10 });
  });

  it('treats {{ and }} as literal braces', () => {
    const items = parseFormat('{{literal}}', '{');
    expect(items).toEqual([expect.objectContaining({ isText: true, value: '{literal}' })]);
  });

  it('reports a malformed format spec as a parse error', () => {
    expect(() => parseFormat('{lineno:8zz}', '{')).toThrow(FormatParseError);
  });
});

const TEMPLATE_FORMATS = ['', '$message', '${levelname}:${name}', 'cost is 100$$ for $message'];

describe('parse/serialize round-trip ($ style)', () => {
  for (const fmt of TEMPLATE_FORMATS) {
    it(`stabilizes ${JSON.stringify(fmt)}`, () => {
      const items1 = parseFormat(fmt, '$');
      const items2 = parseFormat(serialize(items1, '$'), '$');
      expect(items2).toEqual(items1);
    });
  }

  it('parses both $name and ${name} and carries no spec', () => {
    const items = parseFormat('$levelname ${name}', '$');
    expect(items.filter((i) => !i.isText)).toHaveLength(2);
    expect(items.every((i) => Object.keys(i.spec).length === 0)).toBe(true);
  });

  it('rejects unknown identifiers', () => {
    expect(() => parseFormat('$nonsense', '$')).toThrow(FormatParseError);
  });
});

describe('parse details (% style)', () => {
  it('extracts flags, width and precision', () => {
    const [item] = parseFormat('%(created)-+08.3f', '%');
    expect(item.value).toBe('created');
    expect(item.isText).toBe(false);
    expect(item.spec).toMatchObject({ align: '<', sign: '+', zero: true, width: 8, precision: 3, conv: 'f' });
  });

  it('treats %% as a literal percent', () => {
    const items = parseFormat('100%% sure', '%');
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ isText: true, value: '100% sure' });
  });

  it('rejects unknown tokens', () => {
    expect(() => parseFormat('%(nonsense)s', '%')).toThrow(FormatParseError);
  });

  it('rejects a missing conversion', () => {
    expect(() => parseFormat('%(lineno)', '%')).toThrow(FormatParseError);
  });
});
