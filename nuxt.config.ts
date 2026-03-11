export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  ssr: false,
  devtools: { enabled: false },
  nitro: {
    experimental: {
      websocket: true,
    },
  },
})
