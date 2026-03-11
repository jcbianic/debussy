# API Contract: Theme System

**Feature**: Customizable Appearance (FR-200, FR-201)
**Implements**: User Story 4
**Date**: 2026-03-11

## Overview

Theming system enables light/dark mode and custom color overrides without page reload. This contract defines the theme API and persistence.

## Endpoints

### GET /api/theme

Retrieve current theme settings and design tokens.

**Request**:
```http
GET /api/theme
```

**Response (200 OK)**:
```json
{
  "mode": "dark",
  "customColors": {
    "primary": "#3b82f6",
    "secondary": "#8b5cf6",
    "background": "#1f2937",
    "text": "#f3f4f6"
  },
  "tokens": {
    "color.primary": "#3b82f6",
    "color.secondary": "#8b5cf6",
    "color.background": "#1f2937",
    "color.text": "#f3f4f6",
    "color.border": "#374151",
    "font.size.base": "16px",
    "font.size.lg": "18px",
    "font.size.sm": "14px",
    "font.weight.normal": "400",
    "font.weight.bold": "700",
    "spacing.xs": "0.25rem",
    "spacing.sm": "0.5rem",
    "spacing.md": "1rem",
    "spacing.lg": "1.5rem"
  }
}
```

**Test Assertions**:
- Response status is 200
- `mode` is one of: light, dark, system
- `customColors` object (may be empty)
- All colors are valid hex format (#RRGGBB)
- `tokens` object contains all design token keys
- Token keys follow pattern `category.name`

---

### POST /api/theme

Update theme settings.

**Request**:
```http
POST /api/theme
Content-Type: application/json

{
  "mode": "light",
  "customColors": {
    "primary": "#ef4444"
  }
}
```

**Response (200 OK)**:
```json
{
  "mode": "light",
  "customColors": {
    "primary": "#ef4444",
    "secondary": "#8b5cf6",
    "background": "#ffffff",
    "text": "#1f2937"
  }
}
```

**Response (400 Bad Request)**:
```json
{
  "error": "Invalid theme",
  "details": "color must be valid hex format (#RRGGBB)"
}
```

**Test Assertions**:
- Valid request returns 200
- `mode` must be one of: light, dark, system
- `customColors` values must be valid hex
- Response includes all default tokens merged with custom overrides
- Invalid hex color returns 400
- Partial updates (just mode, no colors) are allowed

---

## Composable API

Vue applications use `useTheme()` composable for reactive theme switching.

### useTheme()

```typescript
const { mode, colors, tokens, switchMode, setColor } = useTheme()

// Reactive properties
mode: Ref<"light" | "dark" | "system">
colors: Ref<Record<string, string>>
tokens: Ref<Record<string, string>>

// Methods
async switchMode(newMode: "light" | "dark" | "system") // Calls POST /api/theme
async setColor(colorName: string, hexValue: string)     // Updates single color
```

**Usage Example**:
```vue
<template>
  <button @click="switchMode(isDark ? 'light' : 'dark')">
    {{ isDark ? '🌙 Dark' : '☀️ Light' }}
  </button>

  <input
    v-model="colors.primary"
    type="color"
    @change="setColor('primary', colors.primary)"
  />
</template>

<script setup>
const { mode, colors, switchMode, setColor } = useTheme()
const isDark = computed(() => mode.value === "dark")
</script>
```

---

## CSS Variables

Design tokens are applied as CSS custom properties on `:root` and `[data-theme="dark"]` selector.

**Light Mode (root)**:
```css
:root {
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
  --color-background: #ffffff;
  --color-text: #1f2937;
  --color-border: #e5e7eb;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-sm: 14px;
  --font-weight-normal: 400;
  --font-weight-bold: 700;
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
}
```

**Dark Mode**:
```css
[data-theme="dark"] {
  --color-primary: #60a5fa;
  --color-secondary: #a78bfa;
  --color-background: #1f2937;
  --color-text: #f3f4f6;
  --color-border: #374151;
}
```

**Component Usage**:
```vue
<style scoped>
.button {
  background-color: var(--color-primary);
  color: var(--color-text);
  padding: var(--spacing-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  border: 1px solid var(--color-border);
}
</style>
```

---

## Persistence

Theme preference is stored in localStorage under key `debussy:theme`.

**Storage Format**:
```json
{
  "mode": "dark",
  "customColors": {
    "primary": "#ef4444"
  },
  "lastUpdated": "2026-03-11T10:00:00Z"
}
```

**Hydration on App Boot**:
1. App.vue mounts → `onMounted(() => { const prefs = loadThemeFromStorage() })`
2. Apply CSS variables to document.root
3. Sync with OS preference if mode === "system"

**Persistence on Change**:
- Every theme update → save to localStorage
- No network error blocks theme switching (instant local update, async API call)

---

## State Invariants

1. Mode is one of: light, dark, system
2. All colors are valid hex format (#RRGGBB)
3. Tokens object is always non-empty (defaults provided)
4. lightMode and darkMode tokens are defined separately
5. Custom colors override defaults; don't delete system tokens

---

## Error Handling

| Status | Scenario | Message |
|--------|----------|---------|
| 400 | Invalid mode | "mode must be one of: light, dark, system" |
| 400 | Invalid color | "color must be valid hex format (#RRGGBB)" |
| 500 | Storage error | "Failed to save theme preference" |

---

## Tailwind Integration

Tailwind CSS configuration uses theme tokens via custom values:

```typescript
// tailwind.config.ts
export default {
  theme: {
    colors: {
      primary: 'var(--color-primary)',
      secondary: 'var(--color-secondary)',
      background: 'var(--color-background)',
      text: 'var(--color-text)',
    },
    fontSize: {
      sm: 'var(--font-size-sm)',
      base: 'var(--font-size-base)',
      lg: 'var(--font-size-lg)',
    },
    spacing: {
      xs: 'var(--spacing-xs)',
      sm: 'var(--spacing-sm)',
      md: 'var(--spacing-md)',
      lg: 'var(--spacing-lg)',
    },
  }
}
```

**Benefits**:
- Change colors without rebuilding CSS
- Tailwind classes automatically pick up CSS variables
- Fallback to defaults if variable undefined

---

## Contract Enforcement

Tests verify:
- GET /api/theme returns all tokens
- POST /api/theme updates mode/colors
- Invalid colors rejected with 400
- CSS variables applied to DOM
- localStorage persistence
- useTheme() composable reactivity
- Tailwind classes respond to theme changes
- Dark mode colors are visually distinct from light mode
- Mobile preferredColorScheme respected when mode === "system"
