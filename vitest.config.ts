import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

// Engine tests are pure TS — a node environment is all that's needed. Reuse the
// '@' -> 'src' alias from vite.config.ts so engine imports resolve identically.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.ts'],
  },
});
