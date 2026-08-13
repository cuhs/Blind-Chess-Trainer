import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    include: [
      'components/**/*.test.ts',
      'data/**/*.test.ts',
      'hooks/**/*.test.ts',
      'lib/**/*.test.ts',
    ],
  },
});
