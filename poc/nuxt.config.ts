export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  ssr: false,
  devtools: { enabled: false },
  devServer: {
    port: 3333,
  },
  nitro: {
    experimental: {
      websocket: true,
    },
  },
  app: {
    head: {
      script: [{ src: 'https://cdn.tailwindcss.com' }],
      title: 'Debussy POC',
    },
  },
})
