# Phase: END (The Delivery)

> **Load now**: `.ai/instructions/templates/workflow.md`, `.ai/skills/writing-soul.md`, `.ai/skills/checklist-soul.md`, `.ai/skills/versioning.md`. The canonical END checklist is the Single Source of Truth.

## Explicit `end:`, Additional Context

Two purposes:

1. **Cycle Closure**: Closes active `feat:`, `fix:`, `docs:`, or `land:` cycle through standard END checklist.
2. **Mid-Conversation Recovery**: If agent lost cycle state, re-read `.ai/backlog/tasks.md` and reconstruct before running checklist.

**NEVER BYPASS THE VERSION**: every artifact-producing cycle ends in a version, and which mechanism produces it is declared as `release` in `context.md`. On `manual`, `npm run bump` runs before the release commit and is not optional. On `derived`, the commit type is what CI reads to pick the bump, so a mistyped prefix silently ships the wrong version. See `versioning.md`, `VersionControl`.

The cycle is INCOMPLETE until all 7 steps are checked. FORBIDDEN from accepting new work until finalized and workspace is clean.

> Read `.ai/instructions/templates/agent-roles.md` for multi-agent handoff protocol.
