import { lightTokens, darkTokens } from '~/types/theme'

export default defineEventHandler((event) => {
  const query = getQuery(event) as { mode?: string }
  const mode = query.mode === 'dark' ? 'dark' : 'light'

  return {
    mode,
    tokens: mode === 'dark' ? darkTokens : lightTokens,
  }
})
