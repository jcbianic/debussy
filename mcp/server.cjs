#!/usr/bin/env node
'use strict'

/**
 * Debussy MCP Server
 *
 * An MCP stdio server that starts the Nitro web server as a child process
 * and exposes tools for Claude to interact with the Debussy UI.
 *
 * Claude Code starts this process automatically when the debussy plugin is
 * enabled. Communication is over stdio using JSON-RPC 2.0 (MCP protocol).
 */

const { fork, exec } = require('child_process')
const { existsSync } = require('fs')
const { resolve } = require('path')
const readline = require('readline')

const PORT = parseInt(process.env.DEBUSSY_PORT || '3333', 10)

// When installed as a plugin, CLAUDE_PLUGIN_ROOT points to the cache dir.
// During local development, fall back to the repo root (one level up from mcp/).
const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || resolve(__dirname, '..')

let serverProcess = null
let serverUrl = null
let serverReady = false

// ---------------------------------------------------------------------------
// Nitro server lifecycle
// ---------------------------------------------------------------------------

function startNitroServer() {
  const serverEntry = resolve(PLUGIN_ROOT, '.output', 'server', 'index.mjs')

  if (!existsSync(serverEntry)) {
    process.stderr.write(
      '[debussy-mcp] Nitro build not found at ' + serverEntry + '\n' +
      '[debussy-mcp] Run `npm run build` in the debussy repo first.\n'
    )
    return
  }

  serverProcess = fork(serverEntry, [], {
    env: { ...process.env, NITRO_PORT: String(PORT) },
    stdio: ['ignore', 'ignore', 'inherit'],
  })

  serverUrl = `http://localhost:${PORT}`
  serverReady = true

  process.stderr.write(`[debussy-mcp] Nitro server started at ${serverUrl}\n`)

  serverProcess.on('exit', (code) => {
    process.stderr.write(`[debussy-mcp] Nitro server exited (code ${code})\n`)
    serverProcess = null
    serverReady = false
  })
}

// ---------------------------------------------------------------------------
// MCP protocol (JSON-RPC 2.0 over stdio)
// ---------------------------------------------------------------------------

function send(obj) {
  process.stdout.write(JSON.stringify(obj) + '\n')
}

function sendResult(id, result) {
  send({ jsonrpc: '2.0', id, result })
}

function sendError(id, code, message) {
  send({ jsonrpc: '2.0', id, error: { code, message } })
}

const TOOLS = [
  {
    name: 'open_debussy_ui',
    description: 'Open the Debussy web UI in the default browser',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'get_server_status',
    description: 'Return the Debussy server URL and whether it is running',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
]

function handleToolCall(id, name) {
  if (name === 'open_debussy_ui') {
    if (!serverReady) {
      sendResult(id, { content: [{ type: 'text', text: 'Debussy server is not running.' }] })
      return
    }
    const opener =
      process.platform === 'darwin' ? 'open' :
      process.platform === 'win32' ? 'start' :
      'xdg-open'
    exec(`${opener} ${serverUrl}`)
    sendResult(id, { content: [{ type: 'text', text: `Opened ${serverUrl}` }] })
    return
  }

  if (name === 'get_server_status') {
    sendResult(id, {
      content: [{
        type: 'text',
        text: JSON.stringify({ running: serverReady, url: serverReady ? serverUrl : null }),
      }],
    })
    return
  }

  sendError(id, -32601, `Unknown tool: ${name}`)
}

// ---------------------------------------------------------------------------
// stdio message loop
// ---------------------------------------------------------------------------

const rl = readline.createInterface({ input: process.stdin, terminal: false })

rl.on('line', (line) => {
  const trimmed = line.trim()
  if (!trimmed) return

  let msg
  try {
    msg = JSON.parse(trimmed)
  } catch {
    return
  }

  const { id, method, params } = msg

  if (method === 'initialize') {
    sendResult(id, {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: { name: 'debussy', version: '0.1.0' },
    })
    return
  }

  // Notification — no response needed
  if (method === 'notifications/initialized') return

  if (method === 'tools/list') {
    sendResult(id, { tools: TOOLS })
    return
  }

  if (method === 'tools/call') {
    handleToolCall(id, params?.name)
    return
  }

  // Unknown method
  if (id !== undefined) {
    sendError(id, -32601, `Method not found: ${method}`)
  }
})

// ---------------------------------------------------------------------------
// Startup & shutdown
// ---------------------------------------------------------------------------

startNitroServer()

process.on('SIGTERM', () => {
  if (serverProcess) serverProcess.kill()
  process.exit(0)
})

process.on('exit', () => {
  if (serverProcess) serverProcess.kill()
})
