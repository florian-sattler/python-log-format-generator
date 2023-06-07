import type { TemplateItem, TextItem } from './interfaces/internal';

export const templateItems: { [name: string]: TemplateItem } = {
  asctime: {
    description:
      'Human-readable time when the LogRecord was created. By default this is of the form ‘2003-07-08 16:49:45,896’ (the numbers after the comma are millisecond portion of the time).',
    type: 'string',
  },
  created: {
    description: 'Time when the LogRecord was created (as returned by time.time()).',
    type: 'float',
  },
  filename: {
    description: 'Filename portion of pathname.',
    type: 'string',
  },
  funcName: {
    description: 'Name of function containing the logging call.',
    type: 'string',
  },
  levelname: {
    description: "Text logging level for the message ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL').",
    type: 'string',
  },
  levelno: {
    description: 'Numeric logging level for the message (DEBUG, INFO, WARNING, ERROR, CRITICAL).',
    type: 'string',
  },
  lineno: {
    description: 'Source line number where the logging call was issued (if available).',
    type: 'integer',
  },
  message: {
    type: 'string',
    description: 'The logged message, computed as msg % args. This is set when Formatter.format() is invoked.',
  },
  module: {
    description: 'Module (name portion of filename).',
    type: 'string',
  },
  msecs: {
    description: 'Millisecond portion of the time when the LogRecord was created.',
    type: 'integer',
  },
  name: {
    description: 'Name of the logger used to log the call.',
    type: 'string',
  },
  pathname: {
    description: 'Full pathname of the source file where the logging call was issued (if available).',
    type: 'string',
  },
  process: {
    description: 'Process ID (if available).',
    type: 'integer',
  },
  processName: {
    description: 'Process name (if available).',
    type: 'string',
  },
  relativeCreated: {
    description:
      'Time in milliseconds when the LogRecord was created, relative to the time the logging module was loaded.',
    type: 'integer',
  },
  thread: {
    description: 'Thread ID (if available).',
    type: 'integer',
  },
  threadName: {
    description: 'Thread name (if available).',
    type: 'string',
  },
};

export const textItems: TextItem[] = [
  { description: 'A space character', text: ' ' },
  { description: 'A vertical pipe character', text: '|' },
  { description: 'A open bracket character', text: '[' },
  { description: 'A close bracket character', text: ']' },
  { description: 'Add any custom text.', text: 'custom text' },
];
