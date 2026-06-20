/**
 * `%`-style (printf) field rendering: applies a {@link FieldSpec} to a value
 * the way Python's `%` operator would for `%(name)conv`.
 *
 * Supported conversions: d i u o x X e E f F g G s r a c. (`%%` is handled as a
 * literal at parse time, not here.) Errors are raised as {@link FormatValueError}
 * with the Python exception class so the oracle tests can assert parity.
 */

import { type FieldSpec, type ValueKind, FormatValueError } from '../types';
import { formatNumber } from './pyfloat';
import { padNumber, padString } from './pad';
import { pyRepr, pyStr } from './pyrepr';
import {
  PERCENT_FLOAT as FLOAT_CONVS,
  PERCENT_INT_COERCE as INT_COERCE_CONVS,
  PERCENT_INT_ONLY as INT_ONLY_CONVS,
  PERCENT_STRING as STRING_CONVS,
} from './conversions';

/** The conversion Python's `%` style needs by default for a value kind. */
export function defaultPercentConv(kind: ValueKind): string {
  if (kind === 'int') return 'd';
  if (kind === 'float') return 'f';
  return 's';
}

/** Render one value through a `%`-style spec. */
export function formatPercent(value: unknown, kind: ValueKind, spec: FieldSpec): string {
  const conv = spec.conv || defaultPercentConv(kind);

  if (STRING_CONVS.has(conv)) {
    let body = conv === 's' ? pyStr(value, kind) : pyRepr(value, kind);
    if (spec.precision !== undefined) body = body.slice(0, spec.precision);
    return padString(body, spec, '>');
  }

  if (conv === 'c') {
    const body = kind === 'str' ? String(value) : String.fromCodePoint(Math.trunc(Number(value)));
    return padString(body, spec, '>');
  }

  // Numeric conversions require a numeric value.
  if (kind === 'str') {
    throw new FormatValueError(`%${conv} format: a number is required, not str`, 'TypeError');
  }
  if (kind === 'float' && (INT_ONLY_CONVS.has(conv) || conv === 'b')) {
    throw new FormatValueError(`%${conv} format: an integer is required, not float`, 'TypeError');
  }
  if (!INT_COERCE_CONVS.has(conv) && !INT_ONLY_CONVS.has(conv) && !FLOAT_CONVS.has(conv)) {
    throw new FormatValueError(`unsupported format character '${conv}'`, 'ValueError');
  }

  const body = formatNumber(Number(value), conv, spec.precision, !!spec.alt, spec.sign);
  return padNumber(body, spec);
}
