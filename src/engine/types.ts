/**
 * Core types for the formatting engine.
 *
 * The engine models a Python `logging` format string as an ordered list of
 * {@link FormattedItem}s. Each item is either a literal piece of text or a
 * reference to a log-record field carrying a style-neutral {@link FieldSpec}.
 * The same item list is projected into three different surface syntaxes by
 * `serialize` (one per {@link Style}) and rendered against sample data by
 * `render` using real Python semantics.
 */

/** The three styles supported by `logging.Formatter(style=...)`. */
export type Style = '%' | '{' | '$';

/** Intrinsic Python type of a log-record field's value. */
export type ValueKind = 'str' | 'int' | 'float';

/**
 * Style-neutral formatting spec. Not every field is expressible in every
 * style: `%` cannot do fill / `^` centering / grouping, and `$` carries no
 * spec at all. `serialize` down-projects accordingly.
 */
export interface FieldSpec {
  /** Pad character ({}-style only). Defaults to ' ' (or '0' when {@link zero}). */
  fill?: string;
  /** Alignment: `<` left, `>` right, `^` center, `=` sign-aware zero pad. */
  align?: '<' | '>' | '^' | '=';
  /** Sign handling for numbers: `+` always, `-` negatives only, ' ' leading space. */
  sign?: '+' | '-' | ' ';
  /** Alternate form (`#`): `0x`/`0o`/`0b` prefixes, keep trailing `.` for g. */
  alt?: boolean;
  /** Zero-pad to width (the `0` flag / `=` align). */
  zero?: boolean;
  /** Minimum field width. */
  width?: number;
  /** Thousands grouping ({}-style only): `,` or `_`. */
  grouping?: ',' | '_';
  /** Precision (decimals for floats, max chars for strings, min digits for ints). */
  precision?: number;
  /**
   * Presentation type / conversion char. Style-specific meaning:
   * `%`: required, one of d i u o x X e E f F g G s r a c %.
   * `{`: optional, one of b c d o x X e E f F g G n s % (empty => default).
   * Ignored for `$`.
   */
  conv?: string;
  /** {}-style `!conversion` applied before formatting: `r` repr, `s` str, `a` ascii. */
  convert?: 'r' | 's' | 'a';
}

/**
 * One element of a format string: either literal text (`isText: true`,
 * {@link value} is the text) or a log-record field (`isText: false`,
 * {@link value} is the field/token name).
 */
export interface FormattedItem {
  /** Human-readable description shown in the UI tooltip. */
  description: string;
  /** Field/token name, or the literal text when {@link isText}. */
  value: string;
  /** True => literal user text; false => a log-record field reference. */
  isText: boolean;
  /** Intrinsic type of the field value (irrelevant for literal text). */
  kind: ValueKind;
  /** Formatting spec; empty `{}` for literal text and `$`-style fields. */
  spec: FieldSpec;
}

/** A row of sample log-record values (a record from `src/assets/logs.json`). */
export type LogRecord = Record<string, unknown>;

/** Raised when a format string cannot be parsed (mirrors Python parse errors). */
export class FormatParseError extends Error {}

/**
 * Raised when rendering a value would raise in real Python (e.g. `{:d}` on a
 * float). The {@link pyError} names the Python exception class so tests can
 * assert the JS engine errors exactly where Python does.
 */
export class FormatValueError extends Error {
  constructor(
    message: string,
    /** The Python exception class name, e.g. 'ValueError' or 'TypeError'. */
    public pyError: string,
  ) {
    super(message);
  }
}
