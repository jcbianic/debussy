export default defineNuxtConfig({
  ssr: false,

  compatibilityDate: '2026-03-24',

  modules: ['@nuxt/ui'],

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'system',
    fallback: 'dark',
    classSuffix: '',
  },

  nitro: {
    port: 4321,
  },

  vite: {
    build: {
      rollupOptions: {
        onLog(level, log, handler) {
          if (log.code === 'SOURCEMAP_BROKEN') return
          handler(level, log)
        },
      },
    },
  },
})
