# Vision: Debussy

## Why We're Building This
Claude Code is the most-used AI coding agent on the market — $2.5B run-rate, 75% adoption at startups, 73% of engineering teams using AI tools daily. But its raw capability creates a trap that solo builders fall into daily: the monster branch. Debussy exists to break that loop — from scoping work upstream with full context, to making parallel execution visible and manageable.

## The Core Problem: The Monster Branch

Claude Code can tackle anything you throw at it. And that's exactly the trap.

You start a session with a clear intent. But Claude is fast, and you have ideas. You ask for one more thing, then another. The branch grows. Pretty soon, you're sitting on a monster branch — massive local changes, four or five ambitious things tangled together.

You ask for a commit plan — you get one. But the resulting PR is still unreviewable: too broad for meaningful human or agent review. It does too many things, and reviewing it seriously starts to take longer than building it.

So you start planning and rescoping. But then you either lose velocity by working sequentially, or juggle complexity by working in parallel across sessions. Either way, your attention scatters, the artifacts you should be reviewing get lost, and the velocity drops.

This is the core loop Debussy breaks. And it leads naturally upstream: if you're going to plan and scope work, you might as well do it with as much context as you can.

### Consequences

**P1: Feedback lost, attention scattered** — Your feedback on key artifacts is scattered across conversation threads, never captured in a retrievable form. The further from the code editor, the less your product thinking lives somewhere navigable.

**P2: Documentation that agents need but humans can't maintain** — Your agent needs documentation to work well. Writing it is hard; keeping it navigable gets harder. But if you're scoping work to avoid monster branches, you need this context — and it needs to be agent-maintainable.

**P3: Parallelism without visibility** — You launch a second session, then a third. Without tools to organize parallel work, you lose track. You need multiple lanes, but no one gave you the dashboard.

## What Success Looks Like
In 6 months: all three pain points are solved for the primary developer's own workflow. The plugin is used daily without thinking about it. Plugin is listed on the Claude Code marketplace with enough traction for others to discover and use it.

## North Star
Zero friction: the plugin disappears into the workflow. No setup overhead, no unexpected failures, no manual workarounds.
