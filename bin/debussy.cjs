#!/usr/bin/env node

'use strict'

const { fork } = require('child_process')
const { existsSync } = require('fs')
const { resolve, join } = require('path')

const args = process.argv.slice(2)

if (args.includes('--version') || args.includes('-v')) {
  const pkg = require(join(__dirname, '..', 'package.json'))
  console.log(pkg.version)
  process.exit(0)
}

if (args.includes('--help') || args.includes('-h')) {
  console.log('Usage: debussy [options]')
  console.log('')
  console.log('Options:')
  console.log('  -v, --version  Show version')
  console.log('  -h, --help     Show this help')
  console.log('  --port <port>  Set server port (default: 3000)')
  process.exit(0)
}

// Look for the Nitro server output
const serverEntry = resolve(__dirname, '..', '.output', 'server', 'index.mjs')

if (!existsSync(serverEntry)) {
  console.error('Error: Production build not found.')
  console.error('Run `npm run build` first, or use `npm run dev` for development.')
  process.exit(1)
}

// Resolve port
let port = '3000'
const portIdx = args.indexOf('--port')
if (portIdx !== -1) {
  const portVal = args[portIdx + 1]
  if (!portVal || isNaN(Number(portVal))) {
    console.error('Error: --port requires a valid number')
    process.exit(1)
  }
  port = portVal
}

// Start the Nitro server
fork(serverEntry, [], {
  env: { ...process.env, NITRO_PORT: port },
  stdio: 'inherit',
})
