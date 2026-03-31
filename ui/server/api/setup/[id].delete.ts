import { rm, stat } from 'node:fs/promises'
import path from 'node:path'
import { resolveDebussyPath } from '../../utils/debussy'
import { isValidItemName } from '../../utils/setup'

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

  if (!rawId.startsWith('project:')) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Only project-scoped items can be deleted',
    })
  }

  const projectRoot = await resolveDebussyPath('.claude')

  // Parse type and name from id
  // skill:  "project:my-skill"
  // command: "project:cmd:my-command"
  // agent:  "project:agent:my-agent"
  const rest = rawId.replace('project:', '')

  let targetPath: string

  let itemName: string
  if (rest.startsWith('cmd:')) {
    itemName = rest.replace('cmd:', '')
    targetPath = path.join(projectRoot, 'commands', `${itemName}.md`)
  } else if (rest.startsWith('agent:')) {
    itemName = rest.replace('agent:', '')
    targetPath = path.join(projectRoot, 'agents', `${itemName}.md`)
  } else {
    // Skill — remove the entire directory
    itemName = rest
    targetPath = path.join(projectRoot, 'skills', itemName)
  }

  if (!isValidItemName(itemName)) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Invalid item name — must be lowercase alphanumeric with hyphens',
    })
  }

  if (!(await exists(targetPath))) {
    throw createError({
      statusCode: 404,
      statusMessage: `Item not found: ${rawId}`,
    })
  }

  await rm(targetPath, { recursive: true })

  return { ok: true, id: rawId }
})
