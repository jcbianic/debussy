import { execSync } from 'child_process'

const SESSION_PREFIX = 'debussy-wf-'

function findTmux(): string | null {
  for (const p of ['/opt/homebrew/bin/tmux', '/usr/local/bin/tmux', '/usr/bin/tmux']) {
    try { execSync(`test -x ${p}`, { stdio: 'ignore' }); return p } catch {}
  }
  try { return execSync('which tmux', { encoding: 'utf-8' }).trim() } catch { return null }
}

function isClaudeIdle(pane: string): boolean {
  const isProcessing = pane.includes('Sprouting')
    || pane.includes('esc to interrupt')
    || pane.includes('Thinking')
    || pane.includes('Running')
    || pane.includes('⏺')
  const hasPrompt = pane.includes('? for shortcuts')
  return hasPrompt && !isProcessing
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const stepId = (query.stepId as string) || ''

  if (!stepId) return { ok: false, error: 'stepId query param required' }

  const bin = findTmux()
  if (!bin) return { ok: false, error: 'tmux not found' }

  const name = `${SESSION_PREFIX}${stepId}`

  try {
    execSync(`${bin} has-session -t ${name}`, { stdio: 'ignore' })
  } catch {
    return { ok: true, status: 'no-session', stepId, pane: '', idle: false }
  }

  const pane = execSync(`${bin} capture-pane -t ${name} -p`, {
    encoding: 'utf-8',
    timeout: 3000,
  }).trim()

  return {
    ok: true,
    status: 'active',
    stepId,
    idle: isClaudeIdle(pane),
    pane,
  }
})
