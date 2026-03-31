import { writeFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { resolveDebussyPath } from '../../utils/debussy'
import {
  isValidItemName,
  serializeSkill,
  serializeCommand,
  serializeAgent,
} from '../../utils/setup'

interface UpdateBody {
  type: 'skill' | 'command' | 'agent'
  description?: string
  body?: string
  // command-specific
  argHint?: string
  allowedTools?: string
  delegatesTo?: string
  // agent-specific
  name?: string
  model?: string
  tools?: string
  metadata?: Record<string, unknown>
}

async function exists(p: string): Promise<boolean> {
  try {
    await stat(p)
    return true
  } catch {
    return false
  }
}

export default defineEventHandler(async (event) => {
  const rawId = getRouterParam(event, 'id')
  if (!rawId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing item id' })
  }

  // Only project-scoped items are editable — id format: "project:{name}" or "project:cmd:{name}" or "project:agent:{name}"
  if (!rawId.startsWith('project:')) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Only project-scoped items can be edited',
    })
  }

  const body = (await readBody(event)) as UpdateBody
  if (!body?.type || !['skill', 'command', 'agent'].includes(body.type)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'type must be skill, command, or agent',
    })
  }

  const projectRoot = await resolveDebussyPath('.claude')

  // Parse item name from the id
  // skill:  "project:my-skill"
  // command: "project:cmd:my-command"
  // agent:  "project:agent:my-agent"
  const idParts = rawId.replace('project:', '').split(':')
  let itemName: string

  if (body.type === 'command') {
    // id = project:cmd:name
    itemName = idParts.length >= 2 ? idParts[1]! : idParts[0]!
  } else if (body.type === 'agent') {
    // id = project:agent:name
    itemName = idParts.length >= 2 ? idParts[1]! : idParts[0]!
  } else {
    // id = project:name
    itemName = idParts[0]!
  }

  if (!isValidItemName(itemName)) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Invalid item name — must be lowercase alphanumeric with hyphens',
    })
  }

  if (body.type === 'skill') {
    const filePath = path.join(projectRoot, 'skills', itemName, 'SKILL.md')
    if (!(await exists(filePath))) {
      throw createError({
        statusCode: 404,
        statusMessage: `Skill "${itemName}" not found`,
      })
    }
    const content = serializeSkill({
      description: body.description,
      body: body.body,
      metadata: body.metadata,
    })
    await writeFile(filePath, content, 'utf8')
  } else if (body.type === 'command') {
    const filePath = path.join(projectRoot, 'commands', `${itemName}.md`)
    if (!(await exists(filePath))) {
      throw createError({
        statusCode: 404,
        statusMessage: `Command "${itemName}" not found`,
      })
    }
    const content = serializeCommand({
      description: body.description,
      argHint: body.argHint,
      allowedTools: body.allowedTools,
      delegatesTo: body.delegatesTo,
      body: body.body,
    })
    await writeFile(filePath, content, 'utf8')
  } else {
    const filePath = path.join(projectRoot, 'agents', `${itemName}.md`)
    if (!(await exists(filePath))) {
      throw createError({
        statusCode: 404,
        statusMessage: `Agent "${itemName}" not found`,
      })
    }
    const content = serializeAgent({
      name: body.name,
      description: body.description,
      model: body.model,
      tools: body.tools,
      body: body.body,
      metadata: body.metadata,
    })
    await writeFile(filePath, content, 'utf8')
  }

  return { ok: true, id: rawId }
})
