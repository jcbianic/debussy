export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxtjs/i18n'],
  css: ['./app.css'],
  ui: {
    icons: ['heroicons'],
    safelistColors: ['primary'],
  },
  colorMode: {
    preference: 'system',
    fallback: 'light',
    classSuffix: '',
  },
  i18n: {
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'fr', name: 'Français', file: 'fr.json' },
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    lazy: true,
    langDir: 'locales',
  },
})
