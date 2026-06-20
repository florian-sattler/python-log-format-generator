/**
 * Python-accurate numeric formatting.
 *
 * Produces the *unsigned magnitude* string for a number under a given
 * conversion plus the resolved sign and alternate-form prefix. Field-width
 * padding (fill / align / zero) is applied separately by the shared pad layer
 * in `pad.ts`, because that step is identical across `%`- and `{`-styles.
 *
 * JS's `toFixed`/`toExponential`/`toString` differ from CPython in several
 * documented ways (exponent width, trailing-zero stripping, `.0` on integral
 * floats, `g` thresholds); those are corrected here. Half-to-even rounding of
 * contrived exact-half decimals is *not* reproduced — the oracle matrix keeps
 * to values where rounding is unambiguous (see tests/oracle/oracle.py).
 */

/** Decomposed numeric body, ready for the pad layer to assemble. */
export interface NumBody {
  /** '', '+', '-', or ' '. */
  sign: string;
  /** Alternate-form prefix: '', '0x', '0o', '0b' (case-matched to conv). */
  prefix: string;
  /** Unsigned magnitude digits, *ungrouped* (may contain '.', exponent, '%'). */
  digits: string;
  /** Length of the leading integer-digit run in {@link digits} (for grouping). */
  intLen: number;
}

function resolveSign(negative: boolean, signFlag?: '+' | '-' | ' '): string {
  if (negative) return '-';
  if (signFlag === '+') return '+';
  if (signFlag === ' ') return ' ';
  return '';
}

function isNeg(n: number): boolean {
  return n < 0 || Object.is(n, -0);
}

/** Strip trailing fractional zeros (and a dangling '.') from an f- or e-form string. */
function stripTrailingZeros(s: string): string {
  const eIdx = s.search(/[eE]/);
  let mant = eIdx >= 0 ? s.slice(0, eIdx) : s;
  const exp = eIdx >= 0 ? s.slice(eIdx) : '';
  if (mant.includes('.')) {
    mant = mant.replace(/0+$/, '').replace(/\.$/, '');
  }
  return mant + exp;
}

/** Normalize a JS exponential string so the exponent has >= 2 digits, matching Python. */
function fixExponent(s: string, upper: boolean): string {
  const m = s.match(/^(.*)[eE]([+-])(\d+)$/);
  if (!m) return s;
  let [, mant, esign, edig] = m;
  if (edig.length < 2) edig = '0'.repeat(2 - edig.length) + edig;
  return `${mant}${upper ? 'E' : 'e'}${esign}${edig}`;
}

/** Insert thousands grouping into the integer part of a digit string. */
function nonFinite(n: number, upper: boolean): string | null {
  if (Number.isNaN(n)) return upper ? 'NAN' : 'nan';
  if (n === Infinity || n === -Infinity) return upper ? 'INF' : 'inf';
  return null;
}

/** Format an integer magnitude in the given radix, zero-padded to `minDigits`. */
function intMagnitude(absInt: number, radix: number, upper: boolean, minDigits: number | undefined): string {
  let s = absInt.toString(radix);
  if (upper) s = s.toUpperCase();
  const min = minDigits ?? 0;
  if (s.length < min) s = '0'.repeat(min - s.length) + s;
  return s;
}

const ALT_PREFIX: Record<string, string> = {
  x: '0x',
  X: '0X',
  o: '0o',
  b: '0b',
};

/** Length of the leading integer-digit run (where thousands grouping applies). */
function leadingIntLen(digits: string): number {
  const m = digits.match(/^\d+/);
  return m ? m[0].length : 0;
}

function body(sign: string, prefix: string, digits: string): NumBody {
  return { sign, prefix, digits, intLen: leadingIntLen(digits) };
}

/**
 * Format a number to its {@link NumBody} for conversion `conv`. The returned
 * `digits` are *ungrouped*; thousands grouping and field-width padding are
 * applied together by the pad layer (they interact when zero-padding).
 *
 * @param value     the numeric value (already coerced as needed by the caller)
 * @param conv      one of d i u f F e E g G x X o b n %
 * @param precision optional precision (decimals / min int digits / etc.)
 * @param alt       alternate form (`#`)
 * @param signFlag  sign handling
 */
export function formatNumber(
  value: number,
  conv: string,
  precision: number | undefined,
  alt: boolean,
  signFlag?: '+' | '-' | ' ',
): NumBody {
  const negative = isNeg(value);
  const abs = Math.abs(value);
  const sign = resolveSign(negative, signFlag);

  // Integer conversions.
  if (conv === 'd' || conv === 'i' || conv === 'u') {
    const special = nonFinite(value, false);
    if (special) return body(sign, '', special);
    return body(sign, '', intMagnitude(Math.trunc(abs), 10, false, precision));
  }
  if (conv === 'x' || conv === 'X' || conv === 'o' || conv === 'b') {
    const radix = conv === 'o' ? 8 : conv === 'b' ? 2 : 16;
    const upper = conv === 'X';
    const digits = intMagnitude(Math.trunc(abs), radix, upper, precision);
    return body(sign, alt ? ALT_PREFIX[conv] : '', digits);
  }

  // Floating conversions.
  const upper = conv === conv.toUpperCase() && conv !== conv.toLowerCase();
  const lc = conv.toLowerCase();
  const special = nonFinite(value, upper);

  if (lc === 'f') {
    if (special) return body(sign, '', special);
    let digits = abs.toFixed(precision ?? 6);
    if (alt && (precision ?? 6) === 0 && !digits.includes('.')) digits += '.';
    return body(sign, '', digits);
  }

  if (lc === 'e') {
    if (special) return body(sign, '', special);
    let digits = fixExponent(abs.toExponential(precision ?? 6), upper);
    if (alt && (precision ?? 6) === 0 && !/\./.test(digits.split(/[eE]/)[0])) {
      digits = digits.replace(/([eE])/, '.$1');
    }
    return body(sign, '', digits);
  }

  if (lc === 'g' || lc === 'n') {
    if (special) return body(sign, '', special);
    let p = precision ?? 6;
    if (p === 0) p = 1;
    // Python chooses f vs e based on the decimal exponent of the rounded value.
    const exp = abs === 0 ? 0 : parseInt(abs.toExponential(p - 1).split(/[eE]/)[1], 10);
    let digits: string;
    if (exp >= -4 && exp < p) {
      digits = abs.toFixed(Math.max(0, p - 1 - exp));
    } else {
      digits = fixExponent(abs.toExponential(p - 1), upper);
    }
    if (alt) {
      // '#' keeps trailing zeros and forces a decimal point.
      const eIdx = digits.search(/[eE]/);
      const mant = eIdx >= 0 ? digits.slice(0, eIdx) : digits;
      const expPart = eIdx >= 0 ? digits.slice(eIdx) : '';
      if (!mant.includes('.')) digits = mant + '.' + expPart;
    } else {
      digits = stripTrailingZeros(digits);
    }
    return body(sign, '', digits);
  }

  if (lc === '%') {
    // Percentage ({}-style): multiply by 100, fixed with default precision 6, append '%'.
    const pct = abs * 100;
    return body(sign, '', pct.toFixed(precision ?? 6) + '%');
  }

  throw new Error(`Unsupported numeric conversion '${conv}'`);
}
