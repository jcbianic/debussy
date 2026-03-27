---
name: Pitch
icon: i-heroicons-rocket-launch
status: reviewed
---
# Debussy

## Vision
> A disciplined approach to using Claude Code for solo builders — from idea to shippable features, without losing the thread.

Claude Code is the most capable AI coding agent available — it does marvels. But as a solo builder, you find yourself overwhelmed by mundane instructions that feel like pushing buttons, while your valuable feedback is being lost to unreachable artifacts you should be focusing on. Debussy is here to make you focus on where your expertise and creativity is needed, while ensuring reproducible workflows and outcomes.

## The Problem

### P1: Feedback lost, attention scattered
**Affects:** A1 (solo builders)

You have a very powerful agent doing marvels for you, yet you find yourself overwhelmed by repetitive tasks — re-issuing the same instructions, re-explaining the same constraints, re-stating the same conventions. Meanwhile, your feedback on key artifacts is kind of lost — scattered across conversation threads, never captured in a form the agent or you can reliably retrieve. What makes Claude extraordinary is also what makes it overwhelming: it's open, it can tackle anything, and that very openness scatters your attention across many things at once.

### P2: Documentation that agents need but humans can't maintain
**Affects:** A1 (solo builders)

To do good work, your agent needs you to write as much documentation as possible — vision, product decisions, architectural principles, feature intents. That's hard enough. Keeping this documentation nice and tidy becomes harder the more you build, all the more so as you distance yourself from the IDE. Even if you had all the docs in order, the IDE wasn't designed to explore this type of documentation: the further you get from the code editor, the less your product thinking lives somewhere navigable and reviewable.

### P3: Solo builders do it all — and Claude doesn't wait
**Affects:** A1 (solo builders)

Solo builders carry every role at once. And Claude is fast — but it keeps you waiting. So you launch a second session, and a third, and suddenly you're managing a whole team of agents all at once. Without discipline and a way to organize how you work across sessions, you lose track of what's happening where. You need to run this team, but no one gave you the tools for it.

## The Product

- **For:** Solo builders and indie developers using Claude Code
- **Nature:** Claude Code plugin (meta-plugin with skills)
- **Distribution:** Claude Code plugin system / GitHub

Debussy is organized around four strates (strategy, product, engineering, work),
each with progressive depth levels. Strategy researches the space before you
build. Product shapes what to build and in what order. Engineering governs how
the agent builds. Work manages execution with workflow runs and feedback loops.

## What We're NOT Doing
- Not an IDE or editor — Debussy lives inside Claude Code
- Not a code generation tool — Claude Code handles that
- Not a team collaboration platform — optimized for the solo builder
- Not a project management tool — no sprints, no boards, no velocity charts

## Landscape
The Claude Code plugin ecosystem is growing fast, mostly around code quality and external service integration. The upstream layer — product discovery, strategy, roadmap — is largely unaddressed. Debussy is an early experiment in filling that gap, with a particular focus on closing the feedback loop: capturing your reviews and decisions on strategy and product artifacts in a way that feeds back into the agent's context. CCPM is a potential downstream ally (spec → tasks → GitHub Issues). Superpowers brings a review workflow but focuses on code safety. None of them address the product-thinking layer upstream.
