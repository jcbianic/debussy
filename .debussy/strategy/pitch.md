---
name: Pitch
icon: i-heroicons-rocket-launch
status: reviewed
---
# Debussy

## Vision
> A disciplined approach to using Claude Code for solo builders — from idea to shippable features, without losing the thread.

Claude Code is the most capable AI coding agent available — it does marvels. But as a solo builder, you find yourself overwhelmed by mundane instructions that feel like pushing buttons, while your valuable feedback is being lost to unreachable artifacts you should be focusing on. Debussy is here to make you focus on where your expertise and creativity is needed, while ensuring reproducible workflows and outcomes.

## The Problem: The Monster Branch

Claude Code can tackle anything you throw at it. And that's exactly the trap.

You start a session with a clear intent. But Claude is fast, and you have ideas. You ask for one more thing, then another. The branch grows. Pretty soon, you're sitting on a monster branch — massive local changes, four or five ambitious things tangled together in a mess.

You ask for a commit plan — you get one. But the resulting PR is still unreviewable: too broad for meaningful human or agent review. It does too many things, and reviewing it seriously starts to take longer than building it.

So you start planning and rescoping. But then you either lose velocity by working sequentially, or juggle complexity by working in parallel across sessions. Either way, your attention scatters, the artifacts you should be reviewing get lost, and the velocity drops.

This is the core loop Debussy breaks. And it leads naturally upstream: if you're going to plan and scope work to avoid the monster branch, you might as well do it with as much context as you can.

### Consequences

**P1: Feedback lost, attention scattered**
Your feedback on key artifacts is scattered across conversation threads, never captured in a form you or the agent can reliably retrieve. The further you get from the code editor, the less your product thinking lives somewhere navigable and reviewable.

**P2: Documentation that agents need but humans can't maintain**
Your agent needs documentation to work well — vision, product decisions, architectural principles, feature intents. Writing it is hard enough. Keeping it navigable becomes harder the more you build. But if you're scoping work to avoid monster branches, you need this context — and it needs to be agent-maintainable.

**P3: Parallelism without visibility**
You launch a second session, then a third. Without discipline and tools to organize parallel work, you lose track. You need to run multiple lanes, but no one gave you the dashboard.

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
