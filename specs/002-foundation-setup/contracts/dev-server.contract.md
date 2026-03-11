# Contract: Developer Quick Start

**Feature**: Developer Experience (FR-100, FR-101, FR-102)
**Implements**: User Story 1, 2
**Date**: 2026-03-11

## Overview

This contract defines the expected behavior of the dev server and build system for developers.

## Command: npm run dev

Launch the development server with hot module reloading.

### Expected Behavior

**Invocation**:
```bash
npm run dev
```

**Output Timeline**:
```
> nuxt dev

 ℹ Using Nitro@latest
 ℹ Using Nuxt@4.x
 ℹ Using Vue@3.x

 ✔ Compiled successfully in 3.2s
 ✔ Local:    http://localhost:3000/
 ✔ Network:  [your-ip]:3000

 ↓ waiting for manual page reload or hot module reloading...
```

**Timing**:
- Total startup: <5 seconds (FR-100/SC-001)
- Webpack/Vite rebuild on file change: <1 second (HMR)

**Browser Access**:
- App accessible at http://localhost:3000
- Welcome page loaded by default
- DevTools accessible (Vite debug info available)

### File Changes (HMR)

When source files are modified:

**Component Change** (e.g., component color):
- File saved
- HMR payload sent to browser
- Component hot-replaces in-place
- State persists (no page reload)
- New styling visible immediately

**Page/Layout Change**:
- File saved
- HMR refreshes layout
- Route preserved (if possible)
- Page re-renders with new component

**Config Change** (e.g., Tailwind tokens):
- File saved
- Full page reload (HMR cannot refresh config)
- State lost (acceptable; config changes are rare)

### Error Handling

**Syntax Error**:
- Dev server continues running
- Browser shows error overlay with file/line number
- Error clears on fix

**Missing Module**:
- Dev server shows error in terminal
- Browser shows "Module not found" error
- Error clears when module is available

### Exit

**Ctrl+C**:
- Dev server gracefully shuts down
- No orphaned processes
- Terminal prompt returns

### Test Assertions

- Dev server starts in <5 seconds
- Welcome page renders (check DOM)
- HMR works (file change → browser update <1s)
- Dev server recovers from errors
- Port is 3000 (configurable, but default)
- No TypeScript errors in terminal

---

## Command: npm run build

Create production-optimized build.

### Expected Behavior

**Invocation**:
```bash
npm run build
```

**Output**:
```
> nuxt build

 ℹ Building Nitro server...
 ℹ Compiling app...
 ℹ Minifying CSS and JS...

 ✔ Build complete in 12s
 ✔ Output written to .output/
```

**Artifacts**:
- `.output/server/` - Nitro server (Node.js)
- `.output/public/` - Static assets (HTML, CSS, JS, images)
- `.output/app.json` - Build metadata

**Bundle Characteristics**:
- Minified (no whitespace)
- Tree-shaken (unused code removed)
- Chunked (lazy-loading where possible)
- Source maps (for debugging in production)

### npm start (Post-Build)

After build completes, `npm start` runs the server:

```bash
npm start
# Starts .output/server (Nitro standalone)
# Server listens on port 3000
# Serves .output/public/ as static files
```

### Test Assertions

- Build completes without errors
- No TypeScript errors reported
- `.output/` directory exists
- `server/` and `public/` subdirectories populated
- No warnings for missing dependencies
- Bundle size <5MB (CSS + JS combined)

---

## Command: npm test

Run test suite.

### Expected Behavior

**Invocation**:
```bash
npm test
```

**Output (Watch Mode)**:
```
 DEV  v3.2.1

 ✓ tests/unit/welcome-page.test.ts (5 tests)
 ✓ tests/unit/theme-composable.test.ts (3 tests)
 ✓ tests/integration/api.test.ts (8 tests)

 Test Files  3 passed (3)
      Tests  16 passed (16)

 Coverage: 72% statements | 68% branches | 70% functions | 71% lines

 ✓ Ready for file changes (press 'q' to quit)
```

**Timing**:
- Total execution: <60 seconds (FR-102/SC-003)
- Coverage report: included in output
- Exit code: 0 (success) or 1 (failures)

**Watch Mode**:
- Watches `src/` and `tests/` for changes
- Re-runs affected tests on change
- Press `q` to exit

### Coverage Thresholds

- **Statements**: ≥70% (FR-102/SC-004)
- **Branches**: ≥65%
- **Functions**: ≥70%
- **Lines**: ≥70%

Failing coverage exits with code 1.

### Test Failure Reporting

When tests fail:

```
✗ tests/unit/welcome-page.test.ts (1 failed)
  ✗ should render headline (51ms)
    AssertionError: expected "Welcome" to include "Debussy"
    at tests/unit/welcome-page.test.ts:12:5
```

**Clear Error Message**:
- Test name
- Assertion that failed
- Expected vs. actual value
- File and line number

### Test Patterns

Tests follow this structure:
```typescript
describe("Feature Name", () => {
  it("should do X", () => {
    // Arrange
    const component = mount(MyComponent)

    // Act
    await component.find("button").trigger("click")

    // Assert
    expect(component.emitted("click")).toBeTruthy()
  })
})
```

### Test Discovery

Tests are auto-discovered via glob pattern:
- `**/*.test.ts`
- `**/*.spec.ts`

No configuration needed; just add files.

### Test Assertions

- All tests pass (exit code 0)
- Coverage ≥70% for critical paths
- No flaky tests (deterministic results)
- Error messages are clear
- Execution time <60s

---

## Command: npm run coverage

Generate detailed coverage report.

### Expected Output

```bash
npm run coverage
```

```
coverage/
  index.html       # Interactive coverage report (open in browser)
  coverage.json    # Machine-readable format
```

**Report Contents**:
- Per-file coverage statistics
- Uncovered lines highlighted
- Branch coverage
- Function coverage

---

## Error Scenarios

| Scenario | Expected Behavior |
|----------|-------------------|
| Missing node_modules | `npm install` instruction shown |
| Port 3000 already in use | Error message with alternative port |
| TypeScript errors | Listed in terminal; dev server continues |
| Disk space full | Clear error; dev server stops |
| Syntax error in component | HMR error overlay shown; dev server continues |
| Missing environment file | Uses defaults; no error if optional |

---

## Accessibility

- Dev server output is logged to stdout (captured by CI/CD)
- Error messages are clear and actionable
- No unnecessary colors/formatting that confuse CI logs
- Help text available via `npm run dev -- --help`

---

## Performance Baseline

| Metric | Target | Acceptable Range |
|--------|--------|------------------|
| Dev server startup | <5s | <7s |
| HMR feedback | <1s | <1.5s |
| Full test suite | <60s | <90s |
| Build time | 15s | <30s |
| Bundle size | <5MB | <7MB |

---

## Contract Enforcement

Tests verify:
- Dev server starts and serves requests
- HMR works (no errors on file change)
- `npm test` exits with correct code
- Coverage meets thresholds
- Build produces correct artifacts
- No orphaned processes
- Error messages are helpful
