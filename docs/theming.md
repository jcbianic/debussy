# Theming Guide

Debussy uses a design token system that separates color, typography, and spacing
values from component styles. Tokens are defined in TypeScript, applied as CSS
custom properties, and reactive to user preference.

## Design Token Structure

Tokens are declared in `types/theme.ts` as a flat key–value map where keys use
dot notation (e.g., `color.primary`) and values are CSS strings.

```typescript
// types/theme.ts
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
```

At runtime the composable converts each token key to a CSS variable by replacing
`.` with `-` and prefixing with `--`:

| Token key             | CSS variable            |
| --------------------- | ----------------------- |
| `color.primary`       | `--color-primary`       |
| `color.background`    | `--color-background`    |
| `font.size.base`      | `--font-size-base`      |
| `spacing.md`          | `--spacing-md`          |

CSS variables are set on `<html>` (`:root`) so they cascade to every element.

## Light and Dark Palettes

Two palettes ship out of the box:

```typescript
// types/theme.ts
export const lightTokens: ThemeTokens = {
  'color.primary':    '#3b82f6',  // blue-500
  'color.secondary':  '#8b5cf6',  // violet-500
  'color.background': '#ffffff',
  'color.text':       '#1f2937',  // gray-800
  'color.border':     '#e5e7eb',  // gray-200
  // ...typography and spacing tokens
}

export const darkTokens: ThemeTokens = {
  ...lightTokens,                 // inherits typography/spacing
  'color.primary':    '#60a5fa',  // blue-400
  'color.secondary':  '#a78bfa',  // violet-400
  'color.background': '#1f2937',  // gray-800
  'color.text':       '#f3f4f6',  // gray-100
  'color.border':     '#374151',  // gray-700
}
```

## Customizing Colors

### Per-session override

Use `setColor` from `useTheme()` to override a token at runtime. The change is
reactive and persisted to `localStorage`:

```vue
<script setup lang="ts">
const { setColor } = useTheme()

// Apply a brand color instead of the default blue
setColor('primary', '#10b981')   // emerald-500
setColor('background', '#fafafa')
</script>
```

Supported color names: `primary`, `secondary`, `background`, `text`.

### Persistent per-user preference

`useTheme()` reads `localStorage` under the key `debussy:theme` on mount. A
saved `ThemePreference` object looks like:

```json
{
  "mode": "dark",
  "customColors": {
    "primary": "#10b981",
    "secondary": "#f59e0b"
  }
}
```

Users can export / import this JSON to share their preferred colour scheme.

## Mode Switching

Three modes are supported: `'light'`, `'dark'`, and `'system'`.

```vue
<script setup lang="ts">
const { mode, switchMode } = useTheme()
</script>

<template>
  <button @click="switchMode('dark')">Dark</button>
  <button @click="switchMode('light')">Light</button>
  <button @click="switchMode('system')">System</button>
</template>
```

In `'system'` mode the composable reads `prefers-color-scheme` and listens for
OS-level changes — no manual toggle required.

## Adding a New Theme Variant

1. **Declare a new token set** in `types/theme.ts`:

   ```typescript
   export const highContrastTokens: ThemeTokens = {
     ...lightTokens,
     'color.primary':    '#000000',
     'color.text':       '#000000',
     'color.background': '#ffffff',
     'color.border':     '#000000',
   }
   ```

2. **Extend `ThemePreference.mode`**:

   ```typescript
   export interface ThemePreference {
     mode: 'light' | 'dark' | 'system' | 'high-contrast'
     // ...
   }
   ```

3. **Add a branch in `composables/useTheme.ts`**:

   ```typescript
   const tokens = computed(() => {
     if (resolvedMode.value === 'high-contrast') {
       return { ...highContrastTokens }
     }
     const base = resolvedMode.value === 'dark'
       ? { ...darkTokens }
       : { ...lightTokens }
     // apply custom overrides
     return base
   })
   ```

4. **Expose the option in `ThemeToggle.vue`**:

   ```typescript
   const options = [
     { value: 'light' as const,         label: 'Light' },
     { value: 'dark' as const,          label: 'Dark' },
     { value: 'system' as const,        label: 'System' },
     { value: 'high-contrast' as const, label: 'High Contrast' },
   ]
   ```

## Using Tokens in Vue Components

Reference CSS variables directly in Tailwind arbitrary-value syntax or inline
styles. The variables are always available because they are set on `:root`.

### Tailwind arbitrary values

```vue
<template>
  <div class="bg-[var(--color-background)] text-[var(--color-text)]">
    <button class="bg-[var(--color-primary)] text-white px-4 py-2 rounded">
      Action
    </button>
  </div>
</template>
```

### Inline styles

```vue
<template>
  <div :style="{ backgroundColor: 'var(--color-background)' }">
    <span
      :style="{
        color: 'var(--color-text)',
        fontSize: 'var(--font-size-base)',
      }"
    >
      Content
    </span>
  </div>
</template>
```

### Composable access

If you need the token values as JavaScript strings (e.g., for a canvas or
charting library):

```vue
<script setup lang="ts">
const { tokens } = useTheme()

// tokens is a computed ref of ThemeTokens
const primaryColor = computed(() => tokens.value['color.primary'])
</script>
```

## Theme API

The server exposes two endpoints for reading and writing the active theme:

| Method | Path         | Body                     | Description           |
| ------ | ------------ | ------------------------ | --------------------- |
| GET    | /api/theme   | —                        | Returns stored theme  |
| POST   | /api/theme   | `{ mode, customColors }` | Persists theme update |

These mirror `localStorage` on the server side and are intended for tooling
that cannot access browser storage (e.g., SSR pre-rendering or CLI scripts).

## Token Reference

| Token                | Light     | Dark      | Description          |
| -------------------- | --------- | --------- | -------------------- |
| `color.primary`      | `#3b82f6` | `#60a5fa` | Interactive elements |
| `color.secondary`    | `#8b5cf6` | `#a78bfa` | Accent / badges      |
| `color.background`   | `#ffffff` | `#1f2937` | Page background      |
| `color.text`         | `#1f2937` | `#f3f4f6` | Body text            |
| `color.border`       | `#e5e7eb` | `#374151` | Dividers / outlines  |
| `font.size.base`     | `16px`    | `16px`    | Body font size       |
| `font.size.lg`       | `18px`    | `18px`    | Large text           |
| `font.size.sm`       | `14px`    | `14px`    | Small / helper text  |
| `font.weight.normal` | `400`     | `400`     | Regular weight       |
| `font.weight.bold`   | `700`     | `700`     | Bold weight          |
| `spacing.xs`         | `0.25rem` | `0.25rem` | 4 px gap             |
| `spacing.sm`         | `0.5rem`  | `0.5rem`  | 8 px gap             |
| `spacing.md`         | `1rem`    | `1rem`    | 16 px gap            |
| `spacing.lg`         | `1.5rem`  | `1.5rem`  | 24 px gap            |
