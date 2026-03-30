import { readFile } from 'node:fs/promises'
import { parse as parseYaml } from 'yaml'
import { resolveDebussyPath } from './debussy'

interface WorkConfig {
  test_cmd?: string
}

export async function getWorkConfig(): Promise<WorkConfig> {
  const configPath = await resolveDebussyPath('.debussy', 'config.yaml')
  try {
    const raw = await readFile(configPath, 'utf8')
    const parsed = parseYaml(raw)
    return (parsed?.work as WorkConfig) ?? {}
  } catch {
    return {}
  }
}
