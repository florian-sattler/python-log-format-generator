import type { TemplateItem, TextItem } from './interfaces/internal';

export const templateItems: { [name: string]: TemplateItem } = {
  asctime: {
    description:
      'Human-readable time when the LogRecord was created. By default this is of the form ‘2003-07-08 16:49:45,896’ (the numbers after the comma are millisecond portion of the time).',
    kind: 'str',
  },
  created: {
    description: 'Time when the LogRecord was created (as returned by time.time()).',
    kind: 'float',
  },
  filename: {
    description: 'Filename portion of pathname.',
    kind: 'str',
  },
  funcName: {
    description: 'Name of function containing the logging call.',
    kind: 'str',
  },
  levelname: {
    description: "Text logging level for the message ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL').",
    kind: 'str',
  },
  levelno: {
    description: 'Numeric logging level for the message (DEBUG, INFO, WARNING, ERROR, CRITICAL).',
    kind: 'int',
  },
  lineno: {
    description: 'Source line number where the logging call was issued (if available).',
    kind: 'int',
  },
  message: {
    kind: 'str',
    description: 'The logged message, computed as msg % args. This is set when Formatter.format() is invoked.',
  },
  module: {
    description: 'Module (name portion of filename).',
    kind: 'str',
  },
  msecs: {
    description: 'Millisecond portion of the time when the LogRecord was created.',
    kind: 'float',
  },
  name: {
    description: 'Name of the logger used to log the call.',
    kind: 'str',
  },
  pathname: {
    description: 'Full pathname of the source file where the logging call was issued (if available).',
    kind: 'str',
  },
  process: {
    description: 'Process ID (if available).',
    kind: 'int',
  },
  processName: {
    description: 'Process name (if available).',
    kind: 'str',
  },
  relativeCreated: {
    description:
      'Time in milliseconds when the LogRecord was created, relative to the time the logging module was loaded.',
    kind: 'float',
  },
  thread: {
    description: 'Thread ID (if available).',
    kind: 'int',
  },
  threadName: {
    description: 'Thread name (if available).',
    kind: 'str',
  },
};

export const textItems: TextItem[] = [
  { description: 'A space character', text: ' ' },
  { description: 'A vertical pipe character', text: '|' },
  { description: 'A open bracket character', text: '[' },
  { description: 'A close bracket character', text: ']' },
  { description: 'Add any custom text.', text: 'custom text' },
];
