# Research: Foundation Setup

**Date**: 2026-03-11 | **Status**: Complete | **Decision Maker**: Architecture

## Executive Summary

All technology choices for the foundation are inherited from Intent 001 bootstrap and documented in CLAUDE.md. No new technologies are needed for foundation setup. All gaps are addressed by extending existing patterns.

## Technology Decisions

### Framework: Nuxt 4 (Vue 3)

**Decision**: Confirmed ✓ (from CLAUDE.md)
**Rationale**:
- Full-stack solution (frontend + backend in one package)
- File-based routing (pages/) reduces configuration
- SSR + client-side hydration for polished UX
- Nitro server handles API routes seamlessly
- TypeScript first-class support
**Alternatives Considered**:
- Next.js: More mature but heavier; overkill for local-first app
- Svelte: Lighter but smaller ecosystem for UI component libraries
- Rails/Django: Not JavaScript; adds deployment complexity
**Why Chosen**: Nuxt balances fullness (SSR, API, SSG) with simplicity (file routing, minimal config).

### UI Library: Nuxt UI 3 (Radix Vue + Tailwind)

**Decision**: Confirmed ✓ (from CLAUDE.md)
**Rationale**:
- Radix Vue provides accessible, headless components
- Tailwind CSS enables rapid theming and responsive design
- Tailwind v4 improves CSS-in-JS and custom tokens support
- Tight Vue 3 integration; auto-imports
**Alternatives**:
- shadcn/vue: Component library; more setup required
- Headless UI: Similar to Radix but less mature
- Vuetify: Full-featured but heavy; opinionated theming
**Why Chosen**: Radix Vue provides primitives; Tailwind provides tokens. Together they enable custom, accessible design.

### Testing: Vitest 3.2

**Decision**: Confirmed ✓ (from CLAUDE.md)
**Rationale**:
- Drop-in Jest replacement; no config changes needed
- Native ESM and TypeScript support
- Smart and instant watch mode
- Vue component testing via @vitest/ui
- 10x faster than Jest in most cases
**Alternatives**:
- Jest: Industry standard but slower, requires babel
- Playwright: E2E only; not unit test runner
- Cypress: E2E; overkill for component tests
**Why Chosen**: Vitest enables fast feedback loop critical for TDD. Auto-discovery eliminates boilerplate.

### Database: SQLite (better-sqlite3)

**Decision**: Confirmed ✓ (from CLAUDE.md)
**Rationale**:
- Single-file database; no separate server
- Synchronous API; simple integration with Nitro
- Suitable for <10k records (sessions/workflows)
- Zero configuration; file lives in .debussy/
**Alternatives**:
- PostgreSQL: Overkill for local-first; adds deployment
- MongoDB: No benefit for structured session data
- JSON files: No query capability; SQLite is minimal complexity
**Why Chosen**: SQLite is the local-first sweet spot: structured data, no setup, file-based.

### Terminal: xterm.js + node-pty

**Decision**: Confirmed ✓ (from CLAUDE.md)
**Rationale**:
- xterm.js: Mature, production-grade terminal emulator
- node-pty: PTY management on Windows/Mac/Linux
- Both open-source; well-maintained
**Alternatives**:
- Hyper.js: Full terminal app; overkill for embedded UI
- Blessed: Lower-level TUI library; more boilerplate
**Why Chosen**: xterm.js is the browser terminal standard. Paired with node-pty, handles cross-platform complexity.

### Real-Time: SSE (Nitro) + WebSocket (h3)

**Decision**: Confirmed ✓ (from CLAUDE.md)
**Rationale**:
- SSE: For server→client updates (session output, workflow progress)
- WebSocket: For bidirectional terminal interaction
- Both built into Nitro/h3; zero external dependencies
- Fallback support if SSE unavailable in some environments
**Alternatives**:
- Socket.io: Heavier; abstracts away protocol details
- gRPC: Overkill for local localhost communication
**Why Chosen**: Nitro has first-class SSE and WebSocket support. Direct protocol access is simpler and lighter.

### Package Distribution: npm + Nitro Standalone

**Decision**: Confirmed ✓ (from CLAUDE.md)
**Rationale**:
- npm is the JavaScript distribution standard
- Standalone Nitro binary eliminates node_modules bloat
- bin entry in package.json is npm convention
- `npx` auto-downloads and executes
**Alternatives**:
- Tauri: Electron-like packaging; adds Rust complexity
- pkg: Creates binary but less maintainable
**Why Chosen**: npm + Nitro standalone is the path of least resistance. No additional tooling.

### CLI Entry: Nitro Standalone

**Decision**: Create `bin/debussy.cjs` as Nitro prebuilt entry point
**Rationale**:
- Nuxt/Nitro supports `npm run build:nitro` for standalone binary
- Binary contains server + assets; zero dependencies
- Can be executed directly or via `npx`
**Implementation**:
- Build produces `.output/server/index.cjs`
- Copy to `bin/debussy.cjs` during build
- package.json bin field points to this file
**Why**: Standard npm pattern; lightweight distribution.

## Identified Gaps & Solutions

### Gap: No explicit dev script in package.json yet

**Solution**: Add to package.json:
```json
{
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "start": "node .output/server/index.cjs",
    "test": "vitest",
    "coverage": "vitest --coverage",
    "lint": "eslint . --fix",
    "type-check": "vue-tsc --noEmit"
  }
}
```

### Gap: No test configuration files (vitest.config.ts, etc.)

**Solution**:
- Create `vitest.config.ts` with Vue setup and jsdom environment
- Configure coverage thresholds (70% minimum)
- Set up test environment isolation

### Gap: No theme system implementation

**Solution**:
- Create `types/theme.ts` with design token types
- Create `composables/useTheme.ts` for runtime switching
- Create `theme.config.ts` with Tailwind token mappings
- Populate CSS variables in `app.vue` root selector

### Gap: No page templates for welcome, sessions, workflows, artifacts

**Solution**:
- Create `pages/index.vue` (welcome)
- Create `pages/sessions.vue` (session list/create)
- Create `pages/workflows.vue` (workflow list)
- Create `pages/artifacts.vue` (artifact browser)

### Gap: No AppNavigation component

**Solution**:
- Create `components/AppNavigation.vue`
- Use Nuxt `<NuxtLink>` for routing
- Highlight active route via `$route.name`
- Mobile-responsive with hamburger (Radix Vue toggle)

## Constitutional Alignment

✓ **Specification-Driven**: All gaps have acceptance scenarios (FR-XXX) → implementation tasks
✓ **Test-First**: Every feature will be tested before implementation
✓ **Assertion Integrity**: Testify phase will lock acceptance criteria
✓ **Local-First**: All tech choices avoid cloud/telemetry
✓ **Intent Sequencing**: No dependencies on future intents
✓ **Architectural Stewardship**: Extends existing patterns; no breaking changes

## Tessl Tiles

No new Tessl tiles required. The project uses standard, well-documented technologies:
- Nuxt ecosystem tiles available but not mandatory (code examples)
- Vue testing tiles available but Vitest is standard enough
- No specialized domain tiles (not AI/ML, not data pipeline)

## Conclusion

No research blockers. All technology choices are inherited and validated. Foundation setup is pure implementation: configuration (package.json scripts, vitest.config.ts), component development (pages, navigation, welcome), and test infrastructure setup (test patterns, coverage).

**Next Step**: Proceed to `/iikit-04-testify` to generate test specifications from acceptance scenarios.
