export interface FormatPreset {
  title: string;
  format: string;
}

export const presets: FormatPreset[] = [
  {
    title: 'Empty',
    format: '',
  },
  {
    title: '[Time] [Level] File::Line Message',
    format: '[%(asctime)s] [%(levelname)s] %(filename)s::%(lineno)s %(message)s',
  },
  {
    title: '[Level Time Name] Message',
    format: '[%(levelname)s %(asctime)s %(name)s] %(message)s',
  },
  {
    title: '[Level] - Time - Name - Message in Path:Line',
    format: '[%(levelname)s] - %(asctime)s - %(name)s - : %(message)s in %(pathname)s:%(lineno)d',
  },
  {
    title: '[Level] Message',
    format: '[%(levelname)s]: %(message)s',
  },
  {
    title: 'Time - Level - File:Function - Message',
    format: '%(asctime)s - %(levelname)s - %(filename)s:%(funcName)s - %(message)s',
  },
  {
    title: 'Time - Level - Message ',
    format: '%(asctime)s - %(levelname)s - %(message)s',
  },
  {
    title: 'Time - Message',
    format: '%(asctime)s - %(message)s',
  },
  {
    title: 'Time - Module - Message',
    format: '%(asctime)s - %(module)s - %(message)s',
  },
  {
    title: 'Time - Name - Level - Message',
    format: '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
  },
  {
    title: 'Time - Name - Process - Thread - Level - Message',
    format: '%(asctime)s - %(name)s - %(process)d - %(threadName)s - %(levelname)s - %(message)s',
  },
  {
    title: 'Time [PID] Level Module.Function:Line Message',
    format: '%(asctime)s [pid %(process)d] %(levelname)-8s %(module)s.%(funcName)s():%(lineno)d %(message)s',
  },
  {
    title: 'Time Level Name Message',
    format: '%(asctime)s %(levelname)s %(name)s %(message)s',
  },
  {
    title: 'Time Level Thread Name Message',
    format: '%(asctime)s %(levelname)s %(threadName)s %(name)s %(message)s',
  },
  {
    title: 'Time Name[Process] Level Message',
    format: '%(asctime)s %(name)s[%(process)d] \\033[1m%(levelname)s\\033[0m %(message)s',
  },
  {
    title: 'Level Time File - Line --> Message',
    format: '%(levelname)s - %(asctime)-15s - %(filename)s - line %(lineno)d --> %(message)s',
  },
  {
    title: 'Level Time: Message',
    format: '%(levelname)s %(asctime)-20s: %(message)s',
  },
  {
    title: 'Python default',
    format: '%(levelname)s:%(name)s:%(message)s',
  },
  {
    title: 'Plain Message',
    format: '%(message)s',
  },
  {
    title: 'Name - Level - Message',
    format: '%(name)s - %(levelname)s - %(message)s',
  },
];
