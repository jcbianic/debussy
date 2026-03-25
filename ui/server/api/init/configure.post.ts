import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { stringify as stringifyYaml } from 'yaml'
import { DEFAULT_STRATES } from '~~/types/config'
import type { StrateConfig } from '~~/types/config'

interface ConfigureBody {
  project: {
    name: string
    description: string
  }
  strates: Partial<StrateConfig>
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ConfigureBody>(event)

  if (!body?.project?.name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'project.name is required',
    })
  }

  const root = await resolveDebussyPath()
  const debussyDir = path.join(root, '.debussy')

  // Merge with defaults
  const strates: StrateConfig = { ...DEFAULT_STRATES }
  if (body.strates && typeof body.strates === 'object') {
    for (const key of Object.keys(DEFAULT_STRATES)) {
      if (typeof body.strates[key as keyof StrateConfig] === 'boolean') {
        strates[key as keyof StrateConfig] =
          body.strates[key as keyof StrateConfig]!
      }
    }
  }

  const config = {
    project: {
      name: body.project.name,
      description: body.project.description || '',
    },
    strates,
  }

  await mkdir(debussyDir, { recursive: true })
  await writeFile(
    path.join(debussyDir, 'config.yaml'),
    stringifyYaml(config),
    'utf8'
  )

  return { ok: true, config }
})
