import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'components/**/*.test.ts',
      'data/**/*.test.ts',
      'hooks/**/*.test.ts',
      'lib/**/*.test.ts',
    ],
  },
});
