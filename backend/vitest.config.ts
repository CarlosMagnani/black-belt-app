import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.vitest.ts'],
    setupFiles: ['test/setup.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    // Run files sequentially because they share the same database
    fileParallelism: false,
  },
})
