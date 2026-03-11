import { defineWebSocketHandler } from 'h3'
import { createRequire } from 'module'
import { resolve } from 'path'
import { execSync } from 'child_process'

const require = createRequire(import.meta.url)

const shells = new Map<string, any>()

function findTmux(): string | null {
  for (const p of ['/opt/homebrew/bin/tmux', '/usr/local/bin/tmux', '/usr/bin/tmux']) {
    try { execSync(`test -x ${p}`, { stdio: 'ignore' }); return p } catch {}
  }
  try { return execSync('which tmux', { encoding: 'utf-8' }).trim() } catch { return null }
}

export default defineWebSocketHandler({
  open(peer) {
    try {
      const pty = require('node-pty')
      const projectRoot = process.env.PROJECT_ROOT || resolve(process.cwd(), '..')

      // Spawn a plain shell — we attach to tmux on first init message
      const shell = pty.spawn(
        process.env.SHELL || '/bin/zsh',
        [],
        {
          name: 'xterm-256color',
          cwd: projectRoot,
          env: { ...process.env, TERM: 'xterm-256color' },
          cols: 80,
          rows: 24,
        },
      )

      shells.set(peer.id, shell)

      shell.onData((data: string) => {
        try { peer.send(data) } catch {}
      })
    } catch (err: any) {
      peer.send(`\r\n\x1b[31mFailed to start terminal: ${err.message}\x1b[0m\r\n`)
    }
  },

  message(peer, message) {
    const shell = shells.get(peer.id)
    if (!shell) return

    const text = message.text()

    try {
      const cmd = JSON.parse(text)

      if (cmd.type === 'init') {
        const tmuxPath = findTmux()
        if (!tmuxPath) {
          shell.write('echo "tmux not found"\r')
          return
        }

        if (cmd.cols && cmd.rows) {
          shell.resize(Math.max(cmd.cols, 1), Math.max(cmd.rows, 1))
        }

        if (cmd.tmuxSession) {
          // Workflow mode: attach to an existing step session
          shell.write(`${tmuxPath} attach-session -t ${cmd.tmuxSession}\r`)
        } else {
          // Default mode: create/attach the main debussy-poc session
          shell.write(`${tmuxPath} new-session -A -s debussy-poc\r`)
        }
        return
      }

      if (cmd.type === 'resize') {
        shell.resize(Math.max(cmd.cols, 1), Math.max(cmd.rows, 1))
        return
      }
    } catch {
      // not JSON — regular terminal input
    }

    shell.write(text)
  },

  close(peer) {
    const shell = shells.get(peer.id)
    if (shell) {
      shell.kill()
      shells.delete(peer.id)
    }
  },
})
