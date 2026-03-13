import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '~': resolve(__dirname, 'app'),
      '~~': resolve(__dirname),
      '@': resolve(__dirname, 'app'),
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts', 'tests/**/*.steps.ts'],
    setupFiles: ['tests/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['app/pages/**', 'app/components/**', 'app/composables/**', 'server/**', 'types/**'],
      thresholds: {
        lines: 70,
        branches: 60,
        functions: 70,
      },
    },
  },
})
