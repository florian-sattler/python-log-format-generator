/**
 * Conformance suite: replays every case from the Python-generated oracle
 * fixture through the TS engine and asserts the output matches real Python
 * (or that the engine raises where Python raised).
 *
 * Regenerate the fixture with `npm run test:oracle` (or `python3
 * tests/oracle/oracle.py`). CI regenerates and diffs it to catch drift.
 */

import { describe, expect, it } from 'vitest';
import { parseFormat } from '../parse';
import { renderRecord } from '../render';
import type { LogRecord, Style } from '../types';
import oracle from './fixtures/oracle.json';

interface OracleCase {
  id: number;
  style: Style;
  fmt: string;
  record: LogRecord;
  datefmt?: string;
  expected?: string;
  error?: string;
}

const cases = oracle.cases as unknown as OracleCase[];

function runEngine(c: OracleCase): string {
  const items = parseFormat(c.fmt, c.style);
  return renderRecord(items, c.record, c.style, c.datefmt);
}

describe(`oracle conformance (Python ${oracle.python}, TZ=${oracle.tz}, ${cases.length} cases)`, () => {
  const byStyle = new Map<Style, OracleCase[]>();
  for (const c of cases) {
    if (!byStyle.has(c.style)) byStyle.set(c.style, []);
    byStyle.get(c.style)!.push(c);
  }

  for (const [style, group] of byStyle) {
    describe(`style '${style}'`, () => {
      for (const c of group) {
        const label = `#${c.id} ${JSON.stringify(c.fmt)}${c.datefmt ? ` datefmt=${c.datefmt}` : ''}`;
        if (c.error !== undefined) {
          it(`${label} -> raises`, () => {
            expect(() => runEngine(c)).toThrow();
          });
        } else {
          it(`${label} -> ${JSON.stringify(c.expected)}`, () => {
            expect(runEngine(c)).toBe(c.expected);
          });
        }
      }
    });
  }
});
