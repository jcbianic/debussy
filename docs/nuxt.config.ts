export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxtjs/tailwindcss'],
  ui: {
    icons: ['heroicons'],
    safelistColors: ['primary'],
  },
  colorMode: {
    preference: 'light',
  },
})
