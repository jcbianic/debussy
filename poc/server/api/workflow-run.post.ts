import { execSync } from 'child_process'

const SESSION_PREFIX = 'debussy-wf-'

function findTmux(): string | null {
  for (const p of ['/opt/homebrew/bin/tmux', '/usr/local/bin/tmux', '/usr/bin/tmux']) {
    try { execSync(`test -x ${p}`, { stdio: 'ignore' }); return p } catch {}
  }
  try { return execSync('which tmux', { encoding: 'utf-8' }).trim() } catch { return null }
}

function sessionExists(bin: string, name: string): boolean {
  try { execSync(`${bin} has-session -t ${name}`, { stdio: 'ignore' }); return true } catch { return false }
}

function escapeForTmux(cmd: string): string {
  return `'${cmd.replace(/'/g, "'\\''")}'`
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const stepId: string = body?.stepId || ''
  const command: string = body?.command || ''

  if (!stepId) return { ok: false, error: 'stepId is required' }
  if (!command) return { ok: false, error: 'No command provided' }

  const bin = findTmux()
  if (!bin) return { ok: false, error: 'tmux not found' }

  const name = `${SESSION_PREFIX}${stepId}`

  if (!sessionExists(bin, name)) {
    return { ok: false, error: `No session for step "${stepId}". Start it first.` }
  }

  // Fire and forget — send the command to the step's tmux session
  execSync(`${bin} send-keys -t ${name} ${escapeForTmux(command)} Enter`, {
    encoding: 'utf-8',
    timeout: 5000,
  })

  return { ok: true, stepId, command }
})
