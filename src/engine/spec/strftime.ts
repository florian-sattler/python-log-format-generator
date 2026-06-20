/**
 * `logging.Formatter.formatTime` semantics for the `asctime` field.
 *
 * CPython computes `asctime` from the record's `created` timestamp via
 * `time.strftime(datefmt, localtime(created))`. We pin `TZ=UTC` (in CI and the
 * oracle) so the result is deterministic, and compute everything in UTC here.
 *
 * - With a `datefmt`: `strftime(datefmt, created)`.
 * - Without: the CPython default `'%Y-%m-%d %H:%M:%S'` followed by `,` and the
 *   millisecond portion zero-padded to 3 digits (`int(msecs)`).
 *
 * `%f` is intentionally unsupported: CPython's `time.strftime` (unlike
 * `datetime`) does not implement it, so it is out of scope (see the plan).
 */

const WEEKDAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_FULL = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const pad2 = (n: number) => String(n).padStart(2, '0');

function dayOfYear(d: Date): number {
  const start = Date.UTC(d.getUTCFullYear(), 0, 1);
  const diff = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - start;
  return Math.floor(diff / 86400000) + 1;
}

/** C-style strftime over a UTC date, supporting the directives `time.strftime` accepts. */
export function strftime(fmt: string, date: Date): string {
  let out = '';
  for (let i = 0; i < fmt.length; i++) {
    if (fmt[i] !== '%' || i + 1 >= fmt.length) {
      out += fmt[i];
      continue;
    }
    const dir = fmt[++i];
    switch (dir) {
      case 'Y':
        out += String(date.getUTCFullYear());
        break;
      case 'y':
        out += pad2(date.getUTCFullYear() % 100);
        break;
      case 'm':
        out += pad2(date.getUTCMonth() + 1);
        break;
      case 'd':
        out += pad2(date.getUTCDate());
        break;
      case 'H':
        out += pad2(date.getUTCHours());
        break;
      case 'I': {
        const h = date.getUTCHours() % 12;
        out += pad2(h === 0 ? 12 : h);
        break;
      }
      case 'M':
        out += pad2(date.getUTCMinutes());
        break;
      case 'S':
        out += pad2(date.getUTCSeconds());
        break;
      case 'p':
        out += date.getUTCHours() < 12 ? 'AM' : 'PM';
        break;
      case 'j':
        out += String(dayOfYear(date)).padStart(3, '0');
        break;
      case 'w':
        out += String(date.getUTCDay());
        break;
      case 'a':
        out += WEEKDAY_ABBR[date.getUTCDay()];
        break;
      case 'A':
        out += WEEKDAY_FULL[date.getUTCDay()];
        break;
      case 'b':
      case 'h':
        out += MONTH_ABBR[date.getUTCMonth()];
        break;
      case 'B':
        out += MONTH_FULL[date.getUTCMonth()];
        break;
      case 'z':
        out += '+0000';
        break;
      case 'Z':
        out += 'UTC';
        break;
      case '%':
        out += '%';
        break;
      default:
        // Unknown / unsupported directive: emit the literal char (best effort).
        out += dir;
        break;
    }
  }
  return out;
}

/** Compute the `asctime` string for a record's `created`/`msecs` values. */
export function formatTime(created: number, msecs: number, datefmt?: string): string {
  const date = new Date(created * 1000);
  if (datefmt) return strftime(datefmt, date);
  const base = strftime('%Y-%m-%d %H:%M:%S', date);
  return `${base},${String(Math.trunc(msecs)).padStart(3, '0')}`;
}
