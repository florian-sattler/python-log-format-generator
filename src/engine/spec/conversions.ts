/**
 * Canonical conversion / presentation-type sets, defined once and shared by the
 * parser, the per-style formatters and the spec sanitizer. Keeping these in a
 * single place means adding or changing a supported conversion is a one-line
 * edit rather than a hunt across modules.
 */

// --- %-style (printf) conversion categories ---

/** `%s`/`%r`/`%a` — string conversions. */
export const PERCENT_STRING = new Set(['s', 'r', 'a']);
/** `%d`/`%i`/`%u` — integer, coerces a float (truncates). */
export const PERCENT_INT_COERCE = new Set(['d', 'i', 'u']);
/** `%o`/`%x`/`%X` — integer radix, requires an int. */
export const PERCENT_INT_ONLY = new Set(['o', 'x', 'X']);
/** `%e`/`%E`/`%f`/`%F`/`%g`/`%G` — floating point. */
export const PERCENT_FLOAT = new Set(['e', 'E', 'f', 'F', 'g', 'G']);
/** `%c` — character. */
export const PERCENT_CHAR = 'c';

/** Every conversion the `%`-style accepts. */
export const PERCENT_CONVS = new Set<string>([
  ...PERCENT_STRING,
  ...PERCENT_INT_COERCE,
  ...PERCENT_INT_ONLY,
  ...PERCENT_FLOAT,
  PERCENT_CHAR,
]);

// --- {}-style (str.format) presentation types ---

/** `b`/`c`/`d`/`o`/`x`/`X` — integer presentation types. */
export const BRACE_INT_TYPES = new Set(['b', 'c', 'd', 'o', 'x', 'X']);
/** `e`/`E`/`f`/`F`/`g`/`G`/`%` — floating presentation types. */
export const BRACE_FLOAT_TYPES = new Set(['e', 'E', 'f', 'F', 'g', 'G', '%']);

/** Every presentation type the `{}`-style accepts (`n` locale-number, `s` string). */
export const BRACE_CONVS = new Set<string>([...BRACE_INT_TYPES, ...BRACE_FLOAT_TYPES, 'n', 's']);
