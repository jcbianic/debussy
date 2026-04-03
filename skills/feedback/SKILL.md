---
description: >-
  Collect structured user feedback via a browser UI. Use when an agent needs
  human review, approval, or triage of a list of items. Serves a standalone
  dark-themed review page, waits without consuming tokens (bash filewatch),
  and returns structured decisions. Commands: /feedback <request.json>
  | /feedback --check <session-id>
---

# Feedback Skill

Serve a browser-based review UI for a set of items, wait for the user to
make decisions, and return structured feedback. The waiting uses a bash
filewatch loop so no AI tokens are consumed while the user reviews.

## When to Activate

- An agent has produced items that need human triage/review/approval
- User says "get feedback", "review these", "triage"
- User invokes `/feedback <path-to-request.json>`

## Usage

```
/feedback <request.json>                 # Serve review UI and wait
/feedback --check <session-id>           # Check if feedback was submitted
```

---

## Request JSON Schema

The calling agent writes a JSON file with this structure:

```json
{
  "title": "Review Title",
  "subtitle": "Brief instructions for the reviewer",
  "comment_mode": "action",
  "actions": [
    {"id": "accept", "label": "Accept", "icon": "check", "style": "green"},
    {"id": "discuss", "label": "Discuss", "icon": "chat", "style": "yellow", "has_comment": true, "comment_placeholder": "What would you like to discuss?"},
    {"id": "reject", "label": "Reject", "icon": "x", "style": "red"}
  ],
  "groups": [
    {
      "name": "Group Name",
      "items": [
        {
          "id": "unique-id",
          "ref": "A",
          "title": "Item Title",
          "description": "Item description",
          "tags": [
            {"label": "new", "style": "green"},
            {"label": "custom", "bg": "#1a0a2e", "color": "#9f7aea"}
          ],
          "details": "Expandable long-form content",
          "context": "Previous note or reviewer context"
        }
      ]
    }
  ]
}
```

### Field Reference

**Top-level:**

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `title` | yes | — | Page heading |
| `subtitle` | no | — | Description below heading |
| `comment_mode` | no | `"action"` | `"action"` = show comment when action has `has_comment`. `"always"` = show comment for every item |
| `actions` | yes | — | Array of available actions |
| `groups` | yes | — | Array of item groups |

**Action fields:**

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `id` | yes | — | Unique action identifier |
| `label` | yes | — | Button label text |
| `icon` | no | — | Icon hint: `"check"`, `"chat"`, `"x"`, `"star"`, `"flag"` |
| `style` | yes | — | Color: `"green"`, `"yellow"`, `"red"`, `"blue"`, `"purple"`, `"cyan"`, `"orange"` |
| `has_comment` | no | `false` | Show comment area when this action is selected |
| `comment_placeholder` | no | `"Add a comment…"` | Placeholder text for comment textarea |

**Item fields:**

| Field | Required | Description |
|-------|----------|-------------|
| `id` | yes | Unique identifier (used in response) |
| `ref` | no | Short display reference (e.g. "A", "#1", "T01") |
| `title` | yes | Item title |
| `description` | no | Description text |
| `tags` | no | Array of `{label, style}` or `{label, bg, color}` |
| `details` | no | Expandable content (shown on click) |
| `context` | no | Previous note/context (shown with left border) |

---

## Step 1: Parse Arguments

From `$ARGUMENTS`:

1. If contains `--check` → extract session-id, jump to **Check Mode**
2. Otherwise → first positional arg is the request JSON path → **Serve Mode**

---

## Step 2: Serve Mode

### A. Generate Session

```bash
SESSION_ID="feedback-$(date +%s)"
WORKSPACE=".feedback/$SESSION_ID"
mkdir -p "$WORKSPACE"
```

### B. Copy Request File

Read the request JSON file provided by the user (using Read tool).
Write it to `{workspace}/request.json` (using Write tool).

### C. Deploy Server and UI

Read `.claude/skills/feedback/templates/feedback-server.py` using the Read tool.
Write its content verbatim to `{workspace}/feedback-server.py` using the Write tool.

Read `.claude/skills/feedback/templates/feedback.html` using the Read tool.
Write its content verbatim to `{workspace}/feedback.html` using the Write tool.

### D. Start Server

```bash
cd "{workspace}" && python3 feedback-server.py request.json 0 >> server.log 2>&1 &
```

Wait for startup and read port:

```bash
sleep 1 && cat "{workspace}/server.port" 2>/dev/null || echo "FAILED"
```

If FAILED, print error from `{workspace}/server.log` and EXIT.

### E. Open Browser

```bash
open "http://127.0.0.1:{port}" 2>/dev/null || \
xdg-open "http://127.0.0.1:{port}" 2>/dev/null || \
echo "Open in browser: http://127.0.0.1:{port}"
```

### F. Print Status

```
╔══════════════════════════════════════════════════════╗
║  FEEDBACK: {title}                                   ║
╚══════════════════════════════════════════════════════╝

Review UI: http://127.0.0.1:{port}
Session:   {SESSION_ID}

Waiting for your feedback…
(Review items in the browser and click "Send Feedback" when done)
```

### G. Wait for Response (Zero Token Consumption)

Run a bash command that blocks until the response file exists. This does NOT
consume AI tokens — the bash process just sleeps.

```bash
RESPONSE="{workspace}/response.json"
end=$((SECONDS + 600))
while [ ! -f "$RESPONSE" ] && [ $SECONDS -lt $end ]; do
  sleep 2
done
if [ -f "$RESPONSE" ]; then
  cat "$RESPONSE"
else
  echo "__TIMEOUT__"
fi
```

**Timeout**: 600 seconds (10 minutes). Use the Bash tool with `timeout: 610000`.

### H. Process Response

If the output is `__TIMEOUT__`:
- Print: "Feedback not received within 10 minutes."
- Print: "The review UI is still running. Submit when ready, then run:"
- Print: "  `/feedback --check {SESSION_ID}`"
- EXIT

Otherwise, parse the JSON response. Format and return the feedback:

```
## Feedback Results: {title}

**Summary:** {accept_count} accepted · {discuss_count} to discuss · {reject_count} rejected · {pending_count} pending

### Accepted
- **{ref}** {title}
  {comment if any}

### To Discuss
- **{ref}** {title}
  > {comment}

### Rejected
- **{ref}** {title}

### Pending (no decision)
- **{ref}** {title}
```

### I. Cleanup Server

```bash
if [ -f "{workspace}/server.pid" ]; then
  kill $(cat "{workspace}/server.pid") 2>/dev/null
  rm -f "{workspace}/server.pid" "{workspace}/server.port"
fi
```

---

## Check Mode

1. Read `.feedback/{session-id}/response.json`
2. If file exists: format and return feedback (same as Step H)
3. If not: check if server is still running (`kill -0 $(cat .feedback/{session-id}/server.pid)`)
   - Running: "Still waiting. Review UI: http://127.0.0.1:{port}"
   - Dead: "Server stopped. No feedback received."

---

## Error Handling

| Situation | Action |
|-----------|--------|
| Request JSON not found | Print error with path, EXIT |
| Invalid JSON | Print parse error, EXIT |
| Server fails to start | Print server.log content, EXIT |
| Timeout waiting | Print check command, EXIT |
| Port file missing | Default to port 8902, warn |

---

## Integration Pattern

For agents that want to collect feedback, the pattern is:

1. **Agent writes request JSON** to a temp file
2. **Agent tells main conversation** to run `/feedback <path>`
3. **Skill serves UI and waits**
4. **Skill returns formatted feedback** to the conversation
5. **Main conversation passes feedback** back to the agent

Example agent prompt addition:
```
When you need human feedback on your output, write a feedback request JSON
to {workspace}/feedback-request.json following the schema in the feedback
skill, then tell the main conversation: "Please run /feedback {path}"
```
