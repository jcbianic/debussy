import { describe, it, expect } from 'vitest'
import {
  parsePluginManifest,
  parseSkillFrontmatter,
  parseCommandFrontmatter,
  parseAgentFrontmatter,
  parseHooksJson,
  parseInstalledPlugins,
  buildSetupItems,
  isValidItemName,
  serializeSkill,
  serializeCommand,
  serializeAgent,
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
license: MIT
metadata:
  author: jcbianic
  version: "0.2.0"
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
  it('extracts name, description, body, and metadata from valid SKILL.md', () => {
    const result = parseSkillFrontmatter(VALID_SKILL_MD, 'brainstorming')
    expect(result).not.toBeNull()
    expect(result!.name).toBe('brainstorming')
    expect(result!.description).toContain('Collaborative design')
    expect(result!.body).toContain('Use when requirements are unclear.')
    expect(result!.metadata).toEqual({
      license: 'MIT',
      metadata: { author: 'jcbianic', version: '0.2.0' },
    })
  })

  it('falls back to directory name when frontmatter is missing', () => {
    const result = parseSkillFrontmatter(SKILL_NO_FRONTMATTER, 'some-skill')
    expect(result).not.toBeNull()
    expect(result!.name).toBe('some-skill')
  })

  it('falls back to directory name when name field is absent', () => {
    const result = parseSkillFrontmatter(SKILL_NO_NAME, 'my-skill')
    expect(result).not.toBeNull()
    expect(result!.name).toBe('my-skill')
    expect(result!.description).toBe('A skill without a name field.')
    expect(result!.body).toBe('Content here.')
  })

  it('returns null when neither name nor dirName is provided', () => {
    const result = parseSkillFrontmatter(SKILL_NO_NAME)
    expect(result).toBeNull()
  })

  it('omits metadata when no extra frontmatter fields exist', () => {
    const result = parseSkillFrontmatter(SKILL_NO_NAME, 'my-skill')
    expect(result!.metadata).toBeUndefined()
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

// ─── parseAgentFrontmatter ───────────────────────────────────────────────────

const VALID_AGENT_MD = `---
description: >-
  Senior frontend lead specialized in Nuxt 4.
model: sonnet
tools: Read, Grep, Glob, Bash
---

You are a senior frontend lead.
`

const AGENT_NO_FRONTMATTER = `# Just markdown

No frontmatter here.
`

describe('parseAgentFrontmatter', () => {
  it('extracts name from filename, description, model, tools, and body', () => {
    const result = parseAgentFrontmatter(VALID_AGENT_MD, 'frontend-lead.md')
    expect(result).not.toBeNull()
    expect(result!.name).toBe('frontend-lead')
    expect(result!.description).toContain('Senior frontend lead')
    expect(result!.model).toBe('sonnet')
    expect(result!.tools).toBe('Read, Grep, Glob, Bash')
    expect(result!.body).toContain('senior frontend lead')
  })

  it('strips .md extension from filename for name', () => {
    const result = parseAgentFrontmatter(VALID_AGENT_MD, 'my-agent.md')
    expect(result!.name).toBe('my-agent')
  })

  it('falls back to filename when no frontmatter name', () => {
    const result = parseAgentFrontmatter(AGENT_NO_FRONTMATTER, 'fallback.md')
    expect(result).not.toBeNull()
    expect(result!.name).toBe('fallback')
  })

  it('returns null for empty content', () => {
    expect(parseAgentFrontmatter('', 'empty.md')).toBeNull()
    expect(parseAgentFrontmatter('   ', 'blank.md')).toBeNull()
  })

  it('collects extra frontmatter fields as metadata', () => {
    const md = `---
description: test
model: opus
custom_field: hello
---

Body.
`
    const result = parseAgentFrontmatter(md, 'meta.md')
    expect(result!.metadata).toEqual({ custom_field: 'hello' })
  })

  it('omits metadata when no extra fields exist', () => {
    const result = parseAgentFrontmatter(VALID_AGENT_MD, 'clean.md')
    expect(result!.metadata).toBeUndefined()
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

  it('extracts commands from hook definitions', () => {
    const result = parseHooksJson(VALID_HOOKS_JSON)
    const postToolHook = result.find((h) => h.triggers.includes('PostToolUse'))
    expect(postToolHook!.commands).toEqual(['echo "post tool use"'])
    const stopHook = result.find((h) => h.triggers.includes('Stop'))
    expect(stopHook!.commands).toEqual(['echo "stop"'])
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
    expect(result[0]!.commands).toEqual(['echo 1'])
    expect(result[1]!.commands).toEqual(['echo 2'])
  })

  it('handles hooks with no command entries', () => {
    const noCommands = JSON.stringify({
      hooks: {
        Stop: [{ hooks: [] }],
      },
    })
    const result = parseHooksJson(noCommands)
    expect(result).toHaveLength(1)
    expect(result[0]!.commands).toBeUndefined()
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
  skills: [
    {
      name: 'test-skill',
      description: 'A test skill',
      files: [
        { relativePath: 'run.sh', content: '#!/bin/bash\necho hello' },
        { relativePath: 'templates/review.html', content: '<html></html>' },
      ],
    },
  ],
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
      commands: ['${CLAUDE_PLUGIN_ROOT}/hooks/post-tool.sh'],
      files: [
        {
          relativePath: 'hooks/post-tool.sh',
          content: '#!/bin/bash\necho done',
        },
      ],
    },
  ],
  agents: [
    {
      name: 'frontend-lead',
      description: 'Nuxt 4 expert',
      model: 'sonnet',
      tools: 'Read, Grep, Glob',
    },
  ],
}

describe('buildSetupItems', () => {
  it('assembles plugins, skills, commands, hooks into SetupItem[] array', () => {
    const result = buildSetupItems([MOCK_PLUGIN_DATA])
    expect(result.length).toBeGreaterThanOrEqual(5) // plugin + skill + command + hook + agent
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

  it('passes files through to skill SetupItems', () => {
    const result = buildSetupItems([MOCK_PLUGIN_DATA])
    const skill = result.find((i) => i.type === 'skill')
    expect(skill).toBeDefined()
    expect(skill!.files).toHaveLength(2)
    expect(skill!.files![0]!.relativePath).toBe('run.sh')
    expect(skill!.files![1]!.relativePath).toBe('templates/review.html')
  })

  it('omits files when skill has no files', () => {
    const data = {
      ...MOCK_PLUGIN_DATA,
      skills: [{ name: 'no-files-skill', description: 'No files' }],
    }
    const result = buildSetupItems([data])
    const skill = result.find((i) => i.type === 'skill')
    expect(skill!.files).toBeUndefined()
  })

  it('passes command as body and files through to hook SetupItems', () => {
    const result = buildSetupItems([MOCK_PLUGIN_DATA])
    const hook = result.find((i) => i.type === 'hook')
    expect(hook).toBeDefined()
    expect(hook!.body).toBe('${CLAUDE_PLUGIN_ROOT}/hooks/post-tool.sh')
    expect(hook!.files).toHaveLength(1)
    expect(hook!.files![0]!.relativePath).toBe('hooks/post-tool.sh')
  })
})

// ─── isValidItemName ────────────────────────────────────────────────────────

describe('isValidItemName', () => {
  it('accepts lowercase alphanumeric names with hyphens', () => {
    expect(isValidItemName('my-skill')).toBe(true)
    expect(isValidItemName('skill123')).toBe(true)
    expect(isValidItemName('a')).toBe(true)
  })

  it('rejects names starting with a hyphen', () => {
    expect(isValidItemName('-bad')).toBe(false)
  })

  it('rejects uppercase, spaces, and special characters', () => {
    expect(isValidItemName('MySkill')).toBe(false)
    expect(isValidItemName('my skill')).toBe(false)
    expect(isValidItemName('my_skill')).toBe(false)
    expect(isValidItemName('my/skill')).toBe(false)
    expect(isValidItemName('../traversal')).toBe(false)
  })

  it('rejects empty strings', () => {
    expect(isValidItemName('')).toBe(false)
  })

  it('rejects names longer than 64 characters', () => {
    expect(isValidItemName('a'.repeat(64))).toBe(true)
    expect(isValidItemName('a'.repeat(65))).toBe(false)
  })
})

// ─── serializeSkill ─────────────────────────────────────────────────────────

describe('serializeSkill', () => {
  it('produces valid frontmatter + body that can be re-parsed', () => {
    const content = serializeSkill({
      description: 'A test skill for exploration.',
      body: '# Usage\n\nUse this skill when exploring.',
    })
    const parsed = parseSkillFrontmatter(content, 'test')
    expect(parsed).not.toBeNull()
    expect(parsed!.description).toBe('A test skill for exploration.')
    expect(parsed!.body).toContain('# Usage')
  })

  it('handles empty body', () => {
    const content = serializeSkill({ description: 'No body skill.' })
    expect(content).toContain('description:')
    expect(content).not.toContain('\n\n\n')
  })

  it('includes metadata fields in frontmatter', () => {
    const content = serializeSkill({
      description: 'With metadata',
      metadata: { license: 'MIT' },
    })
    expect(content).toContain('license:')
  })
})

// ─── serializeCommand ───────────────────────────────────────────────────────

describe('serializeCommand', () => {
  it('produces valid frontmatter + body that can be re-parsed', () => {
    const content = serializeCommand({
      description: 'Run quick search',
      argHint: '<query>',
      allowedTools: 'Read, Grep',
      body: 'Search the codebase for the given query.',
    })
    const parsed = parseCommandFrontmatter(content, 'search')
    expect(parsed).not.toBeNull()
    expect(parsed!.description).toBe('Run quick search')
    expect(parsed!.argHint).toBe('<query>')
    expect(parsed!.allowedTools).toBe('Read, Grep')
    expect(parsed!.body).toContain('Search the codebase')
  })

  it('omits optional fields when not provided', () => {
    const content = serializeCommand({ description: 'Simple command' })
    expect(content).not.toContain('argument-hint')
    expect(content).not.toContain('allowed-tools')
    expect(content).not.toContain('delegates-to')
  })

  it('includes delegates-to when provided', () => {
    const content = serializeCommand({
      description: 'Delegating command',
      delegatesTo: 'my-skill',
    })
    const parsed = parseCommandFrontmatter(content, 'delegate')
    expect(parsed!.delegatesTo).toBe('my-skill')
  })
})

// ─── serializeAgent ─────────────────────────────────────────────────────────

describe('serializeAgent', () => {
  it('produces valid frontmatter + body that can be re-parsed', () => {
    const content = serializeAgent({
      name: 'test-agent',
      description: 'A testing agent',
      model: 'sonnet',
      tools: 'Read, Grep, Bash',
      body: 'You are a testing agent.',
    })
    const parsed = parseAgentFrontmatter(content, 'test-agent.md')
    expect(parsed).not.toBeNull()
    expect(parsed!.name).toBe('test-agent')
    expect(parsed!.description).toBe('A testing agent')
    expect(parsed!.model).toBe('sonnet')
    expect(parsed!.tools).toBe('Read, Grep, Bash')
    expect(parsed!.body).toContain('testing agent')
  })

  it('omits optional fields when not provided', () => {
    const content = serializeAgent({ description: 'Minimal agent' })
    expect(content).not.toContain('model:')
    expect(content).not.toContain('tools:')
  })
})
