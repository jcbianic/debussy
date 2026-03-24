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
    port: 3050,
  },
})
