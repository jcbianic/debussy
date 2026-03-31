import { rm, stat } from 'node:fs/promises'
import path from 'node:path'
import { resolveDebussyPath } from '../../utils/debussy'

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

  if (rest.startsWith('cmd:')) {
    const name = rest.replace('cmd:', '')
    targetPath = path.join(projectRoot, 'commands', `${name}.md`)
  } else if (rest.startsWith('agent:')) {
    const name = rest.replace('agent:', '')
    targetPath = path.join(projectRoot, 'agents', `${name}.md`)
  } else {
    // Skill — remove the entire directory
    targetPath = path.join(projectRoot, 'skills', rest)
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
