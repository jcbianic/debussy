# Debussy

Local-first web UI for orchestrating Claude Code sessions and IIKit workflows.

## Setup

```bash
# Clone and install
git clone https://github.com/libon-data/debussy
cd debussy
npm install
```

Requires Node.js 18+.

## Development

```bash
# Start dev server with hot module reloading
npm run dev

# Server available at http://localhost:3000
```

The dev server uses Nuxt 4 with Vite HMR for instant feedback on file changes.

## Testing

```bash
# Run tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with coverage report
npm run test:coverage
```

Tests use Vitest 3.2 with happy-dom. Coverage thresholds: 70% lines, 60% branches, 70% functions.

## Build

```bash
# Create production build
npm run build

# Start production server
npm start
```

Build output goes to `.output/` (Nitro standalone server + static assets).

## Distribution

```bash
# After publishing to npm
npx debussy

# Or install globally
npm install -g debussy
debussy
```

The `bin/debussy.cjs` entry point starts the Nitro server. Use `--version` or `--help` for options.

## Theme Customization

Debussy supports light, dark, and system theme modes. Use the theme toggle in the navigation bar to switch modes.

Design tokens (colors, typography, spacing) are defined in `types/theme.ts` and applied as CSS custom variables. To customize:

1. Edit token values in `types/theme.ts`
2. Changes apply globally across all components via CSS variables
3. Theme preference persists to localStorage

## Project Structure

```
pages/           # Nuxt file-based routes
components/      # Vue components (auto-imported)
composables/     # Vue composables (useTheme, etc.)
layouts/         # Page layouts
server/api/      # Nitro API routes
server/utils/    # Server utilities (database, services)
types/           # TypeScript type definitions
tests/           # Vitest tests (unit, integration, step definitions)
bin/             # CLI entry point
```

## Tech Stack

- **Nuxt 4** (Vue 3 + Nitro server)
- **Nuxt UI 3** (Radix Vue + Tailwind CSS 4)
- **SQLite** (better-sqlite3)
- **Vitest 3.2** (testing)
- **TypeScript** throughout
