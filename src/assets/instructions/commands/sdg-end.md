# Phase: END (The Delivery)

> **Load now**: `.ai/instructions/templates/workflow.md`, `.ai/skills/writing-soul.md`, `.ai/skills/checklist-soul.md`. The canonical END checklist is the Single Source of Truth.

## Explicit `end:`, Additional Context

Two purposes:

1. **Cycle Closure**: Closes active `feat:`, `fix:`, `docs:`, or `land:` cycle through standard END checklist.
2. **Mid-Conversation Recovery**: If agent lost cycle state, re-read `.ai/backlog/tasks.md` and reconstruct before running checklist.

**NEVER BYPASS THE BUMP**: Semantic pipeline (`npm run bump`) is MANDATORY across all cycle types. Run before every release commit.

The cycle is INCOMPLETE until all 7 steps are checked. FORBIDDEN from accepting new work until finalized and workspace is clean.

> Read `.ai/instructions/templates/agent-roles.md` for multi-agent handoff protocol.
