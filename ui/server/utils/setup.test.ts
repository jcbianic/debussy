import { describe, it, expect } from 'vitest'
import {
  parsePluginManifest,
  parseSkillFrontmatter,
  parseCommandFrontmatter,
  parseHooksJson,
  parseInstalledPlugins,
  buildSetupItems,
} from './setup'

// ─── parsePluginManifest ─────────────────────────────────────────────────────

const VALID_PLUGIN_JSON = JSON.stringify({
  name: 'rpikit',
  version: '0.5.1',
  description: 'General-purpose framework for disciplined engineering.',
})

const PLUGIN_MISSING_OPTIONAL = JSON.stringify({
  name: 'minimal-plugin',
})

describe('parsePluginManifest', () => {
  it('returns name, version, description from valid plugin.json content', () => {
    const result = parsePluginManifest(VALID_PLUGIN_JSON)
    expect(result).not.toBeNull()
    expect(result!.name).toBe('rpikit')
    expect(result!.version).toBe('0.5.1')
    expect(result!.description).toBe(
      'General-purpose framework for disciplined engineering.'
    )
  })

  it('returns null for empty/malformed JSON', () => {
    expect(parsePluginManifest('')).toBeNull()
    expect(parsePluginManifest('not json')).toBeNull()
    expect(parsePluginManifest('{broken')).toBeNull()
  })

  it('handles missing optional fields gracefully', () => {
    const result = parsePluginManifest(PLUGIN_MISSING_OPTIONAL)
    expect(result).not.toBeNull()
    expect(result!.name).toBe('minimal-plugin')
    expect(result!.version).toBeUndefined()
    expect(result!.description).toBeUndefined()
  })
})

// ─── parseSkillFrontmatter ───────────────────────────────────────────────────

const VALID_SKILL_MD = `---
name: brainstorming
description: >-
  Collaborative design methodology for creative work.
---

Use when requirements are unclear.
`

const SKILL_NO_FRONTMATTER = `# Just a markdown file

No frontmatter here.
`

const SKILL_NO_NAME = `---
description: A skill without a name field.
---

Content here.
`

describe('parseSkillFrontmatter', () => {
  it('extracts name and description from valid SKILL.md content', () => {
    const result = parseSkillFrontmatter(VALID_SKILL_MD, 'brainstorming')
    expect(result).not.toBeNull()
    expect(result!.name).toBe('brainstorming')
    expect(result!.description).toContain('Collaborative design')
  })

  it('returns null when frontmatter is missing', () => {
    const result = parseSkillFrontmatter(SKILL_NO_FRONTMATTER, 'some-skill')
    expect(result).toBeNull()
  })

  it('returns null when name field is absent', () => {
    const result = parseSkillFrontmatter(SKILL_NO_NAME, 'fallback-dir')
    expect(result).toBeNull()
  })

  it('handles description-only frontmatter (no name) by falling back to directory name', () => {
    // This test checks a graceful fallback behavior. If the implementation
    // chooses to fall back to dirName when name is absent, this test should
    // be updated accordingly. For now, we expect null per the plan.
    const result = parseSkillFrontmatter(SKILL_NO_NAME, 'my-skill')
    expect(result).toBeNull()
  })
})

// ─── parseCommandFrontmatter ─────────────────────────────────────────────────

const VALID_COMMAND_MD = `---
description: Deep codebase exploration
argument-hint: <question or goal>
allowed-tools: Read,Grep,Glob,Bash
---

You are tasked with exploring the codebase to answer questions.
`

const COMMAND_WITH_DISABLE = `---
description: Run tests silently
disable-model-invocation: true
---

Run the test suite.
`

const COMMAND_WITH_DELEGATES = `---
description: Delegates to another skill
delegates-to: rpikit:implementing-plans
---
`

describe('parseCommandFrontmatter', () => {
  it('extracts description, argHint, allowedTools from valid command .md content', () => {
    const result = parseCommandFrontmatter(VALID_COMMAND_MD, 'research')
    expect(result).not.toBeNull()
    expect(result!.description).toBe('Deep codebase exploration')
    expect(result!.argHint).toBe('<question or goal>')
    expect(result!.allowedTools).toBe('Read,Grep,Glob,Bash')
  })

  it('extracts body content after frontmatter', () => {
    const result = parseCommandFrontmatter(VALID_COMMAND_MD, 'research')
    expect(result).not.toBeNull()
    expect(result!.body).toContain('exploring the codebase')
  })

  it('returns null for empty content', () => {
    expect(parseCommandFrontmatter('', 'empty')).toBeNull()
  })

  it('handles disable-model-invocation field', () => {
    const result = parseCommandFrontmatter(COMMAND_WITH_DISABLE, 'test')
    expect(result).not.toBeNull()
    expect(result!.description).toBe('Run tests silently')
  })

  it('handles delegates-to field', () => {
    const result = parseCommandFrontmatter(COMMAND_WITH_DELEGATES, 'implement')
    expect(result).not.toBeNull()
    expect(result!.delegatesTo).toBe('rpikit:implementing-plans')
  })
})

// ─── parseHooksJson ──────────────────────────────────────────────────────────

const VALID_HOOKS_JSON = JSON.stringify({
  description: 'Plugin hooks',
  hooks: {
    PostToolUse: [
      {
        matcher: 'Write|Edit',
        hooks: [
          {
            type: 'command',
            command: 'echo "post tool use"',
          },
        ],
      },
    ],
    Stop: [
      {
        hooks: [
          {
            type: 'command',
            command: 'echo "stop"',
          },
        ],
      },
    ],
  },
})

describe('parseHooksJson', () => {
  it('returns array of hook entries from valid hooks.json content', () => {
    const result = parseHooksJson(VALID_HOOKS_JSON)
    expect(result.length).toBeGreaterThan(0)
  })

  it('extracts trigger event types as triggers array (PostToolUse, Stop, etc.)', () => {
    const result = parseHooksJson(VALID_HOOKS_JSON)
    const triggers = result.flatMap((h) => h.triggers)
    expect(triggers).toContain('PostToolUse')
    expect(triggers).toContain('Stop')
  })

  it('extracts matcher patterns from hook entries', () => {
    const result = parseHooksJson(VALID_HOOKS_JSON)
    const postToolHook = result.find((h) => h.triggers.includes('PostToolUse'))
    expect(postToolHook).toBeDefined()
    // The matcher should be captured somehow in the hook entry
    expect(postToolHook!.description).toContain('Write|Edit')
  })

  it('returns empty array for empty/malformed JSON', () => {
    expect(parseHooksJson('')).toEqual([])
    expect(parseHooksJson('not json')).toEqual([])
    expect(parseHooksJson('{}')).toEqual([])
  })

  it('handles nested hooks structure correctly', () => {
    const nested = JSON.stringify({
      hooks: {
        PostToolUse: [
          {
            matcher: 'Bash',
            hooks: [{ type: 'command', command: 'echo 1' }],
          },
          {
            matcher: 'Write',
            hooks: [{ type: 'command', command: 'echo 2' }],
          },
        ],
      },
    })
    const result = parseHooksJson(nested)
    expect(result.length).toBeGreaterThan(0)
  })
})

// ─── parseInstalledPlugins ───────────────────────────────────────────────────

const VALID_INSTALLED_PLUGINS = JSON.stringify({
  version: 2,
  plugins: {
    'rpikit@rpikit': [
      {
        scope: 'user',
        installPath: '~/.claude/plugins/cache/rpikit/0.5.1',
        version: '0.5.1',
        installedAt: '2026-02-28T08:08:42.613Z',
        lastUpdated: '2026-02-28T08:08:42.613Z',
        gitCommitSha: 'abc123',
      },
    ],
    'debussy@debussy': [
      {
        scope: 'user',
        installPath: '~/.claude/plugins/cache/debussy/0.1.0',
        version: '0.1.0',
        installedAt: '2026-03-16T10:00:00.000Z',
        lastUpdated: '2026-03-16T10:00:00.000Z',
      },
    ],
  },
})

describe('parseInstalledPlugins', () => {
  it('returns array of plugin entries with id, scope, installPath, version, installedAt', () => {
    const result = parseInstalledPlugins(VALID_INSTALLED_PLUGINS)
    expect(result).toHaveLength(2)
    expect(result[0]!.id).toBe('rpikit@rpikit')
    expect(result[0]!.scope).toBe('user')
    expect(result[0]!.version).toBe('0.5.1')
    expect(result[0]!.installedAt).toBe('2026-02-28T08:08:42.613Z')
  })

  it('handles version 2 format', () => {
    const result = parseInstalledPlugins(VALID_INSTALLED_PLUGINS)
    expect(result.length).toBeGreaterThan(0)
    for (const p of result) {
      expect(p).toHaveProperty('id')
      expect(p).toHaveProperty('installPath')
    }
  })

  it('returns empty array for empty/missing plugins', () => {
    expect(parseInstalledPlugins('')).toEqual([])
    expect(parseInstalledPlugins('{}')).toEqual([])
    expect(parseInstalledPlugins('null')).toEqual([])
  })

  it('normalizes installPath (expands ~ to homedir)', () => {
    const result = parseInstalledPlugins(VALID_INSTALLED_PLUGINS)
    for (const p of result) {
      expect(p.installPath).not.toContain('~')
      expect(p.installPath).toMatch(/^\//)
    }
  })
})

// ─── buildSetupItems ─────────────────────────────────────────────────────────

const MOCK_PLUGIN_DATA = {
  id: 'test-plugin@test',
  name: 'test-plugin',
  version: '1.0.0',
  scope: 'user',
  description: 'A test plugin',
  installedAt: '2026-01-01T00:00:00Z',
  installPath: '/tmp/test-plugin',
  skills: [{ name: 'test-skill', description: 'A test skill' }],
  commands: [
    {
      name: 'test-cmd',
      description: 'A test command',
      argHint: '<arg>',
      allowedTools: 'Read',
      body: 'Do something.',
    },
  ],
  hooks: [
    {
      name: 'post-tool-hook',
      description: 'PostToolUse: Write|Edit',
      triggers: ['PostToolUse'],
    },
  ],
}

describe('buildSetupItems', () => {
  it('assembles plugins, skills, commands, hooks into SetupItem[] array', () => {
    const result = buildSetupItems([MOCK_PLUGIN_DATA])
    expect(result.length).toBeGreaterThanOrEqual(4) // plugin + skill + command + hook
  })

  it('sets plugin field on child items to parent id', () => {
    const result = buildSetupItems([MOCK_PLUGIN_DATA])
    const children = result.filter((i) => i.type !== 'plugin')
    for (const child of children) {
      expect(child.plugin).toBe('test-plugin@test')
    }
  })

  it('sets provides field on plugin items', () => {
    const result = buildSetupItems([MOCK_PLUGIN_DATA])
    const plugin = result.find((i) => i.type === 'plugin')
    expect(plugin).toBeDefined()
    expect(plugin!.provides).toBeDefined()
    expect(plugin!.provides!.length).toBeGreaterThan(0)
  })

  it('sets usage to 0 for all items', () => {
    const result = buildSetupItems([MOCK_PLUGIN_DATA])
    for (const item of result) {
      expect(item.usage).toBe(0)
    }
  })

  it('assigns unique ids to all items', () => {
    const result = buildSetupItems([MOCK_PLUGIN_DATA])
    const ids = result.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
