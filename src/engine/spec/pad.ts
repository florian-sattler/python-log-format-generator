/**
 * Shared field-width padding, identical across `%`- and `{}`-styles.
 *
 * Assembles a {@link NumBody} (sign + prefix + digits) or a plain string into
 * the final field, honouring width, fill, alignment, thousands grouping and
 * sign-aware zero padding (`=` / the `0` flag). Grouping and zero-padding are
 * handled together because they interact: with `0` + grouping Python grows the
 * field (separators included) until its length reaches at least the width.
 */

import { type FieldSpec, FormatValueError } from '../types';
import type { NumBody } from './pyfloat';

/** Group an integer-digit string in 3s from the right with the separator. */
function group(intDigits: string, sep: string): string {
  return intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

/** Length of an `n`-digit integer once grouped in 3s. */
function groupedLen(n: number): number {
  return n + Math.floor((n - 1) / 3);
}

/**
 * Zero-extend `intDigits` and group it so the grouped string's length reaches
 * at least `avail`, never starting with a separator (Python's `0`+`,` rule).
 */
function zeroPadGrouped(intDigits: string, sep: string, avail: number): string {
  let d = intDigits.length;
  while (groupedLen(d) < avail) d++;
  return group(intDigits.padStart(d, '0'), sep);
}

/**
 * Pad an already-formatted string body (non-numeric) to the field width.
 *
 * `defaultAlign` differs by style: `%`-style strings right-align, `{}`-style
 * strings left-align.
 */
export function padString(body: string, spec: FieldSpec, defaultAlign: '<' | '>' | '^' = '<'): string {
  // '=' (sign-aware padding) is meaningless for text; Python rejects it regardless
  // of width, so reject it here too rather than silently left-aligning.
  if (spec.align === '=') {
    throw new FormatValueError("'=' alignment not allowed in string format specifier", 'ValueError');
  }
  const width = spec.width ?? 0;
  if (body.length >= width) return body;
  const fill = spec.fill ?? ' ';
  const gap = width - body.length;
  const align = spec.align ?? defaultAlign;
  if (align === '>') return fill.repeat(gap) + body;
  if (align === '^') {
    const left = Math.floor(gap / 2);
    return fill.repeat(left) + body + fill.repeat(gap - left);
  }
  // '<' (and '=' is meaningless for strings; treat as left)
  return body + fill.repeat(gap);
}

/**
 * Pad a numeric {@link NumBody} to the field width.
 *
 * Default alignment for numbers is right (`>`). The `0` flag (or explicit `=`)
 * inserts zeros *between* the sign/prefix and the digits.
 */
export function padNumber(num: NumBody, spec: FieldSpec): string {
  const sep = spec.grouping;
  const intPart = num.digits.slice(0, num.intLen);
  const rest = num.digits.slice(num.intLen);
  const width = spec.width ?? 0;

  // The '0' flag means zero-fill with sign-aware ('=') alignment. An explicit
  // '=' alignment on its own pads with the fill char (defaulting to space),
  // NOT zeros — only the '0' flag (or an explicit '0' fill) zero-pads.
  const zeroFlag = !!spec.zero && (spec.align === undefined || spec.align === '=');
  const align = spec.align ?? (zeroFlag ? '=' : '>');
  const fill = spec.fill ?? (zeroFlag ? '0' : ' ');

  if (align === '=') {
    const fixed = num.sign.length + num.prefix.length + rest.length;
    // Zero-fill participates in grouping; any other fill is plain padding.
    if (sep && fill === '0') {
      const grouped = zeroPadGrouped(intPart, sep, width - fixed);
      return num.sign + num.prefix + grouped + rest;
    }
    const groupedInt = sep ? group(intPart, sep) : intPart;
    const content = num.sign + num.prefix + groupedInt + rest;
    const gap = width - content.length;
    return gap > 0 ? num.sign + num.prefix + fill.repeat(gap) + groupedInt + rest : content;
  }

  const groupedInt = sep ? group(intPart, sep) : intPart;
  const content = num.sign + num.prefix + groupedInt + rest;
  if (content.length >= width) return content;
  const gap = width - content.length;
  if (align === '<') return content + fill.repeat(gap);
  if (align === '^') {
    const left = Math.floor(gap / 2);
    return fill.repeat(left) + content + fill.repeat(gap - left);
  }
  return fill.repeat(gap) + content;
}
