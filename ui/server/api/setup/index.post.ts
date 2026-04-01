import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { resolveDebussyPath } from '../../utils/debussy'
import {
  isValidItemName,
  serializeSkill,
  serializeCommand,
  serializeAgent,
} from '../../utils/setup'

interface CreateBody {
  type: 'skill' | 'command' | 'agent'
  name: string
  description?: string
  body?: string
  // command-specific
  argHint?: string
  allowedTools?: string
  delegatesTo?: string
  // agent-specific
  model?: string
  tools?: string
  metadata?: Record<string, unknown>
}

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as CreateBody

  if (!body?.type || !body?.name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'type and name are required',
    })
  }
  if (!['skill', 'command', 'agent'].includes(body.type)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'type must be skill, command, or agent',
    })
  }
  if (!isValidItemName(body.name)) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'name must be lowercase alphanumeric with hyphens (e.g. my-skill)',
    })
  }

  const projectRoot = await resolveDebussyPath('.claude')

  if (body.type === 'skill') {
    const skillDir = path.join(projectRoot, 'skills', body.name)
    await mkdir(skillDir, { recursive: true })
    const content = serializeSkill({
      description: body.description,
      body: body.body,
      metadata: body.metadata,
    })
    await writeFile(path.join(skillDir, 'SKILL.md'), content, 'utf8')
  } else if (body.type === 'command') {
    const commandsDir = path.join(projectRoot, 'commands')
    await mkdir(commandsDir, { recursive: true })
    const content = serializeCommand({
      description: body.description,
      argHint: body.argHint,
      allowedTools: body.allowedTools,
      delegatesTo: body.delegatesTo,
      body: body.body,
    })
    await writeFile(path.join(commandsDir, `${body.name}.md`), content, 'utf8')
  } else {
    const agentsDir = path.join(projectRoot, 'agents')
    await mkdir(agentsDir, { recursive: true })
    const content = serializeAgent({
      name: body.name,
      description: body.description,
      model: body.model,
      tools: body.tools,
      body: body.body,
      metadata: body.metadata,
    })
    await writeFile(path.join(agentsDir, `${body.name}.md`), content, 'utf8')
  }

  return { ok: true, id: `project:${body.name}` }
})
