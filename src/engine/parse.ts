/**
 * Parse a Python `logging` format string into {@link FormattedItem}s.
 *
 * One parser per {@link Style}. Each is the inverse of the corresponding
 * `serialize` projection, so `parse(serialize(items, style), style)` round-trips.
 * Unknown tokens raise {@link FormatParseError}, matching the original parser's
 * behaviour when loading presets.
 */

import { type FieldSpec, type FormattedItem, type Style, type ValueKind, FormatParseError } from './types';
import { templateItems } from '@/items';
import { parseFormatSpec } from './spec/formatspec';
import { PERCENT_CONVS } from './spec/conversions';

function lookup(name: string): { kind: ValueKind; description: string } {
  const t = templateItems[name];
  if (!t) throw new FormatParseError(`Unknown token "${name}"!`);
  return { kind: t.kind, description: t.description };
}

function field(name: string, spec: FieldSpec): FormattedItem {
  const { kind, description } = lookup(name);
  return { description, value: name, isText: false, kind, spec };
}

function literal(text: string): FormattedItem {
  return { description: 'Add any custom text.', value: text, isText: true, kind: 'str', spec: {} };
}

/** Parse a `%`-style format string. */
function parsePercent(input: string): FormattedItem[] {
  const result: FormattedItem[] = [];
  let text = '';
  let i = 0;

  const flush = () => {
    if (text) {
      result.push(literal(text));
      text = '';
    }
  };

  while (i < input.length) {
    if (input[i] !== '%') {
      text += input[i++];
      continue;
    }
    // input[i] === '%'
    if (input[i + 1] === '%') {
      text += '%';
      i += 2;
      continue;
    }
    if (input[i + 1] !== '(') {
      // Lone '%' — treat as literal (lenient).
      text += '%';
      i += 1;
      continue;
    }

    // Field: %(name)[flags][width][.precision]conv
    const close = input.indexOf(')', i + 2);
    if (close === -1) throw new FormatParseError('Unterminated %(name) reference!');
    const name = input.slice(i + 2, close);
    let j = close + 1;
    const spec: FieldSpec = {};

    // flags
    for (; j < input.length; j++) {
      const c = input[j];
      if (c === '-') spec.align = '<';
      else if (c === '0') spec.zero = true;
      else if (c === '+') spec.sign = '+';
      else if (c === ' ') {
        if (spec.sign !== '+') spec.sign = ' ';
      } else if (c === '#') spec.alt = true;
      else break;
    }
    // width
    let w = '';
    while (j < input.length && input[j] >= '0' && input[j] <= '9') w += input[j++];
    if (w) spec.width = +w;
    // precision
    if (input[j] === '.') {
      j++;
      let p = '';
      while (j < input.length && input[j] >= '0' && input[j] <= '9') p += input[j++];
      spec.precision = p ? +p : 0;
    }
    // conversion
    const conv = input[j];
    if (!conv || !PERCENT_CONVS.has(conv)) {
      throw new FormatParseError(`Missing or invalid conversion for %(${name})`);
    }
    spec.conv = conv;
    j++;

    flush();
    result.push(field(name, spec));
    i = j;
  }

  flush();
  return result;
}

/** Parse a `{}`-style (str.format) format string. */
function parseBrace(input: string): FormattedItem[] {
  const result: FormattedItem[] = [];
  let text = '';
  let i = 0;

  const flush = () => {
    if (text) {
      result.push(literal(text));
      text = '';
    }
  };

  while (i < input.length) {
    const c = input[i];
    if (c === '{' && input[i + 1] === '{') {
      text += '{';
      i += 2;
      continue;
    }
    if (c === '}' && input[i + 1] === '}') {
      text += '}';
      i += 2;
      continue;
    }
    if (c === '}') {
      throw new FormatParseError("Single '}' encountered in format string");
    }
    if (c !== '{') {
      text += c;
      i++;
      continue;
    }

    // Field: {name[!conv][:spec]}
    const close = input.indexOf('}', i + 1);
    if (close === -1) throw new FormatParseError("Single '{' encountered in format string");
    const inner = input.slice(i + 1, close);
    const spec: FieldSpec = {};

    let body = inner;
    const colon = body.indexOf(':');
    if (colon !== -1) {
      Object.assign(spec, parseFormatSpec(body.slice(colon + 1)));
      body = body.slice(0, colon);
    }
    const bang = body.indexOf('!');
    if (bang !== -1) {
      const conv = body.slice(bang + 1);
      if (conv !== 'r' && conv !== 's' && conv !== 'a') {
        throw new FormatParseError(`Unknown conversion '!${conv}'`);
      }
      spec.convert = conv;
      body = body.slice(0, bang);
    }
    const name = body;
    if (!name) throw new FormatParseError('Empty field name (positional fields are not supported)');

    flush();
    result.push(field(name, spec));
    i = close + 1;
  }

  flush();
  return result;
}

const IDENT = /^[A-Za-z_][A-Za-z0-9_]*/;
const IDENT_FULL = /^[A-Za-z_][A-Za-z0-9_]*$/;

/** Parse a `$`-style (string.Template) format string. */
function parseTemplate(input: string): FormattedItem[] {
  const result: FormattedItem[] = [];
  let text = '';
  let i = 0;

  const flush = () => {
    if (text) {
      result.push(literal(text));
      text = '';
    }
  };

  while (i < input.length) {
    if (input[i] !== '$') {
      text += input[i++];
      continue;
    }
    if (input[i + 1] === '$') {
      text += '$';
      i += 2;
      continue;
    }
    if (input[i + 1] === '{') {
      const close = input.indexOf('}', i + 2);
      if (close === -1) throw new FormatParseError("Unterminated '${...}' in template");
      const name = input.slice(i + 2, close);
      if (!IDENT_FULL.test(name)) {
        throw new FormatParseError(`Invalid identifier '${name}'`);
      }
      flush();
      result.push(field(name, {}));
      i = close + 1;
      continue;
    }
    const m = IDENT.exec(input.slice(i + 1));
    if (!m) throw new FormatParseError("Invalid '$' in template");
    flush();
    result.push(field(m[0], {}));
    i += 1 + m[0].length;
  }

  flush();
  return result;
}

/** Parse a format string of the given style into items. */
export function parseFormat(input: string, style: Style = '%'): FormattedItem[] {
  switch (style) {
    case '%':
      return parsePercent(input);
    case '{':
      return parseBrace(input);
    case '$':
      return parseTemplate(input);
    default:
      throw new FormatParseError(`Style '${style}' parsing not yet implemented`);
  }
}
