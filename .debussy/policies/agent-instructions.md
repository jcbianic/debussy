---
name: Agent Instructions
icon: i-heroicons-cpu-chip
status: defined
order: 6
---

## Purpose

CLAUDE.md is the primary instructions file for the Claude Code agent. It describes the project structure, distribution model, and next steps.

AGENTS.md delegates to `.tessl/RULES.md` for detailed agent rules. This separation keeps top-level instructions concise.

## What belongs in CLAUDE.md

- Project description and structure — What is this, what are the skills
- Distribution model — How to install the plugin
- Dogfooding instructions — How to test the plugin on itself
- Pointers to AGENTS.md — Delegate detailed rules

## What does NOT belong

Detailed coding rules, commit conventions, or toolchain choices. Those live in AGENTS.md and `.tessl/RULES.md` where they can be managed as structured data.
