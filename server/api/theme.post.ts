export default defineEventHandler(async (event) => {
  const body = await readBody(event) as { mode?: string; customColors?: Record<string, string> }

  const validModes = ['light', 'dark', 'system']
  if (body.mode && !validModes.includes(body.mode)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'mode must be one of: light, dark, system',
    })
  }

  const hexRegex = /^#[0-9a-fA-F]{6}$/
  if (body.customColors) {
    for (const [key, value] of Object.entries(body.customColors)) {
      if (!hexRegex.test(value)) {
        throw createError({
          statusCode: 400,
          statusMessage: `color must be valid hex format (#RRGGBB): ${key}=${value}`,
        })
      }
    }
  }

  return {
    mode: body.mode || 'light',
    customColors: body.customColors || {},
  }
})
