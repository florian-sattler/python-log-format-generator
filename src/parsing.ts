import type { FormattedItem } from './interfaces/internal';
import { templateItems } from './items';

class Scanner {
  private _string: string;
  private _cursor: number;

  constructor(string: string) {
    this._string = string;
    this._cursor = 0;
  }

  /**
   * Returns the next character, or '' if done without advancing the cursor.
   */
  peek() {
    return this._string.slice(this._cursor, this._cursor + 1);
  }

  /**
   * Returns the next two characters, or '' if done without advancing the cursor.
   */
  peek2() {
    return this._string.slice(this._cursor, this._cursor + 2);
  }

  /**
   * Returns the next character, or '' if done. Advances the cursor.
   */
  pop(): string {
    return this._string[this._cursor++];
  }
}

function readText(scanner: Scanner): string {
  const charaters: string[] = [];

  while (!['%(', ''].includes(scanner.peek2())) {
    charaters.push(scanner.pop());
  }

  return charaters.join('');
}

function readTemplate(scanner: Scanner): [string, number] {
  if (scanner.peek2() != '%(') {
    throw Error(`Wrong template start: ${scanner.peek2}`);
  }
  scanner.pop();
  scanner.pop();

  // parse name
  const nameCharacters: string[] = [];
  while (!['', ')'].includes(scanner.peek())) {
    nameCharacters.push(scanner.pop());
  }
  if (scanner.peek() != ')') {
    throw Error('Unable to read template name!');
  }
  scanner.pop();

  // parse padding
  const numberCharacters: string[] = [];
  if (scanner.peek() === '-') {
    numberCharacters.push(scanner.pop());
  }
  while ('0123456789'.includes(scanner.peek())) {
    numberCharacters.push(scanner.pop());
  }
  if (numberCharacters.length === 1 && numberCharacters[0] === '-') {
    throw Error('Illegal padding definition!');
  }
  if (!['d', 'f', 's'].includes(scanner.peek())) {
    throw Error('Missing type definition');
  }
  scanner.pop();

  return [nameCharacters.join(''), +numberCharacters.join('')];
}

export function parseFormat(input: string): FormattedItem[] {
  const scanner = new Scanner(input);

  let readModeText = scanner.peek2() !== '%(';

  const result: FormattedItem[] = [];

  while (scanner.peek() !== '') {
    if (readModeText) {
      // read text
      const text = readText(scanner);
      if (text != '') {
        result.push({ description: 'Add any custom text.', padding: 0, type: 'usertext', value: text });
        readModeText = false;
      }
    } else {
      // read template
      const [templateName, padding] = readTemplate(scanner);
      const template = templateItems[templateName];
      if (!template) {
        throw Error(`Unknown template "${templateName}"!`);
      }
      result.push({ ...template, padding, value: templateName });
      readModeText = true;
    }
  }

  return result;
}
