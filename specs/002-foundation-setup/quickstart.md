# Quickstart: Foundation Setup Testing & Development

**Date**: 2026-03-11 | **For**: Developers implementing Intent 002

## Test Scenarios

### Scenario 1: Developer Quick Start (FR-100)

**Goal**: Verify that `npm run dev` launches a working dev server in <5 seconds.

**Steps**:
1. Clone repo (assume Intent 001 complete)
2. Run `npm install`
3. Start timer
4. Run `npm run dev`
5. Wait for "Local: http://localhost:3000" message
6. Stop timer
7. Navigate to http://localhost:3000 in browser
8. Verify welcome page loads

**Expected Result**:
- Dev server running
- Welcome page visible
- Startup time < 5 seconds
- No errors in console

**Test Code**:
```typescript
// tests/integration/dev-server.test.ts
import { describe, it, expect } from "vitest"

describe("Dev Server (FR-100)", () => {
  it("should start in under 5 seconds", async () => {
    const start = Date.now()
    // Trigger dev server via Nitro's test utilities
    const server = await startDevServer()
    const elapsed = Date.now() - start

    expect(elapsed).toBeLessThan(5000)
    expect(server.url).toBe("http://localhost:3000")

    await server.close()
  })

  it("should enable HMR on file changes", async () => {
    const server = await startDevServer()

    // Simulate file change
    const watchEvent = await server.waitForHMR()
    expect(watchEvent).toBeDefined()

    await server.close()
  })
})
```

---

### Scenario 2: Test Execution (FR-102)

**Goal**: Verify that `npm test` runs all tests, reports coverage, and completes in <60 seconds.

**Steps**:
1. Run `npm test`
2. Verify test discovery (count tests found)
3. Watch for failures (should be none initially)
4. Check coverage report (should show ≥70% for critical paths)
5. Verify exit code is 0

**Expected Result**:
- All tests pass
- Coverage report displayed
- Execution time < 60 seconds
- Exit code 0 for CI/CD

**Test Code**:
```typescript
// tests/unit/component-render.test.ts
import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import AppNavigation from "~/components/AppNavigation.vue"

describe("AppNavigation Component", () => {
  it("should render navigation links", () => {
    const wrapper = mount(AppNavigation)
    expect(wrapper.find("a[href='/']").exists()).toBe(true)
    expect(wrapper.find("a[href='/sessions']").exists()).toBe(true)
    expect(wrapper.find("a[href='/workflows']").exists()).toBe(true)
  })

  it("should highlight active route", () => {
    const wrapper = mount(AppNavigation, {
      props: { activeRoute: "sessions" }
    })
    const sessionLink = wrapper.find("a[href='/sessions']")
    expect(sessionLink.classes()).toContain("active")
  })

  it("should be mobile-responsive", () => {
    const wrapper = mount(AppNavigation)
    const hamburger = wrapper.find("[data-testid='hamburger']")
    expect(hamburger.exists()).toBe(true)
  })
})
```

---

### Scenario 3: Package Distribution (FR-110, FR-111)

**Goal**: Verify that the app can be published to npm and run via `npx debussy`.

**Steps**:
1. Run `npm run build`
2. Run `npm pack` (creates tarball)
3. In a clean directory, run `npm install ../debussy-1.0.0.tgz`
4. Run `npm run start` (or check bin entry)
5. Verify app launches and welcome page is visible

**Expected Result**:
- Build completes without warnings
- Package installs cleanly
- No manual build steps required to run
- App launches and is accessible

**Test Code**:
```typescript
// tests/integration/distribution.test.ts
import { describe, it, expect } from "vitest"
import { execSync } from "child_process"

describe("Distribution (FR-110, FR-111)", () => {
  it("should build without warnings", () => {
    const output = execSync("npm run build", { encoding: "utf8" })
    expect(output).not.toContain("error")
    expect(output).toContain("Build successful") // Adjust per Nuxt output
  })

  it("should create standalone executable", () => {
    expect(fs.existsSync("bin/debussy.cjs")).toBe(true)
  })

  it("should execute bin entry without node_modules", () => {
    const result = execSync("node bin/debussy.cjs --version", { encoding: "utf8" })
    expect(result).toMatch(/\d+\.\d+\.\d+/) // Version string
  })
})
```

---

### Scenario 4: Theme Switching (FR-200)

**Goal**: Verify that light/dark mode can be switched without page reload.

**Steps**:
1. Open app
2. Verify colors match light mode (default)
3. Click theme toggle (button with icon)
4. Verify colors update instantly
5. Check CSS variables in DevTools
6. Refresh page
7. Verify theme persists

**Expected Result**:
- Theme switches instantly (no flicker, no reload)
- All colors update (background, text, buttons, etc.)
- Theme persists across page refreshes
- localStorage has theme preference

**Test Code**:
```typescript
// tests/unit/theme-composable.test.ts
import { describe, it, expect } from "vitest"
import { useTheme } from "~/composables/useTheme"

describe("useTheme Composable (FR-200)", () => {
  it("should switch theme reactively", async () => {
    const { mode, switchTheme } = useTheme()
    expect(mode.value).toBe("light")

    await switchTheme("dark")
    expect(mode.value).toBe("dark")
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark")
  })

  it("should persist theme to localStorage", () => {
    const { switchTheme } = useTheme()
    switchTheme("dark")

    const stored = JSON.parse(localStorage.getItem("debussy:theme") || "{}")
    expect(stored.mode).toBe("dark")
  })

  it("should apply CSS variables", () => {
    const { switchTheme } = useTheme()
    switchTheme("dark")

    const bgColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-background")
    expect(bgColor).toBeTruthy()
  })
})
```

---

### Scenario 5: Welcome Page (FR-300)

**Goal**: Verify that the welcome page is polished and guides users to features.

**Steps**:
1. Navigate to `/` (app root)
2. Verify page loads and is visually complete
3. Check headline, hero section, feature callouts
4. Click "New Session" CTA
5. Verify navigation to `/sessions` page
6. Go back, click "View Workflows" CTA
7. Verify navigation to `/workflows` page
8. Test on mobile (viewport 375px)
9. Verify responsive layout

**Expected Result**:
- Welcome page renders without visual bugs
- All CTAs functional
- Mobile layout adapts (stacks, not side-by-side)
- No layout shift or oversized elements

**Test Code**:
```typescript
// tests/unit/welcome-page.test.ts
import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import WelcomePage from "~/pages/index.vue"

describe("Welcome Page (FR-300)", () => {
  it("should render headline and callouts", () => {
    const wrapper = mount(WelcomePage)
    expect(wrapper.text()).toContain("Debussy")
    expect(wrapper.text()).toContain("Sessions")
    expect(wrapper.text()).toContain("Workflows")
    expect(wrapper.text()).toContain("Artifacts")
  })

  it("should have primary CTA 'New Session'", () => {
    const wrapper = mount(WelcomePage)
    const cta = wrapper.find("button:contains('New Session')")
    expect(cta.exists()).toBe(true)
  })

  it("should navigate on CTA click", async () => {
    const router = createRouter()
    const wrapper = mount(WelcomePage, { global: { plugins: [router] } })

    await wrapper.find("button").trigger("click")
    expect(router.currentRoute.value.path).toBe("/sessions")
  })
})
```

---

### Scenario 6: Navigation & Pages (FR-301, FR-302)

**Goal**: Verify consistent navigation and page integration.

**Steps**:
1. Open app
2. Verify header/sidebar with navigation visible
3. Click each link: Home, Sessions, Workflows, Artifacts
4. Verify active link is highlighted
5. Check styling consistency across pages (colors, fonts, spacing)
6. Test on mobile navigation (hamburger menu)

**Expected Result**:
- Navigation appears on all pages
- All links work
- Active link highlighted
- Consistent styling
- Mobile nav functional

**Test Code**:
```typescript
// tests/integration/navigation.test.ts
import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"

describe("Navigation & Pages (FR-301, FR-302)", () => {
  const routes = [
    { path: "/", name: "home" },
    { path: "/sessions", name: "sessions" },
    { path: "/workflows", name: "workflows" },
    { path: "/artifacts", name: "artifacts" }
  ]

  for (const route of routes) {
    it(`should render ${route.name} page with navigation`, async () => {
      const wrapper = mount(App, {
        global: { mocks: { $route: { path: route.path, name: route.name } } }
      })

      const nav = wrapper.findComponent(AppNavigation)
      expect(nav.exists()).toBe(true)

      const activeLink = nav.find(`a[href="${route.path}"]`)
      expect(activeLink.classes()).toContain("active")
    })
  }
})
```

---

### Scenario 7: E2E User Flow

**Goal**: Verify a complete user journey from app start to feature discovery.

**Steps**:
1. User opens app
2. Sees welcome page with headline and CTAs
3. Clicks "New Session"
4. Session page loads with list and "Create Session" button
5. Clicks "Create Session"
6. New session appears in list
7. Clicks "View Workflows"
8. Workflows page shows empty (no workflows yet)
9. Switches theme to dark
10. Colors update, theme persists
11. Navigates back home

**Expected Result**:
- All pages render and respond
- Data operations work (create session)
- Navigation is smooth
- Theme system works
- No console errors

**Test Code**:
```typescript
// tests/e2e/user-flow.test.ts
import { describe, it, expect } from "vitest"
// (Would use Playwright or jsdom)

describe("E2E: Complete User Flow", () => {
  it("should guide user through app", async () => {
    // Start dev server
    // Navigate to /
    // Verify welcome page
    // Click CTAs
    // Create session
    // Switch theme
    // Verify all operations
  })
})
```

---

## Development Checklist

Before marking intent complete:

- [ ] `npm run dev` starts in <5s with HMR working
- [ ] `npm test` runs all tests in <60s
- [ ] Coverage report shows ≥70% for critical paths
- [ ] `npm run build` produces standalone binary
- [ ] Standalone binary executes without errors
- [ ] `npx debussy` works on clean machine (simulated)
- [ ] Welcome page renders with hero + CTAs
- [ ] Navigation links functional and highlighted
- [ ] All pages (home, sessions, workflows, artifacts) render
- [ ] Theme toggle works; colors update instantly
- [ ] Theme persists on refresh
- [ ] Mobile viewport renders responsively
- [ ] Light and dark modes are visually distinct
- [ ] No console warnings or errors
- [ ] README updated with dev/build/test/deploy instructions
- [ ] Code comments explain non-obvious patterns
- [ ] All FR-XXX requirements have corresponding tests

## Local Testing Commands

```bash
# Development
npm install              # Install dependencies
npm run dev             # Start dev server (http://localhost:3000)

# Testing
npm test                # Run all tests (watch mode)
npm run test:ui         # Visual test dashboard
npm run coverage        # Generate coverage report

# Build & Distribution
npm run build           # Build for production
npm run lint            # Check code style
npm run type-check      # TypeScript validation
npm pack                # Create distribution tarball

# Publishing (requires npm auth)
npm publish             # Push to npm registry
npm dist-tag add debussy@1.0.0 latest
```

---

## Test Infrastructure

### Unit Test Pattern
- File: `src/components/MyComponent.test.ts`
- Framework: Vitest + @vue/test-utils
- Pattern: Arrange → Act → Assert

### Integration Test Pattern
- File: `tests/integration/api-route.test.ts`
- Framework: Vitest + Nitro test utils
- Pattern: Start server → HTTP request → Verify response

### E2E Test Pattern
- File: `tests/e2e/user-flow.test.ts`
- Framework: Vitest + jsdom or Playwright
- Pattern: User action → Verify DOM/state change

### Coverage Targets
- **Critical paths**: ≥70% (FR-102/SC-004)
- **Components**: ≥60% (views, nav, theme)
- **API routes**: ≥80% (core endpoints)
- **Utils**: ≥70% (composables, helpers)
