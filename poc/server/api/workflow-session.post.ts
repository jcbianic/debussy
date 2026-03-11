import { execSync } from 'child_process'
import { resolve } from 'path'

const SESSION_PREFIX = 'debussy-wf-'

function findTmux(): string | null {
  for (const p of ['/opt/homebrew/bin/tmux', '/usr/local/bin/tmux', '/usr/bin/tmux']) {
    try { execSync(`test -x ${p}`, { stdio: 'ignore' }); return p } catch {}
  }
  try { return execSync('which tmux', { encoding: 'utf-8' }).trim() } catch { return null }
}

function tmux(bin: string, args: string): string {
  return execSync(`${bin} ${args}`, { encoding: 'utf-8', timeout: 5000 }).trim()
}

function sessionExists(bin: string, name: string): boolean {
  try { execSync(`${bin} has-session -t ${name}`, { stdio: 'ignore' }); return true } catch { return false }
}

function capturePaneRaw(bin: string, name: string): string {
  try { return tmux(bin, `capture-pane -t ${name} -p`) } catch { return '' }
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

function isClaudeReady(pane: string): boolean {
  return pane.includes('? for shortcuts') || /^❯\s*$/m.test(pane)
}

function sessionName(stepId: string): string {
  return `${SESSION_PREFIX}${stepId}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const action: string = body?.action || 'start'
  const stepId: string = body?.stepId || ''

  const bin = findTmux()
  if (!bin) return { ok: false, error: 'tmux not found' }

  const projectRoot = process.env.PROJECT_ROOT || resolve(process.cwd(), '..')

  // --- LIST all workflow sessions ---
  if (action === 'list') {
    let lines: string[] = []
    try {
      const raw = tmux(bin, 'list-sessions -F "#{session_name}"')
      lines = raw.split('\n').filter(l => l.startsWith(SESSION_PREFIX))
    } catch {}

    const sessions = lines.map(name => {
      const pane = capturePaneRaw(bin, name)
      return {
        name,
        stepId: name.replace(SESSION_PREFIX, ''),
        ready: isClaudeReady(pane),
      }
    })

    return { ok: true, sessions }
  }

  // --- All other actions require stepId ---
  if (!stepId) return { ok: false, error: 'stepId is required' }
  const name = sessionName(stepId)

  // --- KILL a step session ---
  if (action === 'kill') {
    try { tmux(bin, `kill-session -t ${name}`) } catch {}
    return { ok: true, action: 'killed', stepId }
  }

  // --- KILL ALL workflow sessions ---
  if (action === 'kill-all') {
    try {
      const raw = tmux(bin, 'list-sessions -F "#{session_name}"')
      for (const line of raw.split('\n')) {
        if (line.startsWith(SESSION_PREFIX)) {
          try { tmux(bin, `kill-session -t ${line}`) } catch {}
        }
      }
    } catch {}
    return { ok: true, action: 'killed-all' }
  }

  // --- STATUS of a step session ---
  if (action === 'status') {
    if (!sessionExists(bin, name)) return { ok: true, status: 'no-session', stepId }
    const pane = capturePaneRaw(bin, name)
    return { ok: true, status: 'active', stepId, ready: isClaudeReady(pane), pane }
  }

  // --- START a step session with Claude (fire-and-forget) ---
  if (sessionExists(bin, name)) {
    const pane = capturePaneRaw(bin, name)
    return { ok: true, status: 'already-running', stepId, session: name, ready: isClaudeReady(pane) }
  }

  // Create detached tmux session and launch Claude — return immediately
  tmux(bin, `new-session -d -s ${name} -x 120 -y 30`)
  tmux(bin, `send-keys -t ${name} 'cd ${projectRoot} && unset CLAUDECODE && claude' Enter`)

  return {
    ok: true,
    status: 'starting',
    stepId,
    session: name,
  }
})
