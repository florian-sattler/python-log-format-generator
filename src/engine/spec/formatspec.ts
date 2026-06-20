/**
 * `{}`-style (str.format) field rendering and the format-spec mini-language.
 *
 * Implements the grammar
 *   `[[fill]align][sign][#][0][width][grouping][.precision][type]`
 * plus the `!r`/`!s`/`!a` conversions, matching `str.format` / `format()`.
 *
 * Errors Python would raise (e.g. type `d` on a float, type `s` on a number,
 * precision on an integer type) are raised here as {@link FormatValueError}
 * with `pyError: 'ValueError'` so the oracle tests assert parity.
 */

import { type FieldSpec, type ValueKind, FormatValueError } from '../types';
import { formatNumber } from './pyfloat';
import { padNumber, padString } from './pad';
import { pyRepr, pyStr } from './pyrepr';

const ALIGNS = '<>=^';
const INT_TYPES = new Set(['b', 'c', 'd', 'o', 'x', 'X']);
const FLOAT_TYPES = new Set(['e', 'E', 'f', 'F', 'g', 'G', '%']);

/** Parse a `{}` format-spec string (the part after the colon) into a {@link FieldSpec}. */
export function parseFormatSpec(spec: string): FieldSpec {
  const out: FieldSpec = {};
  let i = 0;

  // [[fill]align]
  if (spec.length >= 2 && ALIGNS.includes(spec[1])) {
    out.fill = spec[0];
    out.align = spec[1] as FieldSpec['align'];
    i = 2;
  } else if (spec.length >= 1 && ALIGNS.includes(spec[0])) {
    out.align = spec[0] as FieldSpec['align'];
    i = 1;
  }
  // [sign]
  if ('+- '.includes(spec[i])) {
    out.sign = spec[i] as FieldSpec['sign'];
    i++;
  }
  // [#]
  if (spec[i] === '#') {
    out.alt = true;
    i++;
  }
  // [0] (sign-aware zero padding)
  if (spec[i] === '0') {
    out.zero = true;
    i++;
  }
  // [width]
  let w = '';
  while (i < spec.length && spec[i] >= '0' && spec[i] <= '9') w += spec[i++];
  if (w) out.width = +w;
  // [grouping]
  if (spec[i] === ',' || spec[i] === '_') {
    out.grouping = spec[i] as FieldSpec['grouping'];
    i++;
  }
  // [.precision]
  if (spec[i] === '.') {
    i++;
    let p = '';
    while (i < spec.length && spec[i] >= '0' && spec[i] <= '9') p += spec[i++];
    out.precision = p ? +p : 0;
  }
  // [type]
  if (i < spec.length) {
    out.conv = spec[i++];
  }
  if (i !== spec.length) {
    throw new FormatValueError(`Invalid format specifier '${spec}'`, 'ValueError');
  }
  return out;
}

/** Serialize a {@link FieldSpec} back into a `{}` format-spec string. */
export function braceSpecToString(spec: FieldSpec): string {
  let s = '';
  if (!spec.zero && spec.align) {
    s += (spec.fill ?? '') + spec.align;
  }
  if (spec.sign) s += spec.sign;
  if (spec.alt) s += '#';
  if (spec.zero) s += '0';
  if (spec.width) s += String(spec.width);
  if (spec.grouping) s += spec.grouping;
  if (spec.precision !== undefined) s += '.' + spec.precision;
  if (spec.conv) s += spec.conv;
  return s;
}

/** Whether the spec carries any formatting at all (vs. a bare `{name}`). */
export function isBareSpec(spec: FieldSpec): boolean {
  return (
    !spec.convert &&
    spec.conv === undefined &&
    spec.align === undefined &&
    spec.sign === undefined &&
    spec.alt === undefined &&
    spec.zero === undefined &&
    spec.width === undefined &&
    spec.grouping === undefined &&
    spec.precision === undefined &&
    spec.fill === undefined
  );
}

function formatBraceString(s: string, spec: FieldSpec): string {
  let body = s;
  if (spec.precision !== undefined) body = body.slice(0, spec.precision);
  return padString(body, spec, '<');
}

/** Render one value through a `{}`-style spec. */
export function formatBrace(value: unknown, kind: ValueKind, spec: FieldSpec): string {
  // {name} with nothing else -> str(value).
  if (isBareSpec(spec)) return pyStr(value, kind);

  // !r / !s / !a conversion: produce a string, then format it as a string.
  if (spec.convert) {
    const s =
      spec.convert === 's' ? pyStr(value, kind) : pyRepr(value, kind); // 'a' ~ repr for ASCII content
    if (spec.conv && spec.conv !== 's') {
      throw new FormatValueError(`Unknown format code '${spec.conv}' after conversion`, 'ValueError');
    }
    return formatBraceString(s, spec);
  }

  const conv = spec.conv;

  // No presentation type: string -> string formatting; numbers -> str() then pad.
  if (conv === undefined || conv === 's') {
    if (conv === 's' && kind !== 'str') {
      throw new FormatValueError(`Unknown format code 's' for object of type '${kind}'`, 'ValueError');
    }
    if (kind === 'str') return formatBraceString(pyStr(value, 'str'), spec);
    // Numeric with no type: str() padded as a number (right-aligned by default).
    const padded = padString(pyStr(value, kind), { ...spec }, '>');
    return padded;
  }

  // Numeric presentation types.
  if (kind === 'str') {
    throw new FormatValueError(`Unknown format code '${conv}' for object of type 'str'`, 'ValueError');
  }
  if (kind === 'float' && (INT_TYPES.has(conv) || conv === 'n')) {
    if (conv !== 'n') {
      throw new FormatValueError(`Unknown format code '${conv}' for object of type 'float'`, 'ValueError');
    }
  }
  if (INT_TYPES.has(conv) && spec.precision !== undefined) {
    throw new FormatValueError('Precision not allowed in integer format specifier', 'ValueError');
  }

  const body = formatNumber(Number(value), conv, spec.precision, !!spec.alt, spec.sign);
  return padNumber(body, spec);
}
