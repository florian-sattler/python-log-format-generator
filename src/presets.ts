import type { FormattedItem } from './interfaces/internal';

export interface FormatPreset {
  title: string;
  items: FormattedItem[];
}

export const presets: FormatPreset[] = [
  {
    title: 'Empty',
    items: [],
  },
  {
    title: 'Python default',
    items: [
      {
        description: "Text logging level for the message ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL').",
        padding: 0,
        type: 'string',
        value: 'levelname',
      },
      {
        description: 'Add any custom text.',
        value: ':',
        padding: 0,
        type: 'usertext',
      },
      {
        description: 'Name of the logger used to log the call.',
        padding: 0,
        type: 'string',
        value: 'name',
      },
      {
        description: 'Add any custom text.',
        value: ':',
        padding: 0,
        type: 'usertext',
      },
      {
        description: 'The logged message, computed as msg % args. This is set when Formatter.format() is invoked.',
        padding: 0,
        type: 'string',
        value: 'message',
      },
    ],
  },
  {
    title: 'Time - Level - Location - Message',
    items: [
      {
        value: '[',
        description: 'Open bracket.',
        type: 'usertext',
        padding: 0,
      },
      {
        value: 'asctime',
        description:
          'Human-readable time when the LogRecord was created. By default this is of the form ‘2003-07-08 16:49:45,896’ (the numbers after the comma are millisecond portion of the time).',
        type: 'string',
        padding: 0,
      },
      {
        value: '] [',
        description: 'Custom Text.',
        type: 'usertext',
        padding: 0,
      },
      {
        value: 'levelname',
        description: "Text logging level for the message ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL').",
        type: 'string',
        padding: 0,
      },
      {
        value: '] ',
        description: 'Custom Text.',
        type: 'usertext',
        padding: 0,
      },
      {
        value: 'filename',
        description: 'Filename portion of pathname.',
        type: 'string',
        padding: 0,
      },
      {
        value: '::',
        description: 'Custom Text.',
        type: 'usertext',
        padding: 0,
      },
      {
        value: 'levelno',
        description: 'Numeric logging level for the message (DEBUG, INFO, WARNING, ERROR, CRITICAL).',
        type: 'string',
        padding: 0,
      },
      {
        value: ' ',
        description: 'Space.',
        type: 'usertext',
        padding: 0,
      },
      {
        value: 'message',
        type: 'string',
        description: 'The logged message, computed as msg % args. This is set when Formatter.format() is invoked.',
        padding: 0,
      },
    ],
  },
  {
    title: 'Name - Level - Message',
    items: [
      {
        value: 'name',
        description: 'Name of the logger used to log the call.',
        type: 'string',
        padding: 0,
      },
      {
        value: ' - ',
        description: 'Custom Text.',
        type: 'usertext',
        padding: 0,
      },
      {
        value: 'levelname',
        description: "Text logging level for the message ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL').",
        type: 'string',
        padding: 0,
      },
      {
        value: ' - ',
        description: 'Custom Text.',
        type: 'usertext',
        padding: 0,
      },
      {
        value: 'message',
        type: 'string',
        description: 'The logged message, computed as msg % args. This is set when Formatter.format() is invoked.',
        padding: 0,
      },
    ],
  },
];
