# Phase: END (The Delivery)

> **Load now**: `.ai/kit/instructions/templates/workflow.md`, `.ai/kit/skills/writing-soul.md`, `.ai/kit/skills/checklist-soul.md`, `.ai/kit/skills/versioning.md`. The canonical END checklist is the Single Source of Truth.

## Explicit `end:`, Additional Context

Two purposes:

1. **Cycle Closure**: Closes active `feat:`, `fix:`, `docs:`, or `land:` cycle through standard END checklist.
2. **Mid-Conversation Recovery**: If agent lost cycle state, re-read `.ai/backlog/session.md` and reconstruct before running checklist.

**Every cycle that writes a changelog entry ends in a version**, and which mechanism produces it is declared as `release` in `context.md`. On `manual`, the `bump` command from `context.md` runs before the release commit, because a release commit without it describes a version that does not exist. On `derived`, the commit type is what CI reads to pick the bump, so a mistyped prefix silently ships the wrong version. See `versioning.md`, `VersionControl`.

The cycle is incomplete until every END step is checked. New work waits until every step is done and the workspace is clean, because a half-closed cycle leaves its changes in the tree for the next one to sweep up.

## Memory hygiene

When Backlog Sync writes to `learned.md`, the entry follows the rules in that file's header: one lesson, its date and cycle, and its origin (`developer`, `model` or `tool`). The same pass deletes any entry this cycle made untrue, whether the code it describes changed, the vocabulary it names is gone, or the canon now states it. An entry moves into a skill or `AGENTS.md` only when the developer decides so, never on the agent's initiative: memory informs the next cycle and never authorizes it.
