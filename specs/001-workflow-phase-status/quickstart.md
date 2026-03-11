# Quickstart: Workflow Phase Status

## Setup

```bash
cd poc/
yarn install   # adds vitest if not present
yarn dev       # starts Nuxt dev server on :3333
```

## Test Scenarios

### 1. List features

```bash
curl http://localhost:3333/api/features
# Expected: { "features": [{ "id": "001-workflow-phase-status", "name": "Workflow Phase Status" }] }
```

### 2. Get phase status

```bash
curl "http://localhost:3333/api/phases?feature=001-workflow-phase-status"
# Expected: 8 phases, constitution=complete, spec=complete, plan=complete (if filled), others vary
```

### 3. Refresh after artifact change

```bash
# Create a plan artifact
echo "# Plan" > specs/001-workflow-phase-status/plan.md

# Re-fetch — plan should now be "complete"
curl "http://localhost:3333/api/phases?feature=001-workflow-phase-status"
```

### 4. Error handling

```bash
# Missing parameter
curl http://localhost:3333/api/phases
# Expected: 400 { "error": "Missing required query parameter: feature" }

# Nonexistent feature
curl "http://localhost:3333/api/phases?feature=999-nope"
# Expected: 404 { "error": "Feature not found: 999-nope" }
```

### 5. Visual pipeline

Open `http://localhost:3333/workflow` in a browser. Select a feature from the dropdown. Verify each phase card shows the correct status indicator and progress bar (if applicable).

## Running Tests

```bash
cd poc/
npx vitest run                    # all tests
npx vitest run --reporter=verbose # verbose output
npx vitest run server/utils/      # phase computation unit tests only
npx vitest run server/api/        # API endpoint tests only
```
