/**
 * Render {@link FormattedItem}s against a sample log record, applying real
 * Python formatting semantics, to produce the preview line for one record.
 *
 * `asctime` is computed from the record's `created`/`msecs` via
 * {@link formatTime} (honouring `datefmt`) rather than read from the static
 * sample value, so width/precision specs and `datefmt` behave like Python.
 */

import { type FormattedItem, type LogRecord, type Style, FormatValueError } from './types';
import { formatPercent } from './spec/printf';
import { formatBrace } from './spec/formatspec';
import { pyStr } from './spec/pyrepr';
import { formatTime } from './spec/strftime';

function fieldValue(item: FormattedItem, record: LogRecord, datefmt?: string): unknown {
  if (item.value === 'asctime') {
    const created = Number(record.created ?? 0);
    const msecs = Number(record.msecs ?? 0);
    return formatTime(created, msecs, datefmt);
  }
  // A referenced field absent from the record is a KeyError in all three styles
  // (`fmt % record.__dict__`, `fmt.format(**d)`, `Template(fmt).substitute(d)`).
  if (!(item.value in record)) {
    throw new FormatValueError(`KeyError: '${item.value}'`, 'KeyError');
  }
  return record[item.value];
}

/** Render one record into a preview string for the given style. */
export function renderRecord(
  items: FormattedItem[],
  record: LogRecord,
  style: Style = '%',
  datefmt?: string,
): string {
  return items
    .map((item) => {
      if (item.isText) return item.value;
      // asctime is always a string once formatted.
      const kind = item.value === 'asctime' ? 'str' : item.kind;
      const value = fieldValue(item, record, datefmt);
      switch (style) {
        case '%':
          return formatPercent(value, kind, item.spec);
        case '{':
          return formatBrace(value, kind, item.spec);
        case '$':
          // string.Template substitutes str(value); no formatting spec.
          return pyStr(value, kind);
        default:
          throw new Error(`Style '${style}' rendering not yet implemented`);
      }
    })
    .join('');
}
