import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'
import yaml from 'js-yaml'

export default defineEventHandler(async () => {
  const workflowsDir = join(process.cwd(), 'workflows')

  if (!existsSync(workflowsDir)) {
    return { workflows: [], error: 'workflows/ directory not found' }
  }

  const files = readdirSync(workflowsDir).filter(
    (f) => f.endsWith('.yaml') || f.endsWith('.yml'),
  )

  const workflows = files.map((file) => {
    const content = readFileSync(join(workflowsDir, file), 'utf-8')
    return {
      file,
      ...(yaml.load(content) as Record<string, any>),
    }
  })

  return { workflows }
})
