import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['pages/**', 'components/**', 'composables/**', 'server/**', 'types/**'],
      thresholds: {
        lines: 70,
        branches: 60,
        functions: 70,
      },
    },
  },
})
