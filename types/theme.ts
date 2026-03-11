export interface ThemePreference {
  mode: 'light' | 'dark' | 'system'
  customColors?: {
    primary?: string
    secondary?: string
    background?: string
    text?: string
  }
  fontFamily?: 'system' | 'serif' | 'mono'
  reduceMotion?: boolean
}

export interface ThemeTokens {
  'color.primary': string
  'color.secondary': string
  'color.background': string
  'color.text': string
  'color.border': string
  'font.size.base': string
  'font.size.lg': string
  'font.size.sm': string
  'font.weight.normal': string
  'font.weight.bold': string
  'spacing.xs': string
  'spacing.sm': string
  'spacing.md': string
  'spacing.lg': string
}

export const lightTokens: ThemeTokens = {
  'color.primary': '#3b82f6',
  'color.secondary': '#8b5cf6',
  'color.background': '#ffffff',
  'color.text': '#1f2937',
  'color.border': '#e5e7eb',
  'font.size.base': '16px',
  'font.size.lg': '18px',
  'font.size.sm': '14px',
  'font.weight.normal': '400',
  'font.weight.bold': '700',
  'spacing.xs': '0.25rem',
  'spacing.sm': '0.5rem',
  'spacing.md': '1rem',
  'spacing.lg': '1.5rem',
}

export const darkTokens: ThemeTokens = {
  ...lightTokens,
  'color.primary': '#60a5fa',
  'color.secondary': '#a78bfa',
  'color.background': '#1f2937',
  'color.text': '#f3f4f6',
  'color.border': '#374151',
}

export const defaultPreference: ThemePreference = {
  mode: 'system',
  fontFamily: 'system',
  reduceMotion: false,
}

export const THEME_STORAGE_KEY = 'debussy:theme'
