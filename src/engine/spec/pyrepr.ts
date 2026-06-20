/**
 * Python `str()` / `repr()` for the value kinds the engine handles.
 *
 * Used by the `s`/`r`/`a` conversions (`%s`/`%r`/`%a`) and the `{}`-style
 * `!s`/`!r`/`!a` conversions, and as the default rendering of a `{}` field with
 * no presentation type. `JSON.stringify` is deliberately *not* used: Python's
 * repr quoting and escaping rules differ from JSON's.
 *
 * Note: only ASCII / typical log content is handled faithfully. Python's repr
 * of large/small floats switches to exponential at different thresholds than
 * JS `Number.toString`; the oracle matrix stays within the agreeing range.
 */

import type { ValueKind } from '../types';

/** Python `repr(float)` — shortest round-trip, with `.0` forced on integral values. */
export function reprFloat(n: number): string {
  if (Number.isNaN(n)) return 'nan';
  if (n === Infinity) return 'inf';
  if (n === -Infinity) return '-inf';
  if (Number.isInteger(n)) {
    return (Object.is(n, -0) ? '-0' : String(n)) + '.0';
  }
  return String(n);
}

/** Python `repr(str)` — single quotes preferred, switching to double to avoid escaping. */
export function reprStr(s: string): string {
  const useDouble = s.includes("'") && !s.includes('"');
  const q = useDouble ? '"' : "'";
  let out = q;
  for (const ch of s) {
    if (ch === '\\') out += '\\\\';
    else if (ch === q) out += '\\' + q;
    else if (ch === '\n') out += '\\n';
    else if (ch === '\r') out += '\\r';
    else if (ch === '\t') out += '\\t';
    else {
      const code = ch.codePointAt(0)!;
      if (code < 0x20 || code === 0x7f) out += '\\x' + code.toString(16).padStart(2, '0');
      else out += ch;
    }
  }
  return out + q;
}

/** Python `str(value)` for a value of the given kind. */
export function pyStr(value: unknown, kind: ValueKind): string {
  if (kind === 'str') return String(value);
  if (kind === 'int') return String(Math.trunc(Number(value)));
  return reprFloat(Number(value));
}

/** Python `repr(value)` for a value of the given kind. */
export function pyRepr(value: unknown, kind: ValueKind): string {
  if (kind === 'str') return reprStr(String(value));
  if (kind === 'int') return String(Math.trunc(Number(value)));
  return reprFloat(Number(value));
}
