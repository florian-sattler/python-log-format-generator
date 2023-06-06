import type { FormatItem } from './interfaces/internal';

export const attributes: FormatItem[] = [
  {
    value: 'asctime',
    description:
      'Human-readable time when the LogRecord was created. By default this is of the form ‘2003-07-08 16:49:45,896’ (the numbers after the comma are millisecond portion of the time).',
    type: 'string',
  },
  {
    value: 'created',
    description: 'Time when the LogRecord was created (as returned by time.time()).',
    type: 'float',
  },
  {
    value: 'filename',
    description: 'Filename portion of pathname.',
    type: 'string',
  },
  {
    value: 'funcName',
    description: 'Name of function containing the logging call.',
    type: 'string',
  },
  {
    value: 'levelname',
    description: "Text logging level for the message ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL').",
    type: 'string',
  },
  {
    value: 'levelno',
    description: 'Numeric logging level for the message (DEBUG, INFO, WARNING, ERROR, CRITICAL).',
    type: 'string',
  },
  {
    value: 'lineno',
    description: 'Source line number where the logging call was issued (if available).',
    type: 'integer',
  },
  {
    value: 'message',
    type: 'string',
    description: 'The logged message, computed as msg % args. This is set when Formatter.format() is invoked.',
  },
  {
    value: 'module',
    description: 'Module (name portion of filename).',
    type: 'string',
  },
  {
    value: 'msecs',
    description: 'Millisecond portion of the time when the LogRecord was created.',
    type: 'integer',
  },
  {
    value: 'name',
    description: 'Name of the logger used to log the call.',
    type: 'string',
  },
  {
    value: 'pathname',
    description: 'Full pathname of the source file where the logging call was issued (if available).',
    type: 'string',
  },
  {
    value: 'process',
    description: 'Process ID (if available).',
    type: 'integer',
  },
  {
    value: 'processName',
    description: 'Process name (if available).',
    type: 'string',
  },
  {
    value: 'relativeCreated',
    description:
      'Time in milliseconds when the LogRecord was created, relative to the time the logging module was loaded.',
    type: 'integer',
  },
  {
    value: 'thread',
    description: 'Thread ID (if available).',
    type: 'integer',
  },
  {
    value: 'threadName',
    description: 'Thread name (if available).',
    type: 'string',
  },
];
