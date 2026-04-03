---
name: debussy
description: >-
  Run multi-step AI workflows defined in YAML files with human review gates.
  Use when user says "run workflow", "start workflow", "resume workflow", or
  references a .claude/workflows/*.yml file. Commands: /workflow-run <file>
  [--input k=v] | --resume [run_id] | --status | --list
compatibility: Requires Python 3, jq, and bash on PATH.
license: MIT
metadata:
  author: jcbianic
  version: "0.0.0"
---

# Workflow Run Skill

Run or resume a multi-step AI workflow defined in a YAML file.
The maestro (this skill) is a pure coordinator: it dispatches
a principal agent per step and blocks at review gates. Reviews
are handled through the Debussy UI Inbox at localhost:4321.

## When to Activate

- User says "run workflow", "start workflow", "resume workflow"
- User references a `.claude/workflows/*.yml` file
- User says "check workflow status" or "list workflow runs"

## Usage

```text
/workflow-run <workflow-file> [--input key=value ...]   # Start new run
/workflow-run --resume [run_id]                         # Resume after review
/workflow-run --status [run_id]                         # Check run status
/workflow-run --list                                    # List all runs
```

---

## Step 1: Parse Arguments

From `$ARGUMENTS`, determine mode:

1. If starts with `--list` → jump to **List Mode**
2. If contains `--status` → jump to **Status Mode** (extract optional run_id)
3. If contains `--resume` → jump to **Resume Mode** (extract optional run_id)
4. Otherwise → first positional arg is the workflow YAML path → **New Run Mode**

Extract all `--input key=value` pairs into an inputs dict.

If `--cwd <path>` is present, resolve it to an absolute path and store
it as `workflow_cwd`. All file operations (workspace creation, artifact
paths, verify commands, context reads) and all agent dispatches use
this directory as working directory. When dispatching agents, prepend
`cd "{workflow_cwd}" &&` to any bash commands and resolve relative
paths against it. If `--cwd` is absent, `workflow_cwd` defaults to
the current working directory.

---

## Step 2: Load Workflow YAML

Read the workflow file with the Read tool. Extract:

| Field | Type | Description |
| --- | --- | --- |
| `name` | string | Workflow identifier |
| `description` | string | What this workflow does |
| `workspace` | string | Directory template containing `{run_id}` |
| `inputs` | dict | Input definitions: name → {description, required, default} |
| `steps` | list | Ordered step objects |

Each step object has:

| Field | Required | Description |
| --- | --- | --- |
| `id` | yes | Unique step ID, format: `N-name` |
| `name` | yes | Human-readable step name |
| `agent` | no | subagent_type, default: `general-purpose` |
| `model` | no | `opus`, `sonnet`, or `haiku` |
| `prompt` | yes | Instructions for the agent, may contain `{var}` references |
| `context` | no | List of file/glob paths to include as context |
| `artifacts` | no | List of `{path, description, review_summary_prompt}` |
| `verify` | no | `{command, expect}` — bash command + expected outcome |
| `review` | no | boolean — if true, pause for human review after step |
| `review_prompt` | no | Guidance shown in the review UI |
| `condition` | no | bash command; step skipped if exit code is non-zero |

Validate that all `required: true` inputs are provided or have a `default`.
If any required input is missing, ask the user with AskUserQuestion.

---

## Variable Substitution

Before using any prompt, context path, or artifact path, substitute:

- `{key}` → value from the inputs dict
- `{workspace}` → resolved workspace directory path
- `{run_id}` → current run ID
- `@{artifacts.step_id.filename}` → absolute path to a previously-produced artifact,
  resolved from `state.steps[step_id].artifacts[filename].path` in the current
  `state.json`. If the referenced step or artifact is not yet present in state
  (i.e. the step hasn't run yet), print an error and abort the workflow — a step
  cannot reference an artifact from a step that hasn't completed.

---

## New Run Mode

1. **Generate run_id**: Format `YYYY-MM-DD-{workflow-name}-{N}` where N is the
   count of existing `.workflow-runs/*-{workflow-name}-*` directories + 1.

2. **Create workspace**: `mkdir -p {workspace}` with variables substituted.

3. **Initialize `{workspace}/state.json`**:

```json
{
  "workflow": "{name}",
  "run_id": "{run_id}",
  "status": "in_progress",
  "created_at": "{ISO-8601}",
  "updated_at": "{ISO-8601}",
  "inputs": {},
  "current_step": "{first step id}",
  "steps": {
    "{step.id}": {
      "name": "{step.name}",
      "status": "not_started",
      "started_at": null,
      "completed_at": null,
      "artifacts": {},
      "review": null,
      "review_history": [],
      "verify": null
    }
  }
}
```

1. Print:

```text
Starting workflow '{name}' — run {run_id}
Inbox: http://localhost:4321/inbox
```

1. **Run the Execution Loop**.

---

## Resume Mode

1. **Find state.json**:
   - If run_id provided: read `.workflow-runs/{run_id}/state.json`
   - Otherwise: find the most recent in-progress run:
     `ls -td .workflow-runs/*/state.json 2>/dev/null | head -5`
     Read each and pick the first with `status == "in_progress"`.

1. Read state.json. Workspace = parent directory of state.json.

1. Print current status (step names + statuses).

1. **Run the Execution Loop** starting from `current_step`.

---

## Status Mode

Find and read state.json (same as Resume Mode step 1–2). Present:

```text
Workflow: {name}
Run ID:   {run_id}
Status:   {status}

Steps:
  ✓ 1-research         approved
  ✓ 2-plan             approved
  → 3-tests-red        pending_review  (AWAITING YOUR REVIEW)
  ○ 4-implement        not_started

Inbox: http://localhost:4321/inbox
Artifacts: {workspace}/
```

---

## List Mode

```bash
find .workflow-runs -name "state.json" -maxdepth 2 2>/dev/null
```

Read each and present a summary table sorted by newest first.

---

## Execution Loop

**Orchestrator discipline**: The maestro does NOT read artifact file contents,
does NOT accumulate sub-agent output, does NOT run verify commands, does NOT
generate summaries. It only reads state.json and principal status reports.
Delegate everything else to the principal.

At the start of each loop iteration, re-read `state.json` using the Read
tool to determine current state. Do not rely on what you remember from earlier
in the conversation. `state.json` is the only source of truth for routing
decisions.

---

### A. Find Next Step

From `state.steps`, find the step whose `id` matches `current_step`.

If `current_step` is null or all steps are `completed`/`approved`/`skipped`:
→ Jump to **Workflow Complete**.

---

### B. Skip Terminal Steps

If step status is `completed`, `approved`, or `skipped`:

- Advance `current_step` to the next step's id (YAML order)
- Update `state.json` `current_step` field
- Loop back to A

If step status is `aborted` or `rejected`:

- Print: "Workflow was previously aborted at step
  '{step.name}'. To restart from this step, reset
  its status to `not_started` in state.json."
- EXIT

---

### C. Check Condition

If step has a `condition` field:

```bash
{condition with variables substituted}
```

Non-zero exit → set status to `skipped`, advance `current_step`, loop to A.

---

### D. Handle Interrupted Step

If step status is `running`: a previous run was interrupted mid-step.

Ask user (AskUserQuestion): "Retry this step from scratch" / "Skip this step"

- Retry: reset status to `not_started` in state.json, proceed to F/G
- Skip: set status to `skipped`, advance, loop to A

---

### E. Handle Pending Review

If step status is `pending_review`:

- The principal already ran and artifacts are written
- Jump to **Review Gate Handler**
- EXIT after (do not continue loop)

---

### F. Handle Revision

If step status is `revision_requested`:

- Read `state.steps[id].review.comments`
- Proceed to G with revision context

---

### G. Dispatch Principal

**Update state.json**:

- If `state.steps[id].review` has a non-null
  `decision` (from a previous review cycle),
  push it to `review_history` first:
  `review_history.push({...existing review,
  "iteration": review_history.length + 1})`
  then set `review: null`.
- Set step `status: "running"`,
  `started_at: {ISO timestamp}`.

**Pre-load context files** (if step has `context` list):
For each path (with variables substituted), read content using Read tool.
Collect all content into a context block.

**Build principal prompt** using the Principal Prompt Template below.
If step was `rejected` or `revision_requested`, append the REVISION block.

**Spawn principal agent**:

```text
subagent_type: "general-purpose"
model: "{step.model if present, else 'sonnet'}"
prompt: {built principal prompt}
```

Wait for the principal to return its status report.

---

### H. Route on Principal Report

Parse the returned report for `STATUS:` line.

**If `STATUS: failed`**:

- Update state.json step `status: "failed"`
- Print what failed (ARTIFACTS / VERIFY lines from report)
- Ask user (AskUserQuestion): "Retry this step" / "Skip this step" / "Abort workflow"
- EXIT (user will resume or abort)

**If `STATUS: completed`**:

- If `review: false`: update state.json step to `status: "completed"`,
  advance `current_step`, loop to A
- If `review: true`: update state.json step to `status: "pending_review"`,
  add `review: {status: "pending", review_prompt: "{step.review_prompt}",
  decision: null, comments: null, decided_at: null}`,
  then jump to **Review Gate Handler** and EXIT

---

### I. Workflow Complete

When all steps are terminal:

Update state.json: `status: "completed"`, `updated_at: {ISO timestamp}`.

Print:

```text
╔══════════════════════════════════════════════════════╗
║  WORKFLOW COMPLETE: {workflow.name}                  ║
╚══════════════════════════════════════════════════════╝

Run ID:    {run_id}
Steps:     {n completed+approved} / {n total}

Artifacts in: {workspace}/
{list each step with status icon and key artifact names}
```

---

## Review Gate Handler

Called after the principal completes a `review: true` step.

### 1. Print Gate Notice

```text
╔══════════════════════════════════════════════════════╗
║  REVIEW GATE: {step.name}                            ║
╚══════════════════════════════════════════════════════╝

Artifacts produced:
{for each artifact: - {path}: {description}}

Review ready at: http://localhost:4321/inbox
```

### 2. Collect Cards

For each artifact in the step, attempt to read
`{workspace}/{artifact.path}.cards.json`.

Collect all cards grouped by artifact. If a cards file
is missing or empty, skip that artifact silently.

### 3. Write Review to Inbox

Generate a review ID: `workflow-{step.id}-{unix-timestamp}`.

Create directories:

- `.debussy/reviews/{review-id}/`
- `.debussy/reviews/{review-id}/items/`

Write `.debussy/reviews/{review-id}/review.json`:

```json
{
  "id": "workflow-{step.id}-{timestamp}",
  "title": "Review: {step.name}",
  "icon": "i-heroicons-clipboard-document-check",
  "source": "workflow",
  "type": "workflow",
  "createdAt": "{ISO 8601 timestamp}"
}
```

For each card collected in Step 2, derive an item ID:
`{step.id}-{artifact-slug}-{i}` (where `artifact-slug`
replaces `/` and `.` with `-` in the artifact path,
and `i` is the card index).

Write `.debussy/reviews/{review-id}/items/{item-id}.json`:

```json
{
  "id": "{item-id}",
  "title": "{card.title}",
  "subtitle": "{artifact.description or artifact.path}",
  "iterations": [
    {
      "number": 1,
      "proposedAt": "{ISO 8601 timestamp}",
      "content": "{card.abstract}"
    }
  ]
}
```

**Fallback** -- if no cards exist for the step, create a
single item:

```json
{
  "id": "{step.id}-approval",
  "title": "Approve step: {step.name}",
  "subtitle": "Step Output",
  "iterations": [
    {
      "number": 1,
      "proposedAt": "{ISO 8601 timestamp}",
      "content": "{step.review_prompt or 'Review artifacts and decide.'}"
    }
  ]
}
```

### 4. Wait for User Review (zero token wait)

Wait for the response file using bash filewatch.
Run with Bash tool, **timeout: 610000ms**:

```bash
RESPONSE=".debussy/reviews/{review-id}/response.json"
end=$((SECONDS + 600))
while [ ! -f "$RESPONSE" ] && [ $SECONDS -lt $end ]; do
  sleep 2
done
[ -f "$RESPONSE" ] && cat "$RESPONSE" || echo "__TIMEOUT__"
```

If output is `__TIMEOUT__`: loop back to step 4 and wait
again. Do not EXIT.

### 5. Derive Decision from Inbox Response

Parse the response JSON. The inbox uses these actions:

- `approved` → workflow decision `approved`
- `changes-requested` → workflow decision `revision_requested`
- `rejected` → workflow decision `rejected`

Apply priority: `rejected` > `changes-requested` > `approved`.

1. If any item has action `rejected` → decision = `rejected`.
   Aggregate: `"Rejected: {title}" -- {comment}` per item.

2. Else if any item has action `changes-requested` →
   decision = `revision_requested`.
   Aggregate: `"Revise: {title}" -- {comment}` per item.

3. Else → decision = `approved`.

### 6. Write Decision to state.json

Read `{workspace}/state.json`. Merge into the step:

```json
{
  "steps": {
    "{step.id}": {
      "status": "{decision}",
      "review": {
        "status": "{decision}",
        "decision": "{decision}",
        "comments": "{aggregated comments}",
        "decided_at": "{ISO timestamp}"
      }
    }
  },
  "updated_at": "{ISO timestamp}"
}
```

### 7. Cleanup

```bash
rm -rf ".debussy/reviews/{review-id}"
```

### 8. Route

| Decision             | Action                                              |
| -------------------- | --------------------------------------------------- |
| `approved`           | Advance `current_step`, continue execution loop     |
| `revision_requested` | Re-dispatch principal (step G) with review comments |
| `rejected`           | Mark `"aborted"`, print summary, EXIT               |

---

## Principal Agent

The principal is a general-purpose agent spawned once per step. It owns the
full step lifecycle: run worker, check artifacts, verify, summarize, write
state. It returns a short structured report to the maestro.

### Principal Prompt Template

The maestro builds this prompt and passes it to the principal agent:

```text
You are the principal for this workflow step. Execute the step lifecycle
exactly as specified below and return a structured status report.

═══════════════════════════════════════════════════════
STEP DEFINITION
═══════════════════════════════════════════════════════
ID:       {step.id}
Name:     {step.name}
Agent:    {step.agent or "general-purpose"}
Model:    {step.model or "default"}
Review:   {step.review}

PROMPT (for the worker agent):
{step.prompt — all variables already substituted}

ARTIFACTS TO PRODUCE:
{for each artifact:}
  Path:        {workspace}/{artifact.path}
  Description: {artifact.description}
  Has summary: {true if artifact.review_summary_prompt else false}
{/for}

VERIFY:
{if step.verify:}
  Command: {step.verify.command — variables substituted}
  Expect:  {step.verify.expect}
{else:}
  None
{/if}

═══════════════════════════════════════════════════════
CONTEXT FILES
═══════════════════════════════════════════════════════
{pre-loaded context file contents, or "None" if no context}

═══════════════════════════════════════════════════════
WORKSPACE
═══════════════════════════════════════════════════════
Path:   {workspace}
Run ID: {run_id}
State:  {workspace}/state.json

═══════════════════════════════════════════════════════
REVISION CONTEXT  (only present if this is a re-run)
═══════════════════════════════════════════════════════
Previous attempt: {revision_requested | rejected}
Reviewer comments: "{review.comments}"
Address all reviewer concerns in this revision.
```

### Principal Execution Instructions

These instructions are appended to every principal prompt:

```text
═══════════════════════════════════════════════════════
PRINCIPAL EXECUTION INSTRUCTIONS
═══════════════════════════════════════════════════════

Execute the following steps in order. Do not skip any step.

STEP 1 — SPAWN WORKER
Dispatch the worker agent using the Agent tool:
  subagent_type: "{step.agent or 'general-purpose'}"
  model:         "{step.model if specified}"
  prompt:        The PROMPT block above, plus:
                 "Write all artifacts using the Write tool to their exact paths.
                  All listed artifact paths MUST exist when you finish."

Wait for the worker to complete.

STEP 2 — CHECK ARTIFACTS
For each artifact in the ARTIFACTS list, run:
  test -f "{artifact.path}" && echo "ok" || echo "missing"

If any artifact is missing:
  → Skip steps 3 and 4
  → Go directly to STEP 5 (WRITE STATE) with status: failed
  → In your report set ARTIFACTS: missing=[list of missing paths]

STEP 3 — RUN VERIFY (skip if VERIFY is None)
Run the verify command with Bash tool.
Check exit code against expect:
  expect "passed" → command must exit 0
  expect "failed" → command must exit non-zero (TDD RED phase)

If result does NOT match expectation:
  → Skip step 4
  → Go to STEP 5 with status: failed
  → In your report set VERIFY: failed

STEP 4 — GENERATE SUMMARIES + CARDS (only if Review: true)
Summary and card generation is non-blocking. If a Haiku agent fails or times
out, record the failure in SUMMARIES/CARDS but continue to STEP 5 with
STATUS: completed. A failed summary does NOT fail the step.

For each artifact where Has summary = true:

  a. Read the artifact content using Read tool.

  b. Spawn a Haiku summarization agent:
     subagent_type: "general-purpose"
     model: "haiku"
     prompt: |
       Read the following document and produce a concise review summary.
       <document>{artifact content}</document>
       <instructions>{artifact.review_summary_prompt}</instructions>
       Write ONLY the summary. No preamble. Use markdown. Under 500 words.
       Focus on what a human reviewer needs to approve/reject/revise.
     Write output to: {workspace}/{artifact.path}.summary.md
     On failure: set summary_failed = true, continue.

  c. Spawn a Haiku card-generation agent (can run in parallel with b):
     subagent_type: "general-purpose"
     model: "haiku"
     prompt: |
       Parse the following document into discrete, actionable review items.
       <document>{artifact content}</document>
       Produce a JSON array. Each element:
       {
         "title": "Short imperative title (max 10 words)",
         "abstract": "1-3 sentences with enough context to act on",
         "severity": "critical|high|medium|low|info",
         "type": "finding|decision|risk|recommendation|change"
       }
       Maximum 8 cards. Write ONLY the JSON array. No markdown wrapper.
     Write output to: {workspace}/{artifact.path}.cards.json
     On failure: set cards_failed = true, continue.

STEP 5 — WRITE STATE.JSON
Read {workspace}/state.json. Preserve the existing `name`, `started_at`, and
`review_history` fields from the current step — do NOT overwrite them.
Update only the fields listed below, then write back.

If status is "completed" (all checks passed):
  Merge into steps[step.id]:
  {
    "status": "completed",
    "completed_at": "{ISO timestamp}",
    "artifacts": {
      "{artifact.path}": {
        "path": "{workspace}/{artifact.path}",
        "produced_at": "{ISO timestamp}",
        "description": "{artifact.description}",
        "has_summary": true/false,
        "has_cards": true/false
      }
    },
    "verify": {
      "command": "{command or null}",
      "expect": "{expect or null}",
      "result": "passed|skipped"
    }
  }

If status is "failed":
  steps[step.id].status = "failed"
  steps[step.id].completed_at = "{ISO timestamp}"

Also update: state.updated_at = "{ISO timestamp}"

STEP 6 — RETURN REPORT
Output exactly this format (the maestro parses it):

STATUS: completed
ARTIFACTS: ok
VERIFY: passed
SUMMARIES: done | skipped | failed (non-blocking)
CARDS: done | skipped | failed (non-blocking)
NOTES: {one phrase, ≤ 80 characters, no sentences}

Or on failure:

STATUS: failed
ARTIFACTS: ok | missing=[path1, path2]
VERIFY: passed | failed | skipped
SUMMARIES: skipped
CARDS: skipped
NOTES: {one phrase, ≤ 80 characters, describing what failed}

NOTES constraint: 80 characters maximum. One phrase only. No full sentences.
This keeps maestro context growth bounded across many steps.
```

---

## Error Handling

| Situation                    | Action                              |
| ---------------------------- | ----------------------------------- |
| Workflow YAML not found      | Print error, suggest `ls`, exit     |
| Missing required input       | Ask user with AskUserQuestion       |
| Principal STATUS: failed     | Print detail, retry / skip / abort  |
| state.json unreadable        | Print path, ask user to inspect     |
| No run for `--resume`        | List all runs, ask which to resume  |
| Inbox response timeout       | Loop back to wait -- do not EXIT    |
