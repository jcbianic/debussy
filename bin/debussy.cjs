#!/usr/bin/env node

'use strict'

const { execSync } = require('child_process')
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

// Start the Nitro server
require('child_process').fork(serverEntry, [], {
  env: { ...process.env, NITRO_PORT: args.includes('--port') ? args[args.indexOf('--port') + 1] : '3000' },
  stdio: 'inherit',
})
