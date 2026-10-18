# Phase: END (The Delivery)

> **Load now**: `.ai/kit/instructions/templates/workflow.md`, `.ai/kit/skills/writing-soul.md`, `.ai/kit/skills/checklist-soul.md`, `.ai/kit/skills/versioning.md`. The canonical END checklist is the Single Source of Truth.

## Explicit `end:`, Additional Context

Two purposes:

1. **Cycle Closure**: Closes active `feat:`, `fix:`, `docs:`, or `land:` cycle through standard END checklist.
2. **Mid-Conversation Recovery**: If agent lost cycle state, re-read `.ai/backlog/session.md` and reconstruct before running checklist.

**NEVER BYPASS THE VERSION**: every artifact-producing cycle ends in a version, and which mechanism produces it is declared as `release` in `context.md`. On `manual`, the `bump` command from `context.md` runs before the release commit and is not optional. On `derived`, the commit type is what CI reads to pick the bump, so a mistyped prefix silently ships the wrong version. See `versioning.md`, `VersionControl`.

The cycle is INCOMPLETE until every END step is checked. FORBIDDEN from accepting new work until finalized and workspace is clean.
