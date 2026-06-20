/**
 * Back-compat re-export. The parser now lives in the formatting engine
 * (`src/engine/parse.ts`); this module keeps the historical import path working.
 */
export { parseFormat } from '@/engine/parse';
