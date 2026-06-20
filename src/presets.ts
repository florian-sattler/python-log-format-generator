import type { Style } from '@/interfaces/internal';

export interface FormatPreset {
  title: string;
  format: string;
  style: Style;
}

export const presets: FormatPreset[] = [
  {
    title: 'Empty',
    format: '',
    style: '%',
  },
  {
    title: '[Time] [Level] File::Line Message',
    format: '[%(asctime)s] [%(levelname)s] %(filename)s::%(lineno)s %(message)s',
    style: '%',
  },
  {
    title: '[Level Time Name] Message',
    format: '[%(levelname)s %(asctime)s %(name)s] %(message)s',
    style: '%',
  },
  {
    title: '[Level] - Time - Name - Message in Path:Line',
    format: '[%(levelname)s] - %(asctime)s - %(name)s - : %(message)s in %(pathname)s:%(lineno)d',
    style: '%',
  },
  {
    title: '[Level] Message',
    format: '[%(levelname)s]: %(message)s',
    style: '%',
  },
  {
    title: 'Time - Level - File:Function - Message',
    format: '%(asctime)s - %(levelname)s - %(filename)s:%(funcName)s - %(message)s',
    style: '%',
  },
  {
    title: 'Time - Level - Message ',
    format: '%(asctime)s - %(levelname)s - %(message)s',
    style: '%',
  },
  {
    title: 'Time - Message',
    format: '%(asctime)s - %(message)s',
    style: '%',
  },
  {
    title: 'Time - Module - Message',
    format: '%(asctime)s - %(module)s - %(message)s',
    style: '%',
  },
  {
    title: 'Time - Name - Level - Message',
    format: '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    style: '%',
  },
  {
    title: 'Time - Name - Process - Thread - Level - Message',
    format: '%(asctime)s - %(name)s - %(process)d - %(threadName)s - %(levelname)s - %(message)s',
    style: '%',
  },
  {
    title: 'Time [PID] Level Module.Function:Line Message',
    format: '%(asctime)s [pid %(process)d] %(levelname)-8s %(module)s.%(funcName)s():%(lineno)d %(message)s',
    style: '%',
  },
  {
    title: 'Time Level Name Message',
    format: '%(asctime)s %(levelname)s %(name)s %(message)s',
    style: '%',
  },
  {
    title: 'Time Level Thread Name Message',
    format: '%(asctime)s %(levelname)s %(threadName)s %(name)s %(message)s',
    style: '%',
  },
  {
    title: 'Time Name[Process] Level Message',
    format: '%(asctime)s %(name)s[%(process)d] \\033[1m%(levelname)s\\033[0m %(message)s',
    style: '%',
  },
  {
    title: 'Level Time File - Line --> Message',
    format: '%(levelname)s - %(asctime)-15s - %(filename)s - line %(lineno)d --> %(message)s',
    style: '%',
  },
  {
    title: 'Level Time: Message',
    format: '%(levelname)s %(asctime)-20s: %(message)s',
    style: '%',
  },
  {
    title: 'Python default',
    format: '%(levelname)s:%(name)s:%(message)s',
    style: '%',
  },
  {
    title: 'Plain Message',
    format: '%(message)s',
    style: '%',
  },
  {
    title: 'Name - Level - Message',
    format: '%(name)s - %(levelname)s - %(message)s',
    style: '%',
  },
  {
    title: '{} Time Level Name Message',
    format: '{asctime} {levelname:<8} {name} {message}',
    style: '{',
  },
  {
    title: '{} Level - File:Line - Message',
    format: '[{levelname:^8}] {filename}:{lineno:>4} - {message}',
    style: '{',
  },
  {
    title: '$ Time Level Name Message',
    format: '$asctime $levelname $name $message',
    style: '$',
  },
];
