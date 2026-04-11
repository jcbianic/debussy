---
description: >-
  Browse all markdown files in the repo, summarize each one, and classify it
  by Debussy strate (vision, product, engineering, work) or role (spec, plan,
  skill, meta). Produces a structured inventory report so you know what exists
  before running any other strate.
license: MIT
metadata:
  author: jcbianic
  version: "0.1.0"
---

# Markdown Inventory Skill

Scan every markdown file in the repository, extract a short summary, and
classify it into one of Debussy's categories. The output is a structured
inventory that tells you at a glance what documentation already exists, what
strate it belongs to, and where the gaps are.

## When to Activate

- Bootstrapping Debussy on a project that already has docs
- User invokes `/debussy:markdown-inventory`
- User asks "what docs do we have?", "inventory the markdown", "what exists?"
- Before running `/debussy:strategy` or `/debussy:product` for the first time,
  to understand the starting point

## Usage

```
/debussy:markdown-inventory                  # Full inventory of all .md files
/debussy:markdown-inventory --path docs/     # Scope to a subdirectory
```

---

## Step 1: Discover Markdown Files

Find all `.md` files in the repository, excluding noise directories.

Use the **Glob** tool with pattern `**/*.md` from the project root.

**Exclude** files under these directories (skip any match containing these
path segments):

- `node_modules/`
- `.git/`
- `.nuxt/`
- `.output/`
- `dist/`
- `.feedback/`

If `--path <dir>` was provided in `$ARGUMENTS`, scope the glob to that
subdirectory instead of the project root.

Sort the results into a working list of absolute paths.

---

## Step 2: Read and Summarize Each File

For each discovered file, use the **Read** tool (limit to the first 80 lines)
and extract:

1. **Frontmatter** — If the file starts with `---`, parse the YAML block.
   Record any `name`, `title`, `description`, `status`, `icon`, `type`,
   `subject`, `order`, `date` fields found.
2. **Title** — The first `# Heading` line (H1). If none, use the filename.
3. **Summary** — Write a 1-2 sentence summary of what the file covers, based
   on the content you read. Be concrete: mention specific topics, not
   generic descriptions.
4. **Word count estimate** — Count lines read and estimate: short (<50
   lines), medium (50-150), long (>150).

Read files in parallel where possible (batch Read calls) to minimize
round-trips.

---

## Step 3: Classify Each File

Assign each file to exactly one **category** based on its path, content, and
frontmatter. Use the first matching rule:

### Path-based rules (highest priority)

| Path pattern | Category |
|---|---|
| `skills/*/SKILL.md` | **Skill** |
| `.debussy/strategy/*` | **Vision & Strategy** |
| `.debussy/product/*` | **Product** |
| `.debussy/policies/*` | **Engineering & Policy** |
| `.debussy/architecture/*` | **Engineering & Policy** |
| `.debussy/decisions/*` | **Engineering & Policy** |
| `.claude/commands/*` | **Engineering & Policy** |
| `specs/*` | **Specification** |
| `docs/plans/*` | **Plan & Research** |

### Filename-based rules

| Filename | Category |
|---|---|
| `README.md` | **Project Meta** |
| `CLAUDE.md` | **Project Meta** |
| `AGENTS.md` | **Project Meta** |
| `CHANGELOG.md` | **Project Meta** |
| `CONTRIBUTING.md` | **Project Meta** |
| `LICENSE.md` | **Project Meta** |

### Content-based rules (lowest priority)

If no path or filename rule matched, classify by scanning the title and
first 80 lines for signal words:

| Signal words in title or content | Category |
|---|---|
| vision, north star, why we're building, mission | **Vision & Strategy** |
| landscape, competitor, ally, ecosystem, market | **Vision & Strategy** |
| problem, audience, pain point, severity | **Vision & Strategy** |
| product, positioning, one-liner, target user, non-goal | **Product** |
| intent, roadmap, milestone, priority, done when | **Product** |
| architecture, principle, ADR, decision, policy, governance | **Engineering & Policy** |
| spec, specification, schema, API, interface, contract | **Specification** |
| plan, research, investigation, migration, refactor plan | **Plan & Research** |

If still unclassified, assign **Uncategorized**.

---

## Step 4: Build the Inventory Report

Produce the inventory as a markdown document. Structure it as follows:

```markdown
# Markdown Inventory

> Generated {YYYY-MM-DD} — {total_count} files found

## Summary

| Category | Count | Files |
|---|---|---|
| Vision & Strategy | {n} | {comma-separated filenames} |
| Product | {n} | ... |
| Engineering & Policy | {n} | ... |
| Specification | {n} | ... |
| Plan & Research | {n} | ... |
| Skill | {n} | ... |
| Project Meta | {n} | ... |
| Uncategorized | {n} | ... |

## Gap Analysis

Based on the inventory, note which Debussy strates have existing material
and which are empty:

- **Strategy**: {present / missing} — list relevant files or "no artifacts found"
- **Product**: {present / missing}
- **Engineering**: {present / missing}
- **Work**: always enabled, check for workflow files

## Detailed Inventory

### Vision & Strategy

#### {relative-path}
- **Title**: {title}
- **Summary**: {1-2 sentence summary}
- **Status**: {frontmatter status or "no frontmatter"}
- **Size**: {short / medium / long}

{repeat for each file in category}

### Product

{same structure}

### Engineering & Policy

{same structure}

### Specification

{same structure}

### Plan & Research

{same structure}

### Skill

{same structure}

### Project Meta

{same structure}

### Uncategorized

{same structure, if any}
```

---

## Step 5: Write the Output

Write the inventory report to `.debussy/inventory.md` using the **Write**
tool.

If `.debussy/` does not exist, create it first:

```bash
mkdir -p .debussy
```

---

## Step 6: Print Summary

Print a formatted summary to the conversation:

```
MARKDOWN INVENTORY COMPLETE

{total_count} files scanned, classified into {category_count} categories

  Vision & Strategy:    {n} files
  Product:              {n} files
  Engineering & Policy: {n} files
  Specification:        {n} files
  Plan & Research:      {n} files
  Skill:                {n} files
  Project Meta:         {n} files
  Uncategorized:        {n} files

Gap analysis:
  Strategy:    {present with N files / no artifacts}
  Product:     {present with N files / no artifacts}
  Engineering: {present with N files / no artifacts}

Full inventory written to: .debussy/inventory.md
```

Suggest next steps based on gaps:

- If strategy artifacts are missing: "Run `/debussy:strategy` to research
  and build your strategy artifacts."
- If product artifacts are missing: "Run `/debussy:product` to define your
  product from existing strategy docs."
- If engineering artifacts are missing: "Run `/debussy:engineering` to set
  up governance."
- If existing docs were found outside `.debussy/`: "Consider running
  `/debussy:init` and migrating existing docs into the `.debussy/`
  structure."

---

## Error Handling

| Situation | Action |
|---|---|
| No `.md` files found | Print "No markdown files found in the repository." and EXIT |
| `--path` directory does not exist | Print error with path, EXIT |
| File read fails | Skip the file, note it as "(unreadable)" in inventory |
| `.debussy/` cannot be created | Print inventory to conversation only, skip file write |
